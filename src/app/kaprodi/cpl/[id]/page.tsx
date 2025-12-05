"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Target,
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  Edit,
  Trash2,
  FileText,
  Users,
  Link2,
  AlertCircle,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate, getInitials } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { cplService, CPL as ApiCPL } from "@/lib/api/cpl"
import { cplAssignmentService } from "@/lib/api/cpl-assignment"
import { rpsService } from "@/lib/api/rps"

// Local CPL type for display
interface DisplayCPL {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface DisplayAssignment {
  id: string;
  cplId: string;
  dosenId: string;
  dosenName: string;
  mataKuliah: string;
  status: string;
  assignedAt: string;
}

interface DisplayRPS {
  id: string;
  mataKuliahNama: string;
  dosenNama: string;
  status: string;
  kodeMK?: string;
  sks?: number;
  semester?: number;
}

export default function CPLDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: authUser } = useAuth()
  const cplId = params.id as string
  
  // State
  const [cpl, setCpl] = useState<DisplayCPL | null>(null)
  const [relatedAssignments, setRelatedAssignments] = useState<DisplayAssignment[]>([])
  const [relatedRPS, setRelatedRPS] = useState<DisplayRPS[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch CPL data
  useEffect(() => {
    const fetchCPL = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await cplService.getById(cplId)
        if (response.success && response.data) {
          setCpl({
            id: response.data.id,
            kode: response.data.kode,
            nama: response.data.nama,
            deskripsi: response.data.deskripsi,
            status: response.data.status,
            version: response.data.version,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at
          })
          
          // Fetch related assignments
          try {
            const assignmentsResponse = await cplAssignmentService.getAll({ cpl_id: cplId })
            if (assignmentsResponse.success && assignmentsResponse.data && assignmentsResponse.data.data) {
              setRelatedAssignments(assignmentsResponse.data.data.map(a => ({
                id: a.id,
                cplId: a.cpl_id,
                dosenId: a.dosen_id,
                dosenName: a.dosen?.nama || 'Unknown',
                mataKuliah: a.mata_kuliah || '',
                status: a.status,
                assignedAt: a.assigned_at
              })))
            } else {
              setRelatedAssignments([])
            }
          } catch (err) {
            console.error('Error fetching assignments:', err)
            setRelatedAssignments([])
          }
          
          // Fetch related RPS
          try {
            const rpsResponse = await rpsService.getAll({ limit: 10 })
            if (rpsResponse.success && rpsResponse.data && rpsResponse.data.data) {
              setRelatedRPS(rpsResponse.data.data.slice(0, 5).map(r => ({
                id: r.id,
                mataKuliahNama: r.mata_kuliah_nama,
                dosenNama: r.dosen_nama,
                status: r.status,
                kodeMK: r.kode_mk,
                sks: r.sks,
                semester: r.semester
              })))
            } else {
              setRelatedRPS([])
            }
          } catch (err) {
            console.error('Error fetching RPS:', err)
            setRelatedRPS([])
          }
        } else {
          setError('CPL tidak ditemukan')
        }
      } catch (err) {
        console.error('Error fetching CPL:', err)
        setError('Gagal memuat data CPL. Pastikan server API berjalan.')
      } finally {
        setLoading(false)
      }
    }

    if (cplId) {
      fetchCPL()
    }
  }, [cplId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>
      case "archived":
        return <Badge className="bg-yellow-100 text-yellow-700">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handlePublish = async () => {
    if (!cpl) return
    setIsProcessing(true)
    try {
      const response = await cplService.updateStatus(cpl.id, 'published')
      if (response.success && response.data) {
        setCpl({
          ...cpl,
          status: 'published'
        })
      }
    } catch (err) {
      console.error('Error publishing CPL:', err)
    } finally {
      setIsProcessing(false)
      setShowPublishDialog(false)
    }
  }

  const handleDelete = async () => {
    if (!cpl) return
    setIsProcessing(true)
    try {
      const response = await cplService.delete(cpl.id)
      if (response.success) {
        router.push("/kaprodi/cpl")
      }
    } catch (err) {
      console.error('Error deleting CPL:', err)
    } finally {
      setIsProcessing(false)
      setShowDeleteDialog(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    )
  }

  // Error or not found
  if (error || !cpl) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{error || 'CPL tidak ditemukan'}</h3>
          <Button className="mt-4" onClick={() => router.push('/kaprodi/cpl')}>
            Kembali ke Daftar CPL
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* Title Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white text-lg px-3 py-1">{cpl.kode}</Badge>
                  {getStatusBadge(cpl.status)}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{cpl.nama}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Versi {cpl.version}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {cpl.status === "draft" && (
              <Button 
                variant="outline" 
                className="text-green-600 hover:bg-green-50"
                onClick={() => setShowPublishDialog(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push(`/kaprodi/cpl/edit/${cpl.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 hover:bg-red-50"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        {/* Meta Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dibuat</p>
                  <p className="font-medium text-gray-900">{formatDate(cpl.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Terakhir Update</p>
                  <p className="font-medium text-gray-900">{formatDate(cpl.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Penugasan</p>
                  <p className="font-medium text-gray-900">{relatedAssignments.length} Dosen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Link2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Terkait RPS</p>
                  <p className="font-medium text-gray-900">{relatedRPS.length} RPS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Users className="h-4 w-4 mr-2" />
              Penugasan
            </TabsTrigger>
            <TabsTrigger value="rps" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              RPS Terkait
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deskripsi CPL</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {cpl.deskripsi}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Detail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Kode CPL</span>
                    <span className="font-medium">{cpl.kode}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Nama</span>
                    <span className="font-medium">{cpl.nama}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Status</span>
                    {getStatusBadge(cpl.status)}
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Versi</span>
                    <span className="font-medium">{cpl.version}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Mata Kuliah Terkait</span>
                      <span className="text-2xl font-bold text-blue-700">{relatedRPS.length}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700">Dosen Ditugaskan</span>
                      <span className="text-2xl font-bold text-green-700">{relatedAssignments.length}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700">CPMK Terkait</span>
                      <span className="text-2xl font-bold text-purple-700">
                        {relatedAssignments.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Daftar Penugasan</CardTitle>
                  <CardDescription>Dosen yang ditugaskan untuk CPL ini</CardDescription>
                </div>
                <Button size="sm" onClick={() => router.push("/kaprodi/assignment")}>
                  <Users className="h-4 w-4 mr-2" />
                  Kelola Penugasan
                </Button>
              </CardHeader>
              <CardContent>
                {relatedAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {relatedAssignments.map((assignment) => {
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getInitials(assignment.dosenName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{assignment.dosenName}</p>
                              <p className="text-sm text-gray-500">{assignment.mataKuliah}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              className={
                                assignment.status === "accepted" ? "bg-green-100 text-green-700" :
                                assignment.status === "done" ? "bg-blue-100 text-blue-700" :
                                "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {assignment.status === "accepted" ? "Diterima" :
                               assignment.status === "done" ? "Selesai" : "Menunggu"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(assignment.assignedAt)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Penugasan</h3>
                    <p className="text-gray-500 mb-4">CPL ini belum ditugaskan ke dosen manapun</p>
                    <Button onClick={() => router.push("/kaprodi/assignment")}>
                      Tambah Penugasan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RPS Tab */}
          <TabsContent value="rps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">RPS yang Mengacu CPL Ini</CardTitle>
                <CardDescription>Daftar RPS yang memiliki CPMK terkait dengan CPL {cpl.kode}</CardDescription>
              </CardHeader>
              <CardContent>
                {relatedRPS.length > 0 ? (
                  <div className="space-y-3">
                    {relatedRPS.map((rps) => (
                      <div 
                        key={rps.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => router.push(`/kaprodi/rps/${rps.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{rps.mataKuliahNama}</p>
                            <p className="text-sm text-gray-500">{rps.kodeMK || ''} {rps.sks ? `• ${rps.sks} SKS` : ''} {rps.semester ? `• Semester ${rps.semester}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={
                              rps.status === "approved" ? "bg-green-100 text-green-700" :
                              rps.status === "submitted" ? "bg-blue-100 text-blue-700" :
                              rps.status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                            }
                          >
                            {rps.status === "approved" ? "Disetujui" :
                             rps.status === "submitted" ? "Menunggu Review" :
                             rps.status === "rejected" ? "Ditolak" : "Draft"}
                          </Badge>
                          <span className="text-sm text-gray-500">{rps.dosenNama}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada RPS Terkait</h3>
                    <p className="text-gray-500">Belum ada RPS yang mengacu ke CPL ini</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish CPL</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mempublish CPL ini? CPL yang sudah dipublish dapat digunakan oleh dosen untuk mapping CPMK.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900">{cpl.kode} - {cpl.nama}</p>
              <p className="text-sm text-blue-700 mt-1">{cpl.deskripsi.slice(0, 100)}...</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePublish}
              disabled={isProcessing}
            >
              {isProcessing ? "Memproses..." : "Publish CPL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Hapus CPL
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus CPL ini? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi semua RPS yang terkait.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="font-medium text-red-900">{cpl.kode} - {cpl.nama}</p>
              <p className="text-sm text-red-700 mt-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                {relatedRPS.length} RPS akan kehilangan mapping ke CPL ini
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Menghapus..." : "Ya, Hapus CPL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
