import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Screening
DEFAULT_BATCH_SIZE = 20
DEFAULT_BATCH_DELAY_SECONDS = 0.3
MAX_CONCURRENT_INFO_FETCHES = 5
CACHE_TTL_HOURS = 6

# Scoring weights (must sum to 1.0)
WEIGHT_PER = 0.30
WEIGHT_PBR = 0.25
WEIGHT_GROWTH = 0.30
WEIGHT_DIVIDEND_HEALTH = 0.15

# Score thresholds for candidate tags
THRESHOLD_10X = 80.0
THRESHOLD_2X = 65.0

# TSE market average P/E
MARKET_AVG_PER = 15.0

# Data paths
TSE_FALLBACK_CSV = os.path.join(BASE_DIR, "data", "tse_stocks.csv")

# Vercel uses /tmp for writable storage; local dev uses api/data/
_ON_VERCEL = bool(os.environ.get("VERCEL"))
SQLITE_DB_PATH = "/tmp/stocks.db" if _ON_VERCEL else os.path.join(BASE_DIR, "data", "stocks.db")

JPX_CACHE_TTL_HOURS = 24

# CORS — allow all origins on Vercel (restrict via vercel.json if needed)
FRONTEND_ORIGINS = ["*"] if _ON_VERCEL else [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
