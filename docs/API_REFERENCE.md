# StockSense API Reference

Base URL (local): `http://localhost:8000`
Base URL (production): `https://your-app.onrender.com`

## Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

### Get Stock Forecast
```
GET /forecast/{ticker}
```

**Parameters:**
- `ticker` (path) - Stock ticker symbol (e.g., NVDA, AAPL)

**Example Request:**
```bash
curl http://localhost:8000/forecast/NVDA
```

**Response:**
```json
{
  "ticker": "NVDA",
  "info": {
    "name": "NVIDIA Corporation",
    "price": 875.40,
    "change_pct": 45.23,
    "volume": 45234567,
    "market_cap": 2150000000000,
    "sector": "Technology"
  },
  "historical": [
    {
      "Date": "2025-01-01",
      "Close": 850.20,
      "Volume": 42000000
    }
  ],
  "forecast": [
    {
      "ds": "2025-01-15",
      "yhat": 910.50,
      "yhat_lower": 890.20,
      "yhat_upper": 930.80,
      "is_forecast": true
    }
  ],
  "explanation": "NVDA is predicted to rise 4.0% over the next 7 days to $910.50, driven by strong volume momentum (+28% vs 30-day average) and positive news sentiment. However, market volatility remains a factor.",
  "news": [
    {
      "headline": "NVIDIA announces new AI chip",
      "url": "https://...",
      "published": "2025-01-10T10:00:00Z",
      "sentiment": "positive",
      "score": 0.85
    }
  ],
  "volume_change_pct": 28.5,
  "avg_sentiment": 0.42
}
```

**Error Response (404):**
```json
{
  "detail": "Ticker 'INVALID' not found: ..."
}
```

---

### Get News Sentiment
```
GET /sentiment/{ticker}
```

**Parameters:**
- `ticker` (path) - Stock ticker symbol

**Example Request:**
```bash
curl http://localhost:8000/sentiment/AAPL
```

**Response:**
```json
{
  "ticker": "AAPL",
  "news": [
    {
      "headline": "Apple reports record earnings",
      "url": "https://...",
      "published": "2025-01-10T10:00:00Z",
      "sentiment": "positive",
      "score": 0.75
    }
  ],
  "avg_sentiment": 0.42
}
```

---

## Data Models

### StockInfo
```typescript
{
  name: string          // Company name
  price: number | null  // Current price
  change_pct: number    // 52-week change percentage
  volume: number | null // Trading volume
  market_cap: number | null // Market capitalization
  sector: string        // Industry sector
}
```

### NewsItem
```typescript
{
  headline: string   // News headline
  url: string       // Article URL
  published: string // Publication date
  sentiment: "positive" | "negative" | "neutral"
  score: number     // Sentiment score (-1 to 1)
}
```

### ForecastPoint
```typescript
{
  ds: string           // Date (YYYY-MM-DD)
  yhat: number        // Predicted price
  yhat_lower: number  // Lower confidence bound
  yhat_upper: number  // Upper confidence bound
  is_forecast: boolean // True if future prediction
}
```

---

## Rate Limits

### Free Tier (Development)
- No rate limits on local development
- yfinance may throttle after ~2000 requests/hour

### Production Limits
- Groq API: 14,400 requests/day
- Recommend implementing caching for repeated queries

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 404  | Ticker not found |
| 500  | Internal server error |

---

## Testing Examples

### Test with curl
```bash
# Health check
curl http://localhost:8000/health

# Get forecast
curl http://localhost:8000/forecast/NVDA

# Get sentiment only
curl http://localhost:8000/sentiment/AAPL
```

### Test with Python
```python
import requests

# Get forecast
response = requests.get("http://localhost:8000/forecast/NVDA")
data = response.json()

print(f"Current: ${data['info']['price']}")
print(f"Forecast: ${data['forecast'][-1]['yhat']:.2f}")
print(f"Explanation: {data['explanation']}")
```

### Test with JavaScript
```javascript
// Get forecast
fetch('http://localhost:8000/forecast/NVDA')
  .then(res => res.json())
  .then(data => {
    console.log(`Current: $${data.info.price}`)
    console.log(`Forecast: $${data.forecast[data.forecast.length-1].yhat}`)
    console.log(`Explanation: ${data.explanation}`)
  })
```

---

## Common Issues

### Ticker Not Found
- Verify ticker symbol is correct
- Use uppercase (NVDA not nvda)
- Check if ticker exists on Yahoo Finance

### Slow Response
- Prophet model takes 2-5 seconds to train
- First request may be slower
- Consider implementing caching

### Missing Data
- Some tickers may have incomplete data
- Check yfinance data availability
- Try different time periods

---

## Caching Strategy (Optional)

To improve performance, cache responses:

```python
from functools import lru_cache
from datetime import datetime, timedelta

@lru_cache(maxsize=100)
def get_cached_forecast(ticker: str, date: str):
    # Only cache if date is today
    if date == datetime.now().strftime("%Y-%m-%d"):
        return fetch_forecast(ticker)
    return None
```

---

## Future Enhancements

Potential API additions:
- `GET /compare/{ticker1}/{ticker2}` - Compare two stocks
- `GET /portfolio` - Portfolio tracking
- `POST /backtest` - Historical accuracy testing
- `GET /alerts` - Price alert management
- `GET /technical/{ticker}` - Technical indicators
