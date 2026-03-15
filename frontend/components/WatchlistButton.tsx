"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getWatchlist, addToWatchlist, removeFromWatchlist, signInWithGoogle } from "@/lib/firebase"

interface WatchlistButtonProps {
  ticker: string
}

export default function WatchlistButton({ ticker }: WatchlistButtonProps) {
  const { user, loading } = useAuth()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (user) {
      getWatchlist(user.uid)
        .then((list) => setInWatchlist(list.includes(ticker)))
        .catch(() => {})
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [user, ticker])

  const handleToggle = async () => {
    if (!user) {
      await signInWithGoogle()
      return
    }
    try {
      if (inWatchlist) {
        await removeFromWatchlist(user.uid, ticker)
        setInWatchlist(false)
      } else {
        await addToWatchlist(user.uid, ticker)
        setInWatchlist(true)
      }
    } catch {
      // silently ignore if offline
    }
  }

  if (loading || checking) return null

  if (!user) {
    return (
      <button
        onClick={handleToggle}
        className="w-full font-mono text-xs border border-[#1e1e1e] text-[#9ca3af] px-4 py-3 hover:border-[#2a2a2a] hover:text-[#f0ede8] transition-colors uppercase"
      >
        SIGN IN TO SAVE
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`w-full font-mono text-xs px-4 py-3 transition-colors uppercase ${
        inWatchlist
          ? "bg-[#f0ede8] text-[#0a0a0a] hover:bg-white"
          : "border border-[#1e1e1e] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-[#f0ede8]"
      }`}
    >
      {inWatchlist ? "✓ SAVED TO WATCHLIST" : "+ ADD TO WATCHLIST"}
    </button>
  )
}

