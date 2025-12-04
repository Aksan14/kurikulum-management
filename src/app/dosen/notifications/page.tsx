"use client"

import React, { useState } from "react"
import { 
  Bell, 
  Check, 
  CheckCheck,
  FileText, 
  Users, 
  AlertCircle,
  Clock,
  Trash2,
  Search,
  X
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/utils"
import type { Notification } from "@/types"

const dosenNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "dosen-1",
    title: "Penugasan CPL Baru",
    message: "Anda ditugaskan untuk mengelola CPL-02 pada mata kuliah Basis Data semester ini.",
    type: "cpl_assignment",
    isRead: false,
    createdAt: "2024-01-10T09:00:00Z"
  },
  {
    id: "notif-2",
    userId: "dosen-1",
    title: "RPS Disetujui",
    message: "RPS Basis Data telah disetujui oleh Kaprodi. Silakan unduh dokumen final.",
    type: "rps_approval",
    isRead: false,
    createdAt: "2024-01-09T14:30:00Z",
    relatedId: "rps-1"
  },
  {
    id: "notif-3",
    userId: "dosen-1",
    title: "Perlu Revisi RPS",
    message: "RPS Pemrograman Web perlu direvisi. Catatan: Mohon tambahkan detail rubrik penilaian.",
    type: "rps_revision",
    isRead: false,
    createdAt: "2024-01-08T11:15:00Z",
    relatedId: "rps-2"
  },
  {
    id: "notif-4",
    userId: "dosen-1",
    title: "Deadline RPS Mendekati",
    message: "Pengumpulan RPS Data Mining akan berakhir dalam 3 hari. Pastikan RPS sudah lengkap.",
    type: "deadline",
    isRead: true,
    createdAt: "2024-01-07T08:00:00Z"
  },
  {
    id: "notif-5",
    userId: "dosen-1",
    title: "Mata Kuliah Baru Ditugaskan",
    message: "Anda ditugaskan untuk mengampu mata kuliah Machine Learning semester depan.",
    type: "cpl_assignment",
    isRead: true,
    createdAt: "2024-01-06T10:20:00Z"
  },
  {
    id: "notif-6",
    userId: "dosen-1",
    title: "RPS Diajukan",
    message: "RPS Basis Data berhasil diajukan untuk direview Kaprodi.",
    type: "rps_submission",
    isRead: true,
    createdAt: "2024-01-05T15:45:00Z"
  },
  {
    id: "notif-7",
    userId: "dosen-1",
    title: "Reminder: Mapping CPL-CPMK",
    message: "Jangan lupa untuk melengkapi mapping CPL-CPMK pada RPS yang sudah disetujui.",
    type: "deadline",
    isRead: true,
    createdAt: "2024-01-04T09:00:00Z"
  }
]

export default function DosenNotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(dosenNotifications)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "unread") return matchesSearch && !notif.isRead
    return matchesSearch && notif.type === activeTab
  })

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
    setSelectedNotifications(selectedNotifications.filter(sid => sid !== id))
  }

  const deleteSelected = () => {
    setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)))
    setSelectedNotifications([])
  }

  const toggleSelect = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(sid => sid !== id))
    } else {
      setSelectedNotifications([...selectedNotifications, id])
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "rps_submission":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "rps_approval":
        return <Check className="h-5 w-5 text-green-500" />
      case "rps_revision":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "cpl_assignment":
        return <Users className="h-5 w-5 text-purple-500" />
      case "deadline":
        return <Clock className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "rps_submission":
        return "bg-blue-100"
      case "rps_approval":
        return "bg-green-100"
      case "rps_revision":
        return "bg-orange-100"
      case "cpl_assignment":
        return "bg-purple-100"
      case "deadline":
        return "bg-red-100"
      default:
        return "bg-gray-100"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "rps_submission":
        return "Pengajuan RPS"
      case "rps_approval":
        return "Persetujuan"
      case "rps_revision":
        return "Revisi"
      case "cpl_assignment":
        return "Penugasan"
      case "deadline":
        return "Deadline"
      default:
        return "Lainnya"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 
                ? `${unreadCount} notifikasi belum dibaca`
                : "Semua notifikasi telah dibaca"
              }
            </p>
          </div>
          <div className="flex gap-2">
            {selectedNotifications.length > 0 ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedNotifications([])}
                >
                  <X className="h-4 w-4 mr-2" />
                  Batal ({selectedNotifications.length})
                </Button>
                <Button 
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={deleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Terpilih
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{notifications.length}</p>
                  <p className="text-sm text-green-700">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{unreadCount}</p>
                  <p className="text-sm text-yellow-700">Belum Dibaca</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    {notifications.filter(n => n.type === "cpl_assignment").length}
                  </p>
                  <p className="text-sm text-purple-700">Penugasan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-900">
                    {notifications.filter(n => n.type === "rps_revision").length}
                  </p>
                  <p className="text-sm text-orange-700">Perlu Revisi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari notifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="all" className="text-xs">
                    Semua
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Belum Dibaca
                    {unreadCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 text-xs bg-red-500">{unreadCount}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="cpl_assignment" className="text-xs">Penugasan</TabsTrigger>
                  <TabsTrigger value="rps_revision" className="text-xs">Revisi</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">
              {filteredNotifications.length} Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 hover:bg-gray-50 transition-colors cursor-pointer
                      ${!notification.isRead ? "bg-green-50/50" : ""}
                      ${selectedNotifications.includes(notification.id) ? "bg-green-100" : ""}
                    `}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div 
                        className="mt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelect(notification.id)
                        }}
                      >
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer
                          ${selectedNotifications.includes(notification.id) 
                            ? "bg-green-600 border-green-600" 
                            : "border-gray-300 hover:border-gray-400"
                          }
                        `}>
                          {selectedNotifications.includes(notification.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {notification.relatedId && (
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                Lihat
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada notifikasi</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? "Tidak ditemukan notifikasi yang sesuai"
                    : "Semua notifikasi akan muncul di sini"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
