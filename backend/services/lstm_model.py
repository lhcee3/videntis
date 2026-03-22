import os
import pickle
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "videntis_models", "models")
SEQUENCE_LENGTH = 60
FORECAST_DAYS = 7

# Lazy-loaded cache
_models = {}
_scalers = {}

SUPPORTED_TICKERS = [
    "AAPL", "AMD", "AMZN", "GOOGL", "JPM",
    "META", "MSFT", "NFLX", "NVDA", "TSLA"
]


def _load_model(ticker: str):
    if ticker not in _models:
        try:
            # Import here to avoid slow startup if tensorflow not needed
            from tensorflow.keras.models import load_model  # type: ignore
            path = os.path.join(MODELS_DIR, f"{ticker}_lstm.h5")
            _models[ticker] = load_model(path, compile=False)
        except Exception as e:
            raise RuntimeError(f"Could not load LSTM model for {ticker}: {e}")
    return _models[ticker]


def _load_scaler(ticker: str):
    if ticker not in _scalers:
        path = os.path.join(MODELS_DIR, f"{ticker}_scaler.pkl")
        with open(path, "rb") as f:
            _scalers[ticker] = pickle.load(f)
    return _scalers[ticker]


def run_lstm_forecast(ticker: str) -> dict:
    """
    Fetches last 60 days of price data, runs LSTM, returns 7-day forecast.
    Returns dict with keys: forecast, forecast_dates, confidence_bands, last_price
    """
    ticker = ticker.upper()
    if ticker not in SUPPORTED_TICKERS:
        raise ValueError(f"{ticker} not supported by LSTM. Supported: {SUPPORTED_TICKERS}")

    # Fetch price data — need at least 60 days
    df = yf.download(ticker, period="120d", progress=False, auto_adjust=True)
    if df.empty or len(df) < SEQUENCE_LENGTH:
        raise RuntimeError(f"Not enough price data for {ticker}")

    closes = df["Close"].values.reshape(-1, 1)
    last_price = float(closes[-1])

    scaler = _load_scaler(ticker)
    model = _load_model(ticker)

    scaled = scaler.transform(closes)
    sequence = scaled[-SEQUENCE_LENGTH:].reshape(1, SEQUENCE_LENGTH, 1)

    # Iterative 7-day prediction
    predictions_scaled = []
    current_seq = sequence.copy()

    for _ in range(FORECAST_DAYS):
        pred = model.predict(current_seq, verbose=0)[0][0]
        predictions_scaled.append(pred)
        # Slide window forward
        current_seq = np.append(current_seq[:, 1:, :], [[[pred]]], axis=1)

    predictions_scaled = np.array(predictions_scaled).reshape(-1, 1)
    predictions = scaler.inverse_transform(predictions_scaled).flatten().tolist()

    # Confidence bands — use model uncertainty proxy (±1.5% of prediction)
    upper = [round(p * 1.015, 2) for p in predictions]
    lower = [round(p * 0.985, 2) for p in predictions]
    predictions = [round(p, 2) for p in predictions]

    # Forecast dates (skip weekends)
    dates = []
    d = datetime.today()
    while len(dates) < FORECAST_DAYS:
        d += timedelta(days=1)
        if d.weekday() < 5:  # Mon–Fri
            dates.append(d.strftime("%Y-%m-%d"))

    return {
        "last_price": round(last_price, 2),
        "forecast": predictions,
        "forecast_dates": dates,
        "confidence_bands": {"upper": upper, "lower": lower},
        "model": "lstm",
    }
