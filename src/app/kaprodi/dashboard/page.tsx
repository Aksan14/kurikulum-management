"use client"

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
  AlertCircle
} from "lucide-react"
import { mockUsers, mockCPLs, mockRPS, mockAssignments, mockDashboardStats } from "@/lib/mock-data"
import Link from "next/link"

export default function KaprodiDashboard() {
  const user = mockUsers[0] // Kaprodi user
  const pendingRPS = mockRPS.filter(rps => rps.status === 'submitted')
  const recentRPS = mockRPS.slice(0, 4)
  const recentAssignments = mockAssignments.slice(0, 4)
  
  // Calculate stats
  const cplProgress = (mockDashboardStats.publishedCPL / mockDashboardStats.totalCPL) * 100
  const rpsProgress = (mockDashboardStats.approvedRPS / mockDashboardStats.totalRPS) * 100

  return (
    <DashboardLayout user={user} unreadNotifications={3}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Kaprodi</h1>
            <p className="mt-1 text-slate-500">
              Selamat datang kembali, {user.nama.split(',')[0]}! Berikut ringkasan kurikulum Anda.
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
        {pendingRPS.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  {pendingRPS.length} RPS Menunggu Review
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
            value={mockDashboardStats.totalCPL}
            description={`${mockDashboardStats.publishedCPL} published`}
            icon={GraduationCap}
            variant="info"
            trend={{ value: 10, isPositive: true }}
          />
          <StatsCard
            title="Total RPS"
            value={mockDashboardStats.totalRPS}
            description={`${mockDashboardStats.approvedRPS} disetujui`}
            icon={FileText}
            variant="success"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Penugasan Aktif"
            value={mockDashboardStats.activeAssignments}
            description="Menunggu RPS"
            icon={Users}
            variant="warning"
          />
          <StatsCard
            title="Dokumen Generated"
            value={mockDashboardStats.documentsGenerated}
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
                    {mockDashboardStats.publishedCPL} / {mockDashboardStats.totalCPL} Published
                  </Badge>
                </div>
                <Progress value={cplProgress} className="h-3" indicatorClassName="from-emerald-500 to-emerald-600" />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Draft: {mockDashboardStats.totalCPL - mockDashboardStats.publishedCPL}</span>
                  <span>Published: {mockDashboardStats.publishedCPL}</span>
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
                    {mockDashboardStats.pendingReview} Menunggu Review
                  </Badge>
                </div>
                <Progress value={rpsProgress} className="h-3" indicatorClassName="from-blue-500 to-blue-600" />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Approved: {mockDashboardStats.approvedRPS}</span>
                  <span>Total: {mockDashboardStats.totalRPS}</span>
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
              <RecentRPSList items={recentRPS} />
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
              <AssignmentList items={recentAssignments} />
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
