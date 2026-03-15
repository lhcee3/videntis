from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.stock_data import get_stock_info, get_historical_data
from services.prophet_model import run_forecast
import requests
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

router = APIRouter()

class HoldingInput(BaseModel):
    ticker: str
    shares: float
    buy_price: float

class PortfolioRequest(BaseModel):
    holdings: list[HoldingInput]

@router.post("/analyze")
async def analyze_portfolio(req: PortfolioRequest):
    if not req.holdings:
        raise HTTPException(status_code=400, detail="No holdings provided")
    if len(req.holdings) > 15:
        raise HTTPException(status_code=400, detail="Max 15 holdings supported")

    results = []
    total_current_value = 0
    total_cost_basis = 0
    total_forecast_value = 0

    for h in req.holdings:
        ticker = h.ticker.upper()
        try:
            info = get_stock_info(ticker)
            df = get_historical_data(ticker)
            forecast = run_forecast(df)

            current_price = info.get("price") or df["Close"].iloc[-1]
            forecast_price = forecast[-1]["yhat"]
            cost_basis = h.shares * h.buy_price
            current_value = h.shares * current_price
            forecast_value = h.shares * forecast_price
            pnl = current_value - cost_basis
            pnl_pct = (pnl / cost_basis) * 100 if cost_basis else 0
            forecast_change_pct = ((forecast_price - current_price) / current_price) * 100

            total_current_value += current_value
            total_cost_basis += cost_basis
            total_forecast_value += forecast_value

            results.append({
                "ticker": ticker,
                "name": info.get("name", ticker),
                "shares": h.shares,
                "buy_price": h.buy_price,
                "current_price": round(current_price, 2),
                "forecast_price": round(forecast_price, 2),
                "current_value": round(current_value, 2),
                "forecast_value": round(forecast_value, 2),
                "cost_basis": round(cost_basis, 2),
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
                "forecast_change_pct": round(forecast_change_pct, 2),
                "weight_pct": 0,
            })
        except Exception as e:
            results.append({"ticker": ticker, "error": str(e)})

    for r in results:
        if "error" not in r and total_current_value:
            r["weight_pct"] = round((r["current_value"] / total_current_value) * 100, 1)

    total_pnl = total_current_value - total_cost_basis
    total_pnl_pct = (total_pnl / total_cost_basis) * 100 if total_cost_basis else 0
    forecast_gain = total_forecast_value - total_current_value
    forecast_gain_pct = (forecast_gain / total_current_value) * 100 if total_current_value else 0

    holdings_summary = "\n".join([
        f"- {r['ticker']}: {r.get('weight_pct', 0)}% of portfolio, "
        f"7-day forecast {r.get('forecast_change_pct', 0):+.1f}%, "
        f"P&L {r.get('pnl_pct', 0):+.1f}%"
        for r in results if "error" not in r
    ])

    prompt = f"""You are a portfolio analyst. Analyze this stock portfolio for a retail investor.

Holdings:
{holdings_summary}

Portfolio total: ${total_current_value:,.2f}
Total P&L: {total_pnl_pct:+.1f}%
7-day forecast gain: {forecast_gain_pct:+.1f}%

Write 3 sentences: 1. Overall portfolio health and dominant theme. 2. Strongest and weakest holding this week. 3. One risk or opportunity to watch. Be specific, friendly, under 85 words. No bullet points."""

    try:
        resp = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=15,
        )
        resp.raise_for_status()
        summary = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        summary = f"Portfolio is {'up' if total_pnl >= 0 else 'down'} {abs(total_pnl_pct):.1f}% overall with a 7-day forecast of {forecast_gain_pct:+.1f}%. Review individual holdings for detailed signals."

    return {
        "holdings": results,
        "totals": {
            "current_value": round(total_current_value, 2),
            "cost_basis": round(total_cost_basis, 2),
            "total_pnl": round(total_pnl, 2),
            "total_pnl_pct": round(total_pnl_pct, 2),
            "forecast_value": round(total_forecast_value, 2),
            "forecast_gain": round(forecast_gain, 2),
            "forecast_gain_pct": round(forecast_gain_pct, 2),
        },
        "summary": summary,
    }
