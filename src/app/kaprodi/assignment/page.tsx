"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Target,
  Loader2,
  AlertCircle,
  RefreshCw,
  Filter
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { cplAssignmentService, CPLAssignment } from "@/lib/api/cpl-assignment"
import { authService } from "@/lib/api/auth"

interface DisplayAssignment {
  id: string
  cplId: string
  cplKode: string
  cplNama: string
  dosenId: string
  dosenNama: string
  dosenEmail: string
  mataKuliah: string
  status: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled'
  assignedAt: string
  acceptedAt?: string
  completedAt?: string
  deadline?: string
  comment?: string
  rejectionReason?: string
}

export default function AssignmentPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<DisplayAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; assignment: DisplayAssignment | null }>({
    open: false,
    assignment: null
  })
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; assignment: DisplayAssignment | null }>({
    open: false,
    assignment: null
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchAssignments = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { limit: 100 }
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await cplAssignmentService.getAll(params)
      
      if (response.success && response.data && response.data.data) {
        const mappedData: DisplayAssignment[] = response.data.data.map(a => ({
          id: a.id,
          cplId: a.cpl_id,
          cplKode: a.cpl?.kode || '-',
          cplNama: a.cpl?.judul || a.cpl?.deskripsi || '-',
          dosenId: a.dosen_id,
          dosenNama: a.dosen?.nama || '-',
          dosenEmail: a.dosen?.email || '-',
          mataKuliah: a.mata_kuliah || '-',
          status: a.status,
          assignedAt: a.assigned_at,
          acceptedAt: a.accepted_at,
          completedAt: a.completed_at,
          deadline: a.deadline,
          comment: a.comment,
          rejectionReason: a.rejection_reason
        }))
        setAssignments(mappedData)
      } else {
        setAssignments([])
      }
    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError('Gagal memuat data penugasan. Pastikan server API berjalan.')
    } finally {
      setLoading(false)
    }
  }, [router, statusFilter])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Filter assignments by search
  const filteredAssignments = assignments.filter(a => {
    const matchSearch = searchQuery === "" || 
      a.cplKode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cplNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.dosenNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mataKuliah.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSearch
  })

  // Stats
  const stats = {
    total: assignments.length,
    assigned: assignments.filter(a => a.status === 'assigned').length,
    accepted: assignments.filter(a => a.status === 'accepted').length,
    done: assignments.filter(a => a.status === 'done').length,
    rejected: assignments.filter(a => a.status === 'rejected').length
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-yellow-100 text-yellow-700">Menunggu</Badge>
      case 'accepted':
        return <Badge className="bg-blue-100 text-blue-700">Diterima</Badge>
      case 'done':
        return <Badge className="bg-green-100 text-green-700">Selesai</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-700">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.assignment) return
    
    setIsProcessing(true)
    try {
      const response = await cplAssignmentService.delete(deleteDialog.assignment.id)
      if (response.success) {
        setAssignments(prev => prev.filter(a => a.id !== deleteDialog.assignment!.id))
        setDeleteDialog({ open: false, assignment: null })
      }
    } catch (err) {
      console.error('Error deleting assignment:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelDialog.assignment) return
    
    setIsProcessing(true)
    try {
      const response = await cplAssignmentService.updateStatus(cancelDialog.assignment.id, {
        status: 'cancelled',
        rejection_reason: 'Penugasan dibatalkan oleh Kaprodi'
      })
      if (response.success) {
        fetchAssignments()
        setCancelDialog({ open: false, assignment: null })
      }
    } catch (err) {
      console.error('Error cancelling assignment:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat data penugasan...</span>
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
          <Button onClick={fetchAssignments}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
            <h1 className="text-2xl font-bold text-slate-900">Penugasan CPL</h1>
            <p className="text-slate-600 mt-1">
              Kelola penugasan Capaian Pembelajaran Lulusan kepada dosen
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/kaprodi/assignment/create">
              <Plus className="h-4 w-4 mr-2" />
              Buat Penugasan
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.assigned}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Diterima</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.accepted}</p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Selesai</p>
                  <p className="text-2xl font-bold text-green-700">{stats.done}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Ditolak</p>
                  <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari berdasarkan CPL, dosen, atau mata kuliah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="assigned">Menunggu</SelectItem>
                    <SelectItem value="accepted">Diterima</SelectItem>
                    <SelectItem value="done">Selesai</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchAssignments}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Penugasan</CardTitle>
            <CardDescription>
              {filteredAssignments.length} penugasan ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Belum ada penugasan</h3>
                <p className="text-slate-500 mt-1">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Tidak ada penugasan yang sesuai dengan filter' 
                    : 'Mulai dengan membuat penugasan CPL baru'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button asChild className="mt-4">
                    <Link href="/kaprodi/assignment/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Penugasan
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-slate-600">
                      <th className="pb-3 font-medium">CPL</th>
                      <th className="pb-3 font-medium">Dosen</th>
                      <th className="pb-3 font-medium">Mata Kuliah</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Tanggal</th>
                      <th className="pb-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment.id} className="text-sm">
                        <td className="py-4">
                          <div>
                            <Badge className="bg-blue-100 text-blue-700 mb-1">
                              {assignment.cplKode}
                            </Badge>
                            <p className="text-slate-600 text-xs line-clamp-1">
                              {assignment.cplNama}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-slate-900">{assignment.dosenNama}</p>
                            <p className="text-xs text-slate-500">{assignment.dosenEmail}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="text-slate-700">{assignment.mataKuliah}</p>
                        </td>
                        <td className="py-4">
                          {getStatusBadge(assignment.status)}
                          {assignment.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1">
                              {assignment.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-4">
                          <p className="text-slate-700">{formatDate(assignment.assignedAt)}</p>
                          {assignment.deadline && (
                            <p className="text-xs text-slate-500">
                              Deadline: {formatDate(assignment.deadline)}
                            </p>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/kaprodi/cpl/${assignment.cplId}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat CPL
                                </Link>
                              </DropdownMenuItem>
                              {(assignment.status === 'assigned' || assignment.status === 'accepted') && (
                                <DropdownMenuItem 
                                  onClick={() => setCancelDialog({ open: true, assignment })}
                                  className="text-yellow-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Batalkan
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, assignment })}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, assignment: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Hapus Penugasan
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus penugasan ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {deleteDialog.assignment && (
            <div className="py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-900">
                  {deleteDialog.assignment.cplKode} - {deleteDialog.assignment.dosenNama}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Mata Kuliah: {deleteDialog.assignment.mataKuliah}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, assignment: null })}>
              Batal
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, assignment: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-yellow-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Batalkan Penugasan
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan penugasan ini? Dosen yang ditugaskan akan mendapat notifikasi.
            </DialogDescription>
          </DialogHeader>
          {cancelDialog.assignment && (
            <div className="py-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-900">
                  {cancelDialog.assignment.cplKode} - {cancelDialog.assignment.dosenNama}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Mata Kuliah: {cancelDialog.assignment.mataKuliah}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, assignment: null })}>
              Tidak
            </Button>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              {isProcessing ? "Membatalkan..." : "Ya, Batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
