"use client"
import { useState } from "react"
import { Holding } from "@/lib/firebase"

export default function AddHoldingForm({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [ticker, setTicker] = useState("")
  const [shares, setShares] = useState("")
  const [buyPrice, setBuyPrice] = useState("")

  function handleSubmit() {
    if (!ticker || !shares || !buyPrice) return
    onAdd({
      ticker: ticker.toUpperCase(),
      shares: parseFloat(shares),
      buyPrice: parseFloat(buyPrice),
      addedAt: new Date().toISOString().split("T")[0],
    })
    setTicker("")
    setShares("")
    setBuyPrice("")
  }

  return (
    <div className="border border-[#1e1e1e] p-6 mb-8">
      <span className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em] block mb-4">ADD HOLDING</span>
      <div className="flex gap-3 flex-wrap items-center">
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-28 bg-[#111] border border-[#1e1e1e] text-[#f0ede8] font-mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff87] transition-colors"
          placeholder="NVDA"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <input
          value={shares}
          onChange={e => setShares(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-32 bg-[#111] border border-[#1e1e1e] text-[#f0ede8] font-mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff87] transition-colors"
          placeholder="Shares"
          type="number"
          min="0"
          step="0.01"
        />
        <input
          value={buyPrice}
          onChange={e => setBuyPrice(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-36 bg-[#111] border border-[#1e1e1e] text-[#f0ede8] font-mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff87] transition-colors"
          placeholder="Buy price $"
          type="number"
          min="0"
          step="0.01"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="border border-[#1e1e1e] font-mono text-sm px-6 py-3 hover:border-[#00ff87] hover:text-[#00ff87] transition-colors"
        >
          ADD +
        </button>
      </div>
    </div>
  )
}
