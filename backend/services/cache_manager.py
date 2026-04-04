import os
import logging
from cachetools import TTLCache
from threading import Lock

logger = logging.getLogger(__name__)

ENABLE_CACHE = os.getenv("ENABLE_CACHE", "true").lower() == "true"

TTL_PRICE        = int(os.getenv("CACHE_TTL_PRICE",        "60"))
TTL_TECHNICAL    = int(os.getenv("CACHE_TTL_TECHNICAL",    "300"))
TTL_FUNDAMENTALS = int(os.getenv("CACHE_TTL_FUNDAMENTALS", "86400"))
TTL_FORECAST     = int(os.getenv("CACHE_TTL_FORECAST",     "3600"))

# Single shared cache — maxsize covers all keys across all TTL types
_cache = TTLCache(maxsize=512, ttl=TTL_FORECAST)
_lock = Lock()


class CacheManager:
    def get(self, key: str):
        if not ENABLE_CACHE:
            return None
        with _lock:
            value = _cache.get(key)
        if value is not None:
            logger.debug(f"CACHE HIT  {key}")
        else:
            logger.debug(f"CACHE MISS {key}")
        return value

    def set(self, key: str, value, ttl_override: int = None):
        if not ENABLE_CACHE:
            return
        # cachetools TTLCache uses a single TTL at construction time.
        # For per-key TTL we store with a wrapper and check expiry manually,
        # but for simplicity we use separate caches per TTL bucket.
        with _lock:
            _cache[key] = value


# Per-TTL caches for different data types
_price_cache        = TTLCache(maxsize=256, ttl=TTL_PRICE)
_technical_cache    = TTLCache(maxsize=128, ttl=TTL_TECHNICAL)
_fundamentals_cache = TTLCache(maxsize=128, ttl=TTL_FUNDAMENTALS)
_forecast_cache     = TTLCache(maxsize=64,  ttl=TTL_FORECAST)
_sentiment_cache    = TTLCache(maxsize=128, ttl=TTL_TECHNICAL)  # 5 min

_price_lock        = Lock()
_technical_lock    = Lock()
_fundamentals_lock = Lock()
_forecast_lock     = Lock()
_sentiment_lock    = Lock()


def _get(cache, lock, key):
    if not ENABLE_CACHE:
        return None
    with lock:
        val = cache.get(key)
    if val is not None:
        logger.info(f"CACHE HIT  [{key}]")
    else:
        logger.info(f"CACHE MISS [{key}]")
    return val


def _set(cache, lock, key, value):
    if not ENABLE_CACHE:
        return
    with lock:
        cache[key] = value


def get_price(key):        return _get(_price_cache,        _price_lock,        key)
def set_price(key, v):     return _set(_price_cache,        _price_lock,        key, v)

def get_technical(key):    return _get(_technical_cache,    _technical_lock,    key)
def set_technical(key, v): return _set(_technical_cache,    _technical_lock,    key, v)

def get_fundamentals(key):    return _get(_fundamentals_cache, _fundamentals_lock, key)
def set_fundamentals(key, v): return _set(_fundamentals_cache, _fundamentals_lock, key, v)

def get_forecast(key):     return _get(_forecast_cache,     _forecast_lock,     key)
def set_forecast(key, v):  return _set(_forecast_cache,     _forecast_lock,     key, v)

def get_sentiment(key):    return _get(_sentiment_cache,    _sentiment_lock,    key)
def set_sentiment(key, v): return _set(_sentiment_cache,    _sentiment_lock,    key, v)
