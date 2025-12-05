"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  FileText,
  Target,
  Loader2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { rpsService } from "@/lib/api/rps"
import { authService } from "@/lib/api/auth"
import type { RPS } from "@/lib/api/rps"
import { formatDate } from "@/lib/utils"

interface Assignment {
  id: string
  title: string
  description: string
  deadline: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'high' | 'medium' | 'low'
  type: 'rps' | 'cpl' | 'mapping'
  relatedRpsId?: string
}

export default function DosenAssignmentPage() {
  const router = useRouter()
  const [rpsList, setRpsList] = useState<RPS[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

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
      setRpsList(response.data?.data || [])
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

  // Generate assignments from RPS data
  const assignments: Assignment[] = rpsList.map((rps) => {
    let status: Assignment['status'] = 'pending'
    if (rps.status === 'approved') status = 'completed'
    else if (rps.status === 'submitted') status = 'in_progress'
    else if (rps.status === 'rejected') status = 'pending'

    return {
      id: String(rps.id),
      title: `RPS ${rps.mata_kuliah_nama || `MK-${rps.mata_kuliah_id}`}`,
      description: `Penyusunan RPS untuk mata kuliah ${rps.mata_kuliah_nama || `MK-${rps.mata_kuliah_id}`} - ${rps.tahun_akademik}`,
      deadline: rps.updated_at || new Date().toISOString(),
      status,
      priority: rps.status === 'rejected' ? 'high' : rps.status === 'draft' ? 'medium' : 'low',
      type: 'rps',
      relatedRpsId: rps.id
    }
  })

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
  }

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Selesai</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Dalam Proses</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Menunggu</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Terlambat</Badge>
    }
  }

  const getPriorityBadge = (priority: Assignment['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="text-red-600 border-red-300">Prioritas Tinggi</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Prioritas Sedang</Badge>
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-300">Prioritas Rendah</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat tugas...</span>
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tugas Saya</h1>
          <p className="text-slate-600 mt-1">
            Daftar tugas penyusunan RPS dan pemetaan CPL yang perlu diselesaikan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-600">Total Tugas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                  <p className="text-sm text-slate-600">Menunggu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.inProgress}</p>
                  <p className="text-sm text-slate-600">Dalam Proses</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                  <p className="text-sm text-slate-600">Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari tugas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="in_progress">Dalam Proses</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Assignment List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">Tidak ada tugas yang ditemukan</p>
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(assignment.status)}
                        {getPriorityBadge(assignment.priority)}
                      </div>
                      <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{assignment.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(assignment.deadline)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {assignment.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dosen/rps/${assignment.relatedRpsId}`}>
                        Lihat Detail
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
