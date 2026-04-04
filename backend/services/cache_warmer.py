"""
Background cache warmer — refreshes blended forecasts for all LSTM tickers
every 5 minutes during market hours (9:30–16:00 ET, Mon–Fri).
"""
import logging
from datetime import datetime
import pytz

logger = logging.getLogger(__name__)

MARKET_TZ = pytz.timezone("America/New_York")
LSTM_TICKERS = ["AAPL", "AMD", "AMZN", "GOOGL", "JPM", "META", "MSFT", "NFLX", "NVDA", "TSLA"]


def _is_market_hours() -> bool:
    now = datetime.now(MARKET_TZ)
    if now.weekday() >= 5:  # Sat/Sun
        return False
    market_open  = now.replace(hour=9,  minute=30, second=0, microsecond=0)
    market_close = now.replace(hour=16, minute=0,  second=0, microsecond=0)
    return market_open <= now <= market_close


def warm_cache():
    if not _is_market_hours():
        return

    from services.stock_data import get_historical_data, get_stock_info
    from services.prophet_model import run_forecast
    from services.lstm_model import run_lstm_forecast
    from services.vader_sentiment import get_news_sentiment
    from services.groq_explainer import explain_forecast
    from services import cache_manager as cache

    for ticker in LSTM_TICKERS:
        try:
            df = get_historical_data(ticker)
            info = get_stock_info(ticker)
            prophet_data = run_forecast(df)
            prophet_prices = [d["yhat"] for d in prophet_data[-7:]]
            prophet_dates  = [d["ds"]   for d in prophet_data[-7:]]

            avg_vol    = df["Volume"].tail(30).mean()
            recent_vol = df["Volume"].tail(5).mean()
            volume_change = ((recent_vol - avg_vol) / avg_vol) * 100 if avg_vol else 0

            news, avg_sentiment = get_news_sentiment(ticker)
            cache.set_sentiment(f"sentiment_{ticker}", (news, avg_sentiment))

            lstm_result = run_lstm_forecast(ticker)
            lstm_prices = lstm_result["forecast"]

            blended = [round((l * 0.6 + p * 0.4), 2) for l, p in zip(lstm_prices, prophet_prices)]
            upper   = [round(p * 1.015, 2) for p in blended]
            lower   = [round(p * 0.985, 2) for p in blended]

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
                "model": "lstm+prophet",
            }
            cache.set_forecast(f"blended_{ticker}", response)
            logger.info(f"Cache warmed: {ticker}")
        except Exception as e:
            logger.warning(f"Cache warm failed for {ticker}: {e}")
