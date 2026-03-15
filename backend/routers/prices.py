from fastapi import APIRouter
import yfinance as yf

router = APIRouter()

@router.get("")
async def get_prices(tickers: str):
    symbols = [t.strip().upper() for t in tickers.split(",") if t.strip()][:20]
    result = {}
    for symbol in symbols:
        try:
            info = yf.Ticker(symbol).info
            price = info.get("currentPrice") or info.get("regularMarketPrice")
            prev = info.get("previousClose") or info.get("regularMarketPreviousClose")
            volume = info.get("volume") or info.get("regularMarketVolume")
            change_pct = round(((price - prev) / prev) * 100, 2) if price and prev else None
            result[symbol] = {
                "price": round(price, 2) if price else None,
                "change_pct": change_pct,
                "volume": volume,
            }
        except:
            result[symbol] = {"price": None, "change_pct": None, "volume": None}
    return result
