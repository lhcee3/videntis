# Videntis

AI-powered stock intelligence platform. 7-day price forecasts using trained LSTM models blended with Prophet, deep technical analysis, portfolio tracking, and rule-based AI explanations — all in a single dark-mode interface.

Live: https://videntis.vercel.app

---

## Features

- Live ticker tape with real-time price and daily change
- Yahoo Finance autocomplete search
- 7-day blended forecast — LSTM (60%) + Prophet (40%) with confidence bands
- Trained LSTM models for 10 stocks: AAPL, AMD, AMZN, GOOGL, JPM, META, MSFT, NFLX, NVDA, TSLA
- Deep analysis: RSI, MACD, Bollinger Bands, moving averages
- Fundamentals: P/E, EPS, market cap, sector
- Rule-based AI explanations — no external LLM, no rate limits
- News sentiment scoring via VADER
- Portfolio tracker with AI analysis
- Watchlist with Firebase persistence
- Risk management calculator — position sizer and R:R planner
- Market open/closed indicator (ET timezone)
- Google Sign-In

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11 |
| Forecasting | LSTM (TensorFlow/Keras) + Facebook Prophet |
| Sentiment | VADER |
| Auth / DB | Firebase (Firestore + Google Auth) |
| Deployment | Vercel (frontend) + Railway (backend) |

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

Create `backend/.env`:
```
# No external API keys required
```

Start the server:
```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

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

Frontend available at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/forecast/{ticker}` | Prophet forecast + news + explanation |
| GET | `/forecast/{ticker}/lstm` | Pure LSTM forecast (10 supported tickers) |
| GET | `/forecast/{ticker}/blended` | LSTM + Prophet blended forecast |
| GET | `/forecast/{ticker}/info` | Fast stock info (price, change, volume) |
| GET | `/forecast/lstm/available` | List LSTM-supported tickers |
| GET | `/analyze/{ticker}` | Technical indicators, fundamentals, scores |
| GET | `/sentiment/{ticker}` | News sentiment |
| GET | `/trending` | Trending tickers |
| GET | `/prices?tickers=A,B` | Batch price fetch |
| POST | `/portfolio/analyze` | Portfolio analysis |

---

## Project Structure

```
videntis/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── videntis_models/
│   │   └── models/
│   │       ├── AAPL_lstm.h5
│   │       ├── AAPL_scaler.pkl
│   │       └── ... (10 tickers)
│   ├── routers/
│   │   ├── forecast.py       # Prophet + LSTM + blended endpoints
│   │   ├── analyze.py
│   │   ├── sentiment.py
│   │   ├── portfolio.py
│   │   ├── trending.py
│   │   └── prices.py
│   └── services/
│       ├── stock_data.py
│       ├── prophet_model.py
│       ├── lstm_model.py     # LSTM inference
│       ├── technical.py
│       ├── fundamentals.py
│       ├── groq_explainer.py # Rule-based, no API key needed
│       └── vader_sentiment.py
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
    │   ├── ForecastChart.tsx
    │   ├── TechnicalIndicators.tsx
    │   ├── FundamentalsCard.tsx
    │   ├── RiskCalculator.tsx
    │   ├── AIChat.tsx
    │   ├── NewsSentiment.tsx
    │   ├── WatchlistButton.tsx
    │   └── portfolio/
    └── lib/
        ├── api.ts
        └── firebase.ts
```

---

## Notes

- LSTM models are pre-trained and loaded at startup — no training on request
- Prophet runs per request and takes 3-8 seconds
- Blended endpoint uses LSTM 60% + Prophet 40% for supported tickers
- No external LLM API required — explanations are rule-based
- Firebase free tier: 50K reads/day, 20K writes/day
