"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getPortfolio, saveHolding, removeHolding, signInWithGoogle, Holding } from "@/lib/firebase"
import { analyzePortfolio } from "@/lib/api"
import AddHoldingForm from "@/components/portfolio/AddHoldingForm"
import HoldingsTable from "@/components/portfolio/HoldingsTable"
import PortfolioSummary from "@/components/portfolio/PortfolioSummary"
import PortfolioAnalysis from "@/components/portfolio/PortfolioAnalysis"
import AnalyzingLoader from "@/components/portfolio/AnalyzingLoader"
import Link from "next/link"

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)

  useEffect(() => {
    if (user) getPortfolio(user.uid).then(setHoldings).catch(() => {})
  }, [user])

  async function handleAddHolding(holding: Holding) {
    if (!user) return
    try {
      await saveHolding(user.uid, holding)
      const updated = await getPortfolio(user.uid)
      setHoldings(updated)
    } catch (e) {
      console.error("saveHolding failed", e)
    }
  }

  async function handleRemove(ticker: string) {
    if (!user) return
    await removeHolding(user.uid, ticker)
    setHoldings(prev => prev.filter(h => h.ticker !== ticker))
  }

  async function handleAnalyze() {
    if (!holdings.length) return
    setAnalyzing(true)
    setError("")
    try {
      const result = await analyzePortfolio(holdings.map(h => ({ ticker: h.ticker, shares: h.shares, buy_price: h.buyPrice })))
      setAnalysisData(result)
      setLastAnalyzed(new Date())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  if (authLoading) return <div className="min-h-screen bg-[#0a0a0a]" />

  if (!user) return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-[#6b6966] mb-4">Sign in to track your portfolio</p>
        <button onClick={() => signInWithGoogle()} className="font-mono text-sm border border-[#1e1e1e] text-[#9ca3af] px-6 py-3 hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors uppercase">
          SIGN IN WITH GOOGLE →
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">← VIDENTIS</Link>
          <div className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em] mt-4">(01) PORTFOLIO</div>
          <h1 className="font-display text-5xl mt-1">My Holdings</h1>
        </div>
        <Link href="/watchlist" className="font-mono text-xs text-[#6b6966] hover:text-[#f0ede8] transition-colors uppercase tracking-widest">Watchlist →</Link>
      </div>

      <AddHoldingForm onAdd={handleAddHolding} />

      {holdings.length > 0 && (
        <>
          <HoldingsTable holdings={holdings} analysisData={analysisData} onRemove={handleRemove} />
          <div className="flex items-center gap-6 mt-6">
            <button onClick={handleAnalyze} disabled={analyzing}
              className="bg-[#f0ede8] text-[#0a0a0a] font-mono text-sm px-8 py-4 uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {analyzing ? "ANALYZING..." : "RUN FORECAST ANALYSIS →"}
            </button>
            {lastAnalyzed && <span className="font-mono text-[10px] text-[#6b6966]">Last analyzed: {lastAnalyzed.toLocaleTimeString()}</span>}
          </div>
          {error && <p className="font-mono text-[#ff4444] text-sm mt-3">{error}</p>}
        </>
      )}

      {analyzing && <AnalyzingLoader holdingCount={holdings.length} />}

      {holdings.length === 0 && (
        <div className="border border-[#1e1e1e] p-12 text-center mt-4">
          <p className="font-mono text-[#6b6966] text-sm">No holdings yet. Add your first position above.</p>
        </div>
      )}

      {analysisData && (
        <>
          <PortfolioSummary totals={analysisData.totals} />
          <PortfolioAnalysis summary={analysisData.summary} />
        </>
      )}
    </main>
  )
}

