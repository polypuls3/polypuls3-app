import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "PolyPulse - Decentralized Polls & Surveys",
  description: "A decentralized platform for creating and participating in polls and surveys on Polygon",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark" storageKey="polypuls3-theme">
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
            <main>{children}</main>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
