import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import ScreeningRequest, ScreenJobResponse
from jobs.job_store import create_job, get_job
from services.screener import run_screening

router = APIRouter()


@router.post("/api/screen/start", response_model=ScreenJobResponse)
async def start_screening(req: ScreeningRequest, background_tasks: BackgroundTasks):
    job_id = create_job()
    background_tasks.add_task(
        _run_screening_task,
        job_id,
        req.batch_size,
        req.max_stocks,
        req.force_refresh,
    )
    job = get_job(job_id)
    return ScreenJobResponse(**job)


async def _run_screening_task(job_id, batch_size, max_stocks, force_refresh):
    try:
        await run_screening(job_id, batch_size, max_stocks, force_refresh)
    except Exception as e:
        from jobs.job_store import update_job
        from datetime import datetime
        update_job(
            job_id,
            status="failed",
            error=str(e),
            finished_at=datetime.utcnow().isoformat(),
        )


@router.get("/api/screen/status/{job_id}", response_model=ScreenJobResponse)
def get_screening_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return ScreenJobResponse(**job)


@router.get("/api/screen/last")
def get_last_screening():
    from jobs.job_store import get_latest_job
    job = get_latest_job()
    if not job:
        return {"message": "No screening run yet"}
    return job
