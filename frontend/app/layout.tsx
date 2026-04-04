import { Playfair_Display, Space_Mono, DM_Sans } from "next/font/google"
import RouteProgress from "@/components/RouteProgress"
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" })
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Videntis — AI Market Intelligence",
  description: "Neural forecasts and deep analysis for any stock.",
}

export const viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a0a'/><rect x='5' y='14' width='4' height='10' fill='%23ff4444'/><line x1='7' y1='11' x2='7' y2='14' stroke='%23ff4444' stroke-width='1.5'/><line x1='7' y1='24' x2='7' y2='27' stroke='%23ff4444' stroke-width='1.5'/><rect x='14' y='10' width='4' height='12' fill='%2300ff87'/><line x1='16' y1='6' x2='16' y2='10' stroke='%2300ff87' stroke-width='1.5'/><line x1='16' y1='22' x2='16' y2='26' stroke='%2300ff87' stroke-width='1.5'/><rect x='23' y='7' width='4' height='14' fill='%2300ff87'/><line x1='25' y1='4' x2='25' y2='7' stroke='%2300ff87' stroke-width='1.5'/><line x1='25' y1='21' x2='25' y2='25' stroke='%2300ff87' stroke-width='1.5'/></svg>" />
      </head>
      <body className="bg-bg text-primary font-sans antialiased">
        <RouteProgress />
        {children}
      </body>
    </html>
  )
}

