import csv
import os
from config import TSE_FALLBACK_CSV


def get_tse_stocks() -> list[dict]:
    """Load TSE stock list from bundled CSV."""
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
    """Return dict keyed by ticker with name and sector."""
    return {s["ticker"]: s for s in get_tse_stocks()}
