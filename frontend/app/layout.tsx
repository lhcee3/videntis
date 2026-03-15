import { Playfair_Display, Space_Mono, DM_Sans } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" })
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Videntis — AI Market Intelligence",
  description: "Neural forecasts and deep analysis for any stock.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

