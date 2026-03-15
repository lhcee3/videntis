"use client"
import { useState, useMemo } from "react"

const inputClass = "w-full bg-[#0a0a0a] border border-[#1e1e1e] text-[#f0ede8] font-mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff87] transition-colors"

function Label({ text, color }: { text: string; color: string }) {
  return <span className="font-mono text-[10px] ml-2" style={{ color }}>{text}</span>
}

export default function RiskCalculator() {
  const [portfolio, setPortfolio] = useState("10000")
  const [riskPct, setRiskPct] = useState("2")
  const [entry, setEntry] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [target, setTarget] = useState("")

  const pos = useMemo(() => {
    const p = parseFloat(portfolio) || 0
    const r = parseFloat(riskPct) || 0
    const e = parseFloat(entry) || 0
    const s = parseFloat(stopLoss) || 0
    const riskAmt = p * (r / 100)
    const riskPerShare = e - s
    const shares = riskPerShare > 0 ? Math.floor(riskAmt / riskPerShare) : 0
    const positionSize = shares * e
    const positionPct = p > 0 ? (positionSize / p) * 100 : 0
    return { riskAmt, riskPerShare, shares, positionSize, positionPct }
  }, [portfolio, riskPct, entry, stopLoss])

  const rr = useMemo(() => {
    const e = parseFloat(entry) || 0
    const s = parseFloat(stopLoss) || 0
    const t = parseFloat(target) || 0
    const risk = e - s
    const reward = t - e
    if (risk <= 0 || reward <= 0) return null
    const ratio = reward / risk
    const minWinRate = Math.round((1 / (1 + ratio)) * 100)
    const verdict =
      ratio >= 3 ? "Excellent" :
      ratio >= 2 ? "Good" :
      ratio >= 1 ? "Acceptable" : "Poor — avoid"
    const verdictColor =
      ratio >= 3 ? "#00ff87" :
      ratio >= 2 ? "#00ff87" :
      ratio >= 1 ? "#d4a847" : "#ff4444"
    const riskWidth = Math.round((risk / (risk + reward)) * 100)
    return { ratio, minWinRate, verdict, verdictColor, riskWidth, rewardWidth: 100 - riskWidth }
  }, [entry, stopLoss, target])

  const riskLabel = useMemo(() => {
    const r = parseFloat(riskPct) || 0
    if (r <= 1) return { text: "Conservative", color: "#00ff87" }
    if (r <= 2) return { text: "Standard", color: "#9b9895" }
    if (r <= 3) return { text: "Aggressive", color: "#d4a847" }
    return { text: "Dangerous", color: "#ff4444" }
  }, [riskPct])

  const barColor = pos.positionPct <= 20 ? "#00ff87" : pos.positionPct <= 30 ? "#d4a847" : "#ff4444"

  return (
    <div className="border border-[#1e1e1e] p-6">
      <span className="font-mono text-[10px] text-[#9b9895] uppercase tracking-[0.2em] block mb-6">(05) RISK CALCULATOR</span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Position Sizer */}
        <div>
          <div className="font-mono text-[10px] text-[#9b9895] mb-4">POSITION SIZER</div>
          <div className="space-y-3">
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">PORTFOLIO SIZE ($)</label>
              <input value={portfolio} onChange={e => setPortfolio(e.target.value)} className={inputClass} type="number" placeholder="10000" />
            </div>
            <div>
              <div className="flex items-center mb-1">
                <label className="font-mono text-[10px] text-[#9b9895]">RISK PER TRADE (%)</label>
                <Label text={riskLabel.text} color={riskLabel.color} />
              </div>
              <input value={riskPct} onChange={e => setRiskPct(e.target.value)} className={inputClass} type="number" placeholder="2" step="0.5" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">ENTRY PRICE ($)</label>
              <input value={entry} onChange={e => setEntry(e.target.value)} className={inputClass} type="number" placeholder="100" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">STOP LOSS ($)</label>
              <input value={stopLoss} onChange={e => setStopLoss(e.target.value)} className={inputClass} type="number" placeholder="95" />
            </div>
          </div>

          {pos.shares > 0 && (
            <div className="mt-5 border border-[#1e1e1e] border-l-2 border-l-[#00ff87] p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#9b9895]">SHARES TO BUY</span>
                <span className="font-display text-2xl text-[#00ff87]">{pos.shares}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#9b9895]">POSITION SIZE</span>
                <span className="font-mono text-sm">${pos.positionSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#9b9895]">DOLLAR AT RISK</span>
                <span className="font-mono text-sm text-[#ff4444]">${pos.riskAmt.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#9b9895]">MAX LOSS</span>
                <span className="font-mono text-sm text-[#ff4444]">${(pos.shares * pos.riskPerShare).toFixed(0)}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[10px] text-[#9b9895]">PORTFOLIO ALLOCATION</span>
                  <span className="font-mono text-[10px]" style={{ color: barColor }}>{pos.positionPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1 bg-[#1e1e1e]">
                  <div className="h-full transition-all duration-200" style={{ width: `${Math.min(pos.positionPct, 100)}%`, backgroundColor: barColor }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* R/R Planner */}
        <div>
          <div className="font-mono text-[10px] text-[#9b9895] mb-4">RISK / REWARD PLANNER</div>
          <div className="space-y-3">
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">ENTRY ($)</label>
              <input value={entry} onChange={e => setEntry(e.target.value)} className={inputClass} type="number" placeholder="100" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">STOP LOSS ($)</label>
              <input value={stopLoss} onChange={e => setStopLoss(e.target.value)} className={inputClass} type="number" placeholder="95" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">TARGET ($)</label>
              <input value={target} onChange={e => setTarget(e.target.value)} className={inputClass} type="number" placeholder="120" />
            </div>
          </div>

          {rr && (
            <div className="mt-5 border border-[#1e1e1e] p-4 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-mono text-[10px] text-[#9b9895] mb-1">RISK : REWARD</div>
                  <div className="font-display text-5xl" style={{ color: rr.verdictColor }}>{rr.ratio.toFixed(1)}R</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm" style={{ color: rr.verdictColor }}>{rr.verdict}</div>
                  <div className="font-mono text-[10px] text-[#9b9895] mt-1">Min win rate: {rr.minWinRate}%</div>
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-[#9b9895] mb-1">RISK vs REWARD</div>
                <div className="flex h-2 w-full overflow-hidden">
                  <div className="h-full transition-all duration-200 bg-[#ff4444]" style={{ width: `${rr.riskWidth}%` }} />
                  <div className="h-full transition-all duration-200 bg-[#00ff87]" style={{ width: `${rr.rewardWidth}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[10px] text-[#ff4444]">Risk {rr.riskWidth}%</span>
                  <span className="font-mono text-[10px] text-[#00ff87]">Reward {rr.rewardWidth}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
