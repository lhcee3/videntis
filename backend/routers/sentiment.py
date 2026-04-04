from fastapi import APIRouter
from services.vader_sentiment import get_news_sentiment
from services import cache_manager as cache

router = APIRouter()


@router.get("/{ticker}")
async def get_sentiment(ticker: str):
    ticker = ticker.upper().strip()
    cached = cache.get_sentiment(f"sentiment_{ticker}")
    if cached is not None:
        news, avg_sentiment = cached
        return {"ticker": ticker, "news": news, "avg_sentiment": avg_sentiment}

    news, avg_sentiment = get_news_sentiment(ticker)
    cache.set_sentiment(f"sentiment_{ticker}", (news, avg_sentiment))
    return {"ticker": ticker, "news": news, "avg_sentiment": avg_sentiment}
