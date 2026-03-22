# Videntis API Reference

Base URL (local): `http://localhost:8000`
Base URL (production): your Railway backend URL

---

## Health Check

```
GET /health
```

Response:
```json
{ "status": "ok" }
```

---

## Forecast Endpoints

### Prophet Forecast
```
GET /forecast/{ticker}
```

Runs Prophet on 6 months of historical data. Takes 3-8 seconds.

Response:
```json
{
  "ticker": "NVDA",
  "info": { "name": "NVIDIA Corporation", "price": 875.40, "change_pct": 2.3, "volume": 45234567, "market_cap": 2150000000000, "sector": "Technology" },
  "historical": [{ "Date": "2025-01-01", "Close": 850.20, "Volume": 42000000 }],
  "forecast": [{ "ds": "2025-01-15", "yhat": 910.50, "yhat_lower": 890.20, "yhat_upper": 930.80, "is_forecast": true }],
  "explanation": "NVDA is forecast to rise moderately by 4.0% over the next 7 days...",
  "news": [{ "headline": "...", "url": "...", "published": "...", "sentiment": "positive", "score": 0.85 }],
  "volume_change_pct": 28.5,
  "avg_sentiment": 0.42
}
```

---

### LSTM Forecast
```
GET /forecast/{ticker}/lstm
```

Pure LSTM inference. Supported tickers only. Returns in under 1 second.

Supported tickers: AAPL, AMD, AMZN, GOOGL, JPM, META, MSFT, NFLX, NVDA, TSLA

Response:
```json
{
  "ticker": "NVDA",
  "info": { ... },
  "last_price": 875.40,
  "forecast": [880.12, 884.50, 887.20, 885.90, 883.10, 881.40, 879.80],
  "forecast_dates": ["2026-03-23", "2026-03-24", "2026-03-25", "2026-03-26", "2026-03-27", "2026-03-28", "2026-03-31"],
  "confidence_bands": { "upper": [892.32, ...], "lower": [867.92, ...] },
  "explanation": "...",
  "model": "lstm"
}
```

---

### Blended Forecast (recommended)
```
GET /forecast/{ticker}/blended
```

LSTM 60% + Prophet 40% for supported tickers. Falls back to Prophet-only for unsupported tickers. This is the endpoint the frontend uses by default.

Response:
```json
{
  "ticker": "NVDA",
  "info": { ... },
  "historical": [...],
  "last_price": 875.40,
  "forecast_prices": [882.10, 885.30, ...],
  "forecast_dates": ["2026-03-23", ...],
  "confidence_bands": { "upper": [...], "lower": [...] },
  "forecast": [...],
  "explanation": "...",
  "news": [...],
  "volume_change_pct": 12.3,
  "avg_sentiment": 0.21,
  "model": "lstm+prophet"
}
```

`model` field is either `"lstm+prophet"` or `"prophet"`.

---

### Stock Info (fast)
```
GET /forecast/{ticker}/info
```

Returns current price, daily change, volume. No ML — responds in under 1 second. Used by the screener page.

Response:
```json
{
  "name": "NVIDIA Corporation",
  "price": 875.40,
  "change_pct": 2.3,
  "volume": 45234567,
  "market_cap": 2150000000000,
  "sector": "Technology"
}
```

---

### LSTM Available Tickers
```
GET /forecast/lstm/available
```

Response:
```json
{ "tickers": ["AAPL", "AMD", "AMZN", "GOOGL", "JPM", "META", "MSFT", "NFLX", "NVDA", "TSLA"] }
```

---

## Analysis Endpoints

### Technical + Fundamental Analysis
```
GET /analyze/{ticker}
```

Returns RSI, MACD, Bollinger Bands, moving averages, P/E, EPS, market cap, sector, and composite scores.

---

### News Sentiment
```
GET /sentiment/{ticker}
```

Response:
```json
{
  "ticker": "AAPL",
  "news": [{ "headline": "...", "url": "...", "published": "...", "sentiment": "positive", "score": 0.75 }],
  "avg_sentiment": 0.42
}
```

---

## Other Endpoints

```
GET  /trending              -> Trending tickers from Yahoo Finance
GET  /prices?tickers=A,B,C  -> Batch current price + daily change
POST /portfolio/analyze     -> Portfolio analysis
GET  /health                -> Health check
```

---

## Data Models

### StockInfo
```typescript
{
  name: string
  price: number | null
  change_pct: number        // daily % change
  volume: number | null
  market_cap: number | null
  sector: string
}
```

### ForecastPoint (Prophet)
```typescript
{
  ds: string           // date YYYY-MM-DD
  yhat: number
  yhat_lower: number
  yhat_upper: number
  is_forecast: boolean
}
```

### NewsItem
```typescript
{
  headline: string
  url: string
  published: string
  sentiment: "positive" | "negative" | "neutral"
  score: number        // -1 to 1
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request (e.g. ticker not supported by LSTM) |
| 404 | Ticker not found |
| 500 | Internal server error |

---

## Testing

```bash
# Health check
curl http://localhost:8000/health

# Blended forecast
curl http://localhost:8000/forecast/NVDA/blended

# Fast info
curl http://localhost:8000/forecast/AAPL/info

# LSTM only
curl http://localhost:8000/forecast/TSLA/lstm

# Available LSTM tickers
curl http://localhost:8000/forecast/lstm/available

# Interactive docs
open http://localhost:8000/docs
```
