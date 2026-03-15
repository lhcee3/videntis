"use client"
import { useState, useEffect } from "react"
import { fetchTrending, fetchPrices } from "@/lib/api"
import Link from "next/link"

const POPULAR = [
  { ticker: "NVDA", name: "NVIDIA" }, { ticker: "AAPL", name: "Apple" },
  { ticker: "TSLA", name: "Tesla" }, { ticker: "MSFT", name: "Microsoft" },
  { ticker: "AMZN", name: "Amazon" }, { ticker: "META", name: "Meta" },
  { ticker: "GOOGL", name: "Alphabet" }, { ticker: "AMD", name: "AMD" },
  { ticker: "NFLX", name: "Netflix" }, { ticker: "JPM", name: "JPMorgan" },
  { ticker: "BAC", name: "Bank of America" }, { ticker: "BABA", name: "Alibaba" },
]

function SkeletonCard() {
  return (
    <div className="border border-[#1e1e1e] p-6 bg-[#0a0a0a]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-5 w-16 bg-[#1e1e1e] animate-pulse mb-2" />
          <div className="h-3 w-24 bg-[#1e1e1e] animate-pulse" />
        </div>
        <div className="h-5 w-14 bg-[#1e1e1e] animate-pulse rounded-sm" />
      </div>
      <div className="h-10 w-28 bg-[#1e1e1e] animate-pulse mb-2" />
      <div className="h-3 w-20 bg-[#1e1e1e] animate-pulse mb-6" />
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-[#1e1e1e] animate-pulse" />
        <div className="flex-1 h-9 bg-[#1e1e1e] animate-pulse" />
      </div>
    </div>
  )
}

function StockCard({ ticker, name, priceData }: { ticker: string; name: string; priceData: any }) {
  const loading = !priceData
  const price = priceData?.price
  const change = priceData?.change_pct
  const volume = priceData?.volume
  const isPos = change >= 0

  const fmt = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
    return `${(v / 1e3).toFixed(0)}K`
  }

  if (loading) return <SkeletonCard />

  return (
    <div className="border border-[#1e1e1e] p-6 bg-[#0a0a0a] hover:border-[#2a2a2a] hover:bg-[#0d0d0d] transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono text-base font-bold">{ticker}</div>
          <div className="font-mono text-[10px] text-[#9ca3af]">{name}</div>
        </div>
        {change != null && (
          <div className="font-mono text-xs px-2 py-1"
            style={{
              color: isPos ? "#00ff87" : "#ff4444",
              backgroundColor: isPos ? "rgba(0,255,135,0.08)" : "rgba(255,68,68,0.08)",
            }}>
            {isPos ? "+" : ""}{change}%
          </div>
        )}
      </div>

      {price != null ? (
        <div className="font-display text-4xl mb-1">${price.toLocaleString()}</div>
      ) : (
        <div className="font-display text-4xl mb-1 text-[#333]">—</div>
      )}

      {volume != null && (
        <div className="font-mono text-[10px] text-[#9ca3af] mb-5">Vol {fmt(volume)}</div>
      )}

      <div className="flex gap-2 mt-4">
        <Link href={`/dashboard/${ticker}`}
          className="flex-1 text-center font-mono text-xs py-2.5 bg-[#f0ede8] text-[#0a0a0a] hover:bg-white transition-colors">
          FORECAST →
        </Link>
        <Link href={`/analyze/${ticker}`}
          className="flex-1 text-center font-mono text-xs py-2.5 border border-[#1e1e1e] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors uppercase">
          ANALYZE
        </Link>
      </div>
    </div>
  )
}

export default function ScreenerPage() {
  const [trending, setTrending] = useState<string[]>([])
  const [prices, setPrices] = useState<Record<string, any>>({})
  const [search, setSearch] = useState("")
  const [loadingPrices, setLoadingPrices] = useState(true)

  useEffect(() => {
    fetchTrending().then(d => setTrending(d.tickers)).catch(() => {})
    fetchPrices(POPULAR.map(s => s.ticker))
      .then(data => { setPrices(data); setLoadingPrices(false) })
      .catch(() => setLoadingPrices(false))
  }, [])

  const filtered = POPULAR.filter(s =>
    s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]">
      <header className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-8 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
        <Link href="/" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">← VIDENTIS</Link>
        </div>
        <div className="font-mono text-sm">SCREENER</div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em] mb-2">(01) STOCK SCREENER</div>
        <h1 className="font-display text-5xl mb-8">Find Stocks</h1>

        {trending.length > 0 && (
          <div className="border border-[#1e1e1e] p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
              <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em]">TRENDING TODAY</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {trending.map(t => (
                <Link key={t} href={`/analyze/${t}`}
                  className="font-mono text-xs px-4 py-2 border border-[#1e1e1e] hover:border-[#00ff87] hover:text-[#00ff87] transition-colors">
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name or ticker..."
            className="w-full bg-[#111] border border-[#1e1e1e] text-[#f0ede8] font-mono text-sm px-6 py-4 focus:outline-none focus:border-[#00ff87] transition-colors"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <StockCard
              key={s.ticker}
              ticker={s.ticker}
              name={s.name}
              priceData={loadingPrices ? null : prices[s.ticker]}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

