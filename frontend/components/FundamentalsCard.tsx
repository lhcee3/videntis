interface Props { fundamentals: any }

function Row({ label, value, good, bad }: { label: string; value: string | null; good?: boolean; bad?: boolean }) {
  const color = good ? "#00ff87" : bad ? "#ff4444" : "#f0ede8"
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1e1e1e]">
      <span className="font-mono text-xs text-[#9b9895]">{label}</span>
      <span className="font-mono text-xs" style={{ color }}>{value ?? "—"}</span>
    </div>
  )
}

export default function FundamentalsCard({ fundamentals: f }: Props) {
  const scoreColor = f.fundamental_score >= 7 ? "#00ff87" : f.fundamental_score >= 5 ? "#d4a847" : "#ff4444"

  return (
    <div className="border border-[#1e1e1e] p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-[10px] text-[#9b9895] uppercase tracking-[0.2em]">(03) FUNDAMENTALS</span>
        <div className="text-right">
          <div className="font-mono text-[10px] text-[#9b9895]">FUNDAMENTAL SCORE</div>
          <div className="font-display text-2xl" style={{ color: scoreColor }}>{f.fundamental_score}/10</div>
          <div className="w-24 h-1 bg-[#1e1e1e] mt-1 ml-auto">
            <div className="h-full" style={{ width: `${f.fundamental_score * 10}%`, backgroundColor: scoreColor }} />
          </div>
        </div>
      </div>

      {f.description && (
        <p className="font-mono text-xs text-[#9b9895] mb-4 leading-relaxed border-l-2 border-[#1e1e1e] pl-3">
          {f.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-mono text-[10px] text-[#9b9895] mb-2">VALUATION</div>
          <Row label="P/E Ratio" value={f.pe_ratio ? `${f.pe_ratio}x` : null} good={f.pe_ratio && f.pe_ratio < 20} bad={f.pe_ratio && f.pe_ratio > 40} />
          <Row label="PEG Ratio" value={f.peg_ratio ? `${f.peg_ratio}x` : null} good={f.peg_ratio && f.peg_ratio < 1} bad={f.peg_ratio && f.peg_ratio > 2} />
          <Row label="Price/Book" value={f.price_to_book ? `${f.price_to_book}x` : null} />
          <Row label="EPS" value={f.eps ? `$${f.eps}` : null} good={f.eps > 0} bad={f.eps < 0} />
          <Row label="Beta" value={f.beta ? `${f.beta}` : null} />
          <Row label="Dividend Yield" value={f.dividend_yield ? `${f.dividend_yield}%` : null} />
        </div>
        <div>
          <div className="font-mono text-[10px] text-[#9b9895] mb-2">GROWTH & HEALTH</div>
          <Row label="Revenue Growth" value={f.revenue_growth != null ? `${f.revenue_growth > 0 ? "+" : ""}${f.revenue_growth}%` : null} good={f.revenue_growth > 10} bad={f.revenue_growth < 0} />
          <Row label="Earnings Growth" value={f.earnings_growth != null ? `${f.earnings_growth > 0 ? "+" : ""}${f.earnings_growth}%` : null} good={f.earnings_growth > 10} bad={f.earnings_growth < 0} />
          <Row label="ROE" value={f.roe != null ? `${f.roe}%` : null} good={f.roe > 15} bad={f.roe < 0} />
          <Row label="Profit Margin" value={f.profit_margin != null ? `${f.profit_margin}%` : null} good={f.profit_margin > 10} bad={f.profit_margin < 0} />
          <Row label="Debt/Equity" value={f.debt_to_equity != null ? `${f.debt_to_equity}%` : null} good={f.debt_to_equity < 50} bad={f.debt_to_equity > 200} />
          {f.sector && <Row label="Sector" value={f.sector} />}
        </div>
      </div>
    </div>
  )
}
