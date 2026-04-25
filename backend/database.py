import sqlite3
import threading
from config import SQLITE_DB_PATH

_lock = threading.Lock()

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    with _lock:
        conn = get_conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS stock_cache (
                ticker          TEXT PRIMARY KEY,
                name            TEXT,
                sector          TEXT,
                price           REAL,
                market_cap      REAL,
                per             REAL,
                pbr             REAL,
                revenue_growth  REAL,
                profit_growth   REAL,
                dividend_yield  REAL,
                debt_to_equity  REAL,
                current_ratio   REAL,
                roe             REAL,
                eps             REAL,
                per_score       REAL DEFAULT 0,
                pbr_score       REAL DEFAULT 0,
                growth_score    REAL DEFAULT 0,
                dividend_health_score REAL DEFAULT 0,
                composite_score REAL DEFAULT 0,
                candidate_tag   TEXT,
                data_quality    TEXT DEFAULT 'minimal',
                raw_json        TEXT,
                cached_at       TEXT
            );

            CREATE TABLE IF NOT EXISTS screening_runs (
                job_id      TEXT PRIMARY KEY,
                started_at  TEXT,
                finished_at TEXT,
                total       INTEGER DEFAULT 0,
                processed   INTEGER DEFAULT 0,
                failed      INTEGER DEFAULT 0,
                status      TEXT DEFAULT 'queued'
            );
        """)
        conn.commit()
        conn.close()
