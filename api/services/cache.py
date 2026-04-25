import json
import sqlite3
import threading
from datetime import datetime, timedelta
from typing import Optional
from database import get_conn, _lock
from config import CACHE_TTL_HOURS

_write_lock = threading.Lock()


def is_fresh(ticker: str, ttl_hours: int = CACHE_TTL_HOURS) -> bool:
    conn = get_conn()
    row = conn.execute(
        "SELECT cached_at FROM stock_cache WHERE ticker = ?", (ticker,)
    ).fetchone()
    conn.close()
    if not row or not row["cached_at"]:
        return False
    try:
        cached_at = datetime.fromisoformat(row["cached_at"])
        return datetime.utcnow() - cached_at < timedelta(hours=ttl_hours)
    except Exception:
        return False


def upsert_stock(ticker: str, name: str, sector: str, scores: dict, market: str = ""):
    now = datetime.utcnow().isoformat()
    with _write_lock:
        conn = get_conn()
        conn.execute("""
            INSERT INTO stock_cache (
                ticker, name, sector, market, price, market_cap,
                per, pbr, revenue_growth, profit_growth,
                dividend_yield, debt_to_equity, current_ratio, roe, eps,
                per_score, pbr_score, growth_score, dividend_health_score,
                composite_score, candidate_tag, data_quality, cached_at
            ) VALUES (
                :ticker, :name, :sector, :market, :price, :market_cap,
                :per, :pbr, :revenue_growth, :profit_growth,
                :dividend_yield, :debt_to_equity, :current_ratio, :roe, :eps,
                :per_score, :pbr_score, :growth_score, :dividend_health_score,
                :composite_score, :candidate_tag, :data_quality, :cached_at
            )
            ON CONFLICT(ticker) DO UPDATE SET
                name=excluded.name, sector=excluded.sector, market=excluded.market,
                price=excluded.price,
                market_cap=excluded.market_cap, per=excluded.per, pbr=excluded.pbr,
                revenue_growth=excluded.revenue_growth, profit_growth=excluded.profit_growth,
                dividend_yield=excluded.dividend_yield, debt_to_equity=excluded.debt_to_equity,
                current_ratio=excluded.current_ratio, roe=excluded.roe, eps=excluded.eps,
                per_score=excluded.per_score, pbr_score=excluded.pbr_score,
                growth_score=excluded.growth_score,
                dividend_health_score=excluded.dividend_health_score,
                composite_score=excluded.composite_score,
                candidate_tag=excluded.candidate_tag,
                data_quality=excluded.data_quality, cached_at=excluded.cached_at
        """, {
            "ticker": ticker, "name": name, "sector": sector, "market": market,
            "cached_at": now, **scores,
        })
        conn.commit()
        conn.close()


def get_all_stocks(
    min_score: float = 0,
    max_per: Optional[float] = None,
    max_pbr: Optional[float] = None,
    min_dividend: Optional[float] = None,
    candidate_tag: Optional[str] = None,
    market: Optional[str] = None,
    sort_by: str = "composite_score",
    sort_dir: str = "desc",
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[dict], int]:
    allowed_sort = {
        "composite_score", "per", "pbr", "revenue_growth",
        "dividend_yield", "market_cap", "cached_at",
    }
    if sort_by not in allowed_sort:
        sort_by = "composite_score"
    direction = "DESC" if sort_dir.lower() == "desc" else "ASC"

    conditions = ["composite_score >= ?"]
    params: list = [min_score]

    if max_per is not None:
        conditions.append("(per IS NULL OR per <= ?)")
        params.append(max_per)
    if max_pbr is not None:
        conditions.append("(pbr IS NULL OR pbr <= ?)")
        params.append(max_pbr)
    if min_dividend is not None:
        min_div_decimal = min_dividend / 100
        conditions.append("(dividend_yield IS NOT NULL AND dividend_yield >= ?)")
        params.append(min_div_decimal)
    if candidate_tag:
        conditions.append("candidate_tag = ?")
        params.append(candidate_tag)
    if market:
        market_list = [m.strip() for m in market.split(",") if m.strip()]
        if market_list:
            placeholders = ",".join("?" * len(market_list))
            conditions.append(f"market IN ({placeholders})")
            params.extend(market_list)

    where = " AND ".join(conditions)
    conn = get_conn()
    total = conn.execute(
        f"SELECT COUNT(*) FROM stock_cache WHERE {where}", params
    ).fetchone()[0]
    rows = conn.execute(
        f"SELECT * FROM stock_cache WHERE {where} ORDER BY {sort_by} {direction} LIMIT ? OFFSET ?",
        params + [limit, offset],
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows], total


def get_stock(ticker: str) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM stock_cache WHERE ticker = ?", (ticker,)).fetchone()
    conn.close()
    return dict(row) if row else None


def count_cached_stocks() -> int:
    conn = get_conn()
    c = conn.execute("SELECT COUNT(*) FROM stock_cache").fetchone()[0]
    conn.close()
    return c


def clear_cache():
    with _write_lock:
        conn = get_conn()
        conn.execute("DELETE FROM stock_cache")
        conn.commit()
        conn.close()
