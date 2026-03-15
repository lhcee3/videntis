"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getWatchlist, removeFromWatchlist, signInWithGoogle } from "@/lib/firebase"
import Link from "next/link"

export default function WatchlistPage() {
  const { user, loading } = useAuth()
  const [tickers, setTickers] = useState<string[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (user) {
      getWatchlist(user.uid).then(list => { setTickers(list); setFetching(false) })
    } else { setFetching(false) }
  }, [user])

  async function handleRemove(ticker: string) {
    if (!user) return
    await removeFromWatchlist(user.uid, ticker)
    setTickers(prev => prev.filter(t => t !== ticker))
  }

  if (loading || fetching) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 border border-[#00ff87] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-4xl mb-4 text-[#f0ede8]">Sign in required</div>
        <button onClick={() => signInWithGoogle()}
          className="font-mono text-sm border border-[#1e1e1e] text-[#9ca3af] px-6 py-3 hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors uppercase">
          SIGN IN WITH GOOGLE →
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]">
      <header className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-8 py-4 flex items-center justify-between z-10">
        <Link href="/" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">← VIDENTIS</Link>
        <div className="font-mono text-sm">WATCHLIST</div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em] mb-2">(01) WATCHLIST</div>
        <h1 className="font-display text-5xl mb-8">Saved Tickers</h1>

        {tickers.length === 0 ? (
          <div className="border border-[#1e1e1e] p-12 text-center">
            <div className="font-mono text-[#9ca3af] mb-4">No tickers saved yet.</div>
            <Link href="/" className="font-mono text-xs border border-[#1e1e1e] text-[#9ca3af] px-6 py-3 hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors uppercase">
              Search stocks →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickers.map(ticker => (
              <div key={ticker} className="border border-[#1e1e1e] p-6 hover:border-[#2a2a2a] hover:bg-[#0d0d0d] transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-2xl font-bold">{ticker}</div>
                  <button onClick={() => handleRemove(ticker)}
                    className="font-mono text-[10px] text-[#9ca3af] opacity-0 group-hover:opacity-100 hover:text-[#ff4444] transition-all">
                    ✕ REMOVE
                  </button>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/${ticker}`}
                    className="flex-1 text-center font-mono text-xs py-2.5 bg-[#f0ede8] text-[#0a0a0a] hover:bg-white transition-colors uppercase">
                    FORECAST →
                  </Link>
                  <Link href={`/analyze/${ticker}`}
                    className="flex-1 text-center font-mono text-xs py-2.5 border border-[#1e1e1e] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors uppercase">
                    ANALYZE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

