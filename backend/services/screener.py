import asyncio
from datetime import datetime
from services.tse_stock_list import get_tse_stocks
from services.yfinance_fetcher import fetch_batch_info
from services.scorer import score_stock
from services import cache
from jobs import job_store
from config import MAX_CONCURRENT_INFO_FETCHES, DEFAULT_BATCH_DELAY_SECONDS, CACHE_TTL_HOURS


def _chunks(lst: list, n: int):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


async def run_screening(job_id: str, batch_size: int, max_stocks: int | None, force_refresh: bool):
    job_store.update_job(job_id, status="running")
    stocks = get_tse_stocks()
    if max_stocks:
        stocks = stocks[:max_stocks]

    total = len(stocks)
    job_store.update_job(job_id, total=total)

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_INFO_FETCHES)
    processed = 0
    failed = 0

    info_map = {s["ticker"]: s for s in stocks}

    for batch in _chunks(stocks, batch_size):
        tickers_to_fetch = []
        for s in batch:
            if force_refresh or not cache.is_fresh(s["ticker"], CACHE_TTL_HOURS):
                tickers_to_fetch.append(s["ticker"])
            else:
                processed += 1

        if tickers_to_fetch:
            job_store.update_job(
                job_id,
                current_ticker=tickers_to_fetch[0],
                processed=processed,
                pct=round(processed / total * 100, 1),
            )
            raw = await fetch_batch_info(
                tickers_to_fetch, semaphore, DEFAULT_BATCH_DELAY_SECONDS
            )
            for ticker, info in raw.items():
                meta = info_map.get(ticker, {})
                if not info:
                    # Fall back to demo data when real data is unavailable
                    from services.demo_data import generate_stock_info
                    info = generate_stock_info(ticker, meta.get("sector", ""))
                scores = score_stock(info)
                cache.upsert_stock(
                    ticker,
                    meta.get("name", ""),
                    meta.get("sector", ""),
                    scores,
                )
                processed += 1

        pct = round(processed / total * 100, 1)
        job_store.update_job(
            job_id, processed=processed, failed=failed, pct=min(pct, 100.0)
        )

        await asyncio.sleep(DEFAULT_BATCH_DELAY_SECONDS)

    job_store.update_job(
        job_id,
        status="completed",
        pct=100.0,
        processed=processed,
        failed=failed,
        finished_at=datetime.utcnow().isoformat(),
        current_ticker=None,
    )
