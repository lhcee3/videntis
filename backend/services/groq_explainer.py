import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def explain_forecast(
    ticker: str,
    current_price: float,
    forecast_price: float,
    volume_change_pct: float,
    avg_sentiment: float,
    sector: str = ""
) -> str:
    change_pct = ((forecast_price - current_price) / current_price) * 100
    direction = "rise" if change_pct > 0 else "fall"
    sentiment_label = (
        "positive" if avg_sentiment > 0.05
        else "negative" if avg_sentiment < -0.05
        else "neutral"
    )

    prompt = f"""You are a financial analyst explaining a stock forecast to a retail investor.
Be clear, friendly, and avoid heavy jargon.

Stock: {ticker} ({sector})
Current Price: ${current_price:.2f}
7-Day Forecast: ${forecast_price:.2f} ({change_pct:+.1f}%)
Volume vs 30-day avg: {volume_change_pct:+.1f}%
News Sentiment: {sentiment_label} ({avg_sentiment:.2f} on a -1 to +1 scale)

Write exactly 2-3 sentences explaining why {ticker} is predicted to {direction} {abs(change_pct):.1f}% over the next 7 days. Mention the specific price target, one key signal (volume or sentiment), and add a brief uncertainty caveat. Keep it under 75 words. Do not use bullet points."""

    try:
        resp = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        # Fallback — never crash the whole forecast
        change_dir = "increase" if change_pct > 0 else "decrease"
        return (
            f"{ticker} is forecast to {change_dir} {abs(change_pct):.1f}% over the next 7 days, "
            f"reaching a target of ${forecast_price:.2f}. "
            f"News sentiment is {sentiment_label} and volume is {volume_change_pct:+.1f}% vs the 30-day average. "
            f"As always, forecasts carry uncertainty and past performance may not predict future results."
        )
