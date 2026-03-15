export default function HoldingsTable({ holdings, analysisData, onRemove }: {
  holdings: any[]
  analysisData: any
  onRemove: (ticker: string) => void
}) {
  const enriched = holdings.map(h => {
    const analysis = analysisData?.holdings?.find((a: any) => a.ticker === h.ticker)
    return { ...h, ...analysis }
  })

  return (
    <div className="border border-[#1e1e1e] mt-6">
      <span className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em] block p-4 border-b border-[#1e1e1e]">
        (02) HOLDINGS
      </span>
      <div className="grid grid-cols-7 gap-4 px-4 py-2 border-b border-[#1e1e1e]">
        {["Ticker", "Shares", "Buy Price", "Current", "Value", "P&L", "7D Forecast"].map(h => (
          <span key={h} className="font-mono text-[10px] text-[#6b6966] uppercase tracking-widest">
            {h}
          </span>
        ))}
      </div>
      {enriched.map(h => (
        <div
          key={h.ticker}
          className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-[#1e1e1e] hover:bg-[#111] transition-colors group"
        >
          <span className="font-mono text-sm font-bold">{h.ticker}</span>
          <span className="font-mono text-sm text-[#6b6966]">{h.shares}</span>
          <span className="font-mono text-sm text-[#6b6966]">${h.buyPrice?.toFixed(2)}</span>
          <span className="font-mono text-sm">${h.current_price?.toFixed(2) ?? "—"}</span>
          <span className="font-mono text-sm">${h.current_value?.toFixed(0) ?? "—"}</span>
          <span className="font-mono text-sm" style={{ color: (h.pnl_pct ?? 0) >= 0 ? "#00ff87" : "#ff4444" }}>
            {h.pnl_pct != null ? `${h.pnl_pct > 0 ? "+" : ""}${h.pnl_pct.toFixed(1)}%` : "—"}
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm" style={{ color: (h.forecast_change_pct ?? 0) >= 0 ? "#00ff87" : "#ff4444" }}>
              {h.forecast_change_pct != null
                ? `${h.forecast_change_pct > 0 ? "+" : ""}${h.forecast_change_pct.toFixed(1)}%`
                : "—"}
            </span>
            <button
              onClick={() => onRemove(h.ticker)}
              className="font-mono text-[10px] text-[#6b6966] opacity-0 group-hover:opacity-100 hover:text-[#ff4444] transition-all ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

