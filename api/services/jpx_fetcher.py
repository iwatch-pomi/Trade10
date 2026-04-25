"""
Fetches the full TSE listed-stock roster from JPX's official data file.
Results are cached in-process for JPX_CACHE_TTL_HOURS hours.
Falls back to the bundled CSV when the download fails.
"""
import io
import logging
from datetime import datetime, timedelta
from typing import Optional

import requests
import pandas as pd

from config import JPX_CACHE_TTL_HOURS

logger = logging.getLogger(__name__)

JPX_URL = (
    "https://www.jpx.co.jp/markets/statistics-equities/misc/"
    "tvdivq0000001vg2-att/data_j.xls"
)

_MARKET_MAP = {
    "プライム（内国株式）": "プライム",
    "スタンダード（内国株式）": "スタンダード",
    "グロース（内国株式）": "グロース",
}

_cache: Optional[list[dict]] = None
_cache_ts: Optional[datetime] = None


def _is_fresh() -> bool:
    return (
        _cache is not None
        and _cache_ts is not None
        and datetime.utcnow() - _cache_ts < timedelta(hours=JPX_CACHE_TTL_HOURS)
    )


def _parse(content: bytes) -> list[dict]:
    df = pd.read_excel(io.BytesIO(content), header=0, dtype=str, engine="xlrd")
    stocks: list[dict] = []
    for _, row in df.iterrows():
        raw_market = str(row.get("市場・商品区分", "")).strip()
        market = _MARKET_MAP.get(raw_market)
        if not market:
            continue  # skip ETFs, REITs, foreign stocks, etc.

        code = str(row.get("コード", "")).strip()
        # TSE domestic codes are 4-digit numbers
        if not code.isdigit() or len(code) != 4:
            continue

        stocks.append({
            "ticker": f"{code}.T",
            "name": str(row.get("銘柄名", "")).strip(),
            "sector": str(row.get("33業種区分", "")).strip(),
            "market": market,
        })
    return stocks


def fetch_jpx_stocks() -> Optional[list[dict]]:
    """Return all TSE domestic stocks from JPX, using in-process cache.
    Returns None if the download fails (caller should use CSV fallback)."""
    global _cache, _cache_ts

    if _is_fresh():
        return _cache

    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; trade10-screener/1.0)"}
        resp = requests.get(JPX_URL, headers=headers, timeout=20)
        resp.raise_for_status()
        stocks = _parse(resp.content)
        if len(stocks) < 100:
            logger.warning("[JPX] Suspiciously few stocks (%d), ignoring", len(stocks))
            return None
        _cache = stocks
        _cache_ts = datetime.utcnow()
        logger.info("[JPX] Loaded %d stocks", len(stocks))
        return stocks
    except Exception as exc:
        logger.warning("[JPX] Fetch failed: %s", exc)
        return None


def invalidate_cache() -> None:
    global _cache, _cache_ts
    _cache = None
    _cache_ts = None
