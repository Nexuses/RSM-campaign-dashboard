"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  FileText,
  Image,
  FileStack,
} from "lucide-react"

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    value: "overview",
  },
  {
    title: "Campaigns",
    icon: FileText,
    value: "campaigns",
  },
  {
    title: "Pipeline",
    icon: FileStack,
    value: "pipeline",
  },
  {
    title: "Content Repository",
    icon: Image,
    value: "content-repository",
  },
  {
    title: "Calendar",
    icon: FileStack,
    value: "content-calendar",
  },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <Sidebar
      className="group/sidebar border-0 bg-white transition-all duration-300 [&_[data-slot=sidebar-container]]:border-0 [&_[data-sidebar=sidebar]]:border-0 [&_[data-sidebar=sidebar]]:rounded-r-xl [&_[data-sidebar=sidebar]]:shadow-lg [&_[data-sidebar=sidebar]]:m-2 [&_[data-sidebar=sidebar]]:h-[calc(100vh-1rem)] [&_[data-slot=sidebar-container]]:!left-0 [&_[data-slot=sidebar-container]]:!translate-x-0 [&_[data-slot=sidebar-container]]:!w-[260px] [&_[data-slot=sidebar-container]]:[&:not([data-collapsible=offcanvas])]:border-0"
    >
      {/* Header with Logo */}
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <img
              src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/MARS/RSM%20Academy%20Logo.svg"
              alt="RSM Logo"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">RSM Dashboard</span>
            <span className="text-xs text-slate-600">Campaign Management</span>
          </div>
        </div>
      </SidebarHeader>
      
      {/* Navigation Menu */}
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.value
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onTabChange(item.value)}
                      className={`h-10 w-full justify-start rounded-full px-4 transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? '' : 'opacity-70'}`} />
                      <span className="flex-1 text-left text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
