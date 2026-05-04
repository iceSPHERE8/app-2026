"use client"

import { useState } from "react"
import { AppSidebar } from "@/app/admin/components/ui/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/app/admin/components/ui/sidebar"
import { SiteHeader } from "@/app/admin/components/ui/site-header"

// 视图组件导入
import AnalyticsView from "../views/analytics"
import HomeSettingsView from "../views/home-settings"
import WorkManager from "../views/work-manager" // 确保创建了此通用管理组件

export default function Dashboard() {
  // 默认显示数据分析页
  const [activeTab, setActiveTab] = useState("analytics")

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AnalyticsView />;

      // 匹配作品管理下的子菜单 ID
      case "all-works":
        return (
          <WorkManager 
            type="all-works" 
            title="作品列表 (All Works)" 
          />
        );

      case "tool-lab":
        return (
          <WorkManager 
            type="tool-lab" 
            title="实验库 (Tool Lab)" 
          />
        );

      case "home-settings":
        return <HomeSettingsView />;

      default:
        return <AnalyticsView />;
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {/* 这里的 renderContent 会根据 Sidebar 传回的 id 自动切换 */}
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}