"use client"
import { useState } from "react"

export default function RiskCalculator() {
  const [portfolio, setPortfolio] = useState("10000")
  const [riskPct, setRiskPct] = useState("2")
  const [entry, setEntry] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [target, setTarget] = useState("")

  const portfolioVal = parseFloat(portfolio) || 0
  const riskAmount = portfolioVal * (parseFloat(riskPct) / 100)
  const entryVal = parseFloat(entry) || 0
  const stopVal = parseFloat(stopLoss) || 0
  const targetVal = parseFloat(target) || 0
  const riskPerShare = entryVal - stopVal
  const maxShares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0
  const reward = targetVal - entryVal
  const rrRatio = riskPerShare > 0 && reward > 0 ? (reward / riskPerShare).toFixed(1) : null
  const isGoodTrade = rrRatio && parseFloat(rrRatio) >= 2

  const inputClass = "w-full bg-[#0a0a0a] border border-[#1e1e1e] text-[#f0ede8] font-mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff87] transition-colors"

  return (
    <div className="border border-[#1e1e1e] p-6">
      <span className="font-mono text-[10px] text-[#9b9895] uppercase tracking-[0.2em] block mb-6">(05) RISK CALCULATOR</span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[10px] text-[#9b9895] mb-4">POSITION SIZER</div>
          <div className="space-y-3">
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">PORTFOLIO SIZE ($)</label>
              <input value={portfolio} onChange={e => setPortfolio(e.target.value)} className={inputClass} type="number" placeholder="10000" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#9b9895] block mb-1">RISK PER TRADE (%)</label>
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

          {maxShares > 0 && (
            <div className="mt-4 border border-[#1e1e1e] p-4 border-l-2 border-l-[#00ff87]">
              <div className="font-mono text-[10px] text-[#9b9895] mb-2">POSITION SIZE</div>
              <div className="font-display text-3xl text-[#00ff87]">{maxShares} shares</div>
              <div className="font-mono text-xs text-[#9b9895] mt-1">Max risk: ${riskAmount.toFixed(0)} ({riskPct}% of portfolio)</div>
              <div className="font-mono text-xs text-[#9b9895]">Risk per share: ${riskPerShare.toFixed(2)}</div>
            </div>
          )}
        </div>

        <div>
          <div className="font-mono text-[10px] text-[#9b9895] mb-4">RISK/REWARD PLANNER</div>
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

          {rrRatio && (
            <div className={`mt-4 border p-4 border-l-2 ${isGoodTrade ? "border-[#1e1e1e] border-l-[#00ff87]" : "border-[#1e1e1e] border-l-[#ff4444]"}`}>
              <div className="font-mono text-[10px] text-[#9b9895] mb-2">RISK : REWARD</div>
              <div className="font-display text-3xl" style={{ color: isGoodTrade ? "#00ff87" : "#ff4444" }}>1 : {rrRatio}</div>
              <div className="font-mono text-xs mt-2" style={{ color: isGoodTrade ? "#00ff87" : "#ff4444" }}>
                {isGoodTrade ? "✓ Good trade setup" : "✗ Poor risk/reward — skip or adjust"}
              </div>
              {maxShares > 0 && targetVal > 0 && (
                <div className="font-mono text-xs text-[#9b9895] mt-1">
                  Potential profit: ${(maxShares * reward).toFixed(0)} | Max loss: ${(maxShares * riskPerShare).toFixed(0)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
