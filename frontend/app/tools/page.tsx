"use client"
import RiskCalculator from "@/components/RiskCalculator"
import Link from "next/link"

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]">
      <header className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-8 py-4 flex items-center justify-between z-10">
        <Link href="/" className="font-mono text-xs text-[#9ca3af] hover:text-[#f0ede8] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#f0ede8] after:transition-all hover:after:w-full">← VIDENTIS</Link>
        <div className="font-mono text-sm">TOOLS</div>
      </header>
      <main className="max-w-5xl mx-auto px-8 py-8">
        <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em] mb-2">(01) TRADING TOOLS</div>
        <h1 className="font-display text-5xl mb-8">Risk Management</h1>
        <RiskCalculator />
      </main>
    </div>
  )
}

