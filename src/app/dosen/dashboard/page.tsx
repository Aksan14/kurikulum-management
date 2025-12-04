"use client"

import { DashboardLayout } from "@/components/layout"
import { StatsCard, RecentRPSList } from "@/components/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  ClipboardList, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  AlertCircle,
  BookOpen,
  GitBranch,
  Send
} from "lucide-react"
import { mockUsers, mockRPS, mockAssignments } from "@/lib/mock-data"
import Link from "next/link"
import { cn, formatDateTime } from "@/lib/utils"

export default function DosenDashboard() {
  const user = mockUsers[1] // Dosen user
  
  // Filter data untuk dosen yang login
  const myRPS = mockRPS.filter(rps => rps.dosenId === user.id)
  const myAssignments = mockAssignments.filter(a => a.dosenId === user.id)
  const pendingAssignments = myAssignments.filter(a => a.status === 'assigned')
  
  // Stats
  const completedRPS = myRPS.filter(r => r.status === 'approved' || r.status === 'published').length
  const draftRPS = myRPS.filter(r => r.status === 'draft').length
  const rejectedRPS = myRPS.filter(r => r.status === 'rejected').length

  return (
    <DashboardLayout user={{...user, role: 'dosen'}} unreadNotifications={2}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Dosen</h1>
            <p className="mt-1 text-slate-500">
              Selamat datang, {user.nama}! Kelola RPS dan tugas Anda di sini.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/dosen/rps">
                <FileText className="h-4 w-4" />
                RPS Saya
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dosen/assignment">
                <ClipboardList className="h-4 w-4" />
                Lihat Tugas
              </Link>
            </Button>
          </div>
        </div>

        {/* Pending Tasks Alert */}
        {pendingAssignments.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">
                  {pendingAssignments.length} Penugasan Baru
                </h3>
                <p className="text-sm text-blue-700">
                  Anda mendapat tugas baru untuk mengisi RPS.
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/dosen/assignment">
                  Lihat Tugas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Rejected RPS Alert */}
        {rejectedRPS > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  {rejectedRPS} RPS Ditolak
                </h3>
                <p className="text-sm text-red-700">
                  Ada RPS yang ditolak dan perlu direvisi.
                </p>
              </div>
              <Button variant="destructive" size="sm" asChild>
                <Link href="/dosen/rps?status=rejected">
                  Revisi Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total RPS"
            value={myRPS.length}
            description="RPS yang Anda kelola"
            icon={FileText}
            variant="info"
          />
          <StatsCard
            title="RPS Disetujui"
            value={completedRPS}
            description="Siap untuk generate"
            icon={CheckCircle2}
            variant="success"
          />
          <StatsCard
            title="RPS Draft"
            value={draftRPS}
            description="Belum disubmit"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Tugas Aktif"
            value={pendingAssignments.length}
            description="Menunggu dikerjakan"
            icon={ClipboardList}
            variant="default"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* My Tasks */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Tugas Saya
              </CardTitle>
              <CardDescription>Penugasan CPL yang perlu dikerjakan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={cn(
                      "rounded-lg border p-4 transition-all",
                      assignment.status === 'assigned' 
                        ? "border-blue-200 bg-blue-50" 
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{assignment.mataKuliah}</h4>
                        <p className="mt-1 text-sm text-slate-500">
                          Ditugaskan: {formatDateTime(assignment.assignedAt)}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          assignment.status === 'done' ? 'success' :
                          assignment.status === 'assigned' ? 'warning' :
                          'info'
                        }
                      >
                        {assignment.status === 'assigned' ? 'Baru' :
                         assignment.status === 'accepted' ? 'Diterima' :
                         assignment.status === 'done' ? 'Selesai' : 'Ditolak'}
                      </Badge>
                    </div>
                    {assignment.status === 'assigned' && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="flex-1">
                          Terima & Isi RPS
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {myAssignments.length === 0 && (
                  <div className="py-8 text-center text-slate-500">
                    <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-2">Belum ada tugas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My RPS */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>RPS Saya</CardTitle>
                <CardDescription>Daftar RPS yang Anda kelola</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dosen/rps">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <RecentRPSList items={myRPS} showDosen={false} />
              {myRPS.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <FileText className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2">Belum ada RPS</p>
                  <p className="text-sm">Terima penugasan untuk mulai mengisi RPS</p>
                </div>
              )}
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
                href="/dosen/rps/create"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Buat RPS</h4>
                  <p className="text-sm text-slate-500">Isi RPS baru</p>
                </div>
              </Link>

              <Link
                href="/dosen/assignment"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Lihat Tugas</h4>
                  <p className="text-sm text-slate-500">Penugasan aktif</p>
                </div>
              </Link>

              <Link
                href="/dosen/mapping"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-purple-200 hover:bg-purple-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <GitBranch className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Mapping CPMK</h4>
                  <p className="text-sm text-slate-500">Petakan ke CPL</p>
                </div>
              </Link>

              <Link
                href="/dosen/mata-kuliah"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-200 hover:bg-amber-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Mata Kuliah</h4>
                  <p className="text-sm text-slate-500">Lihat daftar MK</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
