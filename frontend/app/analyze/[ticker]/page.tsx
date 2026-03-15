"use client"
import { useEffect, useState } from "react"
import { fetchAnalysis } from "@/lib/api"
import TechnicalIndicators from "@/components/TechnicalIndicators"
import FundamentalsCard from "@/components/FundamentalsCard"
import RiskCalculator from "@/components/RiskCalculator"
import AIChat from "@/components/AIChat"
import Link from "next/link"

function Loader({ ticker }: { ticker: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border border-[#00ff87] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="font-mono text-xs text-[#9ca3af]">Analyzing {ticker}...</div>
        <div className="font-mono text-[10px] text-[#333] mt-2">Fetching technicals, fundamentals & AI insights</div>
      </div>
    </div>
  )
}

export default function AnalyzePage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalysis(ticker)
      .then(setData)
      .catch(e => setError(e.message))
  }, [ticker])

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-[#ff4444] mb-4">{error}</div>
        <Link href="/" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8]">← Back</Link>
      </div>
    </div>
  )

  if (!data) return <Loader ticker={ticker} />

  const verdictColor = data.scores.verdict === "BUY" ? "#00ff87" : data.scores.verdict === "SELL" ? "#ff4444" : "#d4a847"

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]">
      <header className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-8 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">← VIDENTIS</Link>
          <Link href={`/dashboard/${ticker}`} className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">FORECAST</Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="font-mono text-sm">{ticker}</div>
          <div className="font-display text-xl">${data.current_price}</div>
          <div className="font-mono text-sm px-3 py-1 border" style={{ borderColor: verdictColor, color: verdictColor }}>
            {data.scores.verdict}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        <div className="border border-[#1e1e1e] p-8">
          <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em] mb-2">(01) DEEP ANALYSIS · {data.info.name}</div>
          <div className="flex items-end gap-8 mb-6">
            <div>
              <div className="font-display text-6xl">${data.current_price}</div>
              <div className="font-mono text-sm text-[#9ca3af] mt-1">→ ${data.forecast_price} (7-day forecast)</div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="font-mono text-[10px] text-[#9ca3af]">TECHNICAL</div>
                <div className="font-display text-3xl" style={{ color: data.scores.technical >= 7 ? "#00ff87" : data.scores.technical >= 5 ? "#d4a847" : "#ff4444" }}>{data.scores.technical}</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[10px] text-[#9ca3af]">FUNDAMENTAL</div>
                <div className="font-display text-3xl" style={{ color: data.scores.fundamental >= 7 ? "#00ff87" : data.scores.fundamental >= 5 ? "#d4a847" : "#ff4444" }}>{data.scores.fundamental}</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[10px] text-[#9ca3af]">OVERALL</div>
                <div className="font-display text-3xl" style={{ color: verdictColor }}>{data.scores.overall}</div>
              </div>
            </div>
          </div>
          <p className="font-display italic text-lg leading-relaxed border-l-2 border-[#d4a847] pl-4">{data.ai_summary}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TechnicalIndicators technicals={data.technicals} currentPrice={data.current_price} />
            <FundamentalsCard fundamentals={data.fundamentals} />
            <RiskCalculator />
          </div>
          <div className="space-y-6">
            <AIChat ticker={ticker} context={data} />
            <div className="border border-[#1e1e1e] p-6">
              <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em] block mb-4">(04) NEWS SENTIMENT</span>
              <div className="space-y-3">
                {data.news.map((n: any, i: number) => (
                  <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                    className="block hover:bg-[#111] transition-colors p-2 -mx-2 border-b border-[#1e1e1e] last:border-0">
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: n.sentiment === "positive" ? "#00ff87" : n.sentiment === "negative" ? "#ff4444" : "#9ca3af" }} />
                      <div className="font-mono text-xs leading-relaxed text-[#f0ede8]">{n.headline}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
