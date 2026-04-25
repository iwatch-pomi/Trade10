from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import health, screening, stocks
from config import FRONTEND_ORIGINS

app = FastAPI(title="割安株ファインダー API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(screening.router)
app.include_router(stocks.router)


@app.on_event("startup")
def startup():
    init_db()
