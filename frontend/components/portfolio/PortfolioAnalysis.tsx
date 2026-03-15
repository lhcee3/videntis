export default function PortfolioAnalysis({ summary }: { summary: string }) {
  return (
    <div className="border border-[#1e1e1e] border-l-2 border-l-[#d4a847] p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] text-[#6b6966] uppercase tracking-[0.2em]">
          (03) PORTFOLIO HEALTH · AI SUMMARY
        </span>
        <span className="font-mono text-[10px] text-[#6b6966] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4a847] inline-block" />
          Gemini 2.0 Flash
        </span>
      </div>
      <p className="font-display italic text-[#f0ede8] text-lg leading-relaxed">
        {summary}
      </p>
    </div>
  )
}
