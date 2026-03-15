from fastapi import APIRouter, HTTPException
from services.stock_data import get_historical_data, get_stock_info
from services.prophet_model import run_forecast
from services.groq_explainer import explain_forecast
from services.vader_sentiment import get_news_sentiment

router = APIRouter()

@router.get("/{ticker}")
async def forecast_stock(ticker: str):
    ticker = ticker.upper().strip()
    
    try:
        df = get_historical_data(ticker)
        info = get_stock_info(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found: {str(e)}")
    
    forecast_data = run_forecast(df)
    
    # Volume signal
    avg_vol = df["Volume"].tail(30).mean()
    recent_vol = df["Volume"].tail(5).mean()
    volume_change = ((recent_vol - avg_vol) / avg_vol) * 100 if avg_vol else 0
    
    # News + sentiment
    news, avg_sentiment = get_news_sentiment(ticker)
    
    # LLM explanation
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
    
    return {
        "ticker": ticker,
        "info": info,
        "historical": df.to_dict(orient="records"),
        "forecast": forecast_data,
        "explanation": explanation,
        "news": news,
        "volume_change_pct": round(volume_change, 2),
        "avg_sentiment": round(avg_sentiment, 3),
    }
