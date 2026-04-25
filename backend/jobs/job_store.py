import threading
import uuid
from datetime import datetime
from typing import Optional

_store: dict[str, dict] = {}
_lock = threading.Lock()


def create_job() -> str:
    job_id = str(uuid.uuid4())
    with _lock:
        _store[job_id] = {
            "job_id": job_id,
            "status": "queued",
            "total": 0,
            "processed": 0,
            "failed": 0,
            "pct": 0.0,
            "started_at": datetime.utcnow().isoformat(),
            "finished_at": None,
            "error": None,
            "current_ticker": None,
        }
    return job_id


def update_job(job_id: str, **kwargs):
    with _lock:
        if job_id in _store:
            _store[job_id].update(kwargs)


def get_job(job_id: str) -> Optional[dict]:
    with _lock:
        return dict(_store[job_id]) if job_id in _store else None


def get_latest_job() -> Optional[dict]:
    with _lock:
        if not _store:
            return None
        latest = max(_store.values(), key=lambda j: j["started_at"])
        return dict(latest)
