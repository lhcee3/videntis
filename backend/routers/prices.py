import logging
from fastapi import APIRouter
from services.stock_data import get_prices_batch

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("")
async def get_prices(tickers: str):
    symbols = [t.strip().upper() for t in tickers.split(",") if t.strip()][:20]
    result = get_prices_batch(symbols)
    return result
