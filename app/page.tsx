"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { StatsCards } from "@/components/stats-cards"
import { OpenRateChart } from "@/components/open-rate-chart"
import { SolutionsDistributionChart } from "@/components/solutions-distribution-chart"
import { CampaignPerformanceChart } from "@/components/campaign-performance-chart"
import { ActiveCampaignsChart } from "@/components/active-campaigns-chart"
import { CampaignDetailView } from "@/components/campaign-detail-view"
import { PipelineStatus } from "@/components/pipeline-status"
import { PipelineInsights } from "@/components/pipeline-insights"
import { GlobalFilters } from "@/components/global-filters"
import { ExternalLink, RefreshCw } from "lucide-react"
import { useRefreshContext } from "@/contexts/refresh-context"
import { RawDataTable } from "@/components/raw-data-table"
import { useStats } from "@/hooks/use-stats"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { refreshAll } = useRefreshContext()
  const { lastUpdated, loading } = useStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex w-full overflow-x-hidden">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset className="overflow-x-hidden">
        <header className="border-b border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
          <div className="flex h-20 sm:h-24 items-center gap-5 sm:gap-6 px-5 sm:px-8 lg:px-10">
            <SidebarTrigger className="-ml-1 scale-110" />
            <div className="flex-1" />
            <div className="flex items-center">
              <img 
                src="https://cdn-nexlink.s3.us-east-2.amazonaws.com/Nexuses-logo-dark_7e83c816-ad05-48a5-ba7f-3b159d2910e3.png" 
                alt="Nexuses" 
                className="object-contain h-10 sm:h-12 w-auto" 
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 py-6">
            <Card className="mb-8 border-0 bg-gradient-to-br from-white to-slate-50 shadow-xl overflow-hidden">
              <CardContent className="pt-8 pb-6 px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight mb-2">
                      RSM Campaign Dashboard
                    </h1>
                    <p className="text-base text-slate-600 mt-1">Nexuses for RSM - Campaign Performance Overview</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {lastUpdated && (
                      <span className="text-sm text-slate-500 text-right">
                        Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                      </span>
                    )}
                    <button
                      onClick={refreshAll}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {activeTab === "overview" && (
              <div className="w-full max-w-full overflow-x-hidden">
                <StatsCards />
                <div className="mt-6 sm:mt-8">
                  <GlobalFilters />
                </div>
                <div className="mt-6 sm:mt-8 space-y-4 w-full max-w-full">
                  <div className="grid gap-4 md:grid-cols-2 w-full">
                    <div className="w-full min-w-0">
                      <SolutionsDistributionChart />
                    </div>
                    <div className="w-full min-w-0">
                      <CampaignPerformanceChart />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 w-full">
                    <div className="w-full min-w-0">
                      <ActiveCampaignsChart />
                    </div>
                    <div className="w-full min-w-0">
                      <OpenRateChart />
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:mt-8 w-full max-w-full">
                  <PipelineStatus />
                </div>
                {/* ESG Manual Reach table - hidden for now */}
                {false && (
                  <div className="mt-6 sm:mt-8 w-full max-w-full overflow-x-auto">
                    <RawDataTable />
                  </div>
                )}
                <div className="mt-6 sm:mt-8 w-full max-w-full">
                  <Card className="shadow-sm border-slate-200 bg-white">
                    <CardHeader className="pb-4 px-6 pt-6">
                      <CardTitle className="text-base sm:text-lg">Task Details</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <iframe
                          src="https://nexuseshiring.notion.site/ebd//2f06947358fa81398716e4b932a8bb78?v=2f06947358fa81958dd2000cdf2163b2"
                          className="w-full h-full border-0"
                          title="Task Details"
                          allow="clipboard-read; clipboard-write; fullscreen"
                          allowFullScreen
                          loading="lazy"
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "campaigns" && (
              <div className="mt-4 w-full max-w-full overflow-x-hidden">
                <CampaignDetailView />
              </div>
            )}

            {activeTab === "pipeline" && (
              <div className="mt-4 w-full max-w-full overflow-x-hidden">
                <PipelineInsights />
              </div>
            )}

            {activeTab === "content-repository" && (
              <div className="mt-4 w-full max-w-full overflow-x-hidden">
                <Card className="shadow-sm border-slate-200 bg-white">
                  <CardContent className="px-6 py-6">
                    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-slate-200 bg-white">
                      <iframe
                        src="https://docs.google.com/spreadsheets/d/15hNLbWP20_uodU4hjCUg0wDB9WnFNviifNDIpnAs2E8/preview"
                        className="w-full h-full border-0"
                        title="Content Repository"
                        allow="clipboard-read; clipboard-write; fullscreen"
                        allowFullScreen
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "content-calendar" && (
              <div className="mt-4 w-full max-w-full overflow-x-hidden">
                <Card className="shadow-sm border-slate-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
                      <span>Content Calendar</span>
                      <a
                        href="https://nexuseshiring.notion.site/ebd/21b6947358fa8025adbefcc0c8dc9e11"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Open in Notion"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </CardTitle>
                    <CardDescription className="text-xs">View and manage content schedule from Notion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <iframe
                        src="https://nexuseshiring.notion.site/ebd/21b6947358fa8025adbefcc0c8dc9e11"
                        className="w-full h-full border-0"
                        title="Notion Content Calendar"
                        allow="clipboard-read; clipboard-write; fullscreen"
                        allowFullScreen
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
