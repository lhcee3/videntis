import logging
from fastapi import APIRouter, HTTPException
from services.stock_data import get_historical_data, get_stock_info
from services.prophet_model import run_forecast
from services.groq_explainer import explain_forecast
from services.vader_sentiment import get_news_sentiment
from services.lstm_model import run_lstm_forecast, SUPPORTED_TICKERS
from services import cache_manager as cache

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/{ticker}/info")
async def get_ticker_info(ticker: str):
    ticker = ticker.upper()
    cached = cache.get_price(f"info_{ticker}")
    if cached is not None:
        return cached
    try:
        info = get_stock_info(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    cache.set_price(f"info_{ticker}", info)
    return info


@router.get("/{ticker}")
async def forecast_stock(ticker: str):
    ticker = ticker.upper().strip()
    cached = cache.get_forecast(f"prophet_{ticker}")
    if cached is not None:
        return cached

    try:
        df = get_historical_data(ticker)
        info = get_stock_info(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found: {str(e)}")

    forecast_data = run_forecast(df)

    avg_vol = df["Volume"].tail(30).mean()
    recent_vol = df["Volume"].tail(5).mean()
    volume_change = ((recent_vol - avg_vol) / avg_vol) * 100 if avg_vol else 0

    news, avg_sentiment = get_news_sentiment(ticker)

    forecast_price = forecast_data[-1]["yhat"]
    current_price = info.get("price") or df["Close"].iloc[-1]

    explanation = explain_forecast(
        ticker=ticker,
        current_price=current_price,
        forecast_price=forecast_price,
        volume_change_pct=volume_change,
        avg_sentiment=avg_sentiment,
        sector=info.get("sector", ""),
    )

    result = {
        "ticker": ticker,
        "info": info,
        "historical": df.to_dict(orient="records"),
        "forecast": forecast_data,
        "explanation": explanation,
        "news": news,
        "volume_change_pct": round(volume_change, 2),
        "avg_sentiment": round(avg_sentiment, 3),
    }
    cache.set_forecast(f"prophet_{ticker}", result)
    return result


@router.get("/{ticker}/lstm")
async def forecast_lstm(ticker: str):
    ticker = ticker.upper().strip()
    cached = cache.get_forecast(f"lstm_{ticker}")
    if cached is not None:
        return cached

    try:
        result = run_lstm_forecast(ticker)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LSTM forecast failed: {str(e)}")

    info = {}
    try:
        info = get_stock_info(ticker)
    except Exception:
        pass

    _, avg_sentiment = ([], 0)
    try:
        _, avg_sentiment = get_news_sentiment(ticker)
    except Exception:
        pass

    explanation = explain_forecast(
        ticker=ticker,
        current_price=result["last_price"],
        forecast_price=result["forecast"][-1],
        volume_change_pct=0,
        avg_sentiment=avg_sentiment,
        sector=info.get("sector", ""),
    )

    response = {
        "ticker": ticker,
        "info": info,
        "last_price": result["last_price"],
        "forecast": result["forecast"],
        "forecast_dates": result["forecast_dates"],
        "confidence_bands": result["confidence_bands"],
        "explanation": explanation,
        "model": "lstm",
    }
    cache.set_forecast(f"lstm_{ticker}", response)
    return response


@router.get("/{ticker}/blended")
async def forecast_blended(ticker: str):
    ticker = ticker.upper().strip()
    cached = cache.get_forecast(f"blended_{ticker}")
    if cached is not None:
        return cached

    try:
        df = get_historical_data(ticker)
        info = get_stock_info(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    prophet_data = run_forecast(df)
    prophet_prices = [d["yhat"] for d in prophet_data[-7:]]
    prophet_dates = [d["ds"] for d in prophet_data[-7:]]

    avg_vol = df["Volume"].tail(30).mean()
    recent_vol = df["Volume"].tail(5).mean()
    volume_change = ((recent_vol - avg_vol) / avg_vol) * 100 if avg_vol else 0

    cached_sentiment = cache.get_sentiment(f"sentiment_{ticker}")
    if cached_sentiment is not None:
        news, avg_sentiment = cached_sentiment
    else:
        news, avg_sentiment = get_news_sentiment(ticker)
        cache.set_sentiment(f"sentiment_{ticker}", (news, avg_sentiment))

    lstm_prices = None
    if ticker in SUPPORTED_TICKERS:
        try:
            lstm_result = run_lstm_forecast(ticker)
            lstm_prices = lstm_result["forecast"]
        except Exception:
            pass

    if lstm_prices and len(lstm_prices) == len(prophet_prices):
        blended = [round((l * 0.6 + p * 0.4), 2) for l, p in zip(lstm_prices, prophet_prices)]
        upper = [round(p * 1.015, 2) for p in blended]
        lower = [round(p * 0.985, 2) for p in blended]
        model_used = "lstm+prophet"
    else:
        blended = [round(p, 2) for p in prophet_prices]
        upper = [round(d["yhat_upper"], 2) for d in prophet_data[-7:]]
        lower = [round(d["yhat_lower"], 2) for d in prophet_data[-7:]]
        model_used = "prophet"

    current_price = info.get("price") or df["Close"].iloc[-1]
    explanation = explain_forecast(
        ticker=ticker,
        current_price=current_price,
        forecast_price=blended[-1],
        volume_change_pct=volume_change,
        avg_sentiment=avg_sentiment,
        sector=info.get("sector", ""),
    )

    response = {
        "ticker": ticker,
        "info": info,
        "historical": df.to_dict(orient="records"),
        "last_price": round(float(current_price), 2),
        "forecast_prices": blended,
        "forecast_dates": prophet_dates,
        "confidence_bands": {"upper": upper, "lower": lower},
        "forecast": prophet_data,
        "explanation": explanation,
        "news": news,
        "volume_change_pct": round(volume_change, 2),
        "avg_sentiment": round(avg_sentiment, 3),
        "model": model_used,
    }
    cache.set_forecast(f"blended_{ticker}", response)
    return response


@router.get("/lstm/available")
async def lstm_available_tickers():
    return {"tickers": SUPPORTED_TICKERS}
