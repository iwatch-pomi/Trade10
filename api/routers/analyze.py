"""
Synchronous batch analysis endpoint for Vercel serverless compatibility.
The frontend drives batching by calling this endpoint repeatedly.
"""
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from services.tse_stock_list import get_tse_stocks, get_stock_info_map
from services.yfinance_fetcher import fetch_batch_info
from services.scorer import score_stock
from services.demo_data import generate_stock_info
from services import cache
from models.schemas import StockResult
from config import MAX_CONCURRENT_INFO_FETCHES, DEFAULT_BATCH_DELAY_SECONDS

router = APIRouter()


class AnalyzeRequest(BaseModel):
    tickers: list[str]
    force_refresh: bool = False


@router.get("/api/tickers")
def list_tickers():
    """Return full TSE ticker list for the frontend to drive batching."""
    return get_tse_stocks()


@router.post("/api/analyze", response_model=list[StockResult])
async def analyze_batch(req: AnalyzeRequest):
    """
    Synchronously fetch and score a batch of tickers.
    Called repeatedly by the frontend to drive progress.
    Results are stored in SQLite and also returned directly.
    """
    info_map = get_stock_info_map()
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_INFO_FETCHES)

    tickers_to_fetch = []
    results: list[dict] = []

    for ticker in req.tickers:
        if not req.force_refresh and cache.is_fresh(ticker):
            cached = cache.get_stock(ticker)
            if cached:
                results.append(cached)
                continue
        tickers_to_fetch.append(ticker)

    if tickers_to_fetch:
        raw = await fetch_batch_info(tickers_to_fetch, semaphore, DEFAULT_BATCH_DELAY_SECONDS)
        for ticker, info in raw.items():
            meta = info_map.get(ticker, {})
            if not info:
                info = generate_stock_info(ticker, meta.get("sector", ""))
            scores = score_stock(info)
            cache.upsert_stock(ticker, meta.get("name", ""), meta.get("sector", ""), scores)
            cached = cache.get_stock(ticker)
            if cached:
                results.append(cached)

    return results
