interface LLMExplainerProps {
  explanation: string
  volumeChangePct: number
  avgSentiment: number
}

export default function LLMExplainer({ explanation, volumeChangePct, avgSentiment }: LLMExplainerProps) {
  const sentimentLabel =
    avgSentiment > 0.05 ? "Positive" : avgSentiment < -0.05 ? "Negative" : "Neutral"
  const sentimentColor =
    avgSentiment > 0.05 ? "text-accent-green" : avgSentiment < -0.05 ? "text-accent-red" : "text-muted"

  return (
    <div className="bg-surface border border-border border-l-2 border-l-accent-green p-8">
      <div className="font-mono text-xs text-accent-gold mb-6 tracking-wider">(03) AI ANALYSIS</div>
      
      <div className="text-xs text-muted font-mono mb-4">⬤ Gemini 1.5 Flash · Google</div>
      
      <p className="font-display italic text-lg leading-relaxed mb-6">
        {explanation}
      </p>

      <div className="flex gap-4 flex-wrap">
        <div className={`px-3 py-1 border ${volumeChangePct > 0 ? "border-accent-green text-accent-green" : "border-accent-red text-accent-red"} font-mono text-xs`}>
          Volume: {volumeChangePct > 0 ? "+" : ""}{volumeChangePct.toFixed(1)}% vs avg
        </div>
        <div className={`px-3 py-1 border border-border ${sentimentColor} font-mono text-xs`}>
          Sentiment: {sentimentLabel}
        </div>
      </div>
    </div>
  )
}
