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

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11 |
| Forecasting | LSTM (TensorFlow/Keras) + Facebook Prophet |
| Sentiment | VADER |
| Fundamentals | yfinance + SEC EDGAR XBRL API |
| Alternative Data | AKShare (macro/global markets) |
| Portfolio AI | Google Gemini 2.0 Flash |
| Auth / DB | Firebase (Firestore + Google Auth) |
| Deployment | Vercel (frontend) + Render (backend) |

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

## API

Full API reference in `docs/API_REFERENCE.md`. Interactive docs at `http://localhost:8000/docs`.

---

## Notes

- LSTM models are pre-trained and loaded at startup — no training on request
- Prophet runs per request and takes 3-8 seconds
- Blended endpoint uses LSTM 60% + Prophet 40% for supported tickers, falls back to Prophet-only for others
- Fallback data sources (Finnhub, Alpha Vantage) activate automatically if Yahoo Finance fails
- SEC EDGAR enrichment is additive — only fills fields Yahoo left empty
- Firebase free tier: 50K reads/day, 20K writes/day
