interface StockHeaderProps {
  name: string
  ticker: string
  currentPrice: number
  forecastPrice: number
  changePct: number
  marketCap?: number
  volume?: number
}

export default function StockHeader({
  name,
  ticker,
  currentPrice,
  forecastPrice,
  changePct,
  marketCap,
  volume,
}: StockHeaderProps) {
  const forecastChange = ((forecastPrice - currentPrice) / currentPrice) * 100
  const isPositive = forecastChange > 0

  return (
    <div className="bg-surface border border-border p-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-muted mb-1">{name}</div>
          <div className="font-mono text-sm text-muted">{ticker}</div>
        </div>
        <div
          className={`px-3 py-1 rounded-full font-mono text-xs ${
            isPositive ? "bg-accent-green/20 text-accent-green" : "bg-accent-red/20 text-accent-red"
          }`}
        >
          {isPositive ? "+" : ""}{forecastChange.toFixed(1)}% in 7 days
        </div>
      </div>

      <div className="mb-2">
        <div className="font-display text-5xl mb-2">${currentPrice.toFixed(2)}</div>
        <div className="text-muted text-sm">
          → ${forecastPrice.toFixed(2)} ({isPositive ? "+" : ""}{forecastChange.toFixed(1)}%)
        </div>
      </div>

      {(marketCap || volume) && (
        <div className="flex gap-6 text-sm text-muted mt-4 pt-4 border-t border-border">
          {marketCap && (
            <div>
              <span className="font-mono text-xs">MARKET CAP</span>
              <div className="mt-1">${(marketCap / 1e9).toFixed(2)}B</div>
            </div>
          )}
          {volume && (
            <div>
              <span className="font-mono text-xs">VOLUME</span>
              <div className="mt-1">{(volume / 1e6).toFixed(2)}M</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

