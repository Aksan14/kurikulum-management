"use client"

import { ReactNode, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { User } from "@/types"
import { cn } from "@/lib/utils"
import { authService } from "@/lib/api"
import { useNotifications } from "@/hooks"

export interface DashboardLayoutProps {
  children: ReactNode
  user?: User
  unreadNotifications?: number
}

export function DashboardLayout({ children, user, unreadNotifications }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(user || null)
  const [loading, setLoading] = useState(!user)

  // Use notifications hook if unreadNotifications prop is not provided
  const { unreadCount } = useNotifications()
  const finalUnreadCount = unreadNotifications !== undefined ? unreadNotifications : unreadCount
  
  console.log('📊 [DashboardLayout] unreadNotifications prop:', unreadNotifications)
  console.log('📊 [DashboardLayout] unreadCount from hook:', unreadCount)
  console.log('📊 [DashboardLayout] finalUnreadCount:', finalUnreadCount)
  
  useEffect(() => {
    if (!user) {
      // Get user from localStorage/session
      const storedUser = authService.getCurrentUser()
      if (storedUser) {
        setCurrentUser({
          id: storedUser.id,
          nama: storedUser.nama,
          email: storedUser.email,
          role: storedUser.role,
          avatar: storedUser.avatar_url || undefined
        })
      } else {
        // Redirect to login if no user found
        router.push('/login')
        return
      }
      setLoading(false)
    }
  }, [user, router])

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

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
        <Header user={currentUser} unreadNotifications={finalUnreadCount} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
