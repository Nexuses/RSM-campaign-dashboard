"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCards } from "@/components/stats-cards"
import { OpenRateChart } from "@/components/open-rate-chart"
import { SolutionsDistributionChart } from "@/components/solutions-distribution-chart"
import { CampaignPerformanceChart } from "@/components/campaign-performance-chart"
import { ActiveCampaignsChart } from "@/components/active-campaigns-chart"
import { RawDataTable } from "@/components/raw-data-table"
import { CampaignDetailView } from "@/components/campaign-detail-view"
import { PipelineStatus } from "@/components/pipeline-status"
import { PipelineInsights } from "@/components/pipeline-insights"
import { GlobalFilters } from "@/components/global-filters"
import { ExternalLink, RefreshCw } from "lucide-react"
import { useRefreshContext } from "@/contexts/refresh-context"
import { useStats } from "@/hooks/use-stats"

export default function DashboardPage() {
  const { refreshAll } = useRefreshContext()
  const { lastUpdated, loading } = useStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="border-b border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 py-5 sm:py-6 lg:py-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-5 lg:gap-7 w-full sm:w-auto">
              <div className="flex items-center flex-shrink-0">
                <img
                  src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/MARS/RSM%20Academy%20Logo.svg"
                  alt="RSM Logo"
                  className="object-contain w-20 h-10 sm:w-28 sm:h-14 lg:w-36 lg:h-18 xl:w-44 xl:h-22"
                />
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 self-end sm:self-center">
              <img 
                src="https://cdn-nexlink.s3.us-east-2.amazonaws.com/Nexuses-logo-dark_7e83c816-ad05-48a5-ba7f-3b159d2910e3.png" 
                alt="Nexuses" 
                className="object-contain w-16 h-8 sm:w-24 sm:h-12 lg:w-32 lg:h-16 xl:w-40 xl:h-20" 
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 py-3 sm:py-4">
        <div className="mb-6 sm:mb-8 mt-3 sm:mt-4 pt-6 sm:pt-8 pb-4 sm:pb-5 px-4 sm:px-6 bg-white rounded-lg border border-[#0db14b] shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2 sm:mb-2.5">RSM Campaign Dashboard</h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600">Nexuses for RSM - Campaign Performance Overview</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 sm:gap-2">
              {lastUpdated && (
                <span className="text-xs text-slate-500 text-right">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={refreshAll}
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
        <StatsCards />

        <div className="mt-6 sm:mt-8">
          <GlobalFilters />
        </div>

        <Tabs defaultValue="overview" className="mt-6 sm:mt-8">
          <div className="overflow-x-auto -mx-8 sm:-mx-12 lg:-mx-16 xl:-mx-20 2xl:-mx-24 px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
            <TabsList className="grid w-full grid-cols-5 bg-slate-100 shadow-sm h-12 sm:h-14 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="overview" className="text-sm sm:text-base font-medium px-3 sm:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="campaigns" className="text-sm sm:text-base font-medium px-3 sm:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Campaigns</TabsTrigger>
              <TabsTrigger value="pipeline" className="text-sm sm:text-base font-medium px-3 sm:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Pipeline</TabsTrigger>
              <TabsTrigger value="content-repository" className="text-sm sm:text-base font-medium px-2 sm:px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Content Repository</TabsTrigger>
              <TabsTrigger value="content-calendar" className="text-sm sm:text-base font-medium px-2 sm:px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Calendar</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <SolutionsDistributionChart />
              <CampaignPerformanceChart />
            </div>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <ActiveCampaignsChart />
              <OpenRateChart />
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-3 sm:mt-4">
            <CampaignDetailView />
          </TabsContent>

          <TabsContent value="pipeline" className="mt-3 sm:mt-4">
            <PipelineInsights />
          </TabsContent>

          <TabsContent value="content-repository" className="mt-3 sm:mt-4">
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Content Repository</CardTitle>
                <CardDescription className="text-xs">Campaign assets and content library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 sm:py-8 text-slate-500">
                  <p className="text-sm sm:text-base">Content repository coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content-calendar" className="mt-3 sm:mt-4">
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
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
          </TabsContent>
        </Tabs>

        <div className="mt-6 sm:mt-8">
          <PipelineStatus />
        </div>

        <div className="mt-6 sm:mt-8">
          <RawDataTable />
        </div>
      </main>
    </div>
  )
}
