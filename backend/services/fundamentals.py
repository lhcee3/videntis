import yfinance as yf

def get_fundamentals(ticker: str) -> dict:
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

    # Fundamental score (0-10)
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
