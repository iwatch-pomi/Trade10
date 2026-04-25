from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models.schemas import StockListResponse, StockDetail
from services.cache import get_all_stocks, get_stock, clear_cache

router = APIRouter()


@router.get("/api/stocks", response_model=StockListResponse)
def list_stocks(
    min_score: float = Query(0, ge=0, le=100),
    max_per: Optional[float] = Query(None),
    max_pbr: Optional[float] = Query(None),
    min_dividend: Optional[float] = Query(None, description="Min dividend yield in %"),
    min_avg_volume: Optional[float] = Query(None, description="Min average daily volume (absolute shares)"),
    candidate_tag: Optional[str] = Query(None),
    market: Optional[str] = Query(None, description="Market segment: プライム/スタンダード/グロース"),
    sort_by: str = Query("composite_score"),
    sort_dir: str = Query("desc"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    items, total = get_all_stocks(
        min_score=min_score,
        max_per=max_per,
        max_pbr=max_pbr,
        min_dividend=min_dividend,
        min_avg_volume=min_avg_volume,
        candidate_tag=candidate_tag,
        market=market,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
    )
    return StockListResponse(items=items, total=total)


@router.get("/api/stocks/{ticker}", response_model=StockDetail)
def get_stock_detail(ticker: str):
    stock = get_stock(ticker)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    stock["score_breakdown"] = {
        "PER": stock.get("per_score", 0),
        "PBR": stock.get("pbr_score", 0),
        "成長率": stock.get("growth_score", 0),
        "配当・健全性": stock.get("dividend_health_score", 0),
        "総合スコア": stock.get("composite_score", 0),
    }
    return StockDetail(**stock)


@router.delete("/api/cache")
def delete_cache():
    clear_cache()
    return {"message": "Cache cleared"}
