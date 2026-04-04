import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import forecast, sentiment, portfolio, analyze, trending, prices

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Videntis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://videntis.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast.router,   prefix="/forecast")
app.include_router(sentiment.router,  prefix="/sentiment")
app.include_router(portfolio.router,  prefix="/portfolio")
app.include_router(analyze.router,    prefix="/analyze")
app.include_router(trending.router,   prefix="/trending")
app.include_router(prices.router,     prefix="/prices")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def startup():
    # Cache warmer scheduler
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from services.cache_warmer import warm_cache
        scheduler = BackgroundScheduler()
        scheduler.add_job(warm_cache, "interval", minutes=5, id="cache_warmer")
        scheduler.start()
        logging.getLogger(__name__).info("Cache warmer started")
    except Exception as e:
        logging.getLogger(__name__).warning(f"Scheduler failed: {e}")

    # WebSocket routes
    try:
        from websocket_manager import register_websocket_routes
        register_websocket_routes(app)
        logging.getLogger(__name__).info("WebSocket routes registered")
    except Exception as e:
        logging.getLogger(__name__).warning(f"WebSocket setup failed: {e}")
