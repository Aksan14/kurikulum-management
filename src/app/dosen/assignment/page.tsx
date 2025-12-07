"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  FileText,
  Target,
  Loader2,
  ArrowRight,
  RefreshCw,
  Check,
  X
} from "lucide-react"
import Link from "next/link"
import { cplAssignmentService, type CPLAssignment } from "@/lib/api/cpl-assignment"
import { authService } from "@/lib/api/auth"
import { formatDate } from "@/lib/utils"

const statusConfig = {
  assigned: { label: 'Ditugaskan', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-200' },
  done: { label: 'Selesai', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

export default function DosenAssignmentPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<CPLAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<CPLAssignment | null>(null)
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'complete'>('accept')
  const [actionLoading, setActionLoading] = useState(false)
  const [comment, setComment] = useState("")

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const response = await cplAssignmentService.getMy()
      
      let data: CPLAssignment[] = []
      if (response.data) {
        if (Array.isArray(response.data)) {
          data = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data
        }
      }
      
      setAssignments(data)
    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data tugas')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      assignment.cpl?.kode?.toLowerCase().includes(searchLower) ||
      assignment.cpl?.judul?.toLowerCase().includes(searchLower) ||
      assignment.mata_kuliah?.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: assignments.length,
    assigned: assignments.filter(a => a.status === 'assigned').length,
    accepted: assignments.filter(a => a.status === 'accepted').length,
    done: assignments.filter(a => a.status === 'done').length,
  }

  const openActionDialog = (assignment: CPLAssignment, type: 'accept' | 'reject' | 'complete') => {
    setSelectedAssignment(assignment)
    setActionType(type)
    setComment("")
    setShowActionDialog(true)
  }

  const handleAction = async () => {
    if (!selectedAssignment) return

    try {
      setActionLoading(true)
      
      let status: 'accepted' | 'rejected' | 'done' = 'accepted'
      if (actionType === 'reject') status = 'rejected'
      else if (actionType === 'complete') status = 'done'

      await cplAssignmentService.updateStatus(selectedAssignment.id, {
        status,
        comment: actionType === 'reject' ? undefined : comment || undefined,
        rejection_reason: actionType === 'reject' ? comment || undefined : undefined
      })

      setShowActionDialog(false)
      fetchData()
    } catch (err) {
      console.error('Error updating assignment:', err)
      setError(err instanceof Error ? err.message : 'Gagal memperbarui tugas')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <div>
              <p className="text-slate-700 font-medium">Memuat tugas CPL Anda...</p>
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
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-900">Oops! Gagal Memuat Data</p>
            <p className="text-sm text-slate-600 max-w-md">{error}</p>
          </div>
          <Button onClick={fetchData}>Coba Lagi</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tugas CPL Saya</h1>
            <p className="text-slate-600 mt-1">
              Daftar penugasan penyusunan CPL yang diberikan oleh Kaprodi
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

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
                  <p className="text-2xl font-bold text-slate-900">{stats.assigned}</p>
                  <p className="text-sm text-slate-600">Menunggu Respon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.accepted}</p>
                  <p className="text-sm text-slate-600">Sedang Dikerjakan</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.done}</p>
                  <p className="text-sm text-slate-600">Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <option value="assigned">Ditugaskan</option>
                <option value="accepted">Diterima</option>
                <option value="done">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-lg font-medium text-slate-900">Tidak Ada Tugas</p>
                <p className="text-slate-600">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Tidak ada tugas yang cocok dengan filter'
                    : 'Anda belum memiliki tugas CPL dari Kaprodi'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusConfig[assignment.status].color}>
                          {statusConfig[assignment.status].label}
                        </Badge>
                        {assignment.cpl && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            {assignment.cpl.kode}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {assignment.cpl?.judul || `Tugas CPL ${assignment.cpl_id}`}
                      </h3>
                      {assignment.cpl?.deskripsi && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {assignment.cpl.deskripsi}
                        </p>
                      )}
                      {assignment.mata_kuliah && (
                        <p className="text-sm text-slate-500 mt-1">
                          <FileText className="h-4 w-4 inline mr-1" />
                          Mata Kuliah: {assignment.mata_kuliah}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Ditugaskan: {formatDate(assignment.assigned_at)}
                        </span>
                        {assignment.deadline && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Clock className="h-4 w-4" />
                            Deadline: {formatDate(assignment.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {assignment.status === 'assigned' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => openActionDialog(assignment, 'accept')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Terima
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openActionDialog(assignment, 'reject')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </>
                      )}
                      {assignment.status === 'accepted' && (
                        <Button 
                          size="sm" 
                          onClick={() => openActionDialog(assignment, 'complete')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selesai
                        </Button>
                      )}
                      {assignment.cpl_id && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dosen/cpl/${assignment.cpl_id}`}>
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Detail CPL
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' && 'Terima Tugas'}
              {actionType === 'reject' && 'Tolak Tugas'}
              {actionType === 'complete' && 'Selesaikan Tugas'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' && 'Anda akan menerima tugas ini. Tambahkan catatan jika diperlukan.'}
              {actionType === 'reject' && 'Anda akan menolak tugas ini. Berikan alasan penolakan.'}
              {actionType === 'complete' && 'Tandai tugas ini sebagai selesai. Tambahkan catatan jika diperlukan.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={actionType === 'reject' ? 'Alasan penolakan...' : 'Catatan (opsional)...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={actionLoading || (actionType === 'reject' && !comment)}
              className={
                actionType === 'reject' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'accept' && 'Terima'}
              {actionType === 'reject' && 'Tolak'}
              {actionType === 'complete' && 'Selesai'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
