import logging
import yfinance as yf
from fastapi import APIRouter, HTTPException
from services.stock_data import get_historical_data, get_stock_info
from services.technical import compute_indicators, get_ohlcv
from services.fundamentals import get_fundamentals
from services.vader_sentiment import get_news_sentiment
from services.prophet_model import run_forecast
from services.groq_explainer import explain_forecast
from services import cache_manager as cache

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/{ticker}")
async def analyze_stock(ticker: str):
    ticker = ticker.upper().strip()

    cached = cache.get_technical(f"analyze_{ticker}")
    if cached is not None:
        return cached

    try:
        df = get_historical_data(ticker, period="1y")
        info = get_stock_info(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    raw = yf.Ticker(ticker).history(period="1y")
    raw = raw.reset_index()
    raw["Date"] = raw["Date"].dt.strftime("%Y-%m-%d")

    technicals = compute_indicators(raw)

    cached_fund = cache.get_fundamentals(f"fund_{ticker}")
    if cached_fund is not None:
        fundamentals = cached_fund
    else:
        fundamentals = get_fundamentals(ticker)
        cache.set_fundamentals(f"fund_{ticker}", fundamentals)

    cached_sentiment = cache.get_sentiment(f"sentiment_{ticker}")
    if cached_sentiment is not None:
        news, avg_sentiment = cached_sentiment
    else:
        news, avg_sentiment = get_news_sentiment(ticker)
        cache.set_sentiment(f"sentiment_{ticker}", (news, avg_sentiment))

    forecast_data = run_forecast(df)
    forecast_price = forecast_data[-1]["yhat"]
    current_price = info.get("price") or df["Close"].iloc[-1]

    tech_score = technicals["technical_score"]
    fund_score = fundamentals["fundamental_score"]
    overall = round((tech_score + fund_score) / 2, 1)
    if overall >= 7:
        verdict = "BUY"
    elif overall >= 5:
        verdict = "HOLD"
    else:
        verdict = "SELL"

    ai_summary = explain_forecast(
        ticker=ticker,
        current_price=current_price,
        forecast_price=forecast_price,
        volume_change_pct=0,
        avg_sentiment=avg_sentiment,
        sector=info.get("sector", ""),
    )

    result = {
        "ticker": ticker,
        "info": info,
        "current_price": round(current_price, 2),
        "forecast_price": round(forecast_price, 2),
        "technicals": technicals,
        "fundamentals": fundamentals,
        "ohlcv": get_ohlcv(raw),
        "news": news[:6],
        "avg_sentiment": round(avg_sentiment, 3),
        "scores": {
            "technical": tech_score,
            "fundamental": fund_score,
            "overall": overall,
            "verdict": verdict,
        },
        "ai_summary": ai_summary,
    }
    cache.set_technical(f"analyze_{ticker}", result)
    return result
