"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signInWithGoogle } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

interface SearchResult {
  symbol: string
  shortname: string
  exchDisp: string
}

async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=6&newsCount=0&listsCount=0`)
    const data = await res.json()
    return (data.quotes || []).filter((q: any) => q.quoteType === "EQUITY" && q.symbol && q.shortname)
  } catch {
    return []
  }
}

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const debounceRef = useRef<NodeJS.Timeout>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setShowDropdown(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const res = await searchTickers(query)
      setResults(res)
      setShowDropdown(res.length > 0)
      setLoading(false)
    }, 300)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(symbol: string) {
    setShowDropdown(false)
    setQuery("")
    router.push(`/dashboard/${symbol}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) handleSelect(query.trim().toUpperCase())
  }

  const quickPicks = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN"]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <div className="font-mono text-sm tracking-wider">STOCKSENSE</div>
        <div className="flex items-center gap-6">
          <Link href="/screener" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Screener</Link>
          <Link href="/portfolio" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Portfolio</Link>
          <Link href="/watchlist" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Watchlist</Link>
          <Link href="/tools" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Tools</Link>
          {!user ? (
            <button onClick={() => signInWithGoogle()} className="px-4 py-2 border border-[#1e1e1e] text-[#9b9895] hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors font-mono text-xs uppercase">Sign In</button>
          ) : (
            <div className="font-mono text-xs text-[#9b9895]">{user.displayName}</div>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="font-mono text-xs text-muted mb-8">(01)</div>
          <h1 className="font-display text-7xl md:text-8xl mb-2 leading-none">MARKET</h1>
          <h1 className="font-display text-7xl md:text-8xl mb-6 leading-none">INTELLIGENCE.</h1>
          <p className="text-lg text-muted mb-12">Neural Forecasts for the Next 7 Days.</p>

          <div ref={wrapperRef} className="relative mb-6">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search — Apple, NVDA, Tesla, Microsoft..."
                className="w-full bg-surface border border-border hover:border-border-hover focus:border-primary outline-none px-6 py-4 font-mono text-sm transition-colors"
                autoComplete="off"
              />
            </form>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 border border-border border-t-0 bg-surface z-50">
                {results.map(r => (
                  <button
                    key={r.symbol}
                    type="button"
                    onClick={() => handleSelect(r.symbol)}
                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#111] transition-colors text-left"
                  >
                    <div>
                      <span className="font-mono text-sm text-primary">{r.symbol}</span>
                      <span className="font-mono text-xs text-muted ml-3">{r.shortname}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted">{r.exchDisp}</span>
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {quickPicks.map(t => (
              <button key={t} onClick={() => handleSelect(t)}
                className="px-4 py-2 border border-[#1e1e1e] text-[#9b9895] hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors font-mono text-xs uppercase">
                {t}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
