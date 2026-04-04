"""
WebSocket manager for real-time price streaming.
Feature flag: ENABLE_WEBSOCKET=true (default)
"""
import os
import asyncio
import logging
from typing import Dict, Set

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
ENABLE_WEBSOCKET = os.getenv("ENABLE_WEBSOCKET", "true").lower() == "true"


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, ticker: str):
        await websocket.accept()
        self.active.setdefault(ticker, set()).add(websocket)
        logger.info(f"WS connected: {ticker} (total: {len(self.active[ticker])})")

    def disconnect(self, websocket: WebSocket, ticker: str):
        if ticker in self.active:
            self.active[ticker].discard(websocket)

    async def broadcast(self, ticker: str, data: dict):
        dead = set()
        for ws in self.active.get(ticker, set()):
            try:
                await ws.send_json(data)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.active[ticker].discard(ws)


manager = ConnectionManager()


def register_websocket_routes(app):
    """Call this from main.py to attach the /ws/{ticker} route."""
    if not ENABLE_WEBSOCKET:
        return

    @app.websocket("/ws/{ticker}")
    async def websocket_endpoint(websocket: WebSocket, ticker: str):
        ticker = ticker.upper()
        await manager.connect(websocket, ticker)
        try:
            while True:
                # Serve from cache — no extra API calls
                from services import cache_manager as cache
                price_data = cache.get_price(f"info_{ticker}")
                if price_data:
                    await manager.broadcast(ticker, {"ticker": ticker, **price_data})
                else:
                    await websocket.send_json({"ticker": ticker, "price": None})
                await asyncio.sleep(1)
        except WebSocketDisconnect:
            manager.disconnect(websocket, ticker)
        except Exception as e:
            logger.warning(f"WS error for {ticker}: {e}")
            manager.disconnect(websocket, ticker)
