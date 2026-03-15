import { fetchForecast } from "@/lib/api"
import StockHeader from "@/components/StockHeader"
import ForecastChart from "@/components/ForecastChart"
import LLMExplainer from "@/components/LLMExplainer"
import NewsSentiment from "@/components/NewsSentiment"
import WatchlistButton from "@/components/WatchlistButton"
import Link from "next/link"

export default async function DashboardPage({ params }: { params: { ticker: string } }) {
  let data
  try {
    data = await fetchForecast(params.ticker)
  } catch (error: any) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-4xl mb-4">Ticker not found</div>
          <div className="text-muted mb-6">Please check the ticker symbol and try again.</div>
          <Link href="/" className="px-6 py-3 border border-[#1e1e1e] text-[#9b9895] hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors font-mono text-xs uppercase inline-block">
            ← BACK TO SEARCH
          </Link>
        </div>
      </div>
    )
  }

  const forecastPrice = data.forecast[data.forecast.length - 1].yhat
  const currentPrice = data.info.price || data.historical[data.historical.length - 1].Close

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 bg-bg/95 backdrop-blur-sm border-b border-border p-6 flex justify-between items-center z-10">
        <Link href="/" className="font-mono text-sm tracking-wider hover:text-[#f0ede8] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">
          STOCKSENSE
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/portfolio" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">
            Portfolio
          </Link>
          <Link href="/watchlist" className="font-mono text-xs text-[#9b9895] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">
            Watchlist
          </Link>
          <Link href={`/analyze/${data.ticker}`} className="font-mono text-xs text-[#d4a847] hover:text-[#f0ede8] uppercase tracking-widest transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">
            Deep Analysis →
          </Link>
          <div className="font-mono text-sm">{data.ticker}</div>
          <div className="font-display text-xl">${currentPrice.toFixed(2)}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StockHeader
              name={data.info.name}
              ticker={data.ticker}
              currentPrice={currentPrice}
              forecastPrice={forecastPrice}
              changePct={data.info.change_pct}
              marketCap={data.info.market_cap}
              volume={data.info.volume}
            />
            
            <ForecastChart
              historical={data.historical}
              forecast={data.forecast}
            />
            
            <LLMExplainer
              explanation={data.explanation}
              volumeChangePct={data.volume_change_pct}
              avgSentiment={data.avg_sentiment}
            />
          </div>

          <div className="space-y-6">
            <NewsSentiment
              news={data.news}
              avgSentiment={data.avg_sentiment}
            />
            
            <WatchlistButton ticker={data.ticker} />
          </div>
        </div>
      </main>
    </div>
  )
}
