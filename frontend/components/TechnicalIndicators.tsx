interface Props { technicals: any; currentPrice: number }

function ScoreBar({ value }: { value: number }) {
  const color = value >= 7 ? "#00ff87" : value >= 5 ? "#d4a847" : "#ff4444"
  return (
    <div className="w-full h-1 bg-[#1e1e1e] mt-1">
      <div className="h-full transition-all" style={{ width: `${value * 10}%`, backgroundColor: color }} />
    </div>
  )
}

export default function TechnicalIndicators({ technicals: t, currentPrice }: Props) {
  const rsiColor = t.rsi > 70 ? "#ff4444" : t.rsi < 30 ? "#00ff87" : "#f0ede8"
  const macdColor = t.macd_signal === "Bullish" ? "#00ff87" : "#ff4444"
  const trendColor = t.trend.includes("Bullish") ? "#00ff87" : "#ff4444"

  return (
    <div className="border border-[#1e1e1e] p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em]">(02) TECHNICAL INDICATORS</span>
        <div className="text-right">
          <div className="font-mono text-[10px] text-[#9ca3af]">TECHNICAL SCORE</div>
          <div className="font-display text-2xl" style={{ color: t.technical_score >= 7 ? "#00ff87" : t.technical_score >= 5 ? "#d4a847" : "#ff4444" }}>
            {t.technical_score}/10
          </div>
          <ScoreBar value={t.technical_score} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-[#1e1e1e] p-4">
          <div className="font-mono text-[10px] text-[#9ca3af] mb-1">RSI (14)</div>
          <div className="font-display text-2xl" style={{ color: rsiColor }}>{t.rsi}</div>
          <div className="font-mono text-[10px] mt-1" style={{ color: rsiColor }}>{t.rsi_label}</div>
        </div>
        <div className="border border-[#1e1e1e] p-4">
          <div className="font-mono text-[10px] text-[#9ca3af] mb-1">MACD</div>
          <div className="font-display text-2xl" style={{ color: macdColor }}>{t.macd > 0 ? "+" : ""}{t.macd}</div>
          <div className="font-mono text-[10px] mt-1" style={{ color: macdColor }}>{t.macd_signal}</div>
        </div>
        <div className="border border-[#1e1e1e] p-4">
          <div className="font-mono text-[10px] text-[#9ca3af] mb-1">TREND</div>
          <div className="font-mono text-sm mt-2" style={{ color: trendColor }}>{t.trend}</div>
        </div>
        <div className="border border-[#1e1e1e] p-4">
          <div className="font-mono text-[10px] text-[#9ca3af] mb-1">VOLUME</div>
          <div className="font-display text-2xl">{t.volume_ratio}x</div>
          <div className="font-mono text-[10px] text-[#9ca3af] mt-1">vs 20-day avg</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="font-mono text-[10px] text-[#9ca3af] mb-3">MOVING AVERAGES</div>
          {[["MA 20", t.ma20], ["MA 50", t.ma50], ["MA 200", t.ma200]].map(([label, val]) => val && (
            <div key={label as string} className="flex justify-between items-center py-1.5 border-b border-[#1e1e1e]">
              <span className="font-mono text-xs text-[#9ca3af]">{label}</span>
              <span className="font-mono text-xs" style={{ color: currentPrice > (val as number) ? "#00ff87" : "#ff4444" }}>
                ${(val as number).toFixed(2)} {currentPrice > (val as number) ? "↑" : "↓"}
              </span>
            </div>
          ))}
        </div>
        <div>
          <div className="font-mono text-[10px] text-[#9ca3af] mb-3">BOLLINGER BANDS</div>
          {[["Upper", t.bb_upper, "#ff4444"], ["Mid", t.bb_mid, "#9ca3af"], ["Lower", t.bb_lower, "#00ff87"]].map(([label, val, color]) => (
            <div key={label as string} className="flex justify-between items-center py-1.5 border-b border-[#1e1e1e]">
              <span className="font-mono text-xs text-[#9ca3af]">{label}</span>
              <span className="font-mono text-xs" style={{ color: color as string }}>${(val as number).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-1.5 border-b border-[#1e1e1e]">
            <span className="font-mono text-xs text-[#9ca3af]">Support</span>
            <span className="font-mono text-xs text-[#00ff87]">${t.support}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="font-mono text-xs text-[#9ca3af]">Resistance</span>
            <span className="font-mono text-xs text-[#ff4444]">${t.resistance}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

