"use client"
import { useState, useEffect } from "react"
import { fetchTrending } from "@/lib/api"
import Link from "next/link"

const POPULAR = [
  { ticker: "NVDA", name: "NVIDIA" }, { ticker: "AAPL", name: "Apple" },
  { ticker: "TSLA", name: "Tesla" }, { ticker: "MSFT", name: "Microsoft" },
  { ticker: "AMZN", name: "Amazon" }, { ticker: "META", name: "Meta" },
  { ticker: "GOOGL", name: "Alphabet" }, { ticker: "AMD", name: "AMD" },
  { ticker: "NFLX", name: "Netflix" }, { ticker: "BABA", name: "Alibaba" },
  { ticker: "JPM", name: "JPMorgan" }, { ticker: "BAC", name: "Bank of America" },
]

export default function ScreenerPage() {
  const [trending, setTrending] = useState<string[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchTrending().then(d => setTrending(d.tickers)).catch(() => {})
  }, [])

  const filtered = POPULAR.filter(s =>
    s.ticker.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]">
      <header className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-8 py-4 flex items-center justify-between z-10">
        <Link href="/" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] transition-colors">← STOCKSENSE</Link>
        <div className="font-mono text-sm">SCREENER</div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="font-mono text-[10px] text-[#9b9895] uppercase tracking-[0.2em] mb-2">(01) STOCK SCREENER</div>
        <h1 className="font-display text-5xl mb-8">Find Stocks</h1>

        {trending.length > 0 && (
          <div className="border border-[#1e1e1e] p-6 mb-8">
            <div className="font-mono text-[10px] text-[#9b9895] uppercase tracking-[0.2em] mb-4">🔥 TRENDING TODAY</div>
            <div className="flex gap-3 flex-wrap">
              {trending.map(t => (
                <Link key={t} href={`/analyze/${t}`}
                  className="font-mono text-sm px-4 py-2 border border-[#1e1e1e] hover:border-[#00ff87] hover:text-[#00ff87] transition-colors">
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
            <div key={s.ticker} className="border border-[#1e1e1e] p-6 hover:border-[#333] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-mono text-lg font-bold">{s.ticker}</div>
                  <div className="font-mono text-xs text-[#9b9895]">{s.name}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/${s.ticker}`}
                  className="flex-1 text-center font-mono text-xs py-2 border border-[#1e1e1e] hover:border-[#00ff87] hover:text-[#00ff87] transition-colors">
                  Forecast
                </Link>
                <Link href={`/analyze/${s.ticker}`}
                  className="flex-1 text-center font-mono text-xs py-2 border border-[#1e1e1e] hover:border-[#d4a847] hover:text-[#d4a847] transition-colors">
                  Analyze
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
