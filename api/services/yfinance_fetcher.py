import asyncio
import time
import yfinance as yf
from typing import Optional


def _get_info(ticker: str) -> dict:
    last_exc = None
    for attempt in range(3):
        try:
            t = yf.Ticker(ticker)
            info = t.info
            if info and len(info) >= 3:
                return info
            # Fall back to fast_info for basic price data
            fi = t.fast_info
            if fi:
                result = {}
                try:
                    result["currentPrice"] = fi.last_price
                    result["marketCap"] = fi.market_cap
                    result["trailingPE"] = fi.pe_ratio if hasattr(fi, "pe_ratio") else None
                except Exception:
                    pass
                if result:
                    return result
            return {}
        except Exception as exc:
            last_exc = exc
            if attempt < 2:
                time.sleep(2 ** attempt)  # 1s, 2s backoff
    return {}


async def fetch_stock_info(ticker: str) -> Optional[dict]:
    try:
        info = await asyncio.to_thread(_get_info, ticker)
        return info
    except Exception:
        return None


async def fetch_batch_info(
    tickers: list[str],
    semaphore: asyncio.Semaphore,
    delay: float = 0.2,
) -> dict[str, dict]:
    results = {}

    async def fetch_one(ticker: str):
        async with semaphore:
            data = await fetch_stock_info(ticker)
            results[ticker] = data or {}
            await asyncio.sleep(delay)

    await asyncio.gather(*[fetch_one(t) for t in tickers])
    return results
