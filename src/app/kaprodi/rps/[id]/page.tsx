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
  XCircle,
  AlertCircle,
  MessageSquare,
  Download,
  Edit,
  Printer,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  ClipboardList,
  Layers
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockRPS, mockUsers, mockCPLs } from "@/lib/mock-data"
import { formatDate, getInitials } from "@/lib/utils"

export default function RPSDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rpsId = params.id as string
  
  const rps = mockRPS.find(r => r.id === rpsId) || mockRPS[0]
  const dosen = mockUsers.find(u => u.id === rps.dosenId)
  
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [comment, setComment] = useState("")
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

  const handleApprove = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setShowApproveDialog(false)
    // In real app, update RPS status
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setShowRejectDialog(false)
    // In real app, update RPS status
  }

  // Mock CPMK data
  const cpmkList = [
    { id: "cpmk-1", kode: "CPMK-1", deskripsi: "Mahasiswa mampu menjelaskan konsep dasar database dan model data relasional", cplId: "cpl-1" },
    { id: "cpmk-2", kode: "CPMK-2", deskripsi: "Mahasiswa mampu merancang skema database menggunakan ERD dan normalisasi", cplId: "cpl-2" },
    { id: "cpmk-3", kode: "CPMK-3", deskripsi: "Mahasiswa mampu mengimplementasikan query SQL untuk manipulasi data", cplId: "cpl-3" },
    { id: "cpmk-4", kode: "CPMK-4", deskripsi: "Mahasiswa mampu menerapkan konsep transaction dan concurrency control", cplId: "cpl-3" }
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
    { minggu: 9, topik: "Transaction Management", cpmk: ["CPMK-4"], metode: "Ceramah, Diskusi", bobot: 5 },
    { minggu: 10, topik: "Concurrency Control", cpmk: ["CPMK-4"], metode: "Ceramah, Praktikum", bobot: 5 },
    { minggu: 11, topik: "Database Recovery", cpmk: ["CPMK-4"], metode: "Ceramah", bobot: 5 },
    { minggu: 12, topik: "Database Security", cpmk: ["CPMK-4"], metode: "Ceramah, Diskusi", bobot: 5 },
    { minggu: 13, topik: "Indexing dan Optimization", cpmk: ["CPMK-3", "CPMK-4"], metode: "Praktikum", bobot: 5 },
    { minggu: 14, topik: "Review dan Persiapan UAS", cpmk: ["CPMK-1", "CPMK-2", "CPMK-3", "CPMK-4"], metode: "Diskusi", bobot: 5 },
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
            {rps.status === "submitted" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-orange-600 hover:bg-orange-50"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Minta Revisi
                </Button>
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowApproveDialog(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Setujui RPS
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Meta Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dosen Pengampu</p>
                  <p className="font-medium text-gray-900">{dosen?.nama || "Dr. Ahmad Fauzi"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
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
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="cpmk" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Target className="h-4 w-4 mr-2" />
              CPMK & CPL
            </TabsTrigger>
            <TabsTrigger value="pertemuan" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <ClipboardList className="h-4 w-4 mr-2" />
              Rencana Pertemuan
            </TabsTrigger>
            <TabsTrigger value="penilaian" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
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
                    Mata kuliah ini membahas konsep dasar sistem basis data, termasuk model data relasional, 
                    perancangan basis data menggunakan ERD, normalisasi, serta implementasi menggunakan SQL. 
                    Mahasiswa akan mempelajari teknik manipulasi data, transaction management, dan konsep 
                    keamanan database.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Capaian Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Setelah menyelesaikan mata kuliah ini, mahasiswa diharapkan mampu merancang dan 
                    mengimplementasikan sistem basis data relasional yang efisien, menerapkan teknik 
                    normalisasi, serta memahami konsep transaction dan keamanan database.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prasyarat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="py-1.5">Algoritma dan Pemrograman</Badge>
                  <Badge variant="outline" className="py-1.5">Struktur Data</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referensi</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded text-sm flex items-center justify-center font-medium">1</span>
                    <span className="text-gray-600">Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). Database System Concepts. McGraw-Hill.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded text-sm flex items-center justify-center font-medium">2</span>
                    <span className="text-gray-600">Elmasri, R., & Navathe, S. B. (2016). Fundamentals of Database Systems. Pearson.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded text-sm flex items-center justify-center font-medium">3</span>
                    <span className="text-gray-600">Connolly, T., & Begg, C. (2015). Database Systems: A Practical Approach to Design, Implementation, and Management. Pearson.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CPMK Tab */}
          <TabsContent value="cpmk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                <CardDescription>Daftar CPMK dan mapping ke CPL Program Studi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cpmkList.map((cpmk, index) => {
                  const relatedCPL = mockCPLs.find(c => c.id === cpmk.cplId)
                  return (
                    <div key={cpmk.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700">{cpmk.kode}</Badge>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Matrix CPL-CPMK</CardTitle>
                <CardDescription>Visualisasi mapping antara CPMK dengan CPL</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-3 bg-gray-100 text-left font-medium">CPMK</th>
                        {mockCPLs.slice(0, 5).map(cpl => (
                          <th key={cpl.id} className="border p-3 bg-gray-100 text-center font-medium text-sm">
                            {cpl.kode}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cpmkList.map((cpmk, idx) => (
                        <tr key={cpmk.id}>
                          <td className="border p-3 font-medium">{cpmk.kode}</td>
                          {mockCPLs.slice(0, 5).map(cpl => (
                            <td key={cpl.id} className="border p-3 text-center">
                              {cpmk.cplId === cpl.id && (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                      ${pertemuan.minggu === 8 ? "border-blue-300 bg-blue-50" : ""}
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
                            ? "bg-blue-600 text-white" 
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
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-blue-600">20%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">Praktikum</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "25%" }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-green-600">25%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">UTS</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "25%" }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-purple-600">25%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">UAS</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: "30%" }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-orange-600">30%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rubrik Penilaian</CardTitle>
                <CardDescription>Kriteria penilaian untuk setiap komponen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-3 bg-gray-100 text-left">Kriteria</th>
                        <th className="border p-3 bg-green-50 text-center">A (85-100)</th>
                        <th className="border p-3 bg-blue-50 text-center">B (70-84)</th>
                        <th className="border p-3 bg-yellow-50 text-center">C (55-69)</th>
                        <th className="border p-3 bg-red-50 text-center">D (&lt;55)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-3 font-medium">Pemahaman Konsep</td>
                        <td className="border p-3 text-sm text-center">Sangat memahami</td>
                        <td className="border p-3 text-sm text-center">Memahami dengan baik</td>
                        <td className="border p-3 text-sm text-center">Cukup memahami</td>
                        <td className="border p-3 text-sm text-center">Kurang memahami</td>
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium">Implementasi</td>
                        <td className="border p-3 text-sm text-center">Sangat tepat & efisien</td>
                        <td className="border p-3 text-sm text-center">Tepat</td>
                        <td className="border p-3 text-sm text-center">Cukup tepat</td>
                        <td className="border p-3 text-sm text-center">Kurang tepat</td>
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium">Presentasi</td>
                        <td className="border p-3 text-sm text-center">Sangat jelas & menarik</td>
                        <td className="border p-3 text-sm text-center">Jelas</td>
                        <td className="border p-3 text-sm text-center">Cukup jelas</td>
                        <td className="border p-3 text-sm text-center">Kurang jelas</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui RPS</DialogTitle>
            <DialogDescription>
              RPS akan disetujui dan dapat digunakan untuk semester ini.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Tambahkan catatan (opsional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Setujui RPS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minta Revisi RPS</DialogTitle>
            <DialogDescription>
              Berikan catatan untuk dosen agar dapat merevisi RPS.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Tuliskan catatan revisi yang diperlukan..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleReject}
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? "Memproses..." : "Kirim Permintaan Revisi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
