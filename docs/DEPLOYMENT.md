# StockSense Deployment Guide

## Pre-Deployment Checklist

### Backend Ready
- [ ] All services tested locally
- [ ] Groq API key working
- [ ] Prophet forecasts generating correctly
- [ ] News sentiment fetching properly
- [ ] No hardcoded secrets in code

### Frontend Ready
- [ ] All pages render correctly
- [ ] Firebase auth working
- [ ] Watchlist CRUD operations work
- [ ] Charts display properly
- [ ] Mobile responsive

## Backend Deployment (Render.com)

### Step 1: Create Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: stocksense-api
   - **Root Directory**: `stocksense/backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Step 3: Environment Variables
Add in Render dashboard:
```
GROQ_API_KEY=your_actual_groq_key
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for build to complete
- Note your backend URL: `https://stocksense-api.onrender.com`

### Alternative: Railway.app
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo, set root to `stocksense/backend`
4. Add env var: `GROQ_API_KEY`
5. Railway auto-detects Python and deploys

## Frontend Deployment (Vercel)

### Step 1: Create Account
1. Go to https://vercel.com
2. Sign up with GitHub

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `stocksense/frontend`

### Step 3: Environment Variables
Add all these in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://stocksense-api.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Note your frontend URL: `https://stocksense.vercel.app`

## Post-Deployment Configuration

### Update CORS in Backend
1. Edit `backend/main.py`
2. Update `allow_origins`:
```python
allow_origins=[
    "http://localhost:3000",
    "https://stocksense.vercel.app"  # your actual Vercel URL
]
```
3. Commit and push to trigger redeploy

### Update Firebase Auth Domain
1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Add your Vercel domain: `stocksense.vercel.app`

### Test Production
- [ ] Visit your Vercel URL
- [ ] Search for a ticker (e.g., NVDA)
- [ ] Verify forecast loads
- [ ] Check LLM explanation appears
- [ ] Test sign in with Google
- [ ] Add ticker to watchlist
- [ ] Visit watchlist page

## Monitoring & Maintenance

### Backend Monitoring (Render)
- Check logs in Render dashboard
- Monitor response times
- Set up health check alerts

### Frontend Monitoring (Vercel)
- Check Analytics in Vercel dashboard
- Monitor build times
- Review error logs

### Firebase Monitoring
- Check Firestore usage in Firebase Console
- Monitor auth usage
- Review security rules

## Cost Monitoring

### Free Tier Limits
- **Groq**: 14,400 requests/day
- **Firebase**: 50K reads/day, 20K writes/day
- **Render**: 750 hours/month (sleeps after 15min inactivity)
- **Vercel**: Unlimited for hobby projects

### If You Hit Limits
1. **Groq**: Implement caching for repeated tickers
2. **Firebase**: Add pagination, reduce reads
3. **Render**: Upgrade to paid ($7/month for always-on)
4. **Vercel**: Should never hit limits for personal use

## Troubleshooting

### Backend Not Responding
- Check Render logs for errors
- Verify GROQ_API_KEY is set
- Check if service is sleeping (free tier)

### Frontend Can't Connect to Backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Test backend URL directly in browser

### Firebase Auth Fails
- Verify all Firebase env vars are set
- Check authorized domains in Firebase Console
- Review browser console for errors

### Charts Not Rendering
- Check browser console for errors
- Verify API is returning data
- Test with different tickers

## Performance Optimization

### Backend
- Add Redis caching for repeated queries
- Implement rate limiting
- Optimize Prophet model parameters

### Frontend
- Enable Next.js Image optimization
- Add loading skeletons
- Implement error boundaries
- Add service worker for offline support

## Security Best Practices

- [ ] Never commit .env files
- [ ] Use environment variables for all secrets
- [ ] Enable Firebase security rules
- [ ] Add rate limiting to API
- [ ] Implement HTTPS only
- [ ] Add CSP headers
- [ ] Regular dependency updates

## Scaling Considerations

When you outgrow free tier:

1. **Backend**: Move to AWS Lambda or Google Cloud Run
2. **Database**: Upgrade Firebase or migrate to PostgreSQL
3. **Caching**: Add Redis for API responses
4. **CDN**: Use Cloudflare for static assets
5. **Monitoring**: Add Sentry for error tracking

## Custom Domain (Optional)

### Vercel
1. Buy domain (Namecheap, Google Domains)
2. Add domain in Vercel dashboard
3. Update DNS records as instructed

### Render
1. Add custom domain in Render dashboard
2. Update DNS CNAME record
3. SSL auto-configured

## Backup Strategy

### Firebase Firestore
- Enable daily backups in Firebase Console
- Export data periodically
- Keep local backup of security rules

### Code
- Keep GitHub repo as source of truth
- Tag releases
- Document major changes

## Launch Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] Firebase auth working
- [ ] All environment variables set
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] README updated with live URLs
- [ ] Share on Twitter/LinkedIn!

## Resume/Portfolio Tips

Highlight these metrics:
- "Deployed full-stack ML app with 99.9% uptime"
- "Handles X forecasts per day at $0 cost"
- "Achieved <5% MAPE on 7-day predictions"
- "Sub-second LLM response times via Groq"
- "Built with modern stack: Next.js 14, FastAPI, Prophet"

Include live demo link and GitHub repo in your resume!
