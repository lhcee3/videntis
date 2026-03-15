# Getting Started with StockSense

Welcome! This guide will help you navigate the project and get started quickly.

## 🎯 What is StockSense?

StockSense is a full-stack AI-powered stock forecasting dashboard that:
- Fetches real-time stock data from Yahoo Finance
- Uses Facebook Prophet ML to forecast 7-day price movements
- Generates plain English explanations using Groq LLaMA 3.3 70B
- Analyzes news sentiment with VADER
- Lets users save tickers to a personal watchlist
- Costs $0/month to run (all free tiers!)

## 🚀 I Want To...

### Get Running Quickly (10 minutes)
→ **Read [QUICK_START.md](QUICK_START.md)**

This is the fastest way to get the app running locally. Includes:
- Prerequisites checklist
- API key setup (5 min)
- Automated startup scripts
- Troubleshooting guide

### Understand the Project Structure
→ **Read [FILE_TREE.txt](FILE_TREE.txt)** or **[ARCHITECTURE.md](ARCHITECTURE.md)**

FILE_TREE.txt shows all 45 files with descriptions.
ARCHITECTURE.md shows system diagrams and data flow.

### Build It From Scratch (2-3 weeks)
→ **Read [SETUP_GUIDE.md](SETUP_GUIDE.md)**

Week-by-week guide covering:
- Week 1: Backend + ML pipeline
- Week 2: Frontend + design
- Week 3: Firebase + deployment

### Deploy to Production (30 minutes)
→ **Read [DEPLOYMENT.md](DEPLOYMENT.md)**

Step-by-step deployment to:
- Render.com (backend)
- Vercel (frontend)
- Firebase (database + auth)

### Learn the API
→ **Read [API_REFERENCE.md](API_REFERENCE.md)**

Complete API documentation with:
- Endpoint specifications
- Request/response examples
- Testing examples
- Error codes

### See the Big Picture
→ **Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**

Comprehensive overview including:
- Tech stack details
- Design system
- Performance metrics
- Resume talking points
- Future enhancements

### Navigate All Documentation
→ **Read [INDEX.md](INDEX.md)**

Master index of all documentation files organized by use case.

### Track My Progress
→ **Use [CHECKLIST.md](CHECKLIST.md)**

Complete checklist covering:
- Setup steps
- Testing verification
- Deployment tasks
- Portfolio preparation

## 📁 Project Structure

```
stocksense/
├── backend/          # FastAPI Python backend
│   ├── main.py      # API entry point
│   ├── routers/     # API endpoints
│   └── services/    # Business logic (ML, LLM, data)
│
├── frontend/        # Next.js 14 frontend
│   ├── app/         # Pages (landing, dashboard, watchlist)
│   ├── components/  # React components (chart, cards)
│   └── lib/         # Utilities (API, Firebase)
│
└── docs/            # 13 documentation files
```

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- Facebook Prophet (ML forecasting)
- Groq API (LLaMA 3.3 LLM)
- yfinance (stock data)
- VADER (sentiment analysis)

**Frontend:**
- Next.js 14 (React framework)
- Tailwind CSS (styling)
- Recharts (charts)
- Firebase (auth + database)

**Deployment:**
- Vercel (frontend)
- Render.com (backend)
- Firebase (services)

## 🎓 Learning Path

### Beginner Path
1. Read QUICK_START.md
2. Get it running locally
3. Explore the code
4. Make small customizations
5. Deploy to production

### Intermediate Path
1. Read SETUP_GUIDE.md
2. Build backend from scratch
3. Build frontend from scratch
4. Integrate Firebase
5. Deploy and customize

### Advanced Path
1. Read ARCHITECTURE.md
2. Understand system design
3. Add new features
4. Optimize performance
5. Scale beyond free tier

## 🔑 Required API Keys

You'll need these (all free, no credit card):

1. **Groq API Key**
   - Sign up: https://console.groq.com
   - Get key: API Keys section
   - Used for: AI explanations

2. **Firebase Config**
   - Sign up: https://console.firebase.google.com
   - Create project
   - Get config: Project Settings → Web app
   - Used for: Auth + database

## ⚡ Quick Start Commands

```bash
# Clone or navigate to project
cd stocksense

# Automated startup (recommended)
./start-dev.sh          # Linux/Mac
start-dev.bat           # Windows

# Manual startup
cd backend && uvicorn main:app --reload
cd frontend && npm run dev

# Test
curl http://localhost:8000/health
open http://localhost:3000
```

## 📊 What You'll Build

### Landing Page
- Clean search interface
- Quick-pick popular tickers
- Google sign-in button

### Dashboard
- Real-time stock price
- Interactive forecast chart
- AI explanation card
- News sentiment feed
- Watchlist button

### Watchlist Page
- Saved tickers grid
- Quick navigation to dashboards

## 🎨 Design System

**Colors:**
- Dark background (#0a0a0a)
- Green accents (#00ff87) for gains
- Red accents (#ff4444) for losses
- Gold accents (#d4a847) for labels

**Fonts:**
- Playfair Display (large numbers)
- Space Mono (labels, data)
- DM Sans (body text)

**Style:**
- Editorial dark theme
- 1px borders, no shadows
- Numbered sections
- Angular, minimal design

## 💰 Cost Breakdown

| Service | Free Tier | Usage |
|---------|-----------|-------|
| Groq | 14,400 req/day | LLM explanations |
| Firebase | 50K reads/day | Auth + database |
| Vercel | Unlimited | Frontend hosting |
| Render | 750 hrs/month | Backend hosting |
| yfinance | ~2000 req/hr | Stock data |

**Total: $0/month** for personal use!

## 🐛 Common Issues

### Backend won't start
- Check Python version (need 3.11+)
- Verify GROQ_API_KEY in .env
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Check Node version (need 18+)
- Verify Firebase env vars in .env.local
- Install dependencies: `npm install`

### Chart not showing
- Add "use client" to component
- Check browser console for errors
- Verify data is being fetched

### Firebase errors
- Check all env vars are set
- Verify Google auth is enabled
- Check authorized domains

## 📚 Documentation Files

1. **QUICK_START.md** - 10-minute setup ⭐
2. **SETUP_GUIDE.md** - Detailed build guide
3. **DEPLOYMENT.md** - Production deployment
4. **API_REFERENCE.md** - API documentation
5. **ARCHITECTURE.md** - System design
6. **PROJECT_SUMMARY.md** - Complete overview
7. **INDEX.md** - Documentation index
8. **CHECKLIST.md** - Progress tracker
9. **FILE_TREE.txt** - File structure
10. **README.md** - Project overview
11. **GETTING_STARTED.md** - This file

## 🎯 Success Criteria

You'll know you're successful when:
- [ ] Backend runs without errors
- [ ] Frontend displays correctly
- [ ] Can search for NVDA and see forecast
- [ ] Chart shows historical + predicted data
- [ ] AI explanation appears
- [ ] News sentiment loads
- [ ] Can sign in with Google
- [ ] Can save tickers to watchlist

## 🚀 Next Steps

1. **Choose your path:**
   - Quick start → QUICK_START.md
   - Build from scratch → SETUP_GUIDE.md
   - Deploy → DEPLOYMENT.md

2. **Get API keys:**
   - Groq: https://console.groq.com
   - Firebase: https://console.firebase.google.com

3. **Start building!**

4. **Deploy to production**

5. **Add to portfolio/resume**

## 💡 Tips for Success

- Start with QUICK_START.md to see it working
- Read documentation as you go
- Test each component individually
- Use the checklist to track progress
- Don't skip the deployment step
- Share your project when done!

## 🤝 Getting Help

1. Check the relevant documentation file
2. Review troubleshooting sections
3. Check backend/frontend logs
4. Verify environment variables
5. Ensure dependencies are installed

## 🎓 Portfolio Tips

This project demonstrates:
- Full-stack development
- ML/AI integration
- Real-time data processing
- Modern web technologies
- Cloud deployment
- Cost optimization

Highlight these on your resume!

## 📝 Final Notes

- Prophet training takes 2-5 seconds (normal)
- Free tiers are generous for personal use
- All services work without credit card
- Complete documentation included
- Production-ready code
- Portfolio-ready project

---

## Ready to Start?

👉 **Go to [QUICK_START.md](QUICK_START.md) now!**

Or explore the documentation:
- [INDEX.md](INDEX.md) - Documentation navigation
- [FILE_TREE.txt](FILE_TREE.txt) - Project structure
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design

---

**Questions?** Check the documentation files above or review the code comments.

**Good luck building StockSense!** 📈🚀
