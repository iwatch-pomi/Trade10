from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ScreeningRequest(BaseModel):
    force_refresh: bool = False
    batch_size: int = 20
    max_stocks: Optional[int] = None


class ScreenJobResponse(BaseModel):
    job_id: str
    status: JobStatus
    total: int
    processed: int
    failed: int
    pct: float
    started_at: str
    finished_at: Optional[str] = None
    error: Optional[str] = None


class StockResult(BaseModel):
    ticker: str
    name: Optional[str] = None
    sector: Optional[str] = None
    market: Optional[str] = None
    price: Optional[float] = None
    market_cap: Optional[float] = None
    per: Optional[float] = None
    per_score: float = 0
    pbr: Optional[float] = None
    pbr_score: float = 0
    revenue_growth: Optional[float] = None
    profit_growth: Optional[float] = None
    growth_score: float = 0
    dividend_yield: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    roe: Optional[float] = None
    avg_volume: Optional[float] = None
    dividend_health_score: float = 0
    composite_score: float = 0
    candidate_tag: Optional[str] = None
    data_quality: str = "minimal"
    cached_at: Optional[str] = None


class StockDetail(StockResult):
    eps: Optional[float] = None
    raw_json: Optional[str] = None
    score_breakdown: Optional[dict] = None


class StockListResponse(BaseModel):
    items: list[StockResult]
    total: int
