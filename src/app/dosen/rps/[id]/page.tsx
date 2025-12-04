"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  User,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Printer,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Layers,
  Send
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockRPS, mockUsers, mockCPLs } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"

export default function DosenRPSDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rpsId = params.id as string
  
  const rps = mockRPS.find(r => r.id === rpsId) || mockRPS[0]
  const dosen = mockUsers.find(u => u.id === rps.dosenId)
  
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700">Menunggu Review</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Disetujui</Badge>
      case "revision":
        return <Badge className="bg-orange-100 text-orange-700">Perlu Revisi</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setShowSubmitDialog(false)
  }

  // Mock CPMK data
  const cpmkList = [
    { id: "cpmk-1", kode: "CPMK-1", deskripsi: "Mahasiswa mampu menjelaskan konsep dasar database dan model data relasional", cplId: "1" },
    { id: "cpmk-2", kode: "CPMK-2", deskripsi: "Mahasiswa mampu merancang skema database menggunakan ERD dan normalisasi", cplId: "2" },
    { id: "cpmk-3", kode: "CPMK-3", deskripsi: "Mahasiswa mampu mengimplementasikan query SQL untuk manipulasi data", cplId: "3" },
    { id: "cpmk-4", kode: "CPMK-4", deskripsi: "Mahasiswa mampu menerapkan konsep transaction dan concurrency control", cplId: "3" }
  ]

  // Mock pertemuan data
  const pertemuanList = [
    { minggu: 1, topik: "Pengantar Sistem Basis Data", cpmk: ["CPMK-1"], metode: "Ceramah, Diskusi", bobot: 5 },
    { minggu: 2, topik: "Model Data Relasional", cpmk: ["CPMK-1"], metode: "Ceramah, Latihan", bobot: 5 },
    { minggu: 3, topik: "Entity Relationship Diagram (ERD)", cpmk: ["CPMK-2"], metode: "Ceramah, Praktikum", bobot: 7 },
    { minggu: 4, topik: "Normalisasi Database", cpmk: ["CPMK-2"], metode: "Ceramah, Praktikum", bobot: 8 },
    { minggu: 5, topik: "SQL: Data Definition Language", cpmk: ["CPMK-3"], metode: "Praktikum", bobot: 7 },
    { minggu: 6, topik: "SQL: Data Manipulation Language", cpmk: ["CPMK-3"], metode: "Praktikum", bobot: 8 },
    { minggu: 7, topik: "SQL: Query Lanjutan", cpmk: ["CPMK-3"], metode: "Praktikum", bobot: 10 },
    { minggu: 8, topik: "Ujian Tengah Semester", cpmk: ["CPMK-1", "CPMK-2", "CPMK-3"], metode: "Ujian", bobot: 20 },
  ]

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
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{rps.mataKuliahNama}</h1>
              {getStatusBadge(rps.status)}
            </div>
            <p className="text-gray-600">Kode: {rps.kodeMK} • {rps.sks} SKS • Semester {rps.semester}</p>
            {rps.reviewNotes && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Catatan Review:</strong> {rps.reviewNotes}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {rps.status === "draft" || rps.status === "rejected" ? (
              <>
                <Button variant="outline" size="sm" onClick={() => router.push(`/dosen/rps/edit/${rps.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit RPS
                </Button>
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Ajukan Review
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* Meta Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dosen Pengampu</p>
                  <p className="font-medium text-gray-900">{dosen?.nama || rps.dosenNama}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tahun Akademik</p>
                  <p className="font-medium text-gray-900">{rps.tahunAkademik}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Terakhir Update</p>
                  <p className="font-medium text-gray-900">{formatDate(rps.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total CPMK</p>
                  <p className="font-medium text-gray-900">{cpmkList.length} CPMK</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="cpmk" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Target className="h-4 w-4 mr-2" />
              CPMK & CPL
            </TabsTrigger>
            <TabsTrigger value="pertemuan" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <ClipboardList className="h-4 w-4 mr-2" />
              Rencana Pertemuan
            </TabsTrigger>
            <TabsTrigger value="penilaian" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Layers className="h-4 w-4 mr-2" />
              Komponen Penilaian
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deskripsi Mata Kuliah</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {rps.deskripsi}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tujuan Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {rps.tujuan}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metode Pembelajaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {rps.metode.map((m, idx) => (
                    <Badge key={idx} variant="outline" className="py-1.5">{m}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {rps.bahanBacaan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Referensi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {rps.bahanBacaan.map((bahan, idx) => (
                      <li key={bahan.id} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded text-sm flex items-center justify-center font-medium">{idx + 1}</span>
                        <span className="text-gray-600">{bahan.penulis} ({bahan.tahun}). {bahan.judul}.</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CPMK Tab */}
          <TabsContent value="cpmk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                <CardDescription>Daftar CPMK dan mapping ke CPL Program Studi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cpmkList.map((cpmk) => {
                  const relatedCPL = mockCPLs.find(c => c.id === cpmk.cplId)
                  return (
                    <div key={cpmk.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">{cpmk.kode}</Badge>
                            {relatedCPL && (
                              <Badge variant="outline" className="text-xs">
                                → {relatedCPL.kode}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700">{cpmk.deskripsi}</p>
                          {relatedCPL && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">CPL Terkait:</span> {relatedCPL.deskripsi.slice(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pertemuan Tab */}
          <TabsContent value="pertemuan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rencana Pembelajaran Semester</CardTitle>
                <CardDescription>Detail kegiatan setiap pertemuan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pertemuanList.map((pertemuan) => (
                  <div 
                    key={pertemuan.minggu}
                    className={`
                      border rounded-lg overflow-hidden transition-all
                      ${pertemuan.minggu === 8 ? "border-green-300 bg-green-50" : ""}
                    `}
                  >
                    <button
                      onClick={() => setExpandedWeek(expandedWeek === pertemuan.minggu ? null : pertemuan.minggu)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                          ${pertemuan.minggu === 8 
                            ? "bg-green-600 text-white" 
                            : "bg-gray-100 text-gray-700"
                          }
                        `}>
                          {pertemuan.minggu}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{pertemuan.topik}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {pertemuan.cpmk.map(c => (
                              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{pertemuan.bobot}%</Badge>
                        {expandedWeek === pertemuan.minggu 
                          ? <ChevronUp className="h-4 w-4 text-gray-400" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                    </button>
                    {expandedWeek === pertemuan.minggu && (
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <div className="grid gap-4 md:grid-cols-3 pt-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Metode Pembelajaran</p>
                            <p className="text-gray-900">{pertemuan.metode}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Indikator</p>
                            <p className="text-gray-900">Mahasiswa mampu memahami dan menerapkan {pertemuan.topik.toLowerCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Bobot Penilaian</p>
                            <p className="text-gray-900">{pertemuan.bobot}% dari total nilai</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Penilaian Tab */}
          <TabsContent value="penilaian" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Komponen Penilaian</CardTitle>
                <CardDescription>Distribusi bobot penilaian mata kuliah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">Tugas</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${rps.bobotNilai.tugas}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-green-600">{rps.bobotNilai.tugas}%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">Praktikum</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rps.bobotNilai.praktikum}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-blue-600">{rps.bobotNilai.praktikum}%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">UTS</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${rps.bobotNilai.uts}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-purple-600">{rps.bobotNilai.uts}%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">UAS</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${rps.bobotNilai.uas}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-orange-600">{rps.bobotNilai.uas}%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">Kehadiran</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-500 rounded-full" style={{ width: `${rps.bobotNilai.kehadiran}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-gray-600">{rps.bobotNilai.kehadiran}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan RPS untuk Review</DialogTitle>
            <DialogDescription>
              RPS akan diajukan ke Kaprodi untuk direview. Pastikan semua data sudah lengkap dan benar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Checklist sebelum mengajukan:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Deskripsi mata kuliah lengkap</li>
                <li>✓ CPMK sudah dipetakan ke CPL</li>
                <li>✓ Rencana pertemuan 14 minggu</li>
                <li>✓ Komponen penilaian total 100%</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Ajukan Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
