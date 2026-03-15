"use client"
import { useEffect, useState } from "react"

const FACTS = [
  "Warren Buffett made 99% of his wealth after age 50.",
  "The S&P 500 has returned ~10% annually on average since 1957.",
  "Prophet uses additive models to decompose trend, seasonality, and noise.",
  "NVDA is up over 20,000% in the last 10 years.",
  "The average holding period for a stock in 1960 was 8 years. Today it's 5 months.",
  "Compound interest is what Einstein allegedly called the 8th wonder of the world.",
  "Index funds outperform ~90% of actively managed funds over 15 years.",
  "The term 'bull market' may come from the way a bull thrusts its horns upward.",
  "Black Monday (1987) saw the Dow drop 22.6% in a single day.",
  "Apple became the first $1 trillion company in 2018. Then $3 trillion in 2023.",
  "Short selling was blamed for the 1929 crash — it wasn't.",
  "The NYSE was founded under a buttonwood tree in 1792.",
  "Fear and greed drive more market moves than fundamentals in the short term.",
  "Dollar-cost averaging beats lump-sum investing in ~33% of historical scenarios.",
  "Running Prophet on your holdings right now. Hang tight.",
]

export default function AnalyzingLoader({ holdingCount }: { holdingCount: number }) {
  const [factIndex, setFactIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [fade, setFade] = useState(true)

  const estimatedSeconds = holdingCount * 10

  useEffect(() => {
    // Rotate facts every 4 seconds with fade
    const factTimer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setFactIndex(i => (i + 1) % FACTS.length)
        setFade(true)
      }, 400)
    }, 4000)
    return () => clearInterval(factTimer)
  }, [])

  useEffect(() => {
    // Fake progress bar that fills over estimated time
    const step = 100 / (estimatedSeconds * 10)
    const progressTimer = setInterval(() => {
      setProgress(p => Math.min(p + step, 95)) // cap at 95 until done
    }, 100)
    return () => clearInterval(progressTimer)
  }, [estimatedSeconds])

  return (
    <div className="border border-[#1e1e1e] p-8 mt-6">
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em]">
          RUNNING ANALYSIS
        </span>
        <span className="font-mono text-[10px] text-[#6b6966]">
          ~{estimatedSeconds}s for {holdingCount} holding{holdingCount > 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-[#1e1e1e] mb-8 relative overflow-hidden">
        <div
          className="h-full bg-[#00ff87] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex gap-8 mb-8">
        {["Fetching prices", "Training models", "Generating forecast", "AI summary"].map((step, i) => {
          const stepProgress = (i + 1) * 25
          const active = progress >= stepProgress - 25
          const done = progress >= stepProgress
          return (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                done ? "bg-[#00ff87]" : active ? "bg-[#d4a847] animate-pulse" : "bg-[#1e1e1e]"
              }`} />
              <span className={`font-mono text-[10px] uppercase tracking-widest transition-colors duration-500 ${
                done ? "text-[#00ff87]" : active ? "text-[#d4a847]" : "text-[#333]"
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Rotating fact */}
      <div className="border-l-2 border-[#1e1e1e] pl-4">
        <div className="font-mono text-[10px] text-[#6b6966] uppercase tracking-widest mb-2">
          DID YOU KNOW
        </div>
        <p
          className="font-display italic text-[#f0ede8] text-base leading-relaxed transition-opacity duration-400"
          style={{ opacity: fade ? 1 : 0 }}
        >
          {FACTS[factIndex]}
        </p>
      </div>
    </div>
  )
}

