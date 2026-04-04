import os
import logging
from typing import Optional, Dict, Any

import yfinance as yf
import requests as req

from services import cache_manager as cache

logger = logging.getLogger(__name__)

SEC_EMAIL      = os.getenv("SEC_EMAIL", "videntis@example.com")
ENABLE_SEC     = os.getenv("ENABLE_SEC_EDGAR", "true").lower() == "true"
EDGAR_BASE     = "https://data.sec.gov"
EDGAR_HEADERS  = {"User-Agent": f"Videntis {SEC_EMAIL}"}

# CIK lookup cache (in-memory, permanent — CIKs don't change)
_cik_cache: dict = {}


def _get_cik(ticker: str) -> Optional[str]:
    if ticker in _cik_cache:
        return _cik_cache[ticker]
    try:
        url = f"{EDGAR_BASE}/submissions/CIK{ticker}.json"
        # EDGAR uses zero-padded 10-digit CIKs — use the tickers.json lookup instead
        tickers_url = "https://www.sec.gov/files/company_tickers.json"
        data = req.get(tickers_url, headers=EDGAR_HEADERS, timeout=10).json()
        for entry in data.values():
            if entry.get("ticker", "").upper() == ticker.upper():
                cik = str(entry["cik_str"]).zfill(10)
                _cik_cache[ticker] = cik
                return cik
    except Exception as e:
        logger.warning(f"CIK lookup failed for {ticker}: {e}")
    return None


def _get_fundamentals_sec(ticker: str) -> Optional[Dict[str, Any]]:
    """Fetch key financials from SEC EDGAR XBRL API."""
    if not ENABLE_SEC:
        return None
    try:
        cik = _get_cik(ticker)
        if not cik:
            return None

        url = f"{EDGAR_BASE}/api/xbrl/companyfacts/CIK{cik}.json"
        data = req.get(url, headers=EDGAR_HEADERS, timeout=15).json()
        facts = data.get("facts", {}).get("us-gaap", {})

        def _latest(concept: str) -> Optional[float]:
            entries = facts.get(concept, {}).get("units", {}).get("USD", [])
            # Filter to annual (10-K) filings, take most recent
            annual = [e for e in entries if e.get("form") in ("10-K", "20-F") and e.get("val") is not None]
            if not annual:
                return None
            return annual[-1]["val"]

        net_income = _latest("NetIncomeLoss")
        revenue    = _latest("Revenues") or _latest("RevenueFromContractWithCustomerExcludingAssessedTax")
        shares     = _latest("CommonStockSharesOutstanding")
        total_debt = _latest("LongTermDebt")
        total_cash = _latest("CashAndCashEquivalentsAtCarryingValue")

        eps = round(net_income / shares, 2) if net_income and shares else None

        return {
            "_source": "sec_edgar",
            "eps_sec": eps,
            "revenue_sec": revenue,
            "net_income_sec": net_income,
            "shares_outstanding": shares,
            "total_debt_sec": total_debt,
            "total_cash_sec": total_cash,
        }
    except Exception as e:
        logger.warning(f"SEC EDGAR fetch failed for {ticker}: {e}")
        return None


def _get_fundamentals_yahoo(ticker: str) -> dict:
    stock = yf.Ticker(ticker)
    info = stock.info

    pe = info.get("trailingPE") or info.get("forwardPE")
    eps = info.get("trailingEps")
    revenue_growth = info.get("revenueGrowth")
    earnings_growth = info.get("earningsGrowth")
    debt_to_equity = info.get("debtToEquity")
    roe = info.get("returnOnEquity")
    profit_margin = info.get("profitMargins")
    beta = info.get("beta")
    dividend_yield = info.get("dividendYield")
    peg = info.get("pegRatio")
    pb = info.get("priceToBook")
    free_cash_flow = info.get("freeCashflow")
    total_cash = info.get("totalCash")
    total_debt = info.get("totalDebt")

    score = 5.0
    if pe and pe < 20: score += 1.0
    elif pe and pe > 40: score -= 1.0
    if revenue_growth and revenue_growth > 0.1: score += 1.0
    elif revenue_growth and revenue_growth < 0: score -= 1.0
    if roe and roe > 0.15: score += 1.0
    elif roe and roe < 0: score -= 1.0
    if debt_to_equity and debt_to_equity < 50: score += 0.5
    elif debt_to_equity and debt_to_equity > 200: score -= 0.5
    if profit_margin and profit_margin > 0.1: score += 0.5
    if earnings_growth and earnings_growth > 0.1: score += 0.5
    score = round(max(0, min(10, score)), 1)

    return {
        "pe_ratio": round(pe, 2) if pe else None,
        "peg_ratio": round(peg, 2) if peg else None,
        "price_to_book": round(pb, 2) if pb else None,
        "eps": round(eps, 2) if eps else None,
        "revenue_growth": round(revenue_growth * 100, 1) if revenue_growth else None,
        "earnings_growth": round(earnings_growth * 100, 1) if earnings_growth else None,
        "debt_to_equity": round(debt_to_equity, 1) if debt_to_equity else None,
        "roe": round(roe * 100, 1) if roe else None,
        "profit_margin": round(profit_margin * 100, 1) if profit_margin else None,
        "beta": round(beta, 2) if beta else None,
        "dividend_yield": round(dividend_yield * 100, 2) if dividend_yield else None,
        "free_cash_flow": free_cash_flow,
        "total_cash": total_cash,
        "total_debt": total_debt,
        "fundamental_score": score,
        "sector": info.get("sector", ""),
        "industry": info.get("industry", ""),
        "description": info.get("longBusinessSummary", "")[:400] if info.get("longBusinessSummary") else "",
        "employees": info.get("fullTimeEmployees"),
        "country": info.get("country", ""),
    }


def get_fundamentals(ticker: str) -> dict:
    """Returns Yahoo fundamentals enriched with SEC EDGAR data where available."""
    cached = cache.get_fundamentals(f"fund_{ticker}")
    if cached is not None:
        return cached

    result = _get_fundamentals_yahoo(ticker)

    # Enrich with SEC data (additive — never overwrites existing fields)
    sec_data = _get_fundamentals_sec(ticker)
    if sec_data:
        # Only fill in fields that Yahoo left empty
        if not result.get("eps") and sec_data.get("eps_sec"):
            result["eps"] = sec_data["eps_sec"]
        if not result.get("total_cash") and sec_data.get("total_cash_sec"):
            result["total_cash"] = sec_data["total_cash_sec"]
        if not result.get("total_debt") and sec_data.get("total_debt_sec"):
            result["total_debt"] = sec_data["total_debt_sec"]
        # Attach raw SEC fields as bonus data
        result["sec_revenue"] = sec_data.get("revenue_sec")
        result["sec_net_income"] = sec_data.get("net_income_sec")

    cache.set_fundamentals(f"fund_{ticker}", result)
    return result
