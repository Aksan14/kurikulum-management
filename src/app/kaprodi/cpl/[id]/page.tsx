"use client"

import React, { useState } from "react"
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
  MoreHorizontal
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockCPLs, mockAssignments, mockRPS, mockUsers } from "@/lib/mock-data"
import { formatDate, getInitials } from "@/lib/utils"

export default function CPLDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cplId = params.id as string
  
  const cpl = mockCPLs.find(c => c.id === cplId) || mockCPLs[0]
  
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get related assignments and RPS
  const relatedAssignments = mockAssignments.filter(a => a.cplId === cpl.id)
  const relatedRPS = mockRPS.filter(rps => 
    rps.cpmk.some(cpmk => cpmk.cplIds.includes(cpl.id))
  )

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

  const getAspekBadge = (aspek: string) => {
    switch (aspek) {
      case "pengetahuan":
        return <Badge className="bg-blue-100 text-blue-700">Pengetahuan</Badge>
      case "keterampilan_umum":
        return <Badge className="bg-green-100 text-green-700">Keterampilan Umum</Badge>
      case "keterampilan_khusus":
        return <Badge className="bg-purple-100 text-purple-700">Keterampilan Khusus</Badge>
      case "sikap":
        return <Badge className="bg-orange-100 text-orange-700">Sikap</Badge>
      default:
        return <Badge variant="outline">{aspek}</Badge>
    }
  }

  const handlePublish = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setShowPublishDialog(false)
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setShowDeleteDialog(false)
    router.push("/kaprodi/cpl")
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
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{cpl.judul}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {getAspekBadge(cpl.aspek)}
              <span>•</span>
              <span>{cpl.kategori}</span>
              <span>•</span>
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
                    <span className="text-gray-500">Aspek</span>
                    {getAspekBadge(cpl.aspek)}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Kategori</span>
                    <span className="font-medium">{cpl.kategori}</span>
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
                        {relatedRPS.reduce((acc, rps) => acc + rps.cpmk.filter(c => c.cplIds.includes(cpl.id)).length, 0)}
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
                      const dosen = mockUsers.find(u => u.id === assignment.dosenId)
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
                            <p className="text-sm text-gray-500">{rps.kodeMK} • {rps.sks} SKS • Semester {rps.semester}</p>
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
              <p className="font-medium text-blue-900">{cpl.kode} - {cpl.judul}</p>
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
              <p className="font-medium text-red-900">{cpl.kode} - {cpl.judul}</p>
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
