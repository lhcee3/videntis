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
        .catch(() => {}) // silently ignore offline/network errors
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
        className="px-4 py-2 border border-border hover:border-border-hover transition-colors font-mono text-xs"
      >
        Sign in to save
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 border transition-colors font-mono text-xs ${
        inWatchlist
          ? "border-accent-green text-accent-green"
          : "border-border hover:border-border-hover"
      }`}
    >
      {inWatchlist ? "✓ Saved" : "＋ Add to Watchlist"}
    </button>
  )
}
