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
  BellOff
} from "lucide-react"
import { rpsService } from "@/lib/api/rps"
import { authService } from "@/lib/api/auth"
import type { RPS } from "@/lib/api/rps"
import { formatDate } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error'
  timestamp: string
  read: boolean
  link?: string
}

export default function DosenNotificationsPage() {
  const router = useRouter()
  const [rpsList, setRpsList] = useState<RPS[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchData = useCallback(async () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const response = await rpsService.getMy()
      const rpsData = response.data?.data || []
      setRpsList(rpsData)
      
      // Generate notifications from RPS status
      const generatedNotifications: Notification[] = []
      
      rpsData.forEach((rps: RPS) => {
        if (rps.status === 'approved') {
          generatedNotifications.push({
            id: `approved-${rps.id}`,
            title: 'RPS Disetujui',
            message: `RPS ${rps.mata_kuliah_nama || `MK-${rps.mata_kuliah_id}`} telah disetujui oleh Kaprodi.`,
            type: 'success',
            timestamp: rps.updated_at || new Date().toISOString(),
            read: false,
            link: `/dosen/rps/${rps.id}`
          })
        } else if (rps.status === 'rejected') {
          generatedNotifications.push({
            id: `rejected-${rps.id}`,
            title: 'RPS Perlu Revisi',
            message: `RPS ${rps.mata_kuliah_nama || `MK-${rps.mata_kuliah_id}`} perlu direvisi. ${rps.review_notes || ''}`,
            type: 'warning',
            timestamp: rps.updated_at || new Date().toISOString(),
            read: false,
            link: `/dosen/rps/${rps.id}`
          })
        } else if (rps.status === 'submitted') {
          generatedNotifications.push({
            id: `submitted-${rps.id}`,
            title: 'RPS Sedang Direview',
            message: `RPS ${rps.mata_kuliah_nama || `MK-${rps.mata_kuliah_id}`} sedang dalam proses review oleh Kaprodi.`,
            type: 'info',
            timestamp: rps.updated_at || new Date().toISOString(),
            read: true,
            link: `/dosen/rps/${rps.id}`
          })
        }
      })
      
      // Sort by timestamp (newest first)
      generatedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setNotifications(generatedNotifications)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: Notification['type']) => {
    switch (type) {
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

  const getBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-white'
    switch (type) {
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
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Tandai Semua Dibaca
            </Button>
          )}
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
                <BellOff className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-lg font-medium text-slate-900">Tidak Ada Notifikasi</p>
                <p className="text-slate-600">Anda tidak memiliki notifikasi saat ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${getBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{notification.title}</p>
                        {!notification.read && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Baru</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(notification.timestamp)}
                        </span>
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Lihat Detail
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
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
