"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { rpsService, cplService, mataKuliahService, authService } from "@/lib/api"
import { cplMKMappingService } from "@/lib/api/cpl-mk-mapping"
import type { CPL } from "@/lib/api/cpl"
import type { MataKuliah } from "@/lib/api/mata-kuliah"
import type { RPS } from "@/lib/api/rps"
import { DownloadRPSButton } from "@/components/rps"
import Link from "next/link"

interface CPMKForm {
  id?: string
  kode: string
  deskripsi: string
  cpl_ids: string[]
}

interface SubCPMKForm {
  id?: string
  kode: string
  deskripsi: string
  urutan: number
}

interface RencanaPembelajaranForm {
  id?: string
  minggu_ke: number
  sub_cpmk_id: string
  topik: string
  sub_topik: string[]
  metode_pembelajaran: string
  waktu_menit: number
  teknik_kriteria: string
  bobot_persen: number
}

interface BahanBacaanForm {
  id?: string
  judul: string
  penulis: string
  tahun: number
  penerbit: string
  jenis: 'buku' | 'jurnal' | 'artikel' | 'website' | 'modul'
  isbn: string
  halaman: string
  url: string
  is_wajib: boolean
  urutan: number
}

interface RencanaTugasForm {
  id?: string
  nomor_tugas: number
  judul: string
  sub_cpmk_id: string
  indikator_keberhasilan: string
  batas_waktu_minggu: number
  petunjuk_pengerjaan: string
  jenis_tugas: 'individu' | 'kelompok'
  luaran_tugas: string
  kriteria_penilaian: string
  teknik_penilaian: string
  bobot: number
  daftar_rujukan: string
}

interface AnalisisKetercapaianForm {
  id?: string
  minggu_mulai: number
  minggu_selesai: number | null
  cpl_id: string
  cpmk_ids: string[]
  sub_cpmk_ids: string[]
  topik_materi: string
  jenis_assessment: string
  bobot_kontribusi: number
}


export default function DetailRPSPage() {
  const router = useRouter()
  const params = useParams()
  const rpsId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rpsData, setRpsData] = useState<RPS | null>(null)
  
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
  const [cplList, setCplList] = useState<CPL[]>([])
  const [relatedCplList, setRelatedCplList] = useState<CPL[]>([])
  const [activeTab, setActiveTab] = useState("info")
  
  const tabOrder = ["info", "cpmk", "subcpmk", "rencana", "tugas", "analisis", "pustaka"]
  
  const [formData, setFormData] = useState({
    mata_kuliah_id: "",
    tahun_ajaran: "2024/2025",
    semester_type: "ganjil" as 'ganjil' | 'genap',
    tanggal_penyusunan: new Date().toISOString().split('T')[0],
    penyusun_nama: "",
    penyusun_nidn: "",
    koordinator_rmk_nama: "",
    koordinator_rmk_nidn: "",
    kaprodi_nama: "",
    kaprodi_nidn: "",
    fakultas: "",
    program_studi: "",
    deskripsi_mk: "",
    capaian_pembelajaran: "",
    metode_pembelajaran: [] as string[],
    media_pembelajaran: [] as string[]
  })
  
  const [cpmkList, setCpmkList] = useState<CPMKForm[]>([])
  const [subCpmkList, setSubCpmkList] = useState<SubCPMKForm[][]>([[]])
  const [rencanaPembelajaran, setRencanaPembelajaran] = useState<RencanaPembelajaranForm[]>([])
  const [bahanBacaan, setBahanBacaan] = useState<BahanBacaanForm[]>([])
  const [rencanaTugas, setRencanaTugas] = useState<RencanaTugasForm[]>([])
  const [analisisKetercapaian, setAnalisisKetercapaian] = useState<AnalisisKetercapaianForm[]>([])
  
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)

  const fetchInitialData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    if (!rpsId) {
      setError('ID RPS tidak ditemukan')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const [rpsResponse, mkResponse, cplResponse] = await Promise.all([
        rpsService.getById(rpsId),
        mataKuliahService.getMy(),
        cplService.getActive()
      ])
      
      if (!rpsResponse.success || !rpsResponse.data) {
        setError('Gagal memuat data RPS: ' + (rpsResponse.message || 'Data tidak ditemukan'))
        setLoading(false)
        return
      }
      
      const rps = rpsResponse.data
      setRpsData(rps)
      
      setFormData({
        mata_kuliah_id: rps.mata_kuliah_id || "",
        tahun_ajaran: rps.tahun_ajaran || "2024/2025",
        semester_type: (rps.semester_type || "ganjil") as 'ganjil' | 'genap',
        tanggal_penyusunan: rps.tanggal_penyusunan ? new Date(rps.tanggal_penyusunan).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        penyusun_nama: rps.penyusun_nama || "",
        penyusun_nidn: rps.penyusun_nidn || "",
        koordinator_rmk_nama: rps.koordinator_rmk_nama || "",
        koordinator_rmk_nidn: rps.koordinator_rmk_nidn || "",
        kaprodi_nama: rps.kaprodi_nama || "",
        kaprodi_nidn: rps.kaprodi_nidn || "",
        fakultas: rps.fakultas || "",
        program_studi: rps.program_studi || "",
        deskripsi_mk: rps.deskripsi_mk || rps.deskripsi || "",
        capaian_pembelajaran: rps.capaian_pembelajaran || "",
        metode_pembelajaran: rps.metode_pembelajaran || [],
        media_pembelajaran: rps.media_pembelajaran || []
      })
      
      const loadedSubCpmkData: SubCPMKForm[][] = []
      if (rps.cpmk && rps.cpmk.length > 0) {
        const cpmkFormList: CPMKForm[] = rps.cpmk.map((c) => ({
          id: c.id,
          kode: c.kode,
          deskripsi: c.deskripsi,
          cpl_ids: c.cpl_ids || []
        }))
        setCpmkList(cpmkFormList)
        
        for (const cpmk of rps.cpmk) {
          try {
            const subCpmkResponse = await rpsService.subCpmk.getAll(cpmk.id)
            if (subCpmkResponse.data && Array.isArray(subCpmkResponse.data)) {
              loadedSubCpmkData.push(subCpmkResponse.data.map((s) => ({
                id: s.id,
                kode: s.kode || "",
                deskripsi: s.deskripsi || "",
                urutan: s.urutan || 1
              })))
            } else {
              loadedSubCpmkData.push([])
            }
          } catch {
            loadedSubCpmkData.push([])
          }
        }
        setSubCpmkList(loadedSubCpmkData)
      }
      
      try {
        const rpResponse = await rpsService.rencanaPembelajaran?.getAll(rpsId)
        if (rpResponse?.success && rpResponse.data && rpResponse.data.length > 0) {
          const rpList: RencanaPembelajaranForm[] = rpResponse.data.map((rp) => ({
            id: rp.id,
            minggu_ke: rp.minggu_ke || 1,
            sub_cpmk_id: rp.sub_cpmk_id || "",
            topik: rp.topik || "",
            sub_topik: rp.sub_topik || [],
            metode_pembelajaran: rp.metode_pembelajaran || "Tatap Muka: Ceramah, Diskusi",
            waktu_menit: rp.waktu_menit || 150,
            teknik_kriteria: rp.teknik_kriteria || "",
            bobot_persen: rp.bobot_persen || 0
          }))
          setRencanaPembelajaran(rpList)
        }
      } catch {
        // Ignore
      }
      
      try {
        const rencanaTugasResponse = await rpsService.rencanaTugas?.getAll(rpsId)
        if (rencanaTugasResponse?.success && rencanaTugasResponse.data && rencanaTugasResponse.data.length > 0) {
          const loadedRencanaTugas = rencanaTugasResponse.data.map((t) => ({
            id: t.id,
            nomor_tugas: t.nomor_tugas || 1,
            judul: t.judul || "",
            sub_cpmk_id: t.sub_cpmk_id || "",
            indikator_keberhasilan: t.indikator_keberhasilan || "",
            batas_waktu_minggu: t.batas_waktu_minggu || 4,
            petunjuk_pengerjaan: t.petunjuk_pengerjaan || "",
            jenis_tugas: (t.jenis_tugas?.toLowerCase() === 'kelompok' ? 'kelompok' : 'individu') as 'individu' | 'kelompok',
            luaran_tugas: t.luaran_tugas || "",
            kriteria_penilaian: t.kriteria_penilaian || "",
            teknik_penilaian: t.teknik_penilaian || "",
            bobot: t.bobot || 0,
            daftar_rujukan: Array.isArray(t.daftar_rujukan) ? t.daftar_rujukan.join(', ') : (t.daftar_rujukan || "")
          }))
          setRencanaTugas(loadedRencanaTugas)
        } else if (rps.rencana_tugas && rps.rencana_tugas.length > 0) {
          const loadedRencanaTugas = rps.rencana_tugas.map((t) => ({
            id: t.id,
            nomor_tugas: t.nomor_tugas || 1,
            judul: t.judul || "",
            sub_cpmk_id: t.sub_cpmk_id || "",
            indikator_keberhasilan: t.indikator_keberhasilan || "",
            batas_waktu_minggu: t.batas_waktu_minggu || 4,
            petunjuk_pengerjaan: t.petunjuk_pengerjaan || "",
            jenis_tugas: (t.jenis_tugas?.toLowerCase() === 'kelompok' ? 'kelompok' : 'individu') as 'individu' | 'kelompok',
            luaran_tugas: t.luaran_tugas || "",
            kriteria_penilaian: t.kriteria_penilaian || "",
            teknik_penilaian: t.teknik_penilaian || "",
            bobot: t.bobot || 0,
            daftar_rujukan: Array.isArray(t.daftar_rujukan) ? t.daftar_rujukan.join(', ') : (t.daftar_rujukan || "")
          }))
          setRencanaTugas(loadedRencanaTugas)
        }
      } catch {
        // Ignore
      }
      
      try {
        const analisisResponse = await rpsService.analisisKetercapaian?.getAll(rpsId)
        if (analisisResponse?.success && analisisResponse.data && analisisResponse.data.length > 0) {
          const loadedAnalisis = analisisResponse.data.map((a) => ({
            id: a.id,
            minggu_mulai: a.minggu_mulai || 1,
            minggu_selesai: a.minggu_selesai || null,
            cpl_id: a.cpl_id || "",
            cpmk_ids: a.cpmk_ids || [],
            sub_cpmk_ids: a.sub_cpmk_ids || [],
            topik_materi: a.topik_materi || "",
            jenis_assessment: a.jenis_assessment || "",
            bobot_kontribusi: a.bobot_kontribusi || 0
          }))
          setAnalisisKetercapaian(loadedAnalisis)
        } else if (rps.analisis_ketercapaian && rps.analisis_ketercapaian.length > 0) {
          const loadedAnalisis = rps.analisis_ketercapaian.map((a) => ({
            id: a.id,
            minggu_mulai: a.minggu_mulai || 1,
            minggu_selesai: a.minggu_selesai || null,
            cpl_id: a.cpl_id || "",
            cpmk_ids: a.cpmk_ids || [],
            sub_cpmk_ids: a.sub_cpmk_ids || [],
            topik_materi: a.topik_materi || "",
            jenis_assessment: a.jenis_assessment || "",
            bobot_kontribusi: a.bobot_kontribusi || 0
          }))
          setAnalisisKetercapaian(loadedAnalisis)
        }
      } catch {
        // Ignore
      }
      
      if (rps.bahan_bacaan && rps.bahan_bacaan.length > 0) {
        setBahanBacaan(rps.bahan_bacaan.map((b, idx) => ({
          id: b.id,
          judul: b.judul || "",
          penulis: b.penulis || "",
          tahun: b.tahun || new Date().getFullYear(),
          penerbit: b.penerbit || "",
          jenis: (b.jenis || 'buku') as 'buku' | 'jurnal' | 'artikel' | 'website' | 'modul',
          isbn: b.isbn || "",
          halaman: b.halaman || "",
          url: b.url || "",
          is_wajib: b.is_wajib !== undefined ? b.is_wajib : true,
          urutan: b.urutan || idx + 1
        })))
      }
      
      let mkData: MataKuliah[] = []
      if (mkResponse.data) {
        if (Array.isArray(mkResponse.data)) {
          mkData = mkResponse.data
        } else if (mkResponse.data.data && Array.isArray(mkResponse.data.data)) {
          mkData = mkResponse.data.data
        }
      }
      setMataKuliahList(mkData)
      
      let cplData: CPL[] = []
      if (cplResponse.data) {
        if (Array.isArray(cplResponse.data)) {
          cplData = cplResponse.data
        } else if ((cplResponse.data as { data?: CPL[] }).data && Array.isArray((cplResponse.data as { data?: CPL[] }).data)) {
          cplData = (cplResponse.data as { data: CPL[] }).data
        }
      }
      setCplList(cplData)
      
      if (rps.mata_kuliah_id) {
        try {
          const mappingResponse = await cplMKMappingService.getByMK(rps.mata_kuliah_id)
          if (mappingResponse.success && mappingResponse.data) {
            const responseData = mappingResponse.data as { data?: Array<{ cpl_id: string }> } | Array<{ cpl_id: string }>
            const mappings: Array<{ cpl_id: string }> = Array.isArray(responseData) 
              ? responseData 
              : (responseData.data || [])
            
            const relatedCplIds = mappings.map(m => m.cpl_id)
            const filteredCplList = cplData.filter(cpl => relatedCplIds.includes(cpl.id))
            setRelatedCplList(filteredCplList)
          } else {
            setRelatedCplList(cplData)
          }
        } catch {
          setRelatedCplList(cplData)
        }
      } else {
        setRelatedCplList(cplData)
      }
      
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [router, rpsId])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const getTabLabel = (tab: string): string => {
    const labels: Record<string, string> = {
      info: "Info Dasar",
      cpmk: "CPMK",
      subcpmk: "Sub-CPMK",
      rencana: "Rencana Pembelajaran",
      tugas: "Rencana Tugas",
      analisis: "Analisis",
      pustaka: "Pustaka"
    }
    return labels[tab] || tab
  }

  const selectedMK = mataKuliahList.find(mk => mk.id === formData.mata_kuliah_id)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600">Memuat data...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Detail RPS</h1>
              <p className="text-slate-600">
                {rpsData?.mata_kuliah_nama ? rpsData.mata_kuliah_nama + " - " + rpsData.tahun_ajaran : "RPS ID: " + rpsId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {rpsData?.status && (
              <span className={"px-3 py-1 rounded-full text-sm font-medium " + (
                rpsData.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                rpsData.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                rpsData.status === 'approved' ? 'bg-green-100 text-green-700' :
                'bg-slate-100 text-slate-700'
              )}>
                {rpsData.status === 'draft' ? 'Draft' :
                 rpsData.status === 'submitted' ? 'Menunggu Review' :
                 rpsData.status === 'approved' ? 'Disetujui' :
                 rpsData.status}
              </span>
            )}
            
            {rpsData && <DownloadRPSButton rpsId={rpsId} rpsData={rpsData} />}
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">Error</p>
                  <pre className="text-sm whitespace-pre-wrap">{error}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            {tabOrder.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {getTabLabel(tab)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar RPS</CardTitle>
                <CardDescription>Detail mata kuliah dan informasi dasar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mata Kuliah</Label>
                    <Select value={formData.mata_kuliah_id} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata kuliah" />
                      </SelectTrigger>
                      <SelectContent>
                        {mataKuliahList.map(mk => (
                          <SelectItem key={mk.id} value={mk.id}>
                            {mk.kode} - {mk.nama} ({mk.sks} SKS)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tahun Ajaran</Label>
                    <Input value={formData.tahun_ajaran} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input value={formData.semester_type === 'ganjil' ? 'Ganjil' : 'Genap'} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Penyusunan</Label>
                    <Input type="date" value={formData.tanggal_penyusunan} disabled />
                  </div>
                </div>

                {selectedMK && (
                  <Card className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold">{selectedMK.nama}</p>
                          <p className="text-sm text-slate-600">
                            {selectedMK.kode} - {selectedMK.sks} SKS - Semester {selectedMK.semester} - {selectedMK.jenis}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Informasi Penyusun & Pengesahan</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nama Penyusun</Label>
                      <Input value={formData.penyusun_nama} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>NIDN Penyusun</Label>
                      <Input value={formData.penyusun_nidn} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Koordinator RMK</Label>
                      <Input value={formData.koordinator_rmk_nama} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>NIDN Koordinator RMK</Label>
                      <Input value={formData.koordinator_rmk_nidn} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Kaprodi</Label>
                      <Input value={formData.kaprodi_nama} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>NIDN Kaprodi</Label>
                      <Input value={formData.kaprodi_nidn} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Fakultas</Label>
                      <Input value={formData.fakultas} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Program Studi</Label>
                      <Input value={formData.program_studi} disabled />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Deskripsi Mata Kuliah</Label>
                    <Textarea value={formData.deskripsi_mk} rows={4} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Capaian Pembelajaran</Label>
                    <Textarea value={formData.capaian_pembelajaran} rows={3} disabled />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Metode & Media Pembelajaran</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Metode Pembelajaran</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.metode_pembelajaran.length > 0 ? (
                          formData.metode_pembelajaran.map(metode => (
                            <Badge key={metode} variant="default">{metode}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">Tidak ada data</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Media Pembelajaran</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.media_pembelajaran.length > 0 ? (
                          formData.media_pembelajaran.map(media => (
                            <Badge key={media} variant="default">{media}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">Tidak ada data</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cpmk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                <CardDescription>Daftar CPMK dan hubungannya dengan CPL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cpmkList.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">Belum ada CPMK</p>
                )}
                
                {cpmkList.map((cpmk, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <Badge variant="outline">{cpmk.kode}</Badge>
                      
                      <div className="space-y-2">
                        <Label>Deskripsi CPMK</Label>
                        <Textarea value={cpmk.deskripsi} rows={2} disabled />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>CPL Terkait</Label>
                        <div className="flex flex-wrap gap-2">
                          {cpmk.cpl_ids.length > 0 ? (
                            cplList
                              .filter(cpl => cpmk.cpl_ids.includes(cpl.id))
                              .map(cpl => (
                                <Badge key={cpl.id} variant="default">{cpl.kode}</Badge>
                              ))
                          ) : (
                            <span className="text-sm text-slate-500">Tidak ada CPL terkait</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subcpmk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sub-CPMK per CPMK</CardTitle>
                <CardDescription>Daftar Sub-CPMK untuk setiap CPMK</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cpmkList.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">Tidak ada CPMK</p>
                )}
                {cpmkList.map((cpmk, cpmkIdx) => (
                  <Card key={cpmkIdx} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Badge variant="outline" className="mb-2">{cpmk.kode}</Badge>
                        <p className="text-sm text-slate-600">{cpmk.deskripsi}</p>
                      </div>
                      {(!subCpmkList[cpmkIdx] || subCpmkList[cpmkIdx].length === 0) && (
                        <p className="text-sm text-slate-500 italic">Belum ada Sub-CPMK</p>
                      )}
                      <div className="space-y-2">
                        {subCpmkList[cpmkIdx]?.map((sub, subIdx) => (
                          <div key={subIdx} className="flex gap-2 items-center p-2 bg-white rounded border">
                            <Input className="w-32 h-8 text-xs" value={sub.kode} disabled />
                            <Input className="flex-1 h-8 text-xs" value={sub.deskripsi} disabled />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rencana" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rencana Pembelajaran Mingguan</CardTitle>
                <CardDescription>Detail topik dan aktivitas untuk setiap minggu pembelajaran</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {rencanaPembelajaran.length === 0 && (
                  <p className="text-sm text-slate-500 italic text-center py-8">
                    Belum ada rencana pembelajaran
                  </p>
                )}
                {rencanaPembelajaran.map((rp, index) => (
                  <Card 
                    key={index} 
                    className={"cursor-pointer transition-colors " + (
                      expandedWeek === rp.minggu_ke ? 'border-blue-300 bg-blue-50/50' : 'hover:bg-slate-50'
                    )}
                  >
                    <CardContent className="p-4">
                      <div 
                        className="flex items-center justify-between"
                        onClick={() => setExpandedWeek(expandedWeek === rp.minggu_ke ? null : rp.minggu_ke)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Minggu {rp.minggu_ke}</Badge>
                          <span className="text-sm text-slate-600">
                            {rp.topik || "(Belum diisi)"}
                          </span>
                          {rp.bobot_persen > 0 && (
                            <Badge variant="outline">{rp.bobot_persen}%</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedWeek === rp.minggu_ke ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                      
                      {expandedWeek === rp.minggu_ke && (
                        <div className="mt-4 space-y-4 pt-4 border-t">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Minggu Ke-</Label>
                              <Input type="number" value={rp.minggu_ke} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label>Sub-CPMK</Label>
                              <Input 
                                value={subCpmkList.flat().find(s => s.id === rp.sub_cpmk_id)?.kode || 'Tidak ada'} 
                                disabled 
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Topik</Label>
                            <Input value={rp.topik} disabled />
                          </div>

                          <div className="space-y-2">
                            <Label>Sub-Topik</Label>
                            <Textarea value={rp.sub_topik?.join('\n') || ''} rows={3} disabled />
                          </div>

                          <div className="space-y-2">
                            <Label>Metode Pembelajaran</Label>
                            <Textarea value={rp.metode_pembelajaran} rows={3} disabled />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Waktu (Menit)</Label>
                              <Input type="number" value={rp.waktu_menit} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label>Bobot (%)</Label>
                              <Input type="number" value={rp.bobot_persen} disabled />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Teknik & Kriteria Penilaian</Label>
                            <Textarea value={rp.teknik_kriteria} rows={3} disabled />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tugas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rencana Tugas</CardTitle>
                <CardDescription>Daftar tugas dan penilaian mahasiswa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rencanaTugas.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">Belum ada rencana tugas</p>
                )}
                {rencanaTugas.map((tugas, index) => (
                  <Card key={index} className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-amber-50">Tugas {tugas.nomor_tugas}</Badge>
                        <Badge variant="outline">{tugas.bobot}%</Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Judul Tugas</Label>
                          <Input value={tugas.judul} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Sub-CPMK Terkait</Label>
                          <Input 
                            value={subCpmkList.flat().find(s => s.id === tugas.sub_cpmk_id)?.kode || 'Tidak ada'} 
                            disabled 
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Jenis Tugas</Label>
                          <Input value={tugas.jenis_tugas === 'individu' ? 'Individu' : 'Kelompok'} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Batas Waktu (Minggu ke-)</Label>
                          <Input type="number" value={tugas.batas_waktu_minggu} disabled />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Indikator Keberhasilan</Label>
                        <Textarea value={tugas.indikator_keberhasilan} rows={2} disabled />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Petunjuk Pengerjaan</Label>
                        <Textarea value={tugas.petunjuk_pengerjaan} rows={2} disabled />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Luaran Tugas</Label>
                        <Input value={tugas.luaran_tugas} disabled />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kriteria Penilaian</Label>
                          <Textarea value={tugas.kriteria_penilaian} rows={2} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Teknik Penilaian</Label>
                          <Input value={tugas.teknik_penilaian} disabled />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Daftar Rujukan</Label>
                        <Textarea value={tugas.daftar_rujukan} rows={2} disabled />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {rencanaTugas.length > 0 && (
                  <div className="flex justify-end">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg">
                      <span className="text-sm text-slate-600">Total Bobot: </span>
                      <span className="font-bold text-slate-900">
                        {rencanaTugas.reduce((sum, t) => sum + (t.bobot || 0), 0)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analisis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analisis Ketercapaian CPL</CardTitle>
                <CardDescription>Mapping CPL dengan rencana pembelajaran</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analisisKetercapaian.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">Belum ada analisis ketercapaian</p>
                )}
                {analisisKetercapaian.map((analisis, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <span className="font-semibold">Analisis {index + 1}</span>
                      
                      <div className="space-y-2">
                        <Label>CPL Terkait</Label>
                        <Input 
                          value={relatedCplList.find(c => c.id === analisis.cpl_id)?.kode || cplList.find(c => c.id === analisis.cpl_id)?.kode || 'Tidak ada'} 
                          disabled 
                        />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Minggu Mulai</Label>
                          <Input type="number" value={analisis.minggu_mulai} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Minggu Selesai</Label>
                          <Input type="number" value={analisis.minggu_selesai ?? ''} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Bobot Kontribusi (%)</Label>
                          <Input type="number" value={analisis.bobot_kontribusi} disabled />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Topik Materi</Label>
                        <Textarea value={analisis.topik_materi} disabled />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Jenis Assessment</Label>
                        <Input value={analisis.jenis_assessment} disabled />
                      </div>
                      
                      {analisis.cpmk_ids.length > 0 && (
                        <div className="space-y-2">
                          <Label>CPMK Terkait</Label>
                          <div className="flex flex-wrap gap-2">
                            {analisis.cpmk_ids.map((cpmkId) => (
                              <Badge key={cpmkId} variant="outline">{cpmkId}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pustaka" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bahan Bacaan / Pustaka</CardTitle>
                <CardDescription>Referensi utama dan pendukung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bahanBacaan.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">Belum ada bahan bacaan</p>
                )}
                {bahanBacaan.map((bb, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {bb.jenis ? bb.jenis.charAt(0).toUpperCase() + bb.jenis.slice(1) : 'Buku'}
                        </Badge>
                        {bb.is_wajib && <Badge variant="default">Wajib</Badge>}
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Jenis</Label>
                          <Input value={bb.jenis ? bb.jenis.charAt(0).toUpperCase() + bb.jenis.slice(1) : 'Buku'} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Tahun</Label>
                          <Input type="number" value={bb.tahun} disabled />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Judul</Label>
                        <Input value={bb.judul} disabled />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Penulis</Label>
                          <Input value={bb.penulis} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Penerbit</Label>
                          <Input value={bb.penerbit} disabled />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>ISBN</Label>
                          <Input value={bb.isbn} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Halaman</Label>
                          <Input value={bb.halaman} disabled />
                        </div>
                      </div>

                      {bb.url && (
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input value={bb.url} disabled />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" asChild>
                <Link href="/dosen/rps">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Daftar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
