# Videntis

AI-powered stock intelligence platform. 7-day price forecasts using trained LSTM models blended with Prophet, deep technical analysis, portfolio tracking, and rule-based AI explanations — all in a single dark-mode interface.

Live: https://videntis.vercel.app

---

## Features

- Live ticker tape with real-time price and daily change
- Yahoo Finance autocomplete search
- 7-day blended forecast — LSTM (60%) + Prophet (40%) with confidence bands
- Trained LSTM models for 10 stocks: AAPL, AMD, AMZN, GOOGL, JPM, META, MSFT, NFLX, NVDA, TSLA
- 3-tier data fallback: Yahoo Finance → Finnhub → Alpha Vantage
- Deep analysis: RSI, MACD, Bollinger Bands, moving averages (pandas-ta with manual fallback)
- Fundamentals from Yahoo Finance enriched with SEC EDGAR XBRL data
- Rule-based AI explanations — no external LLM, no rate limits
- News sentiment scoring via VADER
- Portfolio tracker with Gemini AI analysis
- Watchlist with Firebase persistence
- Risk management calculator — position sizer and R:R planner
- Market open/closed indicator (ET timezone)
- Google Sign-In
- Per-type TTL caching (price 60s, technical 5min, fundamentals 24h, forecast 1h)

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Firebase project with Firestore and Google Auth enabled

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env.local` and fill in your keys:
```
FINNHUB_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
GEMINI_API_KEY=your_key
SEC_EMAIL=your@email.com
```

Start the server:
```bash
uvicorn main:app --reload
```

API at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

```bash
npm run dev
```

Frontend at `http://localhost:3000`

---

## LSTM Models

The models in `backend/videntis_models/models/` were trained using `backend/LSTM_for_stocksense.ipynb` on Google Colab.

Training data: Yahoo Finance daily close prices from 2018-01-01 to 2026-03-22 (~2000 trading days per ticker).

Architecture per ticker:
- LSTM(128, return_sequences=True) → Dropout(0.2)
- LSTM(64) → Dropout(0.2)
- Dense(32, ReLU) → Dense(7)

Training config: 100 epochs max, early stopping (patience 10), Adam, MSE loss, batch 32, 80/20 chronological split.

Each ticker has two files: `{TICKER}_lstm.h5` and `{TICKER}_scaler.pkl`.

To retrain: open the notebook in Google Colab, run all cells, download the `models/` folder, replace `backend/videntis_models/models/`.

---

## Project Structure

```
videntis/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── runtime.txt                     # Python 3.11.9
│   ├── LSTM_for_stocksense.ipynb       # Training notebook
│   ├── videntis_models/
│   │   └── models/                     # .h5 + .pkl per ticker
│   ├── routers/
│   │   ├── forecast.py                 # Prophet, LSTM, blended
│   │   ├── analyze.py                  # Full analysis + scores
│   │   ├── sentiment.py
│   │   ├── portfolio.py                # Gemini AI analysis
│   │   ├── trending.py
│   │   └── prices.py
│   └── services/
│       ├── stock_data.py               # Yahoo + Finnhub + Alpha Vantage fallback
│       ├── prophet_model.py
│       ├── lstm_model.py
│       ├── technical.py                # pandas-ta with manual fallback
│       ├── fundamentals.py             # Yahoo + SEC EDGAR XBRL
│       ├── groq_explainer.py           # Rule-based, no API key
│       ├── vader_sentiment.py
│       ├── cache_manager.py            # Per-type TTL caches
│       ├── cache_warmer.py
│       └── alternative_data.py         # AKShare macro data
└── frontend/
    ├── app/
    │   ├── page.tsx
    │   ├── dashboard/[ticker]/
    │   ├── analyze/[ticker]/
    │   ├── screener/
    │   ├── portfolio/
    │   ├── watchlist/
    │   └── tools/
    ├── components/
    └── lib/
        ├── api.ts
        └── firebase.ts
```

---

## Notes

- LSTM models are pre-trained and loaded at startup — no training on request
- Prophet runs per request, takes 3-8 seconds
- Blended endpoint: LSTM 60% + Prophet 40% for supported tickers, Prophet-only fallback for others
- Data fallback chain activates automatically — no manual intervention needed
- SEC EDGAR enrichment is additive — only fills fields Yahoo left empty
- AKShare macro data is feature-flagged via `ENABLE_AKSHARE`
- Firebase free tier: 50K reads/day, 20K writes/day
