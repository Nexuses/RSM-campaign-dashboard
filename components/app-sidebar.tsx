"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Megaphone,
  Workflow,
  FileText,
  Calendar,
} from "lucide-react"

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    value: "overview",
  },
  {
    title: "Campaigns",
    icon: Megaphone,
    value: "campaigns",
  },
  {
    title: "Pipeline",
    icon: Workflow,
    value: "pipeline",
  },
  {
    title: "Content Repository",
    icon: FileText,
    value: "content-repository",
  },
  {
    title: "Calendar",
    icon: Calendar,
    value: "content-calendar",
  },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <img
            src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/MARS/RSM%20Academy%20Logo.svg"
            alt="RSM Logo"
            className="object-contain h-8 w-auto"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      isActive={activeTab === item.value}
                      onClick={() => onTabChange(item.value)}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
