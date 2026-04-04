export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]">
      {/* Header skeleton */}
      <header className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e] px-8 py-4 flex items-center justify-between">
        <div className="h-3 w-16 bg-[#1e1e1e] animate-pulse" />
        <div className="flex items-center gap-6">
          <div className="h-3 w-12 bg-[#1e1e1e] animate-pulse" />
          <div className="h-3 w-12 bg-[#1e1e1e] animate-pulse" />
          <div className="h-3 w-20 bg-[#1e1e1e] animate-pulse" />
          <div className="h-3 w-10 bg-[#1e1e1e] animate-pulse" />
          <div className="h-5 w-20 bg-[#1e1e1e] animate-pulse" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Loading indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-4 h-4 border border-[#00ff87] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-[0.2em]">Loading forecast...</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* StockHeader skeleton */}
            <div className="border border-[#1e1e1e] p-8 animate-pulse">
              <div className="h-3 w-32 bg-[#1e1e1e] mb-4" />
              <div className="h-12 w-48 bg-[#1e1e1e] mb-3" />
              <div className="flex gap-6">
                <div className="h-4 w-24 bg-[#1e1e1e]" />
                <div className="h-4 w-24 bg-[#1e1e1e]" />
                <div className="h-4 w-24 bg-[#1e1e1e]" />
              </div>
            </div>

            {/* Chart skeleton */}
            <div className="border border-[#1e1e1e] p-6 animate-pulse">
              <div className="h-3 w-24 bg-[#1e1e1e] mb-6" />
              <div className="h-64 bg-[#111] relative overflow-hidden">
                {/* Fake chart lines */}
                <div className="absolute inset-0 flex items-end px-4 pb-4 gap-1">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-[#1e1e1e]"
                      style={{ height: `${30 + Math.sin(i * 0.4) * 20 + Math.random() * 15}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Explainer skeleton */}
            <div className="border border-[#1e1e1e] p-6 animate-pulse">
              <div className="h-3 w-28 bg-[#1e1e1e] mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#1e1e1e]" />
                <div className="h-3 w-5/6 bg-[#1e1e1e]" />
                <div className="h-3 w-4/6 bg-[#1e1e1e]" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* News skeleton */}
            <div className="border border-[#1e1e1e] p-6 animate-pulse">
              <div className="h-3 w-24 bg-[#1e1e1e] mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1e1e1e] mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 bg-[#1e1e1e] w-full" />
                      <div className="h-2.5 bg-[#1e1e1e] w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Watchlist button skeleton */}
            <div className="border border-[#1e1e1e] p-6 animate-pulse">
              <div className="h-10 bg-[#1e1e1e]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
