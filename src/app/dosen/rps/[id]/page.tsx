"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft,
  FileText,
  AlertCircle,
  Target,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
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
import type { CPL } from "@/lib/api/cpl"
import type { MataKuliah } from "@/lib/api/mata-kuliah"
import type { RPS } from "@/lib/api/rps"
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
  pertemuan: number
  minggu_mulai: number
  minggu_selesai: number
  topik: string
  sub_topik: string[]
  cpmk_ids: string[]
  sub_cpmk_ids: string[]
  indikator: string[]
  metode: string
  media_lms: string
  waktu: number
  waktu_tm: number
  waktu_bm: number
  waktu_pt: number
  materi: string
  teknik_penilaian: string
  kriteria_penilaian: string
  bobot_penilaian: number
}

interface BahanBacaanForm {
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

interface EvaluasiForm {
  komponen: string
  teknik_penilaian: string
  instrumen: string
  bobot: number
  minggu_mulai: number
  minggu_selesai: number
  topik_materi: string
  jenis_assessment: string
  urutan: number
}

interface RencanaTugasForm {
  nomor_tugas: number
  judul: string
  sub_cpmk_ids: string[]
  indikator_keberhasilan: string
  batas_waktu_minggu: number
  batas_waktu_tanggal: string
  petunjuk_pengerjaan: string
  jenis_tugas: 'Individu' | 'Kelompok'
  luaran_tugas: string
  kriteria_penilaian: string
  teknik_penilaian: string
  bobot: number
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

interface SkalaPenilaianForm {
  id?: string
  nilai_min: number
  nilai_max: number
  huruf_mutu: string
  bobot_nilai: number
  is_lulus: boolean
}

export default function EditRPSPage() {
  const router = useRouter()
  const params = useParams()
  const editRpsId = params.id as string

  // ✅ FIX: halaman ini benar-benar view only
  const isViewOnly = true
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rpsData, setRpsData] = useState<RPS | null>(null)
  
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
  const [cplList, setCplList] = useState<CPL[]>([])
  const [activeTab, setActiveTab] = useState("info")
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  
  const tabOrder = ["info", "cpmk", "subcpmk", "rencana", "tugas", "analisis", "pustaka", "evaluasi", "skala"]
  
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
    metode_pembelajaran: ["Ceramah", "Diskusi", "Praktikum"] as string[],
    media_pembelajaran: ["Laptop", "Projector", "LMS"] as string[]
  })
  
  const [cpmkList, setCpmkList] = useState<CPMKForm[]>([
    { kode: "CPMK-01", deskripsi: "", cpl_ids: [] }
  ])

  const [subCpmkList, setSubCpmkList] = useState<SubCPMKForm[][]>([[]])
  
  const [rencanaPembelajaran, setRencanaPembelajaran] = useState<RencanaPembelajaranForm[]>([])
  
  const [bahanBacaan, setBahanBacaan] = useState<BahanBacaanForm[]>([
    { judul: "", penulis: "", tahun: new Date().getFullYear(), penerbit: "", jenis: 'buku', isbn: "", halaman: "", url: "", is_wajib: true, urutan: 1 }
  ])
  
  const [evaluasi, setEvaluasi] = useState<EvaluasiForm[]>([
    { komponen: "UTS", teknik_penilaian: "Tes Tertulis", instrumen: "Soal Essay", bobot: 30, minggu_mulai: 1, minggu_selesai: 8, topik_materi: "", jenis_assessment: "Sumatif", urutan: 1 },
    { komponen: "UAS", teknik_penilaian: "Tes Tertulis", instrumen: "Soal Essay", bobot: 40, minggu_mulai: 9, minggu_selesai: 16, topik_materi: "", jenis_assessment: "Sumatif", urutan: 2 },
    { komponen: "Tugas", teknik_penilaian: "Penugasan", instrumen: "Rubrik Penilaian", bobot: 20, minggu_mulai: 1, minggu_selesai: 16, topik_materi: "", jenis_assessment: "Formatif", urutan: 3 },
    { komponen: "Kehadiran", teknik_penilaian: "Observasi", instrumen: "Daftar Hadir", bobot: 10, minggu_mulai: 1, minggu_selesai: 16, topik_materi: "", jenis_assessment: "Formatif", urutan: 4 }
  ])

  const [rencanaTugas, setRencanaTugas] = useState<RencanaTugasForm[]>([])
  const [analisisKetercapaian, setAnalisisKetercapaian] = useState<AnalisisKetercapaianForm[]>([])
  const [skalaPenilaian, setSkalaPenilaian] = useState<SkalaPenilaianForm[]>([])
  
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)

  const fetchInitialData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    if (!editRpsId) {
      setError('ID RPS tidak ditemukan')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const [rpsResponse, mkResponse, cplResponse] = await Promise.all([
        rpsService.getById(editRpsId),
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
        tanggal_penyusunan: rps.tanggal_penyusunan || new Date().toISOString().split('T')[0],
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
        metode_pembelajaran: rps.metode_pembelajaran || ["Ceramah", "Diskusi", "Praktikum"],
        media_pembelajaran: rps.media_pembelajaran || ["Laptop", "Projector", "LMS"]
      })
      
      // CPMK
      let loadedSubCpmkData: SubCPMKForm[][] = []
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
      
      // Rencana Pembelajaran
      if (rps.rencana_pembelajaran && rps.rencana_pembelajaran.length > 0) {
        const rpList: RencanaPembelajaranForm[] = rps.rencana_pembelajaran.map((rp) => ({
          pertemuan: rp.pertemuan,
          minggu_mulai: rp.minggu_mulai || rp.pertemuan,
          minggu_selesai: rp.minggu_selesai || rp.pertemuan,
          topik: rp.topik || "",
          sub_topik: rp.sub_topik || [],
          cpmk_ids: rp.cpmk_ids || [],
          sub_cpmk_ids: rp.sub_cpmk_ids || [],
          indikator: rp.indikator || [],
          metode: rp.metode || "Ceramah dan Praktik",
          media_lms: rp.media_lms || "Google Classroom",
          waktu: rp.waktu || 150,
          waktu_tm: rp.waktu_tm || 2,
          waktu_bm: rp.waktu_bm || 3,
          waktu_pt: rp.waktu_pt || 2,
          materi: rp.materi || "",
          teknik_penilaian: rp.teknik_penilaian || "",
          kriteria_penilaian: rp.kriteria_penilaian || "",
          bobot_penilaian: rp.bobot_penilaian || 0
        }))
        for (let i = rpList.length + 1; i <= 16; i++) {
          rpList.push({
            pertemuan: i,
            minggu_mulai: i,
            minggu_selesai: i,
            topik: "",
            sub_topik: [],
            cpmk_ids: [],
            sub_cpmk_ids: [],
            indikator: [],
            metode: "Ceramah dan Praktik",
            media_lms: "Google Classroom",
            waktu: 150,
            waktu_tm: 2,
            waktu_bm: 3,
            waktu_pt: 2,
            materi: "",
            teknik_penilaian: "",
            kriteria_penilaian: "",
            bobot_penilaian: 0
          })
        }
        setRencanaPembelajaran(rpList)
      } else {
        const initialRP: RencanaPembelajaranForm[] = []
        for (let i = 1; i <= 16; i++) {
          initialRP.push({
            pertemuan: i,
            minggu_mulai: i,
            minggu_selesai: i,
            topik: "",
            sub_topik: [],
            cpmk_ids: [],
            sub_cpmk_ids: [],
            indikator: [],
            metode: "Ceramah dan Praktik",
            media_lms: "Google Classroom",
            waktu: 150,
            waktu_tm: 2,
            waktu_bm: 3,
            waktu_pt: 2,
            materi: "",
            teknik_penilaian: "",
            kriteria_penilaian: "",
            bobot_penilaian: 0
          })
        }
        setRencanaPembelajaran(initialRP)
      }
      
      // Rencana Tugas
      try {
        const rencanaTugasResponse = await rpsService.rencanaTugas?.getAll(editRpsId)
        if (rencanaTugasResponse?.success && rencanaTugasResponse.data && rencanaTugasResponse.data.length > 0) {
          const loadedRencanaTugas: RencanaTugasForm[] = rencanaTugasResponse.data.map((t) => ({
            nomor_tugas: t.nomor_tugas || 1,
            judul: t.judul || "",
            sub_cpmk_ids: t.sub_cpmk_ids || [],
            indikator_keberhasilan: t.indikator_keberhasilan || "",
            batas_waktu_minggu: t.batas_waktu_minggu || 1,
            batas_waktu_tanggal: t.batas_waktu_tanggal || "",
            petunjuk_pengerjaan: t.petunjuk_pengerjaan || "",
            jenis_tugas: (t.jenis_tugas || 'Individu') as 'Individu' | 'Kelompok',
            luaran_tugas: t.luaran_tugas || "",
            kriteria_penilaian: t.kriteria_penilaian || "",
            teknik_penilaian: t.teknik_penilaian || "",
            bobot: t.bobot || 0
          }))
          setRencanaTugas(loadedRencanaTugas)
        } else if (rps.rencana_tugas && rps.rencana_tugas.length > 0) {
          const loadedRencanaTugas: RencanaTugasForm[] = rps.rencana_tugas.map((t) => ({
            nomor_tugas: t.nomor_tugas || 1,
            judul: t.judul || "",
            sub_cpmk_ids: t.sub_cpmk_ids || [],
            indikator_keberhasilan: t.indikator_keberhasilan || "",
            batas_waktu_minggu: t.batas_waktu_minggu || 1,
            batas_waktu_tanggal: t.batas_waktu_tanggal || "",
            petunjuk_pengerjaan: t.petunjuk_pengerjaan || "",
            jenis_tugas: (t.jenis_tugas || 'Individu') as 'Individu' | 'Kelompok',
            luaran_tugas: t.luaran_tugas || "",
            kriteria_penilaian: t.kriteria_penilaian || "",
            teknik_penilaian: t.teknik_penilaian || "",
            bobot: t.bobot || 0
          }))
          setRencanaTugas(loadedRencanaTugas)
        }
      } catch (err) {
        console.error('Error loading rencana tugas:', err)
      }
      
      // Analisis Ketercapaian
      try {
        const analisisResponse = await rpsService.analisisKetercapaian?.getAll(editRpsId)
        if (analisisResponse?.success && analisisResponse.data && analisisResponse.data.length > 0) {
          const loadedAnalisisKetercapaian: AnalisisKetercapaianForm[] = analisisResponse.data.map((a) => ({
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
          setAnalisisKetercapaian(loadedAnalisisKetercapaian)
        } else if (rps.analisis_ketercapaian && rps.analisis_ketercapaian.length > 0) {
          const loadedAnalisisKetercapaian: AnalisisKetercapaianForm[] = rps.analisis_ketercapaian.map((a) => ({
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
          setAnalisisKetercapaian(loadedAnalisisKetercapaian)
        }
      } catch (err) {
        console.error('Error loading analisis ketercapaian:', err)
      }
      
      // Pustaka
      if (rps.bahan_bacaan && rps.bahan_bacaan.length > 0) {
        setBahanBacaan(rps.bahan_bacaan.map((b, idx) => ({
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
      
      // Evaluasi
      try {
        const evaluasiResponse = await rpsService.evaluasi?.getAll(editRpsId)
        if (evaluasiResponse?.success && evaluasiResponse.data && evaluasiResponse.data.length > 0) {
          const loadedEvaluasi: EvaluasiForm[] = evaluasiResponse.data.map((e, idx) => ({
            komponen: e.komponen || "",
            teknik_penilaian: e.teknik_penilaian || "",
            instrumen: e.instrumen || "",
            bobot: e.bobot || 0,
            minggu_mulai: e.minggu_mulai || 1,
            minggu_selesai: e.minggu_selesai || 16,
            topik_materi: e.topik_materi || "",
            jenis_assessment: e.jenis_assessment || "Formatif",
            urutan: e.urutan || idx + 1
          }))
          setEvaluasi(loadedEvaluasi)
        } else if (rps.evaluasi && rps.evaluasi.length > 0) {
          const loadedEvaluasi: EvaluasiForm[] = rps.evaluasi.map((e, idx) => ({
            komponen: e.komponen || e.jenis || "",
            teknik_penilaian: e.teknik_penilaian || "",
            instrumen: e.instrumen || "",
            bobot: e.bobot || 0,
            minggu_mulai: e.minggu_mulai || 1,
            minggu_selesai: e.minggu_selesai || 16,
            topik_materi: e.topik_materi || "",
            jenis_assessment: e.jenis_assessment || "Formatif",
            urutan: e.urutan || idx + 1
          }))
          setEvaluasi(loadedEvaluasi)
        }
      } catch (err) {
        console.error('Error loading evaluasi:', err)
      }
      
      // Skala Penilaian
      try {
        const skalaResponse = await rpsService.skalaPenilaian?.getAll(editRpsId)
        if (skalaResponse?.success && skalaResponse.data && skalaResponse.data.length > 0) {
          const loadedSkala: SkalaPenilaianForm[] = skalaResponse.data.map((s) => ({
            id: s.id,
            nilai_min: s.nilai_min || 0,
            nilai_max: s.nilai_max || 100,
            huruf_mutu: s.huruf_mutu || "",
            bobot_nilai: s.bobot_nilai || 0,
            is_lulus: s.is_lulus !== undefined ? s.is_lulus : true
          }))
          setSkalaPenilaian(loadedSkala)
        } else if (rps.skala_penilaian && rps.skala_penilaian.length > 0) {
          const loadedSkala: SkalaPenilaianForm[] = rps.skala_penilaian.map((s) => ({
            id: s.id,
            nilai_min: s.nilai_min || 0,
            nilai_max: s.nilai_max || 100,
            huruf_mutu: s.huruf_mutu || "",
            bobot_nilai: s.bobot_nilai || 0,
            is_lulus: s.is_lulus !== undefined ? s.is_lulus : true
          }))
          setSkalaPenilaian(loadedSkala)
        }
      } catch (err) {
        console.error('Error loading skala penilaian:', err)
      }
      
      // Mata kuliah list
      let mkData: MataKuliah[] = []
      if (mkResponse.data) {
        if (Array.isArray(mkResponse.data)) {
          mkData = mkResponse.data
        } else if (mkResponse.data.data && Array.isArray(mkResponse.data.data)) {
          mkData = mkResponse.data.data
        }
      }
      setMataKuliahList(mkData)
      
      // CPL list
      let cplData: CPL[] = []
      if (cplResponse.data) {
        if (Array.isArray(cplResponse.data)) {
          cplData = cplResponse.data
        } else if ((cplResponse.data as { data?: CPL[] }).data && Array.isArray((cplResponse.data as { data?: CPL[] }).data)) {
          cplData = (cplResponse.data as { data: CPL[] }).data
        }
      }
      setCplList(cplData)
      
      // Hitung langkah yang "complete" berdasarkan data yang ada
      const completed: string[] = []
      if (rps.mata_kuliah_id && rps.deskripsi_mk) completed.push("info")
      if (rps.cpmk && rps.cpmk.length > 0 && rps.cpmk.some(c => c.deskripsi)) completed.push("cpmk")
      if (loadedSubCpmkData.some((arr: SubCPMKForm[]) => arr.length > 0)) completed.push("subcpmk")
      if (rps.rencana_pembelajaran && rps.rencana_pembelajaran.some(rp => rp.topik)) completed.push("rencana")
      if ((rps.rencana_tugas && rps.rencana_tugas.some(t => t.judul)) || (rencanaTugas && rencanaTugas.some(t => t.judul))) completed.push("tugas")
      if (analisisKetercapaian.length > 0 && analisisKetercapaian.some(a => a.cpl_id)) completed.push("analisis")
      if (rps.bahan_bacaan && rps.bahan_bacaan.some(b => b.judul)) completed.push("pustaka")
      if (evaluasi.length > 0 && evaluasi.some(e => e.komponen)) completed.push("evaluasi")
      if (skalaPenilaian.length > 0 && skalaPenilaian.some(s => s.huruf_mutu)) completed.push("skala")
      
      setCompletedSteps(completed)
      
      const tabOrderLocal = ["info", "cpmk", "subcpmk", "rencana", "tugas", "analisis", "pustaka", "evaluasi", "skala"]
      const firstIncomplete = tabOrderLocal.find(tab => !completed.includes(tab))
      setActiveTab(firstIncomplete || "skala")
      
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [router, editRpsId, analisisKetercapaian.length, evaluasi.length, rencanaTugas.length, skalaPenilaian.length])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const getCurrentTabIndex = () => tabOrder.indexOf(activeTab)
  const getPreviousTab = () => {
    const currentIndex = getCurrentTabIndex()
    if (currentIndex > 0) {
      return tabOrder[currentIndex - 1]
    }
    return null
  }

  const handlePreviousStep = () => {
    const prevTab = getPreviousTab()
    if (prevTab) {
      setActiveTab(prevTab)
    }
  }

  const getTabLabel = (tab: string): string => {
    const labels: Record<string, string> = {
      info: "Info Dasar",
      cpmk: "CPMK",
      subcpmk: "Sub-CPMK",
      rencana: "Rencana Pembelajaran",
      tugas: "Rencana Tugas",
      analisis: "Analisis",
      pustaka: "Pustaka",
      evaluasi: "Evaluasi",
      skala: "Skala Penilaian"
    }
    return labels[tab] || tab
  }

  const selectedMK = mataKuliahList.find(mk => mk.id === formData.mata_kuliah_id)

  const totalBobotEvaluasi = evaluasi.reduce((s, e) => s + e.bobot, 0)
  const totalBobotTugas = rencanaTugas.reduce((sum, t) => sum + (t.bobot || 0), 0)

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Detail RPS
                {isViewOnly && (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    View Only
                  </span>
                )}
              </h1>
              <p className="text-slate-600">
                {rpsData?.mata_kuliah_nama ? `${rpsData.mata_kuliah_nama} - ${rpsData.tahun_ajaran}` : `RPS ID: ${editRpsId}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {rpsData?.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                rpsData.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                rpsData.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                rpsData.status === 'approved' ? 'bg-green-100 text-green-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {rpsData.status === 'draft' ? 'Draft' :
                 rpsData.status === 'submitted' ? 'Menunggu Review' :
                 rpsData.status === 'approved' ? 'Disetujui' :
                 rpsData.status}
              </span>
            )}
            <span className="text-sm text-slate-500">
              {completedSteps.length} dari {tabOrder.length} langkah selesai
            </span>
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

        {/* Step Progress Indicator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress Langkah</span>
              <span className="text-sm text-slate-500">{completedSteps.length} / {tabOrder.length} selesai</span>
            </div>
            <div className="flex gap-1">
              {tabOrder.map((tab) => {
                const isCompleted = completedSteps.includes(tab)
                const isCurrent = activeTab === tab
                return (
                  <div
                    key={tab}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      isCompleted ? 'bg-green-500' : 
                      isCurrent ? 'bg-blue-500' : 
                      'bg-slate-200'
                    }`}
                    title={getTabLabel(tab)}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-9">
            {tabOrder.map((tab) => {
              const isCompleted = completedSteps.includes(tab)
              return (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className={`relative ${isCompleted ? 'text-green-600' : ''}`}
                >
                  {getTabLabel(tab)}
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab: Info Dasar */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar RPS</CardTitle>
                <CardDescription>Data dasar mata kuliah dan penyusun RPS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mata Kuliah</Label>
                    <Select
                      value={formData.mata_kuliah_id}
                      disabled
                    >
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
                    <Input
                      value={formData.tahun_ajaran}
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input
                      value={formData.semester_type === "ganjil" ? "Ganjil" : "Genap"}
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Penyusunan</Label>
                    <Input
                      type="date"
                      value={formData.tanggal_penyusunan}
                      readOnly
                    />
                  </div>
                </div>

                {selectedMK && (
                  <Card className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-semibold">{selectedMK.nama}</p>
                          <p className="text-sm text-slate-600">
                            {selectedMK.kode} • {selectedMK.sks} SKS • Semester {selectedMK.semester} • {selectedMK.jenis}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Informasi Penyusun */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 text-slate-800">Informasi Penyusun & Pengesahan</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nama Penyusun</Label>
                      <Input
                        value={formData.penyusun_nama}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>NIDN Penyusun</Label>
                      <Input
                        value={formData.penyusun_nidn}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Koordinator RMK</Label>
                      <Input
                        value={formData.koordinator_rmk_nama}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>NIDN Koordinator RMK</Label>
                      <Input
                        value={formData.koordinator_rmk_nidn}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Kaprodi</Label>
                      <Input
                        value={formData.kaprodi_nama}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>NIDN Kaprodi</Label>
                      <Input
                        value={formData.kaprodi_nidn}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fakultas</Label>
                      <Input
                        value={formData.fakultas}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Program Studi</Label>
                      <Input
                        value={formData.program_studi}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Deskripsi & Capaian */}
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Deskripsi Mata Kuliah</Label>
                    <Textarea
                      value={formData.deskripsi_mk}
                      rows={4}
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Capaian Pembelajaran</Label>
                    <Textarea
                      value={formData.capaian_pembelajaran}
                      rows={3}
                      readOnly
                    />
                  </div>
                </div>

                {/* Metode & Media Pembelajaran */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 text-slate-800">Metode & Media Pembelajaran</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Metode Pembelajaran</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.metode_pembelajaran.map(metode => (
                          <Badge key={metode} variant="default">
                            {metode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Media Pembelajaran</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.media_pembelajaran.map(media => (
                          <Badge key={media} variant="default">
                            {media}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: CPMK */}
          <TabsContent value="cpmk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                <CardDescription>Daftar CPMK dan hubungan dengan CPL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cpmkList.map((cpmk, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{cpmk.kode}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Deskripsi CPMK</Label>
                        <Textarea
                          value={cpmk.deskripsi}
                          rows={2}
                          readOnly
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>CPL Terkait</Label>
                        <div className="flex flex-wrap gap-2">
                          {cplList.map(cpl => (
                            <Badge
                              key={cpl.id}
                              variant={cpmk.cpl_ids.includes(cpl.id) ? "default" : "outline"}
                            >
                              {cpl.kode}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sub-CPMK */}
          <TabsContent value="subcpmk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Sub-CPMK per CPMK
                </CardTitle>
                <CardDescription>Sub-CPMK yang memperjelas CPMK</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cpmkList.length === 0 && (
                  <p className="text-sm text-slate-500">Tidak ada CPMK</p>
                )}
                {cpmkList.map((cpmk, cpmkIdx) => (
                  <Card key={cpmkIdx} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Badge variant="outline" className="mb-2">{cpmk.kode}</Badge>
                        <p className="text-sm text-slate-600">{cpmk.deskripsi}</p>
                      </div>
                      {subCpmkList[cpmkIdx]?.length === 0 && (
                        <p className="text-sm text-slate-500 italic">Belum ada Sub-CPMK</p>
                      )}
                      <div className="space-y-2">
                        {subCpmkList[cpmkIdx]?.map((sub, subIdx) => (
                          <div key={subIdx} className="flex gap-2 items-center p-2 bg-white rounded border">
                            <Input
                              className="w-32 h-8 text-xs"
                              value={sub.kode}
                              readOnly
                            />
                            <Input
                              className="flex-1 h-8 text-xs"
                              value={sub.deskripsi}
                              readOnly
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Rencana Pembelajaran */}
          <TabsContent value="rencana" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rencana Pembelajaran Mingguan</CardTitle>
                <CardDescription>Topik dan aktivitas setiap pertemuan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {rencanaPembelajaran.map((rp, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-colors ${
                      expandedWeek === rp.pertemuan ? 'border-blue-300 bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div 
                        className="flex items-center justify-between"
                        onClick={() => setExpandedWeek(expandedWeek === rp.pertemuan ? null : rp.pertemuan)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Minggu {rp.pertemuan}</Badge>
                          <span className="text-sm text-slate-600">
                            {rp.topik || "(Belum diisi)"}
                          </span>
                        </div>
                        {expandedWeek === rp.pertemuan ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      
                      {expandedWeek === rp.pertemuan && (
                        <div className="mt-4 space-y-4 pt-4 border-t">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Topik/Materi</Label>
                              <Input
                                value={rp.topik}
                                readOnly
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Metode Pembelajaran</Label>
                              <Input
                                value={rp.metode}
                                readOnly
                              />
                            </div>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Materi</Label>
                              <Textarea
                                value={rp.materi}
                                rows={2}
                                readOnly
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Media & LMS</Label>
                              <Input
                                value={rp.media_lms}
                                readOnly
                              />
                            </div>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                              <Label>Total Waktu (menit)</Label>
                              <Input
                                type="number"
                                value={rp.waktu}
                                readOnly
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tatap Muka (SKS)</Label>
                              <Input
                                type="number"
                                value={rp.waktu_tm}
                                readOnly
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Belajar Mandiri (jam)</Label>
                              <Input
                                type="number"
                                value={rp.waktu_bm}
                                readOnly
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tugas Terstruktur (jam)</Label>
                              <Input
                                type="number"
                                value={rp.waktu_pt}
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Teknik Penilaian</Label>
                              <Input
                                value={rp.teknik_penilaian}
                                readOnly
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Kriteria Penilaian</Label>
                              <Input
                                value={rp.kriteria_penilaian}
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Bobot Penilaian (%)</Label>
                            <Input
                              type="number"
                              className="w-32"
                              value={rp.bobot_penilaian}
                              readOnly
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Pustaka */}
          <TabsContent value="pustaka" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bahan Bacaan / Pustaka</CardTitle>
                <CardDescription>Referensi utama dan pendukung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bahanBacaan.map((bb, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {bb.jenis ? bb.jenis.charAt(0).toUpperCase() + bb.jenis.slice(1) : 'Buku'}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Jenis</Label>
                          <Input
                            value={bb.jenis}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tahun</Label>
                          <Input
                            type="number"
                            value={bb.tahun}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Judul Buku/Referensi</Label>
                        <Input
                          value={bb.judul}
                          readOnly
                        />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Penulis</Label>
                          <Input
                            value={bb.penulis}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Penerbit</Label>
                          <Input
                            value={bb.penerbit}
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>ISBN</Label>
                          <Input
                            value={bb.isbn}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Halaman</Label>
                          <Input
                            value={bb.halaman}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2 flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            checked={bb.is_wajib}
                            readOnly
                            className="h-4 w-4"
                          />
                          <Label className="cursor-default">Wajib</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={bb.url}
                          readOnly
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Evaluasi */}
          <TabsContent value="evaluasi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Komponen Evaluasi</CardTitle>
                <CardDescription>Bobot penilaian (total sebaiknya 100%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {evaluasi.map((ev, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Evaluasi {index + 1}</Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Komponen</Label>
                          <Input
                            value={ev.komponen}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bobot (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={ev.bobot}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Teknik Penilaian</Label>
                          <Input
                            value={ev.teknik_penilaian}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Instrumen</Label>
                          <Input
                            value={ev.instrumen}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Minggu Mulai</Label>
                          <Input
                            type="number"
                            value={ev.minggu_mulai}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Minggu Selesai</Label>
                          <Input
                            type="number"
                            value={ev.minggu_selesai}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Jenis Assessment</Label>
                          <Input
                            value={ev.jenis_assessment}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Topik Materi</Label>
                        <Textarea
                          value={ev.topik_materi}
                          rows={2}
                          readOnly
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-end">
                  <Badge variant={totalBobotEvaluasi === 100 ? "default" : "danger"}>
                    Total: {totalBobotEvaluasi}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Rencana Tugas */}
          <TabsContent value="tugas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Rencana Tugas
                </CardTitle>
                <CardDescription>Daftar tugas dan penilaiannya</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rencanaTugas.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada rencana tugas</p>
                  </div>
                )}
                {rencanaTugas.map((tugas, index) => (
                  <Card key={index} className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-amber-50">Tugas {tugas.nomor_tugas}</Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Judul Tugas</Label>
                          <Input
                            value={tugas.judul}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Jenis Tugas</Label>
                          <Input
                            value={tugas.jenis_tugas}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Indikator Keberhasilan</Label>
                        <Textarea
                          value={tugas.indikator_keberhasilan}
                          rows={2}
                          readOnly
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Petunjuk Pengerjaan</Label>
                        <Textarea
                          value={tugas.petunjuk_pengerjaan}
                          rows={2}
                          readOnly
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Luaran Tugas</Label>
                        <Input
                          value={tugas.luaran_tugas}
                          readOnly
                        />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kriteria Penilaian</Label>
                          <Textarea
                            value={tugas.kriteria_penilaian}
                            rows={2}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Teknik Penilaian</Label>
                          <Input
                            value={tugas.teknik_penilaian}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Batas Waktu (Minggu ke-)</Label>
                          <Input
                            type="number"
                            value={tugas.batas_waktu_minggu}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bobot (%)</Label>
                          <Input
                            type="number"
                            value={tugas.bobot}
                            readOnly
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {rencanaTugas.length > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                      {rencanaTugas.filter(t => t.judul?.trim() && t.bobot > 0 && t.batas_waktu_minggu > 0).length} dari {rencanaTugas.length} tugas valid
                    </div>
                    <div className="bg-slate-100 px-4 py-2 rounded-lg">
                      <span className="text-sm text-slate-600">Total Bobot: </span>
                      <span className={`font-bold ${totalBobotTugas > 100 ? 'text-red-600' : 'text-slate-900'}`}>
                        {totalBobotTugas}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Analisis Ketercapaian */}
          <TabsContent value="analisis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analisis Ketercapaian CPL</CardTitle>
                <CardDescription>Mapping CPL dengan aktivitas pembelajaran</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analisisKetercapaian.length === 0 && (
                  <p className="text-sm text-slate-500">Belum ada analisis ketercapaian</p>
                )}
                {analisisKetercapaian.map((analisis, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <span className="font-semibold">Analisis {index + 1}</span>
                      <div className="space-y-2">
                        <Label>CPL</Label>
                        <Input
                          value={cplList.find(c => c.id === analisis.cpl_id)?.kode || analisis.cpl_id}
                          readOnly
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Minggu Mulai</Label>
                          <Input
                            type="number"
                            value={analisis.minggu_mulai}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Minggu Selesai</Label>
                          <Input
                            type="number"
                            value={analisis.minggu_selesai ?? ''}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bobot Kontribusi (%)</Label>
                          <Input
                            type="number"
                            value={analisis.bobot_kontribusi}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Topik Materi</Label>
                        <Textarea
                          value={analisis.topik_materi}
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jenis Assessment</Label>
                        <Input
                          value={analisis.jenis_assessment}
                          readOnly
                        />
                      </div>
                      {cpmkList.length > 0 && (
                        <div className="space-y-2">
                          <Label>CPMK Terkait</Label>
                          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-white">
                            {analisis.cpmk_ids.map(code => (
                              <Badge key={code} variant="outline">
                                {code}
                              </Badge>
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

          {/* Tab: Skala Penilaian */}
          <TabsContent value="skala" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skala Penilaian</CardTitle>
                <CardDescription>Konversi nilai angka ke huruf mutu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skalaPenilaian.map((skala, index) => (
                    <Card key={index} className="bg-slate-50">
                      <CardContent className="p-3">
                        <div className="grid gap-3 md:grid-cols-6 items-center">
                          <div className="space-y-1">
                            <Label className="text-xs">Nilai Min</Label>
                            <Input
                              type="number"
                              value={skala.nilai_min}
                              className="h-8"
                              readOnly
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nilai Max</Label>
                            <Input
                              type="number"
                              value={skala.nilai_max}
                              className="h-8"
                              readOnly
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Huruf Mutu</Label>
                            <Input
                              value={skala.huruf_mutu}
                              className="h-8"
                              readOnly
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Bobot Nilai</Label>
                            <Input
                              type="number"
                              value={skala.bobot_nilai}
                              className="h-8"
                              readOnly
                            />
                          </div>
                          <div className="space-y-1 flex items-end">
                            <Label className="text-xs mr-2">Lulus</Label>
                            <input
                              type="checkbox"
                              checked={skala.is_lulus}
                              className="h-4 w-4"
                              readOnly
                            />
                          </div>
                          <div />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/dosen/rps">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Daftar
                  </Link>
                </Button>
                
                {getPreviousTab() && (
                  <Button variant="outline" onClick={handlePreviousStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Sebelumnya ({getTabLabel(getPreviousTab()!)})
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  Langkah {tabOrder.indexOf(activeTab) + 1} dari {tabOrder.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
