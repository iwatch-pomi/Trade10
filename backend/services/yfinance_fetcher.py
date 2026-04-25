import asyncio
import yfinance as yf
from typing import Optional


async def fetch_stock_info(ticker: str) -> Optional[dict]:
    """Fetch yfinance info for a single ticker using thread offload."""
    try:
        info = await asyncio.to_thread(_get_info, ticker)
        return info
    except Exception:
        return None


def _get_info(ticker: str) -> dict:
    try:
        t = yf.Ticker(ticker)
        info = t.info
        if not info or len(info) < 3:
            return {}
        return info
    except Exception:
        return {}


async def fetch_batch_info(
    tickers: list[str],
    semaphore: asyncio.Semaphore,
    delay: float = 0.2,
) -> dict[str, dict]:
    """Fetch info for multiple tickers with concurrency control."""
    results = {}

    async def fetch_one(ticker: str):
        async with semaphore:
            data = await fetch_stock_info(ticker)
            results[ticker] = data or {}
            await asyncio.sleep(delay)

    await asyncio.gather(*[fetch_one(t) for t in tickers])
    return results
