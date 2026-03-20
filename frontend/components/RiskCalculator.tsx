"use client"
import { useState, useMemo } from "react"

const underlineInput = "w-full bg-transparent border-b border-[#2a2a2a] focus:border-[#f0ede8] outline-none text-[#f0ede8] font-mono text-sm py-2 transition-colors placeholder:text-[#333]"

export default function RiskCalculator() {
  const [portfolio, setPortfolio] = useState("")
  const [riskPct, setRiskPct]     = useState("")
  const [entry, setEntry]         = useState("")
  const [stopLoss, setStopLoss]   = useState("")
  const [target, setTarget]       = useState("")

  const pos = useMemo(() => {
    const p = parseFloat(portfolio) || 0
    const r = parseFloat(riskPct)   || 0
    const e = parseFloat(entry)     || 0
    const s = parseFloat(stopLoss)  || 0
    const riskAmt      = p * (r / 100)
    const riskPerShare = e - s
    const shares       = riskPerShare > 0 ? Math.floor(riskAmt / riskPerShare) : 0
    const posSize      = shares * e
    const maxLoss      = shares * riskPerShare
    const allocPct     = p > 0 ? (posSize / p) * 100 : 0
    return { shares, posSize, maxLoss, allocPct, riskAmt }
  }, [portfolio, riskPct, entry, stopLoss])

  const rr = useMemo(() => {
    const e = parseFloat(entry)   || 0
    const s = parseFloat(stopLoss)|| 0
    const t = parseFloat(target)  || 0
    const risk   = e - s
    const reward = t - e
    if (risk <= 0 || reward <= 0 || e <= 0) return null
    const ratio      = reward / risk
    const minWin     = Math.round((1 / (1 + ratio)) * 100)
    const riskPctMove   = ((risk / e) * 100).toFixed(1)
    const rewardPctMove = ((reward / e) * 100).toFixed(1)
    const riskW      = Math.round((risk / (risk + reward)) * 100)
    const verdict    = ratio >= 3 ? "Excellent" : ratio >= 2 ? "Good" : ratio >= 1 ? "Acceptable" : "Poor — avoid"
    const color      = ratio >= 2 ? "#00ff87" : ratio >= 1 ? "#d4a847" : "#ff4444"
    return { ratio, minWin, riskPctMove, rewardPctMove, riskW, rewardW: 100 - riskW, verdict, color }
  }, [entry, stopLoss, target])

  const riskLabel = useMemo(() => {
    const r = parseFloat(riskPct) || 0
    if (!r) return null
    if (r < 1)  return { text: "Conservative", color: "#00ff87" }
    if (r <= 3) return { text: "Standard",     color: "#00ff87" }
    if (r <= 5) return { text: "Aggressive",   color: "#d4a847" }
    return       { text: "Dangerous",          color: "#ff4444" }
  }, [riskPct])

  const allocColor = pos.allocPct <= 20 ? "#00ff87" : pos.allocPct <= 40 ? "#d4a847" : "#ff4444"
  const hasPos = pos.shares > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

      {/* LEFT — inputs */}
      <div className="space-y-8">
        <div>
          <label className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] block mb-2">Portfolio Size ($)</label>
          <input value={portfolio} onChange={e => setPortfolio(e.target.value)} className={underlineInput} type="number" placeholder="10000" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.15em]">Risk Per Trade (%)</label>
            {riskLabel && <span className="font-mono text-[10px]" style={{ color: riskLabel.color }}>{riskLabel.text}</span>}
          </div>
          <input value={riskPct} onChange={e => setRiskPct(e.target.value)} className={underlineInput} type="number" placeholder="2" step="0.5" />
        </div>

        <div>
          <label className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] block mb-2">Entry Price ($)</label>
          <input value={entry} onChange={e => setEntry(e.target.value)} className={underlineInput} type="number" placeholder="100" />
        </div>

        <div>
          <label className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] block mb-2">Stop Loss ($)</label>
          <input value={stopLoss} onChange={e => setStopLoss(e.target.value)} className={underlineInput} type="number" placeholder="95" />
        </div>

        <div>
          <label className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] block mb-2">Target Price ($)</label>
          <input value={target} onChange={e => setTarget(e.target.value)} className={underlineInput} type="number" placeholder="120" />
        </div>
      </div>

      {/* RIGHT — outputs */}
      <div className="flex flex-col justify-between">

        {/* Position sizer output */}
        <div>
          <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] mb-4">Position Size</div>
          {hasPos ? (
            <>
              <div className="font-display text-7xl text-[#f0ede8] leading-none mb-3">{pos.shares}</div>
              <div className="font-mono text-[10px] text-[#9ca3af] mb-1">shares to buy</div>
              <div className="flex gap-6 mb-5">
                <div>
                  <div className="font-mono text-sm text-[#f0ede8]">${pos.posSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="font-mono text-[10px] text-[#9ca3af]">position size</div>
                </div>
                <div>
                  <div className="font-mono text-sm text-[#ff4444]">−${pos.maxLoss.toFixed(0)}</div>
                  <div className="font-mono text-[10px] text-[#9ca3af]">max loss</div>
                </div>
              </div>
              {/* Allocation bar */}
              <div className="mb-1 flex justify-between">
                <span className="font-mono text-[10px] text-[#9ca3af]">Portfolio allocation</span>
                <span className="font-mono text-[10px]" style={{ color: allocColor }}>{pos.allocPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-0.5 bg-[#1e1e1e]">
                <div className="h-full transition-all duration-200" style={{ width: `${Math.min(pos.allocPct, 100)}%`, backgroundColor: allocColor }} />
              </div>
            </>
          ) : (
            <div className="font-display text-7xl text-[#1e1e1e] leading-none">—</div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#1e1e1e] my-8" />

        {/* R:R output */}
        <div>
          <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] mb-4">Risk / Reward</div>
          {rr ? (
            <>
              <div className="font-display text-7xl leading-none mb-1" style={{ color: rr.color }}>{rr.ratio.toFixed(1)}R</div>
              <div className="font-mono text-sm mb-5" style={{ color: rr.color }}>{rr.verdict}</div>

              {/* Split bar */}
              <div className="flex h-0.5 w-full mb-2">
                <div className="h-full bg-[#ff4444] transition-all duration-200" style={{ width: `${rr.riskW}%` }} />
                <div className="h-full bg-[#00ff87] transition-all duration-200" style={{ width: `${rr.rewardW}%` }} />
              </div>
              <div className="flex justify-between mb-5">
                <span className="font-mono text-[10px] text-[#ff4444]">Risk −{rr.riskPctMove}%</span>
                <span className="font-mono text-[10px] text-[#00ff87]">Reward +{rr.rewardPctMove}%</span>
              </div>

              <p className="font-mono text-[10px] text-[#9ca3af] leading-relaxed">
                You need to win {rr.minWin}% of trades to break even.
              </p>
            </>
          ) : (
            <div className="font-display text-7xl text-[#1e1e1e] leading-none">—</div>
          )}
        </div>

      </div>
    </div>
  )
}
