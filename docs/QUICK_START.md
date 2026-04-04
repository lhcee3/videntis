# Videntis Quick Start

Get up and running in under 10 minutes.

## Prerequisites

- Python 3.11+
- Node.js 18+
- A Firebase project with Firestore and Google Auth enabled

---

## Step 1: Firebase Setup

1. Go to https://console.firebase.google.com and create a project
2. Enable Firestore Database (test mode)
3. Enable Authentication and add the Google provider
4. Go to Project Settings > Your apps > Add Web app > copy the config

---

## Step 2: Configure Environment

### Backend

Copy `backend/.env.example` to `backend/.env.local` and fill in your keys:
```
FINNHUB_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
GEMINI_API_KEY=your_key
SEC_EMAIL=your@email.com
```

All other variables have sensible defaults — see `backend/.env.example` for the full list.

### Frontend

`frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Step 3: Run the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

API at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`

---

## Step 4: Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend at `http://localhost:3000`

---

## Step 5: Test It

1. Open http://localhost:3000
2. Search for NVDA
3. Wait 3-5 seconds for the blended forecast
4. Check the chart, explanation, and news

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend won't start | Check Python 3.11+, check port 8000 is free |
| Frontend won't start | Check Node 18+, run `npm install` again |
| Ticker not found | Try AAPL, MSFT, TSLA — check backend logs |
| Prophet install fails | Windows: install Visual Studio Build Tools |
| Firebase auth broken | Double-check all NEXT_PUBLIC_ env vars |
| LSTM model not loading | Verify `.h5` and `.pkl` files exist in `backend/videntis_models/models/` |

---

## Useful Commands

```bash
# Backend
uvicorn main:app --reload
curl http://localhost:8000/health
curl http://localhost:8000/forecast/NVDA/blended

# Frontend
npm run dev
npm run build
npm run lint
```

---

## Retraining LSTM Models

Open `backend/LSTM_for_stocksense.ipynb` in Google Colab, run all cells, then download the `models/` folder and replace `backend/videntis_models/models/`.

Training takes roughly 10-20 minutes on Colab GPU for all 10 tickers.
