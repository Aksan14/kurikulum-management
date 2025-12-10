"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  MessageSquare,
  Calendar,
  Check,
  Trash2,
  Loader2,
  BellOff,
  RefreshCw
} from "lucide-react"
import { notificationService, type Notification } from "@/lib/api/notifications"
import { authService } from "@/lib/api/auth"
import { formatDate } from "@/lib/utils"
import { useNotifications } from "@/hooks"

// Map API notification type to display type
type DisplayType = 'success' | 'warning' | 'info' | 'error'

const mapNotificationType = (type: Notification['type']): DisplayType => {
  switch (type) {
    case 'approval':
      return 'success'
    case 'rejection':
      return 'warning'
    case 'deadline':
      return 'error'
    case 'assignment':
    case 'document':
    case 'info':
    case 'system':
    default:
      return 'info'
  }
}

export default function DosenNotificationsPage() {
  const router = useRouter()
  const { refreshUnreadCount } = useNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const response = await notificationService.getAll({ sort_order: 'desc' })
      
      // Handle various response formats
      let notifData: Notification[] = []
      if (response.data) {
        // If response.data is paginated (has nested data array)
        if (Array.isArray(response.data.data)) {
          notifData = response.data.data
        } 
        // If response.data is directly an array
        else if (Array.isArray(response.data)) {
          notifData = response.data
        }
      }
      
      setNotifications(notifData)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const markAsRead = async (id: string) => {
    try {
      setActionLoading(id)
      await notificationService.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      )
      refreshUnreadCount()
    } catch (err) {
      console.error('Error marking as read:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      setActionLoading('all')
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })))
      refreshUnreadCount()
    } catch (err) {
      console.error('Error marking all as read:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      setActionLoading(`delete-${id}`)
      await notificationService.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getIcon = (type: Notification['type']) => {
    const displayType = mapNotificationType(type)
    switch (displayType) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = (type: Notification['type'], isRead: boolean) => {
    if (isRead) return 'bg-white'
    const displayType = mapNotificationType(type)
    switch (displayType) {
      case 'success':
        return 'bg-green-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'error':
        return 'bg-red-50'
      default:
        return 'bg-blue-50'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat notifikasi...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium text-slate-900">Gagal Memuat Data</p>
          <p className="text-slate-600">{error}</p>
          <Button onClick={fetchData}>Coba Lagi</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
            <p className="text-slate-600 mt-1">
              {unreadCount > 0
                ? `Anda memiliki ${unreadCount} notifikasi belum dibaca`
                : 'Semua notifikasi sudah dibaca'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead} disabled={actionLoading === 'all'}>
                {actionLoading === 'all' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
                  <p className="text-sm text-slate-600">Total Notifikasi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                  <p className="text-sm text-slate-600">Belum Dibaca</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{notifications.length - unreadCount}</p>
                  <p className="text-sm text-slate-600">Sudah Dibaca</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Notifikasi</CardTitle>
            <CardDescription>Notifikasi terbaru tentang RPS dan aktivitas lainnya</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BellOff className="h-12 w-12 text-slate-600 mb-3" />
                <p className="text-lg font-medium text-slate-900">Tidak Ada Notifikasi</p>
                <p className="text-slate-600">Anda tidak memiliki notifikasi saat ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${getBgColor(notification.type, notification.is_read)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{notification.title}</p>
                        {!notification.is_read && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Baru</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(notification.created_at)}
                        </span>
                        {notification.action_url && (
                          <a
                            href={notification.action_url}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Lihat Detail
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                          disabled={actionLoading === notification.id}
                        >
                          {actionLoading === notification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        disabled={actionLoading === `delete-${notification.id}`}
                      >
                        {actionLoading === `delete-${notification.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
