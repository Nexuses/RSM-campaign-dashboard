import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { FilterProvider } from "@/contexts/filter-context"
import { RefreshProvider } from "@/contexts/refresh-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RSM Dashboard",
  description: "RSM Campaign Dashboard is an internal web-based dashboard designed to monitor and manage marketing campaigns in real time. It provides RSMs with clear insights into campaign performance, lead status, and key metrics through an intuitive and data-driven interface.",
  generator: "v0.app",
  icons: {
    icon: "/rsm-logo.png",
    apple: "/rsm-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SidebarProvider>
          <FilterProvider>
            <RefreshProvider>
              {children}
            </RefreshProvider>
          </FilterProvider>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  )
}
