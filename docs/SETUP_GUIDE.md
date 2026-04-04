# Videntis Setup Guide

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Test each service:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/forecast/NVDA/blended
curl http://localhost:8000/forecast/AAPL/info
```

No API keys required. The explainer is rule-based and the LSTM models are pre-trained files bundled in the repo.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000.

---

## Firebase Setup

1. Go to https://console.firebase.google.com
2. Create project
3. Enable Firestore (test mode)
4. Enable Authentication > Google provider
5. Project Settings > Web app > copy config into `frontend/.env.local`

Apply Firestore security rules from `docs/firestore.rules` when ready for production.

---

## LSTM Models

The pre-trained models live in `backend/videntis_models/models/`. Each ticker has two files:
- `{TICKER}_lstm.h5` — Keras model weights
- `{TICKER}_scaler.pkl` — MinMaxScaler fitted on training data

Models are lazy-loaded on first request and cached in memory for subsequent calls.

To retrain:
1. Open `backend/LSTM_for_stocksense.ipynb` in Google Colab
2. Run all cells (takes ~10-20 min on Colab GPU for all 10 tickers)
3. Download the `models/` folder from Colab
4. Replace `backend/videntis_models/models/` with the new files

Training config used:
- Data: 2018-01-01 to present, Yahoo Finance daily close
- Lookback: 60 days
- Forecast horizon: 7 days
- Architecture: LSTM(128) > Dropout(0.2) > LSTM(64) > Dropout(0.2) > Dense(32) > Dense(7)
- Optimizer: Adam, Loss: MSE
- Early stopping: patience 10

---

## Deployment

### Backend — Render

1. Push repo to GitHub
2. Create new Render Web Service > connect GitHub repo
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables in the Render dashboard:
   - `FINNHUB_API_KEY`
   - `ALPHA_VANTAGE_API_KEY`
   - `GEMINI_API_KEY`
   - `SEC_EMAIL`
   - `ENABLE_CACHE=true`
   - `ENABLE_FALLBACK_SOURCES=true`
   - `ENABLE_SEC_EDGAR=true`
   - `ENABLE_AKSHARE=true`
   - `PYTHON_VERSION=3.11.9` (or rely on `runtime.txt` which already pins this)
7. Copy the Render public URL

### Frontend — Vercel

1. Import GitHub repo to Vercel
2. Set root directory to `frontend`
3. Framework: Next.js
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
   - All `NEXT_PUBLIC_FIREBASE_*` values
5. Deploy

### Update CORS

In `backend/main.py`, add your Vercel URL to `allow_origins`.

---

## Common Issues

### Prophet installation fails
Windows requires Visual Studio Build Tools. Alternative: use the Docker setup via `docker-compose.yml`.

### yfinance rate limits
Add `time.sleep(0.5)` between bulk requests if hitting throttling.

### LSTM model load error
Verify TensorFlow version matches what was used to train. The notebook uses TensorFlow 2.19. Check `requirements.txt`.

### Chart not rendering
Ensure `"use client"` is at the top of any component using Recharts.

---

## Testing Checklist

- [ ] Backend health endpoint responds
- [ ] `/forecast/NVDA/blended` returns data with `model: "lstm+prophet"`
- [ ] `/forecast/NVDA/info` responds in under 1 second
- [ ] Frontend landing page loads
- [ ] Search redirects to dashboard
- [ ] Chart shows historical + forecast with confidence bands
- [ ] Model badge shows on chart
- [ ] Can sign in with Google
- [ ] Can add ticker to watchlist
- [ ] Watchlist page shows saved tickers
- [ ] Screener page shows prices for all cards
- [ ] Portfolio page loads
- [ ] Risk calculator computes live
