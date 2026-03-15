from fastapi import APIRouter
from services.vader_sentiment import get_news_sentiment

router = APIRouter()

@router.get("/{ticker}")
async def get_sentiment(ticker: str):
    ticker = ticker.upper().strip()
    news, avg_sentiment = get_news_sentiment(ticker)
    return {
        "ticker": ticker,
        "news": news,
        "avg_sentiment": avg_sentiment,
    }
