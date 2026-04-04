"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export default function RouteProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPath.current) {
      // Path changed — complete the bar
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 300)
      prevPath.current = pathname
    }
  }, [pathname])

  // Intercept link clicks to start the bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return
      const href = target.getAttribute("href")
      if (!href || href.startsWith("http") || href.startsWith("#") || href === pathname) return

      if (timerRef.current) clearTimeout(timerRef.current)
      setVisible(true)
      setWidth(0)
      // Animate to ~70% quickly, then stall waiting for route change
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setWidth(70))
      })
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname])

  if (!visible && width === 0) return null

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2px] bg-[#00ff87] pointer-events-none"
      style={{
        width: `${width}%`,
        transition: width === 70
          ? "width 600ms cubic-bezier(0.4,0,0.2,1)"
          : "width 200ms ease",
        opacity: visible ? 1 : 0,
      }}
    />
  )
}
