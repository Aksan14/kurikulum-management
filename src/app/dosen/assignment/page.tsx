"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
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
  Target,
  Loader2,
  ArrowRight,
  RefreshCw,
  Check,
  X
} from "lucide-react"
import { cplAssignmentService, type CPLAssignment } from "@/lib/api/cpl-assignment"
import { authService } from "@/lib/api/auth"
import { formatDate } from "@/lib/utils"
import { rpsService } from "@/lib/api"

const statusConfig = {
  assigned: { label: 'Ditugaskan', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-200' },
  done: { label: 'Selesai', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  mixed: { label: 'Bercampur', color: 'bg-purple-100 text-purple-700 border-purple-200' }
}

interface GroupedMataKuliahAssignment {
  mataKuliahId: string
  mataKuliah: string
  deadline?: string
  assignedAt: string
  cpls: {
    id: string
    cplId: string | string[]
    cplKode: string
    cplJudul: string
    cplDeskripsi?: string
    status: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled' | 'mixed'
    assignments: Array<{
      id: string
      status: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled'
      comment?: string
      rejectionReason?: string
    }>
  }[]
  overallStatus: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled' | 'mixed'
}

function groupAssignmentsByMataKuliah(assignments: CPLAssignment[]): GroupedMataKuliahAssignment[] {
  const groups = new Map<string, CPLAssignment[]>()

  // Group by mata_kuliah_id
  assignments.forEach(assignment => {
    const key = assignment.mata_kuliah_id || 'unknown'
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(assignment)
  })

  return Array.from(groups.entries()).map(([mataKuliahId, groupAssignments]) => {
    const first = groupAssignments[0]
    const allStatuses = groupAssignments.map(a => a.status)
    const uniqueStatuses = [...new Set(allStatuses)]

    let overallStatus: GroupedMataKuliahAssignment['overallStatus']
    if (uniqueStatuses.length === 1) {
      overallStatus = uniqueStatuses[0]
    } else {
      overallStatus = 'mixed'
    }

    // Kumpulkan semua CPL unik untuk mata kuliah ini
    const cplMap = new Map<string, {
      id: string
      cplId: string | string[]
      cplKode: string
      cplJudul: string
      cplDeskripsi?: string
      assignments: Array<{
        id: string
        status: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled'
        comment?: string
        rejectionReason?: string
      }>
    }>()

    groupAssignments.forEach(a => {
      console.log('Processing assignment:', a.id, 'cpl_ids:', a.cpl_ids, 'cpls:', a.cpls?.length)

      // Struktur baru: banyak CPL di field cpls
      if (a.cpl_ids && a.cpls && Array.isArray(a.cpl_ids) && Array.isArray(a.cpls)) {
        console.log('✅ Processing new structure with cpl_ids and cpls arrays')

        a.cpls.forEach(cpl => {
          const cplKey = cpl.id

          if (!cplMap.has(cplKey)) {
            cplMap.set(cplKey, {
              id: cplKey,
              cplId: cpl.id,
              cplKode: cpl.kode,
              cplJudul: cpl.nama || cpl.deskripsi || `CPL ${cpl.kode}`,
              cplDeskripsi: cpl.deskripsi,
              assignments: []
            })
          }

          cplMap.get(cplKey)!.assignments.push({
            id: a.id,
            status: a.status,
            comment: a.comment,
            rejectionReason: a.rejection_reason
          })
        })
      }
      // (opsional) struktur lama dengan single cpl kalau masih ada di tipe
      // else if (a.cpl && a.cpl.kode) { ... }
      else {
        // Tidak ada data CPL untuk assignment ini → biarkan saja.
        // Nanti di tampilan kita handle sebagai "Belum ada CPL (akan ditentukan)"
        console.warn('⚠️ No CPL data for assignment:', a.id)
      }
    })

    // Konversi map ke array dan tentukan status tiap CPL
    const cpls = Array.from(cplMap.values()).map(cpl => {
      const allAssignmentStatuses = cpl.assignments.map(ass => ass.status)
      const uniqueAssignmentStatuses = [...new Set(allAssignmentStatuses)]

      let cplOverallStatus: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled' | 'mixed'
      if (uniqueAssignmentStatuses.length === 1) {
        cplOverallStatus = uniqueAssignmentStatuses[0]
      } else {
        cplOverallStatus = 'mixed'
      }

      return {
        ...cpl,
        status: cplOverallStatus
      }
    })

    return {
      mataKuliahId,
      mataKuliah: first.mata_kuliah || first.mata_kuliah_ref?.nama || 'Mata Kuliah Tidak Diketahui',
      deadline: first.deadline,
      assignedAt: first.assigned_at,
      cpls,
      overallStatus
    }
  })
}

export default function DosenAssignmentPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<CPLAssignment[]>([])
  const [groupedAssignments, setGroupedAssignments] = useState<GroupedMataKuliahAssignment[]>([])
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
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    if (!currentUser || currentUser.role !== 'dosen') {
      console.log('User is not a dosen or not logged in properly:', currentUser)
      setError('Akses ditolak. Halaman ini hanya untuk dosen.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching assignments for dosen:', currentUser.nama, 'ID:', currentUser.id)

      const response = await cplAssignmentService.getAll({ 
        dosen_id: currentUser.id, 
        limit: 100,
        include: 'cpls,mata_kuliah_ref'
      })
      
      console.log('API Response:', response)

      let data: CPLAssignment[] = []
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          data = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data
        } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          if ((response.data as any).assignments && Array.isArray((response.data as any).assignments)) {
            data = (response.data as any).assignments
          } else {
            console.warn('Unexpected API response structure:', response.data)
            setError('Format data dari server tidak sesuai')
          }
        } else {
          console.warn('Unexpected API response structure:', response.data)
          setError('Format data dari server tidak sesuai')
        }
      } else {
        console.warn('API request failed:', response.message || 'Unknown error')
        if (response.message) {
          setError(`Server error: ${response.message}`)
        } else {
          setError('Gagal mengambil data dari server. Periksa koneksi internet Anda.')
        }
      }

      console.log('Final assignments data:', data)
      setAssignments(data)

      const grouped = groupAssignmentsByMataKuliah(data)
      console.log('Grouped assignments:', grouped)
      setGroupedAssignments(grouped)
    } catch (err) {
      console.error('Error fetching assignments:', err)
      let errorMessage = 'Terjadi kesalahan saat memuat data tugas'

      if (err instanceof Error) {
        errorMessage = err.message
        console.error('Error details:', err.stack)
      }

      setError(errorMessage)
      setAssignments([])
      setGroupedAssignments([])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        fetchData()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [fetchData])

  const filteredAssignments = groupedAssignments.filter(assignment => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      assignment.mataKuliah.toLowerCase().includes(searchLower) ||
      assignment.cpls.some(cpl => 
        cpl.cplKode.toLowerCase().includes(searchLower) ||
        cpl.cplJudul.toLowerCase().includes(searchLower)
      )
    const matchesStatus = filterStatus === 'all' || assignment.overallStatus === filterStatus || 
      (filterStatus === 'mixed' && assignment.overallStatus === 'mixed')
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

  const handleRedirectToRPS = async (assignment: CPLAssignment) => {
    if (!assignment.mata_kuliah_id) {
      alert("Mata kuliah ID tidak tersedia")
      return
    }

    try {
      const response = await rpsService.getByMataKuliah(assignment.mata_kuliah_id)
      if (response.success && response.data?.data && response.data.data.length > 0) {
        const rps = response.data.data[0]
        router.push(`/dosen/rps/${rps.id}`)
      } else {
        alert("RPS belum dibuat untuk mata kuliah ini")
      }
    } catch (err) {
      console.error("Error fetching RPS:", err)
      alert("Gagal memuat RPS")
    }
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

  // Helper untuk cari assignment by mata kuliah + status
  const findAssignmentByCourseAndStatus = (
    mataKuliahId: string,
    status: CPLAssignment["status"]
  ): CPLAssignment | undefined => {
    return assignments.find(
      (a) => a.mata_kuliah_id === mataKuliahId && a.status === status
    )
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
            filteredAssignments.map((mataKuliahAssignment) => (
              <Card key={mataKuliahAssignment.mataKuliahId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          mataKuliahAssignment.overallStatus === 'mixed' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          statusConfig[mataKuliahAssignment.overallStatus]?.color || 'bg-gray-100 text-gray-700'
                        }>
                          {mataKuliahAssignment.overallStatus === 'mixed' ? 'Status Campuran' : 
                           statusConfig[mataKuliahAssignment.overallStatus]?.label || mataKuliahAssignment.overallStatus}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {mataKuliahAssignment.mataKuliah}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Ditugaskan: {formatDate(mataKuliahAssignment.assignedAt)}
                        </span>
                        {mataKuliahAssignment.deadline && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Clock className="h-4 w-4" />
                            Deadline: {formatDate(mataKuliahAssignment.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700">CPL yang terkait :</h4>
                    <div className="flex flex-wrap gap-2">
                      {mataKuliahAssignment.cpls.length > 0 ? (
                        mataKuliahAssignment.cpls.map((cpl) => (
                          <Badge key={cpl.id} variant="outline" className="text-blue-600 border-blue-300">
                            {cpl.cplKode}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-300">
                          Belum ada CPL (akan ditentukan)
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      {mataKuliahAssignment.overallStatus === 'assigned' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              // 1. coba pakai CPL kalau ada
                              let target: CPLAssignment | undefined

                              if (mataKuliahAssignment.cpls.length > 0) {
                                const firstCpl = mataKuliahAssignment.cpls[0]
                                const pending = firstCpl.assignments.filter(a => a.status === 'assigned')
                                if (pending.length > 0) {
                                  target = assignments.find(a => a.id === pending[0].id)
                                }
                              }

                              // 2. fallback: cari assignment by mata kuliah
                              if (!target) {
                                target = findAssignmentByCourseAndStatus(
                                  mataKuliahAssignment.mataKuliahId,
                                  "assigned"
                                )
                              }

                              if (target) {
                                openActionDialog(target, 'accept')
                              } else {
                                alert("Tugas untuk mata kuliah ini tidak ditemukan.")
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              let target: CPLAssignment | undefined

                              if (mataKuliahAssignment.cpls.length > 0) {
                                const firstCpl = mataKuliahAssignment.cpls[0]
                                const pending = firstCpl.assignments.filter(a => a.status === 'assigned')
                                if (pending.length > 0) {
                                  target = assignments.find(a => a.id === pending[0].id)
                                }
                              }

                              if (!target) {
                                target = findAssignmentByCourseAndStatus(
                                  mataKuliahAssignment.mataKuliahId,
                                  "assigned"
                                )
                              }

                              if (target) {
                                openActionDialog(target, 'reject')
                              } else {
                                alert("Tugas untuk mata kuliah ini tidak ditemukan.")
                              }
                            }}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </>
                      )}

                      {mataKuliahAssignment.overallStatus === 'accepted' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const accepted = findAssignmentByCourseAndStatus(
                              mataKuliahAssignment.mataKuliahId,
                              "accepted"
                            )
                            if (accepted) {
                              handleRedirectToRPS(accepted)
                            } else {
                              alert("Tugas yang sudah diterima tidak ditemukan.")
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Buat RPS
                        </Button>
                      )}

                      {mataKuliahAssignment.overallStatus === 'done' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const accepted = findAssignmentByCourseAndStatus(
                              mataKuliahAssignment.mataKuliahId,
                              "accepted"
                            )
                            if (accepted) {
                              openActionDialog(accepted, 'complete')
                            } else {
                              const anyAssigned = findAssignmentByCourseAndStatus(
                                mataKuliahAssignment.mataKuliahId,
                                "assigned"
                              )
                              if (anyAssigned) {
                                openActionDialog(anyAssigned, 'complete')
                              } else {
                                alert("Tidak ada tugas yang bisa ditandai selesai.")
                              }
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selesai
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
