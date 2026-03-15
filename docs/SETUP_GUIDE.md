# Videntis Setup Guide

## Quick Start (2-3 Weeks Build Timeline)

### Week 1: Backend + ML Pipeline

#### Day 1-2: Backend Foundation
```bash
cd Videntis/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Get Groq API key: https://console.groq.com (free, no credit card)
Update `backend/.env` with your key

Test the API:
```bash
uvicorn main:app --reload
curl http://localhost:8000/health
curl http://localhost:8000/forecast/NVDA
```

#### Day 3-4: Test Each Service
- Test `yfinance` data fetching
- Verify Prophet forecast generation
- Check VADER sentiment analysis
- Test Groq LLM explanations

### Week 2: Frontend + Design

#### Day 1-2: Next.js Setup
```bash
cd Videntis/frontend
npm install
npm run dev
```

Visit http://localhost:3000 to see the landing page

#### Day 3-5: Build Components
- Landing page with search
- Dashboard with chart
- LLM explanation card
- News sentiment feed

Test with different tickers: NVDA, AAPL, TSLA, MSFT

### Week 3: Firebase + Deployment

#### Day 1-2: Firebase Setup
1. Go to https://console.firebase.google.com
2. Create project "Videntis"
3. Enable Firestore (test mode)
4. Enable Authentication → Google provider
5. Get config from Project Settings → Web app
6. Update `frontend/.env.local`

#### Day 3-4: Watchlist Feature
- Test sign in with Google
- Add/remove tickers from watchlist
- View watchlist page

#### Day 5-7: Deploy
**Backend (Render.com):**
- Create new Web Service
- Connect GitHub repo
- Root directory: `Videntis/backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Add env var: `GROQ_API_KEY`

**Frontend (Vercel):**
- Import GitHub repo
- Root directory: `Videntis/frontend`
- Framework: Next.js
- Add all `NEXT_PUBLIC_*` env vars
- Set `NEXT_PUBLIC_API_URL` to your Render backend URL

**Update CORS:**
Edit `backend/main.py` and add your Vercel URL to `allow_origins`

## Common Issues

### Prophet Installation Fails
Prophet requires C++ compiler. On Windows, install Visual Studio Build Tools.
Alternative: Use Docker setup

### yfinance Rate Limits
Add `time.sleep(1)` between bulk requests

### Firebase Auth Not Working
- Check all env vars are set correctly
- Verify Firebase project has Google auth enabled
- Check browser console for errors

### Chart Not Rendering
- Ensure "use client" is at top of ForecastChart.tsx
- Check that data is being passed correctly
- Verify Recharts is installed

## Testing Checklist

- [ ] Backend health endpoint responds
- [ ] Can fetch forecast for NVDA
- [ ] Prophet generates 7-day forecast
- [ ] Groq LLM returns explanation
- [ ] News sentiment loads
- [ ] Frontend landing page loads
- [ ] Search redirects to dashboard
- [ ] Chart displays historical + forecast
- [ ] Can sign in with Google
- [ ] Can add ticker to watchlist
- [ ] Watchlist page shows saved tickers

## Resume Metrics to Track

Add these to your project:

1. **Forecast Accuracy (MAPE)**
   - Compare predicted vs actual prices weekly
   - Target: <5% MAPE

2. **LLM Response Time**
   - Log Groq API latency
   - Target: <1 second average

3. **User Engagement**
   - Unique tickers queried
   - Watchlist adoption rate
   - Daily active users

4. **System Performance**
   - API response time
   - Chart render time
   - Error rate

## Next Steps After MVP

1. Add more ML models (LSTM, ARIMA)
2. Compare model accuracy
3. Add technical indicators (RSI, MACD)
4. Email alerts for watchlist
5. Portfolio tracking
6. Mobile responsive improvements
7. Dark/light theme toggle
8. Export predictions to CSV

## Support

- Groq API docs: https://console.groq.com/docs
- Firebase docs: https://firebase.google.com/docs
- Prophet docs: https://facebook.github.io/prophet/
- Next.js docs: https://nextjs.org/docs
