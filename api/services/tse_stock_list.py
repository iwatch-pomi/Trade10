import csv
import os
from config import TSE_FALLBACK_CSV
from services.jpx_fetcher import fetch_jpx_stocks


def get_tse_stocks() -> list[dict]:
    """Load TSE stock list from JPX (live) with bundled CSV fallback."""
    stocks = fetch_jpx_stocks()
    if stocks:
        return stocks
    return _load_from_csv()


def _load_from_csv() -> list[dict]:
    stocks = []
    with open(TSE_FALLBACK_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            stocks.append({
                "ticker": f"{row['ticker'].strip()}.T",
                "name": row["name"].strip(),
                "sector": row["sector"].strip(),
                "market": row.get("market", "").strip(),
            })
    return stocks


def get_tse_tickers() -> list[str]:
    return [s["ticker"] for s in get_tse_stocks()]


def get_stock_info_map() -> dict[str, dict]:
    """Return dict keyed by ticker with name, sector, and market."""
    return {s["ticker"]: s for s in get_tse_stocks()}
