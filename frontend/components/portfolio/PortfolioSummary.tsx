export default function PortfolioSummary({ totals }: { totals: any }) {
  const isGain = totals.total_pnl >= 0
  const isForecastGain = totals.forecast_gain >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div className="border border-[#1e1e1e] p-6">
        <span className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em] block mb-2">
          TOTAL VALUE
        </span>
        <span className="font-display text-4xl block">
          ${totals.current_value.toLocaleString()}
        </span>
        <span className="font-mono text-[11px] text-[#6b6966] mt-1 block">
          Cost basis ${totals.cost_basis.toLocaleString()}
        </span>
      </div>

      <div className="border border-[#1e1e1e] p-6" style={{ borderLeftColor: isGain ? "#00ff87" : "#ff4444", borderLeftWidth: 2 }}>
        <span className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em] block mb-2">
          TOTAL P&L
        </span>
        <span className="font-display text-4xl block" style={{ color: isGain ? "#00ff87" : "#ff4444" }}>
          {isGain ? "+" : ""}${Math.abs(totals.total_pnl).toLocaleString()}
        </span>
        <span className="font-mono text-[11px] mt-1 block" style={{ color: isGain ? "#00ff87" : "#ff4444" }}>
          {totals.total_pnl_pct > 0 ? "+" : ""}{totals.total_pnl_pct.toFixed(2)}% all time
        </span>
      </div>

      <div className="border border-[#1e1e1e] p-6" style={{ borderLeftColor: isForecastGain ? "#00ff87" : "#ff4444", borderLeftWidth: 2 }}>
        <span className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em] block mb-2">
          7-DAY FORECAST
        </span>
        <span className="font-display text-4xl block" style={{ color: isForecastGain ? "#00ff87" : "#ff4444" }}>
          {isForecastGain ? "+" : ""}${Math.abs(totals.forecast_gain).toLocaleString()}
        </span>
        <span className="font-mono text-[11px] mt-1 block" style={{ color: isForecastGain ? "#00ff87" : "#ff4444" }}>
          {totals.forecast_gain_pct > 0 ? "+" : ""}{totals.forecast_gain_pct.toFixed(2)}% this week
        </span>
      </div>
    </div>
  )
}

