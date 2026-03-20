import yfinance as yf
import pandas as pd

def get_historical_data(ticker: str, period: str = "6mo") -> pd.DataFrame:
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    df = df.reset_index()[["Date", "Close", "Volume"]]
    df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
    return df

def get_stock_info(ticker: str) -> dict:
    stock = yf.Ticker(ticker)
    info = stock.info
    return {
        "name": info.get("longName", ticker),
        "price": info.get("currentPrice") or info.get("regularMarketPrice"),
        "change_pct": round(info.get("regularMarketChangePercent", 0), 2),
        "volume": info.get("volume"),
        "market_cap": info.get("marketCap"),
        "sector": info.get("sector", ""),
    }
