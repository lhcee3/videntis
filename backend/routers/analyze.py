from fastapi import APIRouter, HTTPException
from services.stock_data import get_historical_data, get_stock_info
from services.technical import compute_indicators, get_ohlcv
from services.fundamentals import get_fundamentals
from services.vader_sentiment import get_news_sentiment
from services.prophet_model import run_forecast
import requests, os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

router = APIRouter()

@router.get("/{ticker}")
async def analyze_stock(ticker: str):
    ticker = ticker.upper().strip()
    try:
        df = get_historical_data(ticker, period="1y")
        info = get_stock_info(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Need OHLCV for technical indicators
    import yfinance as yf
    raw = yf.Ticker(ticker).history(period="1y")
    raw = raw.reset_index()
    raw["Date"] = raw["Date"].dt.strftime("%Y-%m-%d")

    technicals = compute_indicators(raw)
    fundamentals = get_fundamentals(ticker)
    news, avg_sentiment = get_news_sentiment(ticker)
    forecast_data = run_forecast(df)
    forecast_price = forecast_data[-1]["yhat"]
    current_price = info.get("price") or df["Close"].iloc[-1]

    # Overall score
    tech_score = technicals["technical_score"]
    fund_score = fundamentals["fundamental_score"]
    overall = round((tech_score + fund_score) / 2, 1)
    if overall >= 7: verdict = "BUY"
    elif overall >= 5: verdict = "HOLD"
    else: verdict = "SELL"

    # AI deep analysis
    prompt = f"""You are a senior equity analyst. Give a concise analysis of {ticker}.

Technical: RSI {technicals['rsi']} ({technicals['rsi_label']}), MACD {technicals['macd_signal']}, Trend: {technicals['trend']}
Fundamental: P/E {fundamentals['pe_ratio']}, Revenue Growth {fundamentals['revenue_growth']}%, ROE {fundamentals['roe']}%
Sentiment: {avg_sentiment:.2f} on -1 to 1 scale
7-day forecast: ${forecast_price:.2f} (current: ${current_price:.2f})
Overall score: {overall}/10 — {verdict}

Write 3 sentences: 1. Technical picture. 2. Fundamental health. 3. Key risk or catalyst. Under 80 words, no bullets."""

    try:
        resp = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=15)
        resp.raise_for_status()
        ai_summary = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    except:
        ai_summary = f"{ticker} shows {technicals['trend'].lower()} momentum with RSI at {technicals['rsi']}. Overall score {overall}/10 — {verdict}."

    return {
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
