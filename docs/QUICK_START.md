# Videntis — Quick Start Guide

Get up and running in 10 minutes!

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- Git installed
- Text editor (VS Code recommended)

## Step 1: Get API Keys (5 minutes)

### Gemini API Key (Required)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google (free, no credit card)
3. Create API key
4. Copy the key

### Firebase Setup (Required for auth/watchlist)
1. Go to https://console.firebase.google.com
2. Create new project "Videntis"
3. Enable Firestore Database (test mode)
4. Enable Authentication → Google provider
5. Add web app → copy config values

## Step 2: Configure Environment (2 minutes)

### Backend
Edit `backend/.env`:
```bash
GEMINI_API_KEY=your_actual_gemini_key_here
```

### Frontend
Edit `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 3: Install & Run (3 minutes)

### Option A: Automated (Recommended)

**Linux/Mac:**
```bash
cd Videntis
chmod +x start-dev.sh
./start-dev.sh
```

**Windows:**
```bash
cd Videntis
start-dev.bat
```

### Option B: Manual

**Terminal 1 - Backend:**
```bash
cd Videntis/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd Videntis/frontend
npm install
npm run dev
```

## Step 4: Test It! (1 minute)

1. Open http://localhost:3000
2. Search for "NVDA"
3. Wait 3-5 seconds for forecast
4. See the chart, AI explanation, and news!

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Check if port 8000 is free
- Verify GROQ_API_KEY is set in `.env`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Check if port 3000 is free
- Run `npm install` again

### "Ticker not found" error
- Try a different ticker (AAPL, MSFT, TSLA)
- Check backend logs for errors
- Verify yfinance can access Yahoo Finance

### Prophet installation fails
- Windows: Install Visual Studio Build Tools
- Mac: Install Xcode Command Line Tools
- Linux: Install gcc/g++ (`apt-get install build-essential`)

### Firebase auth not working
- Check all Firebase env vars are set
- Verify Google auth is enabled in Firebase Console
- Check browser console for errors

## Next Steps

✅ You're running! Now:

1. **Customize the design** - Edit `frontend/tailwind.config.ts`
2. **Add more tickers** - Edit quick picks in `frontend/app/page.tsx`
3. **Test watchlist** - Sign in and save some tickers
4. **Read the docs** - Check out `SETUP_GUIDE.md` for details
5. **Deploy it** - Follow `DEPLOYMENT.md` when ready

## Useful Commands

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload          # Start server
pytest                             # Run tests
pip install -r requirements.txt   # Update deps

# Frontend
cd frontend
npm run dev                        # Start dev server
npm run build                      # Production build
npm run lint                       # Lint code

# Docker
docker-compose up                  # Start backend in Docker
docker-compose down                # Stop Docker services
```

## API Testing

```bash
# Health check
curl http://localhost:8000/health

# Get forecast
curl http://localhost:8000/forecast/NVDA

# API docs (interactive)
open http://localhost:8000/docs
```

## File Structure Quick Reference

```
Videntis/
├── backend/
│   ├── main.py              ← API entry point
│   ├── routers/
│   │   └── forecast.py      ← Main endpoint
│   └── services/
│       ├── prophet_model.py ← ML forecasting
│       └── groq_explainer.py ← AI explanations
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         ← Landing page
│   │   └── dashboard/[ticker]/
│   │       └── page.tsx     ← Stock dashboard
│   └── components/
│       ├── ForecastChart.tsx ← Chart
│       └── LLMExplainer.tsx  ← AI card
│
└── Documentation files (you are here!)
```

## Getting Help

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Check `API_REFERENCE.md` for API details
3. Check `DEPLOYMENT.md` for production setup
4. Check backend logs for errors
5. Check browser console for frontend errors

## Common First-Time Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process on port 8000/3000 |
| Module not found | Run `pip install -r requirements.txt` |
| Firebase error | Double-check all env vars |
| Chart not showing | Add "use client" to component |
| Slow forecast | Normal! Prophet takes 2-5 seconds |

## Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can search for NVDA
- [ ] Chart displays with forecast
- [ ] AI explanation appears
- [ ] News sentiment loads
- [ ] Can sign in with Google
- [ ] Can add to watchlist

## Ready to Deploy?

Once everything works locally, follow `DEPLOYMENT.md` to deploy to:
- **Backend**: Render.com or Railway.app (free tier)
- **Frontend**: Vercel (free tier)

Total deployment time: ~30 minutes
Total cost: $0/month

---

**Need more help?** Read the full documentation:
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup (2-3 weeks)
- `DEPLOYMENT.md` - Production deployment
- `API_REFERENCE.md` - API documentation
- `PROJECT_SUMMARY.md` - Complete project summary

**Happy forecasting! 📈**
