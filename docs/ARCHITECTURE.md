# Videntis Architecture

## System Overview

```
+------------------------------------------------------------------+
|                         USER BROWSER                             |
+-----------------------------+------------------------------------+
                              |
                              | HTTPS
                              v
+------------------------------------------------------------------+
|                      NEXT.JS FRONTEND (Vercel)                   |
|                                                                  |
|  Landing | Dashboard [ticker] | Screener | Portfolio | Watchlist |
|                                                                  |
|  ForecastChart | LLMExplainer | NewsSentiment | WatchlistButton  |
+-------------+----------------------------------+-----------------+
              |                                  |
              | REST API                         | Firebase SDK
              v                                  v
+-----------------------------+    +----------------------------+
|   FASTAPI BACKEND (Railway) |    |   FIREBASE                 |
|                             |    |   - Auth (Google OAuth)    |
|  /forecast/{ticker}         |    |   - Firestore              |
|  /forecast/{ticker}/blended |    |     users/watchlist        |
|  /forecast/{ticker}/lstm    |    +----------------------------+
|  /forecast/{ticker}/info    |
|  /analyze/{ticker}          |
|  /sentiment/{ticker}        |
|  /portfolio/analyze         |
+----------+------------------+
           |
           +------------------+------------------+
           |                  |                  |
           v                  v                  v
+----------------+  +------------------+  +------------------+
|  YAHOO FINANCE |  |  PROPHET MODEL   |  |  LSTM MODELS     |
|  (yfinance)    |  |  per-request     |  |  pre-trained     |
|  - prices      |  |  3-8s            |  |  10 tickers      |
|  - news RSS    |  |  7-day forecast  |  |  <1s inference   |
+----------------+  +------------------+  +------------------+
           |
           v
+----------------+  +------------------+
|  VADER         |  |  RULE-BASED      |
|  SENTIMENT     |  |  EXPLAINER       |
|  instant       |  |  no API, instant |
+----------------+  +------------------+
```

## Blended Forecast Data Flow

```
GET /forecast/{ticker}/blended
    |
    v
1. Fetch stock data (yfinance)          <- 0.5-1s
    |
    v
2. Run Prophet model                    <- 2-5s
   - Fit on 6mo historical data
   - Generate 7-day forecast + bands
    |
    v
3. Run LSTM model (if supported)        <- <1s
   - Load pre-trained .h5 + .pkl
   - Scale last 60 days of closes
   - Iterative 7-step prediction
   - Inverse transform to price
    |
    v
4. Blend: LSTM 60% + Prophet 40%        <- instant
   (falls back to Prophet-only if no LSTM)
    |
    v
5. Fetch news + VADER sentiment         <- 0.5-1s
    |
    v
6. Rule-based explanation               <- instant
    |
    v
Return JSON (total: 3-8s)
```

## LSTM Model Architecture

Each of the 10 pre-trained models shares the same architecture:

```
Input: (60, 1)  <- 60 days of scaled close prices
    |
LSTM(128, return_sequences=True)
    |
Dropout(0.2)
    |
LSTM(64, return_sequences=False)
    |
Dropout(0.2)
    |
Dense(32, relu)
    |
Dense(7)  <- 7-day forecast
```

Training details:
- Data: Yahoo Finance daily close, 2018-01-01 to 2026-03-22 (~2000 trading days)
- Scaler: MinMaxScaler(0, 1) fitted on training split only
- Split: 80% train / 20% test, chronological
- Optimizer: Adam, Loss: MSE, Batch: 32
- Max 100 epochs, early stopping patience 10
- Trained on Google Colab — notebook at `backend/LSTM_for_stocksense.ipynb`

Runtime inference:
- Fetch last 120 days from yfinance
- Scale with saved scaler
- Take last 60 days as input
- Predict 7 steps iteratively (each output fed back as next input)
- Inverse transform to dollar prices

## Backend Services

```
routers/
  forecast.py    -> /forecast/* endpoints
  analyze.py     -> /analyze/{ticker}
  sentiment.py   -> /sentiment/{ticker}
  portfolio.py   -> /portfolio/analyze
  trending.py    -> /trending
  prices.py      -> /prices

services/
  stock_data.py      -> yfinance wrapper
  prophet_model.py   -> Prophet forecasting
  lstm_model.py      -> LSTM inference (lazy-loads models)
  groq_explainer.py  -> Rule-based text generation
  technical.py       -> RSI, MACD, Bollinger Bands
  fundamentals.py    -> P/E, EPS, market cap
  vader_sentiment.py -> News sentiment scoring
```

## Database Schema

```
firestore/
  users/{userId}/
    watchlist: string[]   e.g. ["NVDA", "AAPL"]

  predictions/{ticker}_{date}/
    ticker: string
    predicted_at: string
    predicted_price: number
    actual_price: number | null
    created_at: Timestamp
```

## Deployment

```
Frontend  -> Vercel (Next.js 15, auto-deploy from Git)
Backend   -> Railway (FastAPI, LSTM models bundled in repo)
Auth/DB   -> Firebase (Firestore + Google Auth)
```

## Performance

| Component | Latency | Notes |
|-----------|---------|-------|
| yfinance | 0.5-1s | per request |
| Prophet | 2-5s | CPU-intensive |
| LSTM inference | <1s | pre-loaded at startup |
| Rule-based explainer | <0.01s | no API call |
| VADER | <0.1s | pre-trained |
| Firestore | 0.1-0.3s | |
