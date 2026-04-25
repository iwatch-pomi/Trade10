from fastapi import APIRouter
from services.cache import count_cached_stocks
from jobs.job_store import get_latest_job

router = APIRouter()


@router.get("/api/health")
def health():
    job = get_latest_job()
    return {
        "status": "ok",
        "cached_stocks": count_cached_stocks(),
        "last_run": job["started_at"] if job else None,
        "last_run_status": job["status"] if job else None,
    }
