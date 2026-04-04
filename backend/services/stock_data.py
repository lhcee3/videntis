import os
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

import yfinance as yf
import pandas as pd
import requests as req

from services import cache_manager as cache

logger = logging.getLogger(__name__)

FINNHUB_API_KEY      = os.getenv("FINNHUB_API_KEY", "")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
ENABLE_FALLBACK      = os.getenv("ENABLE_FALLBACK_SOURCES", "true").lower() == "true"

# ---------------------------------------------------------------------------
# Rate limit tracking
# ---------------------------------------------------------------------------
_rate_tracker: dict = defaultdict(list)

def _check_rate_limit(source: str, limit: int, window_seconds: int = 60) -> bool:
    now = datetime.now()
    cutoff = now - timedelta(seconds=window_seconds)
    _rate_tracker[source] = [t for t in _rate_tracker[source] if t > cutoff]
    if len(_rate_tracker[source]) < limit:
        _rate_tracker[source].append(now)
        return True
    return False

# ---------------------------------------------------------------------------
# Private fetch helpers
# ---------------------------------------------------------------------------

def _fetch_yahoo_info(ticker: str) -> dict:
    stock = yf.Ticker(ticker)
    info = stock.info
    price = info.get("currentPrice") or info.get("regularMarketPrice")
    if not price:
        raise ValueError(f"No price from Yahoo for {ticker}")
    return {
        "name": info.get("longName", ticker),
        "price": price,
        "change_pct": round(info.get("regularMarketChangePercent", 0), 2),
        "volume": info.get("volume"),
        "market_cap": info.get("marketCap"),
        "sector": info.get("sector", ""),
    }


def _fetch_finnhub_info(ticker: str) -> dict:
    if not FINNHUB_API_KEY:
        raise ValueError("No Finnhub key")
    if not _check_rate_limit("finnhub", 55, 60):  # stay under 60/min
        raise ValueError("Finnhub rate limit reached")

    quote_url = f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={FINNHUB_API_KEY}"
    profile_url = f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker}&token={FINNHUB_API_KEY}"

    q = req.get(quote_url, timeout=8).json()
    p = req.get(profile_url, timeout=8).json()

    price = q.get("c")
    prev  = q.get("pc")
    if not price:
        raise ValueError(f"No price from Finnhub for {ticker}")

    change_pct = round(((price - prev) / prev) * 100, 2) if prev else 0
    return {
        "name": p.get("name", ticker),
        "price": price,
        "change_pct": change_pct,
        "volume": None,
        "market_cap": p.get("marketCapitalization"),
        "sector": p.get("finnhubIndustry", ""),
    }


def _fetch_alpha_vantage_info(ticker: str) -> dict:
    if not ALPHA_VANTAGE_API_KEY:
        raise ValueError("No Alpha Vantage key")
    # 25 calls/day — use a daily window
    if not _check_rate_limit("alphavantage", 24, 86400):
        raise ValueError("Alpha Vantage rate limit reached")

    url = (
        f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE"
        f"&symbol={ticker}&apikey={ALPHA_VANTAGE_API_KEY}"
    )
    data = req.get(url, timeout=10).json().get("Global Quote", {})
    price = float(data.get("05. price", 0) or 0)
    if not price:
        raise ValueError(f"No price from Alpha Vantage for {ticker}")

    prev = float(data.get("08. previous close", 0) or 0)
    change_pct = round(((price - prev) / prev) * 100, 2) if prev else 0
    return {
        "name": ticker,
        "price": price,
        "change_pct": change_pct,
        "volume": int(data.get("06. volume", 0) or 0) or None,
        "market_cap": None,
        "sector": "",
    }

# ---------------------------------------------------------------------------
# Public API — same signatures as before
# ---------------------------------------------------------------------------

def get_historical_data(ticker: str, period: str = "6mo") -> pd.DataFrame:
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    df = df.reset_index()[["Date", "Close", "Volume"]]
    df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
    return df


def get_stock_info(ticker: str) -> dict:
    cached = cache.get_price(f"info_{ticker}")
    if cached is not None:
        return cached

    last_err = None

    # Primary: Yahoo Finance
    try:
        result = _fetch_yahoo_info(ticker)
        cache.set_price(f"info_{ticker}", result)
        return result
    except Exception as e:
        last_err = e
        logger.warning(f"Yahoo info failed for {ticker}: {e}")

    if not ENABLE_FALLBACK:
        raise RuntimeError(f"Yahoo failed and fallbacks disabled: {last_err}")

    # Fallback 1: Finnhub
    try:
        result = _fetch_finnhub_info(ticker)
        cache.set_price(f"info_{ticker}", result)
        logger.info(f"Used Finnhub fallback for {ticker}")
        return result
    except Exception as e:
        logger.warning(f"Finnhub fallback failed for {ticker}: {e}")

    # Fallback 2: Alpha Vantage
    try:
        result = _fetch_alpha_vantage_info(ticker)
        cache.set_price(f"info_{ticker}", result)
        logger.info(f"Used Alpha Vantage fallback for {ticker}")
        return result
    except Exception as e:
        logger.error(f"All sources failed for {ticker}: {e}")
        raise RuntimeError(f"All data sources failed for {ticker}")


def get_prices_batch(ticker_list: List[str]) -> dict:
    result = {}
    to_fetch = []

    for ticker in ticker_list:
        cached = cache.get_price(f"price_{ticker}")
        if cached is not None:
            result[ticker] = cached
        else:
            to_fetch.append(ticker)

    if not to_fetch:
        return result

    try:
        raw = yf.download(to_fetch, period="2d", progress=False, auto_adjust=True, group_by="ticker")

        for ticker in to_fetch:
            try:
                closes = raw["Close"] if len(to_fetch) == 1 else raw[ticker]["Close"]
                closes = closes.dropna()
                if len(closes) < 2:
                    raise ValueError("insufficient data")

                price = float(closes.iloc[-1])
                prev  = float(closes.iloc[-2])
                change_pct = round(((price - prev) / prev) * 100, 2) if prev else None

                volume = None
                try:
                    volume = yf.Ticker(ticker).fast_info.get("three_month_average_volume")
                except Exception:
                    pass

                entry = {"price": round(price, 2), "change_pct": change_pct, "volume": volume}
                cache.set_price(f"price_{ticker}", entry)
                result[ticker] = entry
            except Exception as e:
                logger.warning(f"Batch price failed for {ticker}: {e}")
                # Try fallback for individual ticker
                try:
                    if ENABLE_FALLBACK:
                        info = get_stock_info(ticker)
                        entry = {
                            "price": info.get("price"),
                            "change_pct": info.get("change_pct"),
                            "volume": info.get("volume"),
                        }
                        result[ticker] = entry
                    else:
                        result[ticker] = {"price": None, "change_pct": None, "volume": None}
                except Exception:
                    result[ticker] = {"price": None, "change_pct": None, "volume": None}

    except Exception as e:
        logger.error(f"Batch download failed: {e}")
        for ticker in to_fetch:
            result[ticker] = {"price": None, "change_pct": None, "volume": None}

    return result
