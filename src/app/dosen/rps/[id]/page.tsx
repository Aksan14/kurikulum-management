"use client"

import React, { useState, useEffect, useCallback } from "react"
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
  Send,
  Loader2
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { rpsService, cplService, RPS } from "@/lib/api"
import { formatDate } from "@/lib/utils"

interface CPLData {
  id: string
  kode: string
  deskripsi: string
  kategori?: string
}

export default function DosenRPSDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rpsId = params.id as string
  
  const [rps, setRps] = useState<RPS | null>(null)
  const [cpls, setCpls] = useState<CPLData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [rpsResponse, cplResponse] = await Promise.all([
        rpsService.getById(rpsId),
        cplService.getAll({ limit: 100 })
      ])

      if (rpsResponse.data) {
        setRps(rpsResponse.data)
      }

      if (cplResponse.data) {
        const cplData = Array.isArray(cplResponse.data) 
          ? cplResponse.data 
          : cplResponse.data.data || []
        setCpls(cplData)
      }
    } catch (err) {
      console.error("Error fetching RPS detail:", err)
      setError("Gagal memuat detail RPS")
    } finally {
      setLoading(false)
    }
  }, [rpsId])

  useEffect(() => {
    if (rpsId) {
      fetchData()
    }
  }, [rpsId, fetchData])

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
    try {
      setIsSubmitting(true)
      await rpsService.submit(rpsId)
      await fetchData()
      setShowSubmitDialog(false)
    } catch (err) {
      console.error("Error submitting RPS:", err)
      setError("Gagal mengajukan RPS untuk review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCPLById = (cplId: string): CPLData | undefined => {
    return cpls.find(c => c.id === cplId)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !rps) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg text-gray-600">{error || "RPS tidak ditemukan"}</p>
          <Button onClick={() => router.push("/dosen/rps")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar RPS
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const cpmkList = rps.cpmk || []
  const pertemuanList = rps.rencana_pembelajaran || []
  const bahanBacaanList = rps.bahan_bacaan || []
  const bobotNilai = rps.bobot_nilai || { tugas: 0, uts: 0, uas: 0, kehadiran: 0, praktikum: 0 }

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
              <h1 className="text-2xl font-bold text-gray-900">{rps.mata_kuliah_nama}</h1>
              {getStatusBadge(rps.status)}
            </div>
            <p className="text-gray-600">Kode: {rps.kode_mk} • {rps.sks} SKS • Semester {rps.semester}</p>
            {rps.review_notes && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Catatan Review:</strong> {rps.review_notes}
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
                  <p className="font-medium text-gray-900">{rps.dosen_nama}</p>
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
                  <p className="font-medium text-gray-900">{rps.tahun_akademik}</p>
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
                  <p className="font-medium text-gray-900">{formatDate(rps.updated_at)}</p>
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
                    {rps.deskripsi || rps.deskripsi_mk || "Belum ada deskripsi"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tujuan Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {rps.tujuan || rps.capaian_pembelajaran || "Belum ada tujuan"}
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
                  {(rps.metode || rps.metode_pembelajaran || []).length > 0 ? (
                    (rps.metode || rps.metode_pembelajaran || []).map((m, idx) => (
                      <Badge key={idx} variant="outline" className="py-1.5">{m}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">Belum ada metode pembelajaran</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {bahanBacaanList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Referensi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {bahanBacaanList.map((bahan, idx) => (
                      <li key={bahan.id} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded text-sm flex items-center justify-center font-medium">{idx + 1}</span>
                        <span className="text-gray-600">
                          {bahan.penulis && `${bahan.penulis} `}
                          {bahan.tahun && `(${bahan.tahun}). `}
                          {bahan.judul}.
                        </span>
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
                  const relatedCPLs = (cpmk.cpl_ids || []).map(id => getCPLById(id)).filter(Boolean)
                  return (
                    <div key={cpmk.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">{cpmk.kode}</Badge>
                            {relatedCPLs.map((cpl) => cpl && (
                              <Badge key={cpl.id} variant="outline" className="text-xs">
                                → {cpl.kode}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-gray-700">{cpmk.deskripsi}</p>
                          {relatedCPLs.length > 0 && (
                            <div className="space-y-1">
                              {relatedCPLs.map((cpl) => cpl && (
                                <p key={cpl.id} className="text-sm text-gray-500">
                                  <span className="font-medium">{cpl.kode}:</span> {cpl.deskripsi.slice(0, 100)}...
                                </p>
                              ))}
                            </div>
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
                    key={pertemuan.id}
                    className={`
                      border rounded-lg overflow-hidden transition-all
                      ${pertemuan.pertemuan === 8 || pertemuan.pertemuan === 16 ? "border-green-300 bg-green-50" : ""}
                    `}
                  >
                    <button
                      onClick={() => setExpandedWeek(expandedWeek === pertemuan.pertemuan ? null : pertemuan.pertemuan)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                          ${pertemuan.pertemuan === 8 || pertemuan.pertemuan === 16
                            ? "bg-green-600 text-white" 
                            : "bg-gray-100 text-gray-700"
                          }
                        `}>
                          {pertemuan.pertemuan}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{pertemuan.topik || pertemuan.materi || `Pertemuan ${pertemuan.pertemuan}`}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {(pertemuan.cpmk_ids || []).map(c => (
                              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {pertemuan.bobot_nilai && (
                          <Badge variant="outline">{pertemuan.bobot_nilai}%</Badge>
                        )}
                        {expandedWeek === pertemuan.pertemuan 
                          ? <ChevronUp className="h-4 w-4 text-gray-400" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                    </button>
                    {expandedWeek === pertemuan.pertemuan && (
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <div className="grid gap-4 md:grid-cols-3 pt-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Metode Pembelajaran</p>
                            <p className="text-gray-900">{pertemuan.metode || pertemuan.metode_pembelajaran || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Indikator</p>
                            <p className="text-gray-900">{pertemuan.indikator || pertemuan.kemampuan_akhir || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Bobot Penilaian</p>
                            <p className="text-gray-900">{pertemuan.bobot_nilai || 0}% dari total nilai</p>
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
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${bobotNilai.tugas}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-green-600">{bobotNilai.tugas}%</div>
                  </div>
                  {bobotNilai.praktikum !== undefined && bobotNilai.praktikum > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700">Praktikum</div>
                      <div className="flex-1">
                        <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${bobotNilai.praktikum}%` }} />
                        </div>
                      </div>
                      <div className="w-12 text-right font-bold text-blue-600">{bobotNilai.praktikum}%</div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">UTS</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${bobotNilai.uts}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-purple-600">{bobotNilai.uts}%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">UAS</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${bobotNilai.uas}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-orange-600">{bobotNilai.uas}%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">Kehadiran</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-500 rounded-full" style={{ width: `${bobotNilai.kehadiran}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right font-bold text-gray-600">{bobotNilai.kehadiran}%</div>
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
