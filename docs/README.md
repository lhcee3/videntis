# Videntis

AI-powered stock intelligence platform. 7-day price forecasts, deep technical analysis, portfolio tracking, and plain-English AI explanations — all in a single dark-mode interface.

## Features

- Live ticker tape with real-time price and daily change
- Yahoo Finance search — type a company name or ticker
- 7-day Prophet forecast with confidence bands
- Deep analysis: RSI, MACD, Bollinger Bands, moving averages
- Fundamentals: P/E, EPS, market cap, sector
- AI summary via Gemini — one paragraph you can act on
- News sentiment scoring per article
- Portfolio tracker with Gemini AI analysis
- Watchlist with Firebase persistence
- Risk management calculator — position sizer and R:R planner
- Market open/closed indicator (ET timezone)
- Google Sign-In

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Firebase project with Firestore and Google Auth enabled
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Create `backend/.env`:
```
GEMINI_API_KEY=your_key_here
```

Start the server:
```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

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

Start the dev server:
```bash
npm run dev
```

Frontend available at `http://localhost:3000`.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/forecast/{ticker}` | 7-day Prophet forecast + news + AI explanation |
| GET | `/analyze/{ticker}` | Technical indicators, fundamentals, AI summary, scores |
| GET | `/sentiment/{ticker}` | News sentiment for a ticker |
| GET | `/trending` | Trending tickers from Yahoo Finance |
| GET | `/prices?tickers=A,B,C` | Batch current price + daily change |
| POST | `/portfolio/analyze` | Gemini AI analysis of a portfolio |

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project
2. Enable Firestore Database (start in test mode, then apply the rules below)
3. Enable Authentication and add the Google provider
4. Go to Project Settings → Your apps → Add Web app → copy the config into `.env.local`


## Project Structure

```
videntis/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── requirements.txt
│   ├── .env                     # GEMINI_API_KEY
│   ├── routers/
│   │   ├── forecast.py          # Prophet forecast endpoint
│   │   ├── analyze.py           # Technical + fundamental analysis
│   │   ├── sentiment.py         # News sentiment
│   │   ├── portfolio.py         # Portfolio analysis with Gemini
│   │   ├── trending.py          # Trending tickers
│   │   └── prices.py            # Batch price fetch
│   ├── services/
│   │   ├── stock_data.py        # yfinance wrapper
│   │   ├── prophet_model.py     # Prophet training + forecast
│   │   ├── technical.py         # RSI, MACD, Bollinger Bands
│   │   ├── fundamentals.py      # P/E, EPS, market cap
│   │   ├── groq_explainer.py    # Gemini REST calls
│   │   └── vader_sentiment.py   # VADER sentiment scoring
│   └── models/
│       └── schemas.py           # Pydantic models
└── frontend/
    ├── app/
    │   ├── page.tsx             # Homepage — search, ticker tape, hero
    │   ├── dashboard/[ticker]/  # Forecast + chart + news
    │   ├── analyze/[ticker]/    # Deep analysis page
    │   ├── screener/            # Stock screener grid
    │   ├── portfolio/           # Portfolio tracker
    │   ├── watchlist/           # Saved tickers
    │   └── tools/               # Risk management calculator
    ├── components/
    │   ├── ForecastChart.tsx
    │   ├── TechnicalIndicators.tsx
    │   ├── FundamentalsCard.tsx
    │   ├── RiskCalculator.tsx
    │   ├── AIChat.tsx
    │   ├── NewsSentiment.tsx
    │   ├── WatchlistButton.tsx
    │   └── portfolio/
    ├── lib/
    │   ├── api.ts               # All backend fetch calls
    │   └── firebase.ts          # Firebase init + Firestore helpers
    └── hooks/
        └── useAuth.ts           # Firebase auth state hook
```

## Notes

- Prophet training runs on each forecast request and takes 3–8 seconds — this is expected
- The Gemini API key is used server-side only; it is never exposed to the browser
- Firebase free tier: 50K reads/day, 20K writes/day — sufficient for personal use
- No Docker required for development; `docker-compose.yml` is provided for containerised deployment

---
