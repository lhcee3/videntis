const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed: ${path}`)
  }
  return res.json()
}

export const fetchForecast = (ticker: string) =>
  apiFetch(`/forecast/${ticker}/blended`, { next: { revalidate: 300 } } as any)
    .catch(() => apiFetch(`/forecast/${ticker}`, { next: { revalidate: 300 } } as any))

export const fetchAnalysis = (ticker: string) =>
  apiFetch(`/analyze/${ticker}`)

export const analyzePortfolio = (holdings: { ticker: string; shares: number; buy_price: number }[]) =>
  apiFetch("/portfolio/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ holdings }),
  })

export const fetchTrending = () => apiFetch("/trending")

export const fetchPrices = (tickers: string[]) =>
  apiFetch(`/prices?tickers=${tickers.join(",")}`)
