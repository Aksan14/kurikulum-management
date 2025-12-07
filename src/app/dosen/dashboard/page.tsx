"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
  Plus,
  ClipboardList
} from "lucide-react"
import Link from "next/link"
import { rpsService } from "@/lib/api/rps"
import { dashboardService, type DosenDashboard } from "@/lib/api/dashboard"
import { authService } from "@/lib/api/auth"
import type { RPS } from "@/lib/api/rps"
import { formatDate } from "@/lib/utils"

export default function DosenDashboardPage() {
  const router = useRouter()
  const [rpsList, setRpsList] = useState<RPS[]>([])
  const [dashboardData, setDashboardData] = useState<DosenDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const [rpsResponse, dashboardResponse] = await Promise.all([
        rpsService.getMy(),
        dashboardService.getDosen()
      ])
      
      // Handle RPS list
      let rpsData: RPS[] = []
      if (rpsResponse.data) {
        if (Array.isArray(rpsResponse.data)) {
          rpsData = rpsResponse.data
        } else if (rpsResponse.data.data && Array.isArray(rpsResponse.data.data)) {
          rpsData = rpsResponse.data.data
        }
      }
      setRpsList(rpsData)
      
      // Handle dashboard data
      if (dashboardResponse.data) {
        setDashboardData(dashboardResponse.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate stats - prefer dashboard API data, fallback to local calculation
  const stats = {
    totalRPS: dashboardData?.my_rps ?? dashboardData?.total_rps ?? rpsList.length,
    approvedRPS: dashboardData?.approved_rps ?? rpsList.filter(rps => rps.status === 'approved').length,
    pendingRPS: dashboardData?.submitted_rps ?? rpsList.filter(rps => rps.status === 'submitted').length,
    draftRPS: dashboardData?.draft_rps ?? rpsList.filter(rps => rps.status === 'draft').length,
    totalAssignments: dashboardData?.my_assignments ?? dashboardData?.total_assignments ?? 0,
    pendingAssignments: dashboardData?.pending_assignments ?? 0,
    acceptedAssignments: dashboardData?.accepted_assignments ?? 0,
    completedAssignments: dashboardData?.completed_assignments ?? 0,
    totalMataKuliah: dashboardData?.my_mata_kuliah ?? 0,
  }

  const completionRate = stats.totalRPS > 0 
    ? Math.round((stats.approvedRPS / stats.totalRPS) * 100) 
    : 0

  // Recent RPS (last 5)
  const recentRPS = rpsList.slice(0, 5)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <div>
              <p className="text-slate-700 font-medium">Memuat dashboard Anda...</p>
              <p className="text-sm text-slate-500 mt-1">Tunggu sebentar</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-900">Oops! Gagal Memuat Data</p>
            <p className="text-sm text-slate-600 max-w-md">{error}</p>
          </div>
          <Button onClick={fetchData} className="mt-4">
            Coba Lagi
          </Button>
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
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Dosen</h1>
            <p className="text-slate-600 mt-1">
              Selamat datang! Kelola RPS dan pantau progres pengembangan kurikulum Anda.
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dosen/rps/create">
              <Plus className="h-4 w-4 mr-2" />
              Buat RPS Baru
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md hover:shadow-blue-100 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total RPS</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalRPS}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md hover:shadow-green-100 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">RPS Disetujui</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.approvedRPS}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-md hover:shadow-yellow-100 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Menunggu Review</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.pendingRPS}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md hover:shadow-purple-100 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tugas CPL</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalAssignments}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Completion Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Progres Penyelesaian RPS
              </CardTitle>
              <CardDescription>
                Tingkat penyelesaian RPS yang sudah disetujui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">RPS Disetujui</span>
                  <span className="text-sm font-medium">{stats.approvedRPS} dari {stats.totalRPS}</span>
                </div>
                <Progress value={completionRate} className="h-3" />
                <p className="text-center text-2xl font-bold text-blue-600">{completionRate}%</p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-xs text-slate-600">Disetujui</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">{stats.approvedRPS}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-slate-600">Pending</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">{stats.pendingRPS}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-600">Draft</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">{stats.draftRPS}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent RPS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    RPS Terbaru
                  </CardTitle>
                  <CardDescription>Daftar RPS yang baru dibuat atau diperbarui</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dosen/rps">
                    Lihat Semua
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentRPS.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-600">Belum ada RPS</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/dosen/rps/create">Buat RPS pertama Anda</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRPS.map((rps) => (
                    <Link
                      key={rps.id}
                      href={`/dosen/rps/${rps.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {rps.mata_kuliah_nama || `MK-${rps.mata_kuliah_id}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          {rps.tahun_akademik} - Semester {rps.semester}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          rps.status === 'approved'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : rps.status === 'submitted'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : rps.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }
                      >
                        {rps.status === 'approved' ? 'Disetujui' :
                         rps.status === 'submitted' ? 'Menunggu' :
                         rps.status === 'rejected' ? 'Ditolak' : 'Draft'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Menu pintasan untuk tugas yang sering dilakukan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dosen/rps/create">
                  <Plus className="h-6 w-6 text-blue-600" />
                  <span>Buat RPS Baru</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dosen/rps">
                  <FileText className="h-6 w-6 text-green-600" />
                  <span>Kelola RPS</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dosen/mapping">
                  <Target className="h-6 w-6 text-purple-600" />
                  <span>Mapping CPL</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dosen/report">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  <span>Lihat Laporan</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
