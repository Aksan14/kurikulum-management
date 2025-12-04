"use client"

import { ReactNode, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { User } from "@/types"
import { cn } from "@/lib/utils"
import { mockUsers } from "@/lib/mock-data"

export interface DashboardLayoutProps {
  children: ReactNode
  user?: User
  unreadNotifications?: number
}

export function DashboardLayout({ children, user, unreadNotifications = 0 }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Default to kaprodi user if not provided
  const currentUser = user || mockUsers[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={currentUser.role as 'kaprodi' | 'dosen'}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}
      >
        <Header user={currentUser} unreadNotifications={unreadNotifications} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
