"use client"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, CartesianGrid
} from "recharts"

interface ForecastChartProps {
  historical: Array<{ Date: string; Close: number }>
  forecast: Array<{ ds: string; yhat: number; yhat_lower: number; yhat_upper: number; is_forecast: boolean }>
  confidenceBands?: { upper: number[]; lower: number[] }
  forecastPrices?: number[]
  model?: string
}

export default function ForecastChart({ historical, forecast, confidenceBands, forecastPrices, model }: ForecastChartProps) {
  const historicalData = historical.slice(-60).map((d) => ({
    date: d.Date,
    price: d.Close,
    isForecast: false,
  }))

  const forecastOnly = forecast.filter((d) => d.is_forecast)

  const forecastData = forecastOnly.map((d, i) => ({
    date: d.ds,
    price: forecastPrices ? forecastPrices[i] ?? d.yhat : d.yhat,
    lower: confidenceBands ? confidenceBands.lower[i] ?? d.yhat_lower : d.yhat_lower,
    upper: confidenceBands ? confidenceBands.upper[i] ?? d.yhat_upper : d.yhat_upper,
    isForecast: true,
  }))

  const allData = [...historicalData, ...forecastData]
  const splitIndex = historicalData.length - 1

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-3">
        <div className="font-mono text-[10px] text-[#9ca3af] mb-1">{d.date}</div>
        <div className="font-display text-2xl">${d.price?.toFixed(2)}</div>
        {d.isForecast && d.upper && (
          <div className="font-mono text-[10px] text-[#9ca3af] mt-1">
            {d.lower?.toFixed(2)} – {d.upper?.toFixed(2)}
          </div>
        )}
        {d.isForecast && <div className="font-mono text-[10px] text-[#d4a847] mt-1">forecast</div>}
      </div>
    )
  }

  const modelLabel = model === "lstm+prophet" ? "LSTM + PROPHET" : model === "lstm" ? "LSTM" : "PROPHET"
  const modelColor = model === "lstm+prophet" ? "#00ff87" : model === "lstm" ? "#d4a847" : "#9ca3af"

  return (
    <div className="bg-[#0a0a0a] border border-[#1e1e1e] p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="font-mono text-[10px] text-[#9ca3af] tracking-wider">(02) FORECAST</div>
        {model && (
          <div className="font-mono text-[10px] px-2 py-1 border" style={{ borderColor: modelColor, color: modelColor }}>
            {modelLabel}
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={allData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff87" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff87" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
          <XAxis
            dataKey="date"
            stroke="#6b6966"
            style={{ fontFamily: "Space Mono", fontSize: 10 }}
            tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          />
          <YAxis
            stroke="#6b6966"
            style={{ fontFamily: "Space Mono", fontSize: 10 }}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={allData[splitIndex]?.date}
            stroke="#d4a847"
            strokeDasharray="3 3"
            label={{ value: "FORECAST →", position: "top", fill: "#d4a847", fontFamily: "Space Mono", fontSize: 10 }}
          />
          {/* Confidence band */}
          <Area type="monotone" dataKey="upper" stroke="none" fill="url(#colorBand)" />
          <Area type="monotone" dataKey="lower" stroke="none" fill="#0a0a0a" />
          {/* Main price line */}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#00ff87"
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
