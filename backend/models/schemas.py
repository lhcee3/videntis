from pydantic import BaseModel
from typing import List, Optional

class StockInfo(BaseModel):
    name: str
    price: Optional[float]
    change_pct: float
    volume: Optional[int]
    market_cap: Optional[int]
    sector: str

class NewsItem(BaseModel):
    headline: str
    url: str
    published: str
    sentiment: str
    score: float

class ForecastResponse(BaseModel):
    ticker: str
    info: StockInfo
    historical: List[dict]
    forecast: List[dict]
    explanation: str
    news: List[NewsItem]
    volume_change_pct: float
    avg_sentiment: float
