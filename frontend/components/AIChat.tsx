"use client"
import { useState, useRef, useEffect } from "react"

interface Message { role: "user" | "ai"; text: string }

export default function AIChat({ ticker, context }: { ticker: string; context: any }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: `Ask me anything about ${ticker} — should you buy, what's the risk, how's the trend?` }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMsg }])
    setLoading(true)

    try {
      const systemContext = `Stock: ${ticker}
Current price: $${context.current_price}
7-day forecast: $${context.forecast_price}
RSI: ${context.technicals?.rsi} (${context.technicals?.rsi_label})
MACD: ${context.technicals?.macd_signal}
Trend: ${context.technicals?.trend}
Technical score: ${context.scores?.technical}/10
Fundamental score: ${context.scores?.fundamental}/10
Overall: ${context.scores?.verdict}
P/E: ${context.fundamentals?.pe_ratio}
Revenue growth: ${context.fundamentals?.revenue_growth}%
Sector: ${context.fundamentals?.sector}`

      const prompt = `You are a financial analyst assistant for StockSense. Here is the current data for ${ticker}:

${systemContext}

User question: ${userMsg}

Answer concisely in 2-3 sentences. Be specific, use the data above. No bullet points.`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      )
      const data = await res.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sorry, I couldn't process that."
      setMessages(prev => [...prev, { role: "ai", text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Something went wrong. Try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-[#1e1e1e] p-6">
      <span className="font-mono text-[10px] text-[#9b9895] uppercase tracking-[0.2em] block mb-4">(06) AI ASSISTANT · {ticker}</span>

      <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 font-mono text-xs leading-relaxed ${
              m.role === "user"
                ? "bg-[#1e1e1e] text-[#f0ede8]"
                : "border border-[#1e1e1e] border-l-2 border-l-[#d4a847] text-[#f0ede8]"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="border border-[#1e1e1e] px-4 py-3 font-mono text-xs text-[#9b9895]">
              <span className="animate-pulse">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder={`Ask about ${ticker}...`}
          className="flex-1 bg-[#0a0a0a] border border-[#1e1e1e] text-[#f0ede8] font-mono text-xs px-4 py-3 focus:outline-none focus:border-[#00ff87] transition-colors"
          autoComplete="off"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="border border-[#1e1e1e] font-mono text-xs px-4 py-3 hover:border-[#00ff87] hover:text-[#00ff87] transition-colors disabled:opacity-30"
        >
          ASK →
        </button>
      </div>
    </div>
  )
}
