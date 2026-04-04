"""
Alternative data via AKShare — macro and global market data.
All functions are additive; none modify existing services.
Feature flag: ENABLE_AKSHARE=true (default)
"""
import os
import logging
from typing import Optional, Dict, Any

from services import cache_manager as cache

logger = logging.getLogger(__name__)
ENABLE_AKSHARE = os.getenv("ENABLE_AKSHARE", "true").lower() == "true"


def _ak():
    import akshare as ak
    return ak


def get_macro_china_cpi() -> Optional[float]:
    if not ENABLE_AKSHARE:
        return None
    cached = cache.get_fundamentals("macro_china_cpi")
    if cached is not None:
        return cached
    try:
        df = _ak().macro_china_cpi_yearly()
        val = float(df.iloc[-1]["value"]) if not df.empty else None
        if val is not None:
            cache.set_fundamentals("macro_china_cpi", val)
        return val
    except Exception as e:
        logger.warning(f"AKShare China CPI failed: {e}")
        return None


def get_global_market_sentiment() -> Dict[str, Any]:
    """
    Returns a lightweight macro sentiment dict using AKShare global index data.
    Cached for 5 minutes (technical TTL).
    """
    if not ENABLE_AKSHARE:
        return {}
    cached = cache.get_technical("global_sentiment")
    if cached is not None:
        return cached
    result: Dict[str, Any] = {}
    try:
        # Fear & Greed proxy: US index futures change
        df = _ak().stock_us_index_spot_em()
        if not df.empty:
            # Pick S&P 500 row if present
            sp = df[df["名称"].str.contains("标普", na=False)]
            if not sp.empty:
                result["sp500_change_pct"] = float(sp.iloc[0].get("涨跌幅", 0) or 0)
    except Exception as e:
        logger.warning(f"AKShare global sentiment failed: {e}")

    try:
        result["china_cpi"] = get_macro_china_cpi()
    except Exception:
        pass

    if result:
        cache.set_technical("global_sentiment", result)
    return result
