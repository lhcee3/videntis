from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import feedparser

analyzer = SentimentIntensityAnalyzer()

def get_news_sentiment(ticker: str) -> tuple[list[dict], float]:
    feed_url = (
        f"https://feeds.finance.yahoo.com/rss/2.0/headline"
        f"?s={ticker}&region=US&lang=en-US"
    )
    feed = feedparser.parse(feed_url)
    
    results = []
    for entry in feed.entries[:10]:
        title = entry.get("title", "")
        scores = analyzer.polarity_scores(title)
        compound = scores["compound"]
        label = (
            "positive" if compound >= 0.05
            else "negative" if compound <= -0.05
            else "neutral"
        )
        results.append({
            "headline": title,
            "url": entry.get("link", ""),
            "published": entry.get("published", ""),
            "sentiment": label,
            "score": round(compound, 3),
        })
    
    avg_score = (
        sum(r["score"] for r in results) / len(results)
        if results else 0.0
    )
    return results, avg_score
