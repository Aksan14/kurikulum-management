"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { StatsCard, RecentRPSList, AssignmentList } from "@/components/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  GraduationCap, 
  FileText, 
  Users, 
  FileOutput, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { useAuth } from "@/contexts"
import { dashboardService, rpsService, cplAssignmentService, notificationService, authService } from "@/lib/api"
import type { KaprodiDashboard as KaprodiDashboardType } from "@/lib/api"
import { RPS, CPLAssignment } from "@/types"
import Link from "next/link"

// Dashboard-specific types to avoid type conflicts
interface DashboardRPS {
  id: string
  mataKuliahId: string
  mataKuliahNama: string
  kodeMK: string
  sks: number
  semester: number
  tahunAkademik: string
  dosenId: string
  dosenNama: string
  status: string
  createdAt: string
  updatedAt: string
}

interface DashboardAssignment {
  id: string
  cplId: string
  dosenId: string
  dosenName: string
  mataKuliah: string
  status: string
  assignedAt: string
  acceptedAt?: string
}

export default function KaprodiDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState<KaprodiDashboardType | null>(null)
  const [pendingRPSCount, setPendingRPSCount] = useState(0)
  const [recentRPS, setRecentRPS] = useState<DashboardRPS[]>([])
  const [recentAssignments, setRecentAssignments] = useState<DashboardAssignment[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push('/login')
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch dashboard stats
        const dashboardResponse = await dashboardService.getKaprodi()
        if (dashboardResponse.success) {
          setStats(dashboardResponse.data)
        }

        // Fetch unread notifications count
        const notifResponse = await notificationService.getUnreadCount()
        if (notifResponse.success) {
          setUnreadCount(notifResponse.data.count)
        }

        // Fetch recent RPS
        const rpsResponse = await rpsService.getAll({ limit: 4, sort_by: 'updated_at', sort_order: 'desc' })
        if (rpsResponse.success && rpsResponse.data && rpsResponse.data.data) {
          // Map API response to dashboard format
          const rpsData: DashboardRPS[] = rpsResponse.data.data.map(rps => ({
            id: rps.id,
            mataKuliahId: rps.mata_kuliah_id,
            mataKuliahNama: rps.mata_kuliah_nama,
            kodeMK: rps.kode_mk,
            sks: rps.sks,
            semester: rps.semester,
            tahunAkademik: rps.tahun_akademik,
            dosenId: rps.dosen_id,
            dosenNama: rps.dosen_nama,
            status: rps.status,
            createdAt: rps.created_at,
            updatedAt: rps.updated_at,
          }))
          setRecentRPS(rpsData)
          setPendingRPSCount(rpsData.filter(r => r.status === 'submitted').length)
        } else {
          setRecentRPS([])
          setPendingRPSCount(0)
        }

        // Fetch recent assignments
        const assignmentResponse = await cplAssignmentService.getAll({ limit: 4, sort_by: 'assigned_at', sort_order: 'desc' })
        if (assignmentResponse.success && assignmentResponse.data && assignmentResponse.data.data) {
          const assignmentData: DashboardAssignment[] = assignmentResponse.data.data.map(a => ({
            id: a.id,
            cplId: a.cpl_id || '',
            dosenId: a.dosen_id,
            dosenName: a.dosen?.nama || '',
            mataKuliah: a.mata_kuliah || '',
            status: a.status,
            assignedAt: a.assigned_at,
            acceptedAt: a.accepted_at
          }))
          setRecentAssignments(assignmentData)
        } else {
          setRecentAssignments([])
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Gagal memuat data dashboard. Pastikan server API berjalan.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Refetch function
  const refetch = () => {
    setIsLoading(true)
    setError(null)
    // Trigger useEffect again by force
    window.location.reload()
  }

  // Use stats or default values
  const dashboardStats = stats || {
    total_cpl: 0,
    published_cpl: 0,
    draft_cpl: 0,
    total_rps: 0,
    approved_rps: 0,
    pending_review: 0,
    rejected_rps: 0,
    active_dosen: 0,
    active_assignments: 0,
    documents_generated: 0
  }

  // Calculate progress percentages
  const cplProgress = dashboardStats.total_cpl > 0 
    ? (dashboardStats.published_cpl / dashboardStats.total_cpl) * 100 
    : 0
  const rpsProgress = dashboardStats.total_rps > 0 
    ? (dashboardStats.approved_rps / dashboardStats.total_rps) * 100 
    : 0

  // Transform user for DashboardLayout
  const dashboardUser = user ? {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role as 'kaprodi' | 'dosen' | 'admin',
    avatar: user.avatar_url || undefined,
    departemen: 'Program Studi'
  } : undefined

  // Convert for component compatibility (any is used here for backward compatibility with existing components)
  const rpsForList = recentRPS as unknown as RPS[]
  const assignmentsForList = recentAssignments as unknown as CPLAssignment[]

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout user={dashboardUser} unreadNotifications={unreadCount}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-slate-500">Memuat data dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error && !stats) {
    return (
      <DashboardLayout user={dashboardUser} unreadNotifications={unreadCount}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Gagal Memuat Dashboard</h2>
          <p className="mt-2 text-slate-500">{error}</p>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={dashboardUser} unreadNotifications={unreadCount}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Kaprodi</h1>
            <p className="mt-1 text-slate-500">
              Selamat datang kembali, {user?.nama?.split(',')[0] || 'User'}! Berikut ringkasan kurikulum Anda.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/kaprodi/cpl/create">
                <Plus className="h-4 w-4" />
                Buat CPL
              </Link>
            </Button>
            <Button asChild>
              <Link href="/kaprodi/dokumen/generate">
                <FileOutput className="h-4 w-4" />
                Generate Dokumen
              </Link>
            </Button>
          </div>
        </div>

        {/* Alert for Pending Reviews */}
        {pendingRPSCount > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  {pendingRPSCount} RPS Menunggu Review
                </h3>
                <p className="text-sm text-amber-700">
                  Ada beberapa RPS yang memerlukan persetujuan Anda.
                </p>
              </div>
              <Button variant="warning" size="sm" asChild>
                <Link href="/kaprodi/rps?status=submitted">
                  Review Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total CPL"
            value={dashboardStats.total_cpl}
            description={`${dashboardStats.published_cpl} published`}
            icon={GraduationCap}
            variant="info"
            trend={{ value: 10, isPositive: true }}
          />
          <StatsCard
            title="Total RPS"
            value={dashboardStats.total_rps}
            description={`${dashboardStats.approved_rps} disetujui`}
            icon={FileText}
            variant="success"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Penugasan Aktif"
            value={dashboardStats.active_assignments || 0}
            description="Menunggu RPS"
            icon={Users}
            variant="warning"
          />
          <StatsCard
            title="Dokumen Generated"
            value={dashboardStats.documents_generated || 0}
            description="Tahun ini"
            icon={FileOutput}
            variant="default"
          />
        </div>

        {/* Progress Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Progress CPL</CardTitle>
              <CardDescription>Status publikasi Capaian Pembelajaran Lulusan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">{cplProgress.toFixed(0)}%</span>
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {dashboardStats.published_cpl} / {dashboardStats.total_cpl} Published
                  </Badge>
                </div>
                <Progress value={cplProgress} className="h-3" indicatorClassName="from-emerald-500 to-emerald-600" />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Draft: {dashboardStats.draft_cpl}</span>
                  <span>Published: {dashboardStats.published_cpl}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Progress RPS</CardTitle>
              <CardDescription>Status persetujuan Rencana Pembelajaran Semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">{rpsProgress.toFixed(0)}%</span>
                  <Badge variant="info">
                    <Clock className="mr-1 h-3 w-3" />
                    {dashboardStats.pending_review || 0} Menunggu Review
                  </Badge>
                </div>
                <Progress value={rpsProgress} className="h-3" indicatorClassName="from-blue-500 to-blue-600" />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Approved: {dashboardStats.approved_rps}</span>
                  <span>Total: {dashboardStats.total_rps}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent RPS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>RPS Terbaru</CardTitle>
                <CardDescription>Rencana Pembelajaran Semester yang baru diupdate</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/kaprodi/rps">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <RecentRPSList items={rpsForList} />
            </CardContent>
          </Card>

          {/* Recent Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Penugasan Terbaru</CardTitle>
                <CardDescription>Penugasan CPL ke dosen pengampu</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/kaprodi/assignment">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <AssignmentList items={assignmentsForList} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Pintasan ke fitur yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/kaprodi/cpl/create"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Buat CPL Baru</h4>
                  <p className="text-sm text-slate-500">Tambah capaian pembelajaran</p>
                </div>
              </Link>

              <Link
                href="/kaprodi/assignment/create"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Assign CPL</h4>
                  <p className="text-sm text-slate-500">Tugaskan ke dosen</p>
                </div>
              </Link>

              <Link
                href="/kaprodi/mapping"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-purple-200 hover:bg-purple-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Lihat Matriks</h4>
                  <p className="text-sm text-slate-500">Mapping CPL & MK</p>
                </div>
              </Link>

              <Link
                href="/kaprodi/dokumen/generate"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-200 hover:bg-amber-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <FileOutput className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Generate Dokumen</h4>
                  <p className="text-sm text-slate-500">Buat dokumen kurikulum</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
