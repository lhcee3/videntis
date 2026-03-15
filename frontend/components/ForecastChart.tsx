"use client"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, CartesianGrid
} from "recharts"

interface ForecastChartProps {
  historical: Array<{ Date: string; Close: number }>
  forecast: Array<{ ds: string; yhat: number; yhat_lower: number; yhat_upper: number; is_forecast: boolean }>
}

export default function ForecastChart({ historical, forecast }: ForecastChartProps) {
  // Merge data
  const historicalData = historical.slice(-60).map((d) => ({
    date: d.Date,
    price: d.Close,
    isForecast: false,
  }))

  const forecastData = forecast
    .filter((d) => d.is_forecast)
    .map((d) => ({
      date: d.ds,
      price: d.yhat,
      lower: d.yhat_lower,
      upper: d.yhat_upper,
      isForecast: true,
    }))

  const allData = [...historicalData, ...forecastData]
  const splitIndex = historicalData.length - 1

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const data = payload[0].payload
    return (
      <div className="bg-surface border border-border-hover p-3">
        <div className="font-mono text-xs text-muted mb-1">{data.date}</div>
        <div className="font-display text-2xl">${data.price?.toFixed(2)}</div>
        {data.isForecast && <div className="text-xs text-accent-gold mt-1">(predicted)</div>}
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border p-8">
      <div className="font-mono text-xs text-muted mb-6 tracking-wider">(02) FORECAST</div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={allData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff87" stopOpacity={0.2} />
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

