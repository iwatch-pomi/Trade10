"""Generate realistic demo data when Yahoo Finance is unavailable."""
import random
import hashlib
from typing import Optional


def _seed(ticker: str) -> random.Random:
    h = int(hashlib.md5(ticker.encode()).hexdigest(), 16)
    return random.Random(h)


# Sector-based PER ranges (realistic for TSE)
_SECTOR_PER = {
    "情報・通信業": (15, 40),
    "医薬品": (18, 50),
    "電気機器": (12, 35),
    "機械": (10, 25),
    "銀行業": (6, 12),
    "保険業": (8, 15),
    "不動産業": (10, 20),
    "小売業": (12, 30),
    "食料品": (15, 30),
    "化学": (10, 25),
    "鉄鋼": (5, 12),
    "非鉄金属": (7, 15),
    "輸送用機器": (6, 15),
    "サービス業": (15, 45),
    "建設業": (8, 18),
    "陸運業": (10, 20),
    "海運業": (4, 10),
    "卸売業": (7, 15),
    "証券・商品先物取引業": (8, 18),
    "電気・ガス業": (12, 22),
    "精密機器": (15, 35),
    "繊維製品": (8, 18),
    "水産・農林業": (12, 25),
    "鉱業": (8, 15),
    "石油・石炭製品": (6, 12),
    "ゴム製品": (8, 18),
    "ガラス・土石製品": (10, 20),
    "パルプ・紙": (8, 18),
    "金属製品": (8, 20),
    "空運業": (10, 30),
    "倉庫・運輸関連業": (10, 20),
    "その他製品": (12, 30),
    "その他金融業": (10, 20),
}


def generate_stock_info(ticker: str, sector: str) -> dict:
    rng = _seed(ticker)
    per_range = _SECTOR_PER.get(sector, (8, 30))

    per = round(rng.uniform(*per_range), 1)
    pbr = round(rng.uniform(0.3, 2.5), 2)
    revenue_growth = round(rng.normalvariate(8, 18), 1)
    earnings_growth = round(rng.normalvariate(10, 22), 1)
    dividend_yield = round(rng.uniform(0, 0.06), 4)
    debt_to_equity = round(rng.uniform(0, 150), 1)
    current_ratio = round(rng.uniform(0.8, 3.5), 2)
    roe = round(rng.uniform(-0.05, 0.25), 4)
    eps = round(rng.uniform(20, 800), 0)

    price_base = rng.uniform(300, 8000)
    price = round(price_base, 0)
    shares = rng.uniform(50e6, 5e9)
    market_cap = int(price * shares)

    # Deliberately make some stocks look very attractive (small cap hidden gems)
    if rng.random() < 0.08:
        per = round(rng.uniform(4, 9), 1)
        pbr = round(rng.uniform(0.3, 0.8), 2)
        revenue_growth = round(rng.uniform(20, 60), 1)
        earnings_growth = round(rng.uniform(25, 70), 1)
        dividend_yield = round(rng.uniform(0.03, 0.07), 4)

    return {
        "trailingPE": per,
        "priceToBook": pbr,
        "revenueGrowth": revenue_growth / 100,
        "earningsGrowth": earnings_growth / 100,
        "dividendYield": dividend_yield,
        "debtToEquity": debt_to_equity,
        "currentRatio": current_ratio,
        "returnOnEquity": roe,
        "trailingEps": eps,
        "currentPrice": price,
        "marketCap": market_cap,
    }
