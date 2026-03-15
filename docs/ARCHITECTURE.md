# Videntis Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     (http://localhost:3000)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS FRONTEND                            │
│                    (Vercel / Port 3000)                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Landing     │  │  Dashboard   │  │  Watchlist   │          │
│  │  Page        │  │  [ticker]    │  │  Page        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ForecastChart│  │ LLMExplainer │  │ NewsSentiment│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                   │
             │ REST API                          │ Firebase SDK
             │                                   │
             ▼                                   ▼
┌─────────────────────────────┐    ┌────────────────────────────┐
│   FASTAPI BACKEND           │    │   FIREBASE SERVICES        │
│ (Render / Port 8000)        │    │  (console.firebase.google) │
│                             │    │                            │
│  ┌────────────────────┐    │    │  ┌──────────────────────┐ │
│  │ GET /forecast/     │    │    │  │  Authentication      │ │
│  │     {ticker}       │    │    │  │  (Google OAuth)      │ │
│  └────────────────────┘    │    │  └──────────────────────┘ │
│                             │    │                            │
│  ┌────────────────────┐    │    │  ┌──────────────────────┐ │
│  │ GET /sentiment/    │    │    │  │  Firestore Database  │ │
│  │     {ticker}       │    │    │  │  - users/watchlist   │ │
│  └────────────────────┘    │    │  │  - predictions/      │ │
│                             │    │  └──────────────────────┘ │
│  ┌────────────────────┐    │    └────────────────────────────┘
│  │ GET /health        │    │
│  └────────────────────┘    │
└────────┬────────────────────┘
         │
         │ Calls to external services
         │
         ├─────────────────────────────────────────────────────┐
         │                                                       │
         ▼                                                       ▼
┌─────────────────────┐                            ┌─────────────────────┐
│  YAHOO FINANCE      │                            │  GROQ API           │
│  (yfinance library) │                            │  (console.groq.com) │
│                     │                            │                     │
│  • Historical data  │                            │  • LLaMA 3.3 70B    │
│  • Stock info       │                            │  • AI explanations  │
│  • RSS news feed    │                            │  • <1s response     │
│  • Free, no key     │                            │  • 14.4K req/day    │
└─────────────────────┘                            └─────────────────────┘
         │
         │ Data processing
         ▼
┌─────────────────────┐
│  PROPHET ML MODEL   │
│  (Facebook Prophet) │
│                     │
│  • 6mo training     │
│  • 7-day forecast   │
│  • Confidence bands │
│  • 2-5s processing  │
└─────────────────────┘
         │
         │ Sentiment analysis
         ▼
┌─────────────────────┐
│  VADER SENTIMENT    │
│  (vaderSentiment)   │
│                     │
│  • News scoring     │
│  • -1 to +1 scale   │
│  • Pre-trained      │
│  • Instant results  │
└─────────────────────┘
```

## Data Flow

### 1. User Searches for Ticker

```
User enters "NVDA"
    ↓
Frontend validates input
    ↓
Router navigates to /dashboard/NVDA
    ↓
Server component fetches data
    ↓
GET /forecast/NVDA
```

### 2. Backend Processes Request

```
FastAPI receives request
    ↓
┌─────────────────────────────────────┐
│ 1. Fetch stock data (yfinance)     │ ← 0.5-1s
│    - 6 months historical            │
│    - Current price, volume, etc.    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Train Prophet model              │ ← 2-5s
│    - Fit on historical data         │
│    - Generate 7-day forecast        │
│    - Calculate confidence intervals │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Fetch news & sentiment           │ ← 0.5-1s
│    - Yahoo Finance RSS feed         │
│    - VADER sentiment scoring        │
│    - Calculate average sentiment    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. Generate AI explanation          │ ← 0.5-1s
│    - Send context to Groq           │
│    - LLaMA 3.3 generates text       │
│    - Return 2-3 sentence summary    │
└─────────────────────────────────────┘
    ↓
Return JSON response (total: 3-8s)
```

### 3. Frontend Renders Dashboard

```
Receive forecast data
    ↓
┌─────────────────────────────────────┐
│ StockHeader                         │
│ - Display current price             │
│ - Show forecast price & % change    │
│ - Market cap, volume                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ ForecastChart (Recharts)            │
│ - Plot historical data (60 days)    │
│ - Plot forecast (7 days, dashed)    │
│ - Show confidence bands             │
│ - Add forecast boundary line        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ LLMExplainer                        │
│ - Display AI explanation            │
│ - Show volume change signal         │
│ - Show sentiment signal             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ NewsSentiment                       │
│ - Display sentiment meter           │
│ - List 10 news headlines            │
│ - Color-code by sentiment           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ WatchlistButton                     │
│ - Check if user is signed in        │
│ - Check if ticker in watchlist      │
│ - Allow add/remove                  │
└─────────────────────────────────────┘
```

## Component Architecture

### Backend Services Layer

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Application                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Routers (API Endpoints)                                 │
│  ├── forecast.py    → GET /forecast/{ticker}            │
│  └── sentiment.py   → GET /sentiment/{ticker}           │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Services (Business Logic)                               │
│  ├── stock_data.py      → yfinance wrapper              │
│  ├── prophet_model.py   → ML forecasting                │
│  ├── groq_explainer.py  → LLM integration               │
│  └── vader_sentiment.py → News sentiment                │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Models (Data Schemas)                                   │
│  └── schemas.py         → Pydantic models               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Frontend Component Tree

```
App Layout (layout.tsx)
│
├── Landing Page (page.tsx)
│   ├── SearchBar
│   └── QuickPicks
│
├── Dashboard Page (dashboard/[ticker]/page.tsx)
│   ├── StockHeader
│   │   ├── Company name
│   │   ├── Current price
│   │   ├── Forecast price
│   │   └── Change badge
│   │
│   ├── ForecastChart
│   │   ├── Historical area
│   │   ├── Forecast line (dashed)
│   │   ├── Confidence bands
│   │   └── Custom tooltip
│   │
│   ├── LLMExplainer
│   │   ├── AI explanation text
│   │   ├── Volume signal pill
│   │   └── Sentiment signal pill
│   │
│   ├── NewsSentiment
│   │   ├── Sentiment meter
│   │   └── News list (10 items)
│   │       └── NewsItem
│   │           ├── Sentiment dot
│   │           ├── Headline
│   │           └── Timestamp
│   │
│   └── WatchlistButton
│       └── useAuth hook
│
└── Watchlist Page (watchlist/page.tsx)
    └── Ticker cards grid
```

## Database Schema

### Firestore Collections

```
firestore/
│
├── users/
│   └── {userId}/
│       └── watchlist: string[]
│           Example: ["NVDA", "AAPL", "TSLA"]
│
└── predictions/
    └── {ticker}_{date}/
        ├── ticker: string
        ├── predicted_at: string (YYYY-MM-DD)
        ├── predicted_price: number
        ├── actual_price: number | null
        └── created_at: Timestamp
```

## Authentication Flow

```
User clicks "Sign In"
    ↓
Frontend calls signInWithGoogle()
    ↓
Firebase Auth popup opens
    ↓
User selects Google account
    ↓
Firebase validates & creates session
    ↓
onAuthStateChanged fires
    ↓
useAuth hook updates user state
    ↓
UI shows user info & watchlist button
```

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│              https://Videntis.vercel.app               │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  VERCEL (Frontend)                       │
│  • Next.js 14 SSR                                        │
│  • Edge network CDN                                      │
│  • Automatic HTTPS                                       │
│  • Zero config deployment                                │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│              RENDER.COM (Backend)                        │
│  • FastAPI Python app                                    │
│  • Auto-deploy from Git                                  │
│  • Free tier (sleeps after 15min)                        │
│  • Automatic HTTPS                                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Firebase SDK
                         ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE (Google Cloud)                     │
│  • Firestore Database                                    │
│  • Authentication                                        │
│  • Global CDN                                            │
│  • 99.95% uptime SLA                                     │
└─────────────────────────────────────────────────────────┘
```

## Performance Characteristics

| Component | Latency | Caching | Notes |
|-----------|---------|---------|-------|
| yfinance | 0.5-1s | None | Yahoo Finance API |
| Prophet | 2-5s | Possible | CPU-intensive |
| Groq LLM | 0.5-1s | Possible | Fast inference |
| VADER | <0.1s | N/A | Pre-trained |
| Firestore | 0.1-0.3s | Client SDK | Global CDN |
| Next.js SSR | 0.1-0.5s | ISR (5min) | Edge rendering |

## Scaling Strategy

### Current (Free Tier)
- Handles ~100 requests/day comfortably
- No caching, fresh data every request
- Suitable for personal use / portfolio

### Phase 1 (Light Traffic)
- Add Redis caching (5-15 min TTL)
- Cache popular tickers (NVDA, AAPL, etc.)
- Reduce Prophet training frequency
- Cost: Still $0 with Redis free tier

### Phase 2 (Medium Traffic)
- Upgrade Render to paid ($7/month)
- Implement request queuing
- Pre-compute forecasts for top 100 tickers
- Add CDN for static assets
- Cost: ~$10-20/month

### Phase 3 (High Traffic)
- Move to AWS Lambda / Cloud Run
- Implement proper caching layer
- Use PostgreSQL for predictions
- Add load balancing
- Cost: ~$50-100/month

## Security Considerations

### API Security
- CORS restricted to frontend domain
- No API keys exposed to client
- Rate limiting (future enhancement)

### Firebase Security
- Firestore rules enforce user isolation
- Only authenticated users can read/write
- Predictions collection is read-only

### Environment Variables
- All secrets in .env files
- Never committed to Git
- Separate dev/prod configs

## Monitoring & Observability

### Metrics to Track
- API response time (p50, p95, p99)
- Prophet training time
- Groq API latency
- Error rate by endpoint
- User sign-ups
- Watchlist additions
- Popular tickers

### Logging
- Backend: uvicorn access logs
- Frontend: Vercel analytics
- Errors: Console logs (upgrade to Sentry)

### Alerts (Future)
- API downtime
- High error rate
- Slow response times
- Free tier limits approaching

## Technology Choices Rationale

| Technology | Why Chosen | Alternatives Considered |
|------------|------------|------------------------|
| Next.js 14 | SSR, App Router, Vercel integration | React SPA, Remix |
| FastAPI | Fast, async, auto docs | Flask, Django |
| Prophet | No GPU needed, good for stocks | LSTM, ARIMA |
| Groq | Free tier, fast inference | OpenAI, Anthropic |
| Firebase | Easy auth, free tier generous | Supabase, Auth0 |
| Tailwind | Rapid styling, custom design | CSS Modules, Styled Components |
| Recharts | React-native, customizable | Chart.js, D3.js |
| Vercel | Zero-config, free tier | Netlify, AWS Amplify |
| Render | Simple, free tier | Railway, Heroku |

---

This architecture supports the $0/month goal while maintaining production-ready quality and easy scalability path.
