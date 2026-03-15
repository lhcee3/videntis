from fastapi import APIRouter
import requests

router = APIRouter()

@router.get("")
async def get_trending():
    try:
        res = requests.get(
            "https://query1.finance.yahoo.com/v1/finance/trending/US?count=10",
            headers={"User-Agent": "Mozilla/5.0"}, timeout=8
        )
        quotes = res.json()["finance"]["result"][0]["quotes"]
        return {"tickers": [q["symbol"] for q in quotes]}
    except:
        return {"tickers": ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN", "META", "GOOGL", "AMD"]}
