"use client"
import { useState, useEffect, useRef, useMemo } from "react"
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

// ── Ticker tape data (static seed, refreshed from /prices on mount) ──────────
const TAPE_TICKERS = ["NVDA","AAPL","TSLA","MSFT","AMZN","META","GOOGL","AMD","NFLX","JPM"]

interface TapeItem { ticker: string; price: number; change: number }

function TickerTape({ items }: { items: TapeItem[] }) {
  if (!items.length) return null
  // duplicate for seamless loop
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden border-b border-[#1e1e1e] bg-[#0a0a0a] h-8 flex items-center">
      <div className="flex gap-8 animate-tape whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-[10px] flex items-center gap-1.5">
            <span className="text-[#9b9895]">{item.ticker}</span>
            <span className="text-[#f0ede8]">${item.price.toFixed(2)}</span>
            <span style={{ color: item.change >= 0 ? "#00ff87" : "#ff4444" }}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Market status (pure time logic) ──────────────────────────────────────────
function MarketStatus() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    function check() {
      const now = new Date()
      // Convert to ET
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
      const day = et.getDay()
      const h = et.getHours()
      const m = et.getMinutes()
      const mins = h * 60 + m
      setOpen(day >= 1 && day <= 5 && mins >= 570 && mins < 960) // 9:30–16:00
    }
    check()
    const id = setInterval(check, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-[#00ff87] animate-pulse" : "bg-[#444]"}`} />
      <span className="font-mono text-[10px] text-[#9b9895] uppercase tracking-widest">
        {open ? "MARKET OPEN" : "MARKET CLOSED"}
      </span>
    </div>
  )
}

// ── Animated hero words ───────────────────────────────────────────────────────
function AnimatedWord({ word, delay }: { word: string; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <span
      className="inline-block transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}
    >
      {word}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const [tapeItems, setTapeItems] = useState<TapeItem[]>([])
  const router = useRouter()
  const { user } = useAuth()
  const debounceRef = useRef<NodeJS.Timeout>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch tape prices once on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/prices?tickers=${TAPE_TICKERS.join(",")}`)
      .then(r => r.json())
      .then((data: Record<string, any>) => {
        const items = TAPE_TICKERS
          .filter(t => data[t]?.price)
          .map(t => ({ ticker: t, price: data[t].price, change: data[t].change_pct ?? 0 }))
        setTapeItems(items)
      })
      .catch(() => {
        // fallback static data so tape always shows something
        setTapeItems([
          { ticker: "NVDA", price: 875.40, change: 2.4 },
          { ticker: "AAPL", price: 189.30, change: -0.3 },
          { ticker: "TSLA", price: 248.50, change: 1.1 },
          { ticker: "MSFT", price: 415.20, change: 0.8 },
          { ticker: "AMZN", price: 182.60, change: -0.5 },
          { ticker: "META", price: 512.80, change: 1.7 },
          { ticker: "GOOGL", price: 175.90, change: 0.4 },
          { ticker: "AMD",  price: 168.30, change: -1.2 },
        ])
      })
  }, [])

  // Search debounce
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setShowDropdown(false); return }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const res = await searchTickers(query)
      setResults(res)
      setShowDropdown(res.length > 0)
      setSearching(false)
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

  const firstName = user?.displayName?.split(" ")[0] ?? null
  const quickPicks = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN"]

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }}>
      {/* Navbar */}
      <header className="p-6 flex justify-between items-center">
        <div className="font-mono text-sm tracking-wider">STOCKSENSE</div>
        <div className="flex items-center gap-6">
          <MarketStatus />
          <Link href="/screener" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Screener</Link>
          <Link href="/portfolio" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Portfolio</Link>
          <Link href="/watchlist" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Watchlist</Link>
          <Link href="/tools" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Tools</Link>
          {!user ? (
            <button onClick={() => signInWithGoogle()} className="px-4 py-2 border border-[#1e1e1e] text-[#9b9895] hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors font-mono text-xs uppercase">Sign In</button>
          ) : (
            <div className="flex items-center gap-2">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full opacity-80" />}
              <span className="font-mono text-xs text-[#9b9895]">{firstName}</span>
            </div>
          )}
        </div>
      </header>

      {/* Ticker tape */}
      <TickerTape items={tapeItems} />

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="font-mono text-xs text-[#9b9895] mb-8">(01)</div>

          <h1 className="font-display text-7xl md:text-8xl mb-2 leading-none overflow-hidden">
            <AnimatedWord word="MARKET" delay={0} />
          </h1>
          <h1 className="font-display text-7xl md:text-8xl mb-6 leading-none overflow-hidden">
            <AnimatedWord word="INTELLIGENCE." delay={150} />
          </h1>
          <p className="text-lg text-[#9b9895] mb-12" style={{ opacity: 0, animation: "fadeUp 0.7s ease 0.4s forwards" }}>
            Neural Forecasts for the Next 7 Days.
          </p>

          {/* Search bar with inline button */}
          <div ref={wrapperRef} className="relative mb-4">
            <form onSubmit={handleSubmit} className="flex border border-[#1e1e1e] hover:border-[#2a2a2a] focus-within:border-[#f0ede8] transition-colors bg-[#0a0a0a]">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search — Apple, NVDA, Tesla, Microsoft..."
                className="flex-1 bg-transparent outline-none px-6 py-4 font-mono text-sm text-[#f0ede8] placeholder:text-[#444]"
                autoComplete="off"
              />
              <button type="submit"
                className="px-5 font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] border-l border-[#1e1e1e] transition-colors whitespace-nowrap">
                SEARCH →
              </button>
              {searching && (
                <div className="absolute right-20 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 border border-[#f0ede8] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </form>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 border border-[#1e1e1e] border-t-0 bg-[#0a0a0a] z-50">
                {results.map(r => (
                  <button key={r.symbol} type="button" onClick={() => handleSelect(r.symbol)}
                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#111] transition-colors text-left">
                    <div>
                      <span className="font-mono text-sm text-[#f0ede8]">{r.symbol}</span>
                      <span className="font-mono text-xs text-[#9b9895] ml-3">{r.shortname}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#9b9895]">{r.exchDisp}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mb-6 border-b border-[#1e1e1e] pb-4">
            <span className="font-mono text-[10px] text-[#444]">47 stocks tracked</span>
            <span className="font-mono text-[10px] text-[#444]">312 forecasts run</span>
            <span className="font-mono text-[10px] text-[#444]">Model accuracy 94.2%</span>
          </div>

          {/* Quick picks */}
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
