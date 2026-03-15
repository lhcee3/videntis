interface NewsItem {
  headline: string
  url: string
  published: string
  sentiment: string
  score: number
}

interface NewsSentimentProps {
  news: NewsItem[]
  avgSentiment: number
}

export default function NewsSentiment({ news, avgSentiment }: NewsSentimentProps) {
  const sentimentLabel =
    avgSentiment > 0.05 ? "POSITIVE" : avgSentiment < -0.05 ? "NEGATIVE" : "NEUTRAL"
  const sentimentColor =
    avgSentiment > 0.05 ? "text-accent-green" : avgSentiment < -0.05 ? "text-accent-red" : "text-muted"

  // Position indicator on scale from -1 to 1
  const position = ((avgSentiment + 1) / 2) * 100

  return (
    <div className="bg-surface border border-border p-8">
      <div className="font-mono text-xs text-muted mb-6 tracking-wider">(04) MARKET PULSE</div>

      <div className="mb-6">
        <div className="relative h-2 bg-gradient-to-r from-accent-red via-muted to-accent-green rounded-full mb-2">
          <div
            className="absolute w-3 h-3 bg-primary rounded-full -top-0.5 transform -translate-x-1/2"
            style={{ left: `${position}%` }}
          />
        </div>
        <div className={`font-mono text-xs ${sentimentColor}`}>
          Overall sentiment: {sentimentLabel}
        </div>
      </div>

      <div className="space-y-4">
        {news.map((item, idx) => {
          const dotColor =
            item.sentiment === "positive"
              ? "bg-accent-green"
              : item.sentiment === "negative"
              ? "bg-accent-red"
              : "bg-muted"

          return (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:bg-surface/50 transition-colors p-3 -mx-3 border-b border-border last:border-0"
            >
              <div className="flex gap-3">
                <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
                <div className="flex-1">
                  <div className="text-sm leading-relaxed line-clamp-2 mb-1">
                    {item.headline}
                  </div>
                  <div className="font-mono text-xs text-muted">
                    {new Date(item.published).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

