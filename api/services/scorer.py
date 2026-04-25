from typing import Optional
from config import (
    WEIGHT_PER, WEIGHT_PBR, WEIGHT_GROWTH, WEIGHT_DIVIDEND_HEALTH,
    THRESHOLD_10X, THRESHOLD_2X, MARKET_AVG_PER,
)


def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


def score_per(per: Optional[float]) -> float:
    if per is None or per <= 0:
        return 0.0
    if per < 5:
        return 100.0
    if per < 10:
        return 90.0
    if per < 15:
        return 70.0
    if per < 20:
        return 45.0
    if per < 30:
        return 20.0
    return 5.0


def score_pbr(pbr: Optional[float]) -> float:
    if pbr is None or pbr <= 0:
        return 0.0
    if pbr < 0.5:
        return 100.0
    if pbr < 1.0:
        return 80.0
    if pbr < 1.5:
        return 55.0
    if pbr < 2.0:
        return 30.0
    if pbr < 3.0:
        return 10.0
    return 0.0


def score_growth(
    revenue_growth: Optional[float],
    profit_growth: Optional[float],
) -> float:
    rev = revenue_growth if revenue_growth is not None else 0.0
    prof = profit_growth if profit_growth is not None else 0.0

    if revenue_growth is None and profit_growth is None:
        return 0.0

    combined = rev * 0.4 + prof * 0.6

    if combined >= 50:
        return 100.0
    if combined >= 30:
        return 85.0
    if combined >= 20:
        return 70.0
    if combined >= 10:
        return 50.0
    if combined >= 0:
        return 25.0
    return max(0.0, 25.0 + combined)


def score_dividend_health(
    dividend_yield: Optional[float],
    debt_to_equity: Optional[float],
    current_ratio: Optional[float],
) -> float:
    div_pct = (dividend_yield or 0.0) * 100
    div_score = _clamp(div_pct * 20)

    if debt_to_equity is not None and debt_to_equity >= 0:
        debt_score = _clamp(100 - debt_to_equity)
    else:
        debt_score = 50.0

    if current_ratio is not None and current_ratio >= 0:
        liq_score = _clamp(current_ratio * 50)
    else:
        liq_score = 50.0

    return div_score * 0.5 + debt_score * 0.3 + liq_score * 0.2


def calculate_composite(
    per_score: float,
    pbr_score: float,
    growth_score: float,
    dh_score: float,
) -> float:
    return (
        per_score * WEIGHT_PER
        + pbr_score * WEIGHT_PBR
        + growth_score * WEIGHT_GROWTH
        + dh_score * WEIGHT_DIVIDEND_HEALTH
    )


def get_candidate_tag(composite: float, growth_score: float, pbr: Optional[float]) -> Optional[str]:
    if composite >= THRESHOLD_10X and growth_score >= 70 and (pbr is None or pbr < 1.5):
        return "10x候補"
    if composite >= THRESHOLD_2X:
        return "2x候補"
    return None


def score_stock(info: dict) -> dict:
    """Calculate all scores from a yfinance info dict. Returns score dict."""
    per = info.get("trailingPE") or info.get("forwardPE")
    pbr = info.get("priceToBook")
    dividend_yield = info.get("dividendYield")
    debt_to_equity = info.get("debtToEquity")
    current_ratio = info.get("currentRatio")

    rev_growth = _get_growth(
        info.get("totalRevenue"),
        info.get("revenueGrowth"),
    )
    profit_growth = _get_growth(
        info.get("netIncomeToCommon"),
        info.get("earningsGrowth"),
    )

    per_score = score_per(per)
    pbr_score = score_pbr(pbr)
    growth_score = score_growth(rev_growth, profit_growth)
    dh_score = score_dividend_health(dividend_yield, debt_to_equity, current_ratio)
    composite = calculate_composite(per_score, pbr_score, growth_score, dh_score)
    tag = get_candidate_tag(composite, growth_score, pbr)

    fields_present = sum(
        v is not None for v in [per, pbr, dividend_yield, rev_growth, profit_growth]
    )
    if fields_present >= 4:
        data_quality = "full"
    elif fields_present >= 2:
        data_quality = "partial"
    else:
        data_quality = "minimal"

    avg_volume = info.get("averageVolume") or info.get("averageVolume10days")

    return {
        "price": info.get("currentPrice") or info.get("regularMarketPrice"),
        "market_cap": info.get("marketCap"),
        "per": per,
        "pbr": pbr,
        "revenue_growth": rev_growth,
        "profit_growth": profit_growth,
        "dividend_yield": dividend_yield,
        "debt_to_equity": debt_to_equity,
        "current_ratio": current_ratio,
        "roe": info.get("returnOnEquity"),
        "eps": info.get("trailingEps"),
        "avg_volume": avg_volume,
        "per_score": per_score,
        "pbr_score": pbr_score,
        "growth_score": growth_score,
        "dividend_health_score": dh_score,
        "composite_score": composite,
        "candidate_tag": tag,
        "data_quality": data_quality,
    }


def _get_growth(absolute_value, growth_ratio) -> Optional[float]:
    if growth_ratio is not None:
        return growth_ratio * 100
    return None
