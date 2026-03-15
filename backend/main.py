from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import forecast, sentiment, portfolio, analyze, trending

app = FastAPI(title="StockSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app"  # replace after Vercel deploy
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast.router, prefix="/forecast")
app.include_router(sentiment.router, prefix="/sentiment")
app.include_router(portfolio.router, prefix="/portfolio")
app.include_router(analyze.router, prefix="/analyze")
app.include_router(trending.router, prefix="/trending")

@app.get("/health")
def health():
    return {"status": "ok"}
