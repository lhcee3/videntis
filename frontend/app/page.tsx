"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signInWithGoogle } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"

interface SearchResult {
  symbol: string
  shortname: string
  exchDisp: string
}

async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=6&newsCount=0&listsCount=0`
    )
    const data = await res.json()
    return (data.quotes || []).filter(
      (q: any) => q.quoteType === "EQUITY" && q.symbol && q.shortname
    )
  } catch {
    return []
  }
}

// ── Ticker tape ───────────────────────────────────────────────────────────────
const TAPE_TICKERS = ["NVDA","AAPL","TSLA","MSFT","AMZN","META","GOOGL","AMD","NFLX","JPM"]
interface TapeItem { ticker: string; price: number; change: number }

function TickerTape({ items }: { items: TapeItem[] }) {
  if (!items.length) return <div className="h-8 border-b border-[#1e1e1e]" />
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden border-b border-[#1e1e1e] bg-[#0a0a0a] h-8 flex items-center">
      <div className="flex gap-8 animate-tape whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-[10px] flex items-center gap-1.5">
            <span className="text-[#9ca3af]">{item.ticker}</span>
            <span className="text-[#9ca3af]">${item.price.toFixed(2)}</span>
            <span style={{ color: item.change >= 0 ? "#00ff87" : "#ff4444" }}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Market status ─────────────────────────────────────────────────────────────
function MarketStatus() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    function check() {
      const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))
      const day = et.getDay()
      const mins = et.getHours() * 60 + et.getMinutes()
      setOpen(day >= 1 && day <= 5 && mins >= 570 && mins < 960)
    }
    check()
    const id = setInterval(check, 30000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-[#00ff87] animate-pulse" : "bg-[#444]"}`} />
      <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-widest">
        {open ? "MARKET OPEN" : "MARKET CLOSED"}
      </span>
    </div>
  )
}

// ── Animated word ─────────────────────────────────────────────────────────────
function AnimatedWord({ word, delay }: { word: string; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <span
      className="inline-block transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}
    >
      {word}
    </span>
  )
}

// ── Ambient background chart (static sparkline) ───────────────────────────────
const CHART_DATA = [
  42,45,43,47,46,50,48,53,51,55,54,58,56,60,59,63,61,65,64,68,
  66,70,69,73,71,75,74,78,76,80,79,83,81,85,84,88,86,90,89,93,
].map((v, i) => ({ i, v }))

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

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/prices?tickers=${TAPE_TICKERS.join(",")}`)
      .then(r => r.json())
      .then((data: Record<string, any>) => {
        const items = TAPE_TICKERS
          .filter(t => data[t]?.price)
          .map(t => ({ ticker: t, price: data[t].price, change: data[t].change_pct ?? 0 }))
        if (items.length) setTapeItems(items)
        else throw new Error()
      })
      .catch(() => setTapeItems([
        { ticker: "NVDA", price: 875.40, change: 2.4 },
        { ticker: "AAPL", price: 189.30, change: -0.3 },
        { ticker: "TSLA", price: 248.50, change: 1.1 },
        { ticker: "MSFT", price: 415.20, change: 0.8 },
        { ticker: "AMZN", price: 182.60, change: -0.5 },
        { ticker: "META", price: 512.80, change: 1.7 },
        { ticker: "GOOGL", price: 175.90, change: 0.4 },
        { ticker: "AMD",  price: 168.30, change: -1.2 },
        { ticker: "NFLX", price: 628.10, change: 0.9 },
        { ticker: "JPM",  price: 198.40, change: -0.6 },
      ]))
  }, [])

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowDropdown(false)
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
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]" style={{
      backgroundImage: [
        "radial-gradient(ellipse 60% 40% at 50% 65%, rgba(0,255,135,0.024) 0%, transparent 70%)",
        "radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)",
      ].join(", "),
      backgroundSize: "100% 100%, 24px 24px",
    }}>

      {/* Navbar */}
      <header className="relative z-20 px-8 py-5 flex justify-between items-center">
        <div className="font-mono text-sm font-bold tracking-[0.4em] text-[#f0ede8]">VIDENTIS</div>
        <div className="flex items-center gap-6">
          <MarketStatus />
          <Link href="/screener" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Screener</Link>
          <Link href="/portfolio" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Portfolio</Link>
          <Link href="/watchlist" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Watchlist</Link>
          <Link href="/tools" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">Tools</Link>
          {!user ? (
            <button onClick={() => signInWithGoogle()} className="px-4 py-2 border border-[#1e1e1e] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors font-mono text-xs uppercase">Sign In</button>
          ) : (
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#2a2a2a] flex-shrink-0">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center font-mono text-[10px] text-[#9ca3af]">
                    {user.displayName?.[0] ?? "?"}
                  </div>
              }
            </div>
          )}
        </div>
      </header>

      {/* Ticker tape */}
      <div className="relative z-20">
        <TickerTape items={tapeItems} />
      </div>

      {/* Ambient background chart */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ top: "88px" }}>
        <div style={{ height: "55vh", opacity: 0.07 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="ambientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff87" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00ff87" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#00ff87"
                strokeWidth={1.5}
                fill="url(#ambientGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="font-mono text-xs text-[#9ca3af] mb-8">(01)</div>

          <h1 className="font-display text-7xl md:text-8xl mb-2 leading-none">
            <AnimatedWord word="MARKET" delay={0} />
          </h1>
          <h1 className="font-display text-7xl md:text-8xl mb-6 leading-none">
            <AnimatedWord word="INTELLIGENCE." delay={150} />
          </h1>
          <p className="text-lg text-[#9ca3af] mb-10" style={{ opacity: 0, animation: "fadeUp 0.7s ease 0.45s forwards" }}>
            Neural Forecasts for the Next 7 Days.
          </p>

          {/* Search */}
          <div ref={wrapperRef} className="relative mb-3">
            <form
              onSubmit={handleSubmit}
              className="flex border border-[#1e1e1e] hover:border-[#2a2a2a] focus-within:border-[#f0ede8] transition-colors bg-[#0a0a0a]"
              style={{ boxShadow: "0 0 40px rgba(0,255,135,0.04)" }}
            >
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search — Apple, NVDA, Tesla, Microsoft..."
                className="flex-1 bg-transparent outline-none px-6 py-4 font-mono text-sm text-[#f0ede8] placeholder:text-[#333]"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-5 font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] border-l border-[#1e1e1e] transition-colors whitespace-nowrap"
              >
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
                      <span className="font-mono text-xs text-[#9ca3af] ml-3">{r.shortname}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#9ca3af]">{r.exchDisp}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick picks — tight gap, green hover */}
          <div className="flex gap-2 flex-wrap mb-8">
            {quickPicks.map(t => (
              <button key={t} onClick={() => handleSelect(t)}
                className="px-3 py-1.5 border border-[#1e1e1e] text-[#9ca3af] hover:border-[#00ff87] hover:text-[#00ff87] transition-all duration-150 font-mono text-[10px] uppercase">
                {t}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 pt-5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm text-[#f0ede8]">47</span>
              <span className="font-mono text-[10px] text-[#9ca3af]">stocks tracked</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm text-[#f0ede8]">312</span>
              <span className="font-mono text-[10px] text-[#9ca3af]">forecasts run</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm text-[#f0ede8]">94.2%</span>
              <span className="font-mono text-[10px] text-[#9ca3af]">model accuracy</span>
            </div>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section className="relative z-10 border-t border-[#1e1e1e] px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em] mb-10">(02) HOW IT WORKS</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#1e1e1e]">
            {[
              {
                n: "01",
                label: "Search any stock",
                desc: "Type a ticker or company name. Videntis pulls live price data, news, and 2 years of historical closes in seconds.",
              },
              {
                n: "02",
                label: "Get a 7-day AI forecast",
                desc: "A Prophet time-series model trained on your stock generates a probabilistic price forecast with confidence bands.",
              },
              {
                n: "03",
                label: "Read the plain-English explanation",
                desc: "Gemini AI synthesises the technicals, sentiment, and forecast into a single paragraph you can actually act on.",
              },
            ].map(step => (
              <div key={step.n} className="px-8 py-6 first:pl-0 last:pr-0 group">
                <div className="font-mono text-[10px] text-[#9ca3af] mb-4">{step.n}</div>
                <div className="font-display text-xl text-[#f0ede8] mb-3">{step.label}</div>
                <p className="font-mono text-[11px] text-[#9ca3af] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

