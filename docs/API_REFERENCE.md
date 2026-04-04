# Videntis API Reference

Base URL (local): `http://localhost:8000`
Base URL (production): your Render backend URL

Interactive docs: `http://localhost:8000/docs`

---

## Health

```
GET /health
```
```json
{ "status": "ok" }
```

---

## Forecast

### Prophet forecast
```
GET /forecast/{ticker}
```
Runs Prophet on 6 months of historical data. Takes 3-8s.

Response:
```json
{
  "ticker": "NVDA",
  "info": { "name": "NVIDIA Corporation", "price": 875.40, "change_pct": 2.3, "volume": 45234567, "market_cap": 2150000000000, "sector": "Technology" },
  "historical": [{ "Date": "2025-01-01", "Close": 850.20, "Volume": 42000000 }],
  "forecast": [{ "ds": "2025-01-15", "yhat": 910.50, "yhat_lower": 890.20, "yhat_upper": 930.80, "is_forecast": true }],
  "explanation": "NVDA is forecast to rise moderately by 4.0%...",
  "news": [{ "headline": "...", "url": "...", "published": "...", "sentiment": "positive", "score": 0.85 }],
  "volume_change_pct": 28.5,
  "avg_sentiment": 0.42
}
```

---

### LSTM forecast
```
GET /forecast/{ticker}/lstm
```
Pure LSTM inference. Supported tickers only. Under 1s.

Supported: `AAPL, AMD, AMZN, GOOGL, JPM, META, MSFT, NFLX, NVDA, TSLA`

Response:
```json
{
  "ticker": "NVDA",
  "info": { "..." },
  "last_price": 875.40,
  "forecast": [880.12, 884.50, 887.20, 885.90, 883.10, 881.40, 879.80],
  "forecast_dates": ["2026-03-23", "2026-03-24", "2026-03-25", "2026-03-26", "2026-03-27", "2026-03-28", "2026-03-31"],
  "confidence_bands": { "upper": [892.32, "..."], "lower": [867.92, "..."] },
  "explanation": "...",
  "model": "lstm"
}
```

---

### Blended forecast (recommended)
```
GET /forecast/{ticker}/blended
```
LSTM 60% + Prophet 40% for supported tickers. Falls back to Prophet-only for others. Default endpoint used by the frontend.

Response:
```json
{
  "ticker": "NVDA",
  "info": { "..." },
  "historical": ["..."],
  "last_price": 875.40,
  "forecast_prices": [882.10, 885.30, "..."],
  "forecast_dates": ["2026-03-23", "..."],
  "confidence_bands": { "upper": ["..."], "lower": ["..."] },
  "forecast": ["..."],
  "explanation": "...",
  "news": ["..."],
  "volume_change_pct": 12.3,
  "avg_sentiment": 0.21,
  "model": "lstm+prophet"
}
```

`model` is either `"lstm+prophet"` or `"prophet"`.

---

### Stock info (fast)
```
GET /forecast/{ticker}/info
```
Current price, daily change, volume. No ML, under 1s. Used by the screener.

Data source: Yahoo Finance → Finnhub → Alpha Vantage (automatic fallback chain).

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

### LSTM available tickers
```
GET /forecast/lstm/available
```
```json
{ "tickers": ["AAPL", "AMD", "AMZN", "GOOGL", "JPM", "META", "MSFT", "NFLX", "NVDA", "TSLA"] }
```

---

## Analysis

### Full analysis
```
GET /analyze/{ticker}
```
Returns technicals, fundamentals, sentiment, forecast, and composite BUY/HOLD/SELL scores in one call.

Verdict thresholds: `overall >= 7` → BUY, `>= 5` → HOLD, `< 5` → SELL.

Fundamentals are enriched with SEC EDGAR XBRL data where Yahoo Finance fields are missing.

Response:
```json
{
  "ticker": "NVDA",
  "info": { "..." },
  "current_price": 875.40,
  "forecast_price": 910.50,
  "technicals": {
    "rsi": 58.3,
    "rsi_label": "Neutral",
    "macd": 4.21,
    "macd_signal_line": 3.10,
    "macd_histogram": 1.11,
    "macd_signal": "Bullish",
    "ma20": 860.10,
    "ma50": 840.50,
    "ma200": 780.20,
    "bb_upper": 920.00,
    "bb_mid": 860.10,
    "bb_lower": 800.20,
    "support": 820.00,
    "resistance": 930.00,
    "trend": "Strong Bullish",
    "volume_ratio": 1.3,
    "technical_score": 7.5
  },
  "fundamentals": {
    "pe_ratio": 35.2,
    "peg_ratio": 1.8,
    "price_to_book": 22.1,
    "eps": 24.89,
    "revenue_growth": 12.3,
    "earnings_growth": 18.5,
    "debt_to_equity": 42.1,
    "roe": 91.2,
    "profit_margin": 55.0,
    "beta": 1.72,
    "dividend_yield": null,
    "free_cash_flow": 60000000000,
    "total_cash": 34000000000,
    "total_debt": 8900000000,
    "fundamental_score": 8.0,
    "sector": "Technology",
    "industry": "Semiconductors",
    "description": "...",
    "employees": 29600,
    "country": "United States",
    "sec_revenue": 44870000000,
    "sec_net_income": 29760000000
  },
  "ohlcv": [{ "Date": "2025-10-01", "Open": 850.0, "High": 880.0, "Low": 845.0, "Close": 875.4, "Volume": 45000000 }],
  "news": ["..."],
  "avg_sentiment": 0.32,
  "scores": {
    "technical": 7.5,
    "fundamental": 8.0,
    "overall": 7.8,
    "verdict": "BUY"
  },
  "ai_summary": "..."
}
```

---

## Sentiment

```
GET /sentiment/{ticker}
```
VADER sentiment on the latest 10 Yahoo Finance RSS headlines. Cached 5 minutes.

Response:
```json
{
  "ticker": "AAPL",
  "news": [{ "headline": "...", "url": "...", "published": "...", "sentiment": "positive", "score": 0.75 }],
  "avg_sentiment": 0.42
}
```

---

## Prices

```
GET /prices?tickers=AAPL,MSFT,NVDA
```
Batch price fetch. Up to 20 tickers. Uses yfinance batch download with per-ticker fallback to the full fallback chain.

Response:
```json
{
  "AAPL": { "price": 172.30, "change_pct": 0.85, "volume": 58000000 },
  "MSFT": { "price": 415.20, "change_pct": -0.32, "volume": 22000000 }
}
```

---

## Trending

```
GET /trending
```
Trending tickers from Yahoo Finance. Falls back to a hardcoded list on failure.

Response:
```json
{ "tickers": ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN", "META", "GOOGL", "AMD"] }
```

---

## Portfolio

```
POST /portfolio/analyze
```
Analyzes up to 15 holdings. Returns per-holding P&L, forecast, weights, and a Gemini 2.0 Flash AI summary. Falls back to a rule-based summary if Gemini is unavailable.

Request:
```json
{
  "holdings": [
    { "ticker": "AAPL", "shares": 10, "buy_price": 150.00 },
    { "ticker": "NVDA", "shares": 5, "buy_price": 600.00 }
  ]
}
```

Response:
```json
{
  "holdings": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "shares": 10,
      "buy_price": 150.00,
      "current_price": 172.30,
      "forecast_price": 178.50,
      "current_value": 1723.00,
      "forecast_value": 1785.00,
      "cost_basis": 1500.00,
      "pnl": 223.00,
      "pnl_pct": 14.87,
      "forecast_change_pct": 3.60,
      "weight_pct": 28.4
    }
  ],
  "totals": {
    "current_value": 6065.50,
    "cost_basis": 4500.00,
    "total_pnl": 1565.50,
    "total_pnl_pct": 34.79,
    "forecast_value": 6280.00,
    "forecast_gain": 214.50,
    "forecast_gain_pct": 3.54
  },
  "summary": "Your portfolio is up 34.8% overall, led by strong tech holdings..."
}
```

---

## Data Sources

| Source | Used for | Rate limit |
|--------|----------|------------|
| Yahoo Finance (yfinance) | Prices, historical, fundamentals, news RSS | Unofficial |
| Finnhub | Price fallback tier 1 | 60 req/min |
| Alpha Vantage | Price fallback tier 2 | 25 req/day |
| SEC EDGAR XBRL | Fundamental enrichment | No key required |
| AKShare | Macro/global market data | No key required |
| Google Gemini 2.0 Flash | Portfolio AI summary | Per your API quota |

Fallback chain for price/info: Yahoo → Finnhub → Alpha Vantage. Activates automatically on failure.

---

## Caching

| Data type | TTL | Cache key pattern |
|-----------|-----|-------------------|
| Price / info | 60s | `price_{ticker}`, `info_{ticker}` |
| Technical / sentiment | 5 min | `analyze_{ticker}`, `sentiment_{ticker}` |
| Fundamentals | 24h | `fund_{ticker}` |
| Forecast | 1h | `prophet_{ticker}`, `lstm_{ticker}`, `blended_{ticker}` |

In-memory only (cachetools TTLCache). Disable with `ENABLE_CACHE=false`.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FINNHUB_API_KEY` | — | Finnhub fallback key |
| `ALPHA_VANTAGE_API_KEY` | — | Alpha Vantage fallback key |
| `GEMINI_API_KEY` | — | Google Gemini for portfolio analysis |
| `SEC_EMAIL` | `videntis@example.com` | Required by SEC EDGAR User-Agent header |
| `ENABLE_FALLBACK_SOURCES` | `true` | Enable Finnhub/Alpha Vantage fallback |
| `ENABLE_SEC_EDGAR` | `true` | Enable SEC EDGAR enrichment |
| `ENABLE_AKSHARE` | `true` | Enable AKShare macro data |
| `ENABLE_CACHE` | `true` | Enable in-memory caching |
| `CACHE_TTL_PRICE` | `60` | Price cache TTL (seconds) |
| `CACHE_TTL_TECHNICAL` | `300` | Technical/sentiment cache TTL |
| `CACHE_TTL_FUNDAMENTALS` | `86400` | Fundamentals cache TTL |
| `CACHE_TTL_FORECAST` | `3600` | Forecast cache TTL |
| `RATE_LIMIT_FINNHUB` | `55` | Max Finnhub calls per minute |
| `RATE_LIMIT_ALPHA_VANTAGE` | `24` | Max Alpha Vantage calls per day |

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request (ticker not supported by LSTM, >15 holdings) |
| 404 | Ticker not found / all data sources failed |
| 500 | Internal server error |
