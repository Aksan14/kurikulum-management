"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft,
  ArrowRight,
  FileText,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Target,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  GraduationCap,
  Calendar,
  ListChecks,
  XCircle
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
import { ApiError } from "@/lib/api/client"
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

// Sub-CPMK for each CPMK
interface SubCPMKForm {
  id?: string
  kode: string
  deskripsi: string
  urutan: number
}

// Rencana Pembelajaran Form - sesuai backend API baru
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

// Rencana Tugas - sesuai backend API
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

// Analisis Ketercapaian
interface AnalisisKetercapaianForm {
  id?: string // ID dari backend untuk update/delete
  minggu_mulai: number
  minggu_selesai: number | null
  cpl_id: string
  cpmk_ids: string[]
  sub_cpmk_ids: string[]
  topik_materi: string
  jenis_assessment: string
  bobot_kontribusi: number
}


export default function EditRPSPage() {
  const router = useRouter()
  const params = useParams()
  const editRpsId = params.id as string // ID RPS dari URL
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rpsData, setRpsData] = useState<RPS | null>(null) // Data RPS yang sedang diedit
  
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
  const [cplList, setCplList] = useState<CPL[]>([])
  const [relatedCplList, setRelatedCplList] = useState<CPL[]>([]) // CPL yang terkait dengan mata kuliah
  const [activeTab, setActiveTab] = useState("info")
  
  // Step tracking - untuk melacak data yang sudah dikirim
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({})
  const [createdCpmkIds, setCreatedCpmkIds] = useState<Record<string, string>>({}) // Map index to created CPMK ID
  const [deletedCpmkIds, setDeletedCpmkIds] = useState<string[]>([]) // Track deleted CPMK IDs for backend delete
  const [deletedSubCpmkIds, setDeletedSubCpmkIds] = useState<string[]>([]) // Track deleted Sub-CPMK IDs for backend delete
  
  // Urutan tabs
  const tabOrder = ["info", "cpmk", "subcpmk", "rencana", "tugas", "analisis", "pustaka"]
  
  // Form state
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

  // Sub-CPMK state: array of array, each index matches CPMK
  const [subCpmkList, setSubCpmkList] = useState<SubCPMKForm[][]>([[]])
  
  const [rencanaPembelajaran, setRencanaPembelajaran] = useState<RencanaPembelajaranForm[]>([])
  
  const [bahanBacaan, setBahanBacaan] = useState<BahanBacaanForm[]>([
    { judul: "", penulis: "", tahun: new Date().getFullYear(), penerbit: "", jenis: 'buku', isbn: "", halaman: "", url: "", is_wajib: true, urutan: 1 }
  ])

  // Rencana Tugas state
  const [rencanaTugas, setRencanaTugas] = useState<RencanaTugasForm[]>([])

  // Analisis Ketercapaian state
  const [analisisKetercapaian, setAnalisisKetercapaian] = useState<AnalisisKetercapaianForm[]>([])
  const [deletedAnalisisIds, setDeletedAnalisisIds] = useState<string[]>([]) // Track deleted IDs for backend delete
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
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
      
      // Fetch RPS data, mata kuliah list, and CPL list in parallel
      const [rpsResponse, mkResponse, cplResponse] = await Promise.all([
        rpsService.getById(editRpsId),
        mataKuliahService.getMy(),
        cplService.getActive()
      ])
      
      // Check if RPS was fetched successfully
      if (!rpsResponse.success || !rpsResponse.data) {
        setError('Gagal memuat data RPS: ' + (rpsResponse.message || 'Data tidak ditemukan'))
        setLoading(false)
        return
      }
      
      const rps = rpsResponse.data
      setRpsData(rps)
      
      // Populate form data from RPS
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
        metode_pembelajaran: rps.metode_pembelajaran || ["Ceramah", "Diskusi", "Praktikum"],
        media_pembelajaran: rps.media_pembelajaran || ["Laptop", "Projector", "LMS"]
      })
      
      // Load CPMK data
      let loadedSubCpmkData: SubCPMKForm[][] = []
      if (rps.cpmk && rps.cpmk.length > 0) {
        const cpmkFormList: CPMKForm[] = rps.cpmk.map((c) => ({
          id: c.id,
          kode: c.kode,
          deskripsi: c.deskripsi,
          cpl_ids: c.cpl_ids || []
        }))
        setCpmkList(cpmkFormList)
        
        // Map CPMK IDs for reference
        const cpmkIdMap: Record<string, string> = {}
        rps.cpmk.forEach((c, idx) => {
          cpmkIdMap[String(idx)] = c.id
        })
        setCreatedCpmkIds(cpmkIdMap)
        
        // Load Sub-CPMK for each CPMK
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
      
      // Load Rencana Pembelajaran dari API endpoint terpisah
      try {
        const rpResponse = await rpsService.rencanaPembelajaran?.getAll(editRpsId)
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
        } else {
          // Initialize empty - no default weeks, user adds as needed
          setRencanaPembelajaran([])
        }
      } catch {
        // Initialize empty on error
        setRencanaPembelajaran([])
      }
      
      // Load Rencana Tugas - fetch from dedicated endpoint
      let loadedRencanaTugas: RencanaTugasForm[] = []
      try {
        const rencanaTugasResponse = await rpsService.rencanaTugas?.getAll(editRpsId)
        if (rencanaTugasResponse?.success && rencanaTugasResponse.data && rencanaTugasResponse.data.length > 0) {
          loadedRencanaTugas = rencanaTugasResponse.data.map((t) => ({
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
          console.log('✅ Loaded', rencanaTugasResponse.data.length, 'rencana tugas from dedicated endpoint')
        } else if (rps.rencana_tugas && rps.rencana_tugas.length > 0) {
          // Fallback to RPS response data
          loadedRencanaTugas = rps.rencana_tugas.map((t) => ({
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
          console.log('✅ Loaded', rps.rencana_tugas.length, 'rencana tugas from RPS response')
        }
      } catch (err) {
        console.error('Error loading rencana tugas:', err)
      }
      
      // Load Analisis Ketercapaian - fetch from dedicated endpoint
      let loadedAnalisisKetercapaian: AnalisisKetercapaianForm[] = []
      try {
        const analisisResponse = await rpsService.analisisKetercapaian?.getAll(editRpsId)
        if (analisisResponse?.success && analisisResponse.data && analisisResponse.data.length > 0) {
          loadedAnalisisKetercapaian = analisisResponse.data.map((a) => ({
            id: a.id, // Simpan ID untuk update/delete
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
          console.log('✅ Loaded', analisisResponse.data.length, 'analisis ketercapaian from dedicated endpoint')
        } else if (rps.analisis_ketercapaian && rps.analisis_ketercapaian.length > 0) {
          // Fallback to RPS response data
          loadedAnalisisKetercapaian = rps.analisis_ketercapaian.map((a) => ({
            id: a.id, // Simpan ID untuk update/delete
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
          console.log('✅ Loaded', rps.analisis_ketercapaian.length, 'analisis ketercapaian from RPS response')
        }
      } catch (err) {
        console.error('Error loading analisis ketercapaian:', err)
      }
      
      // Load Bahan Bacaan
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
      
      // Handle mata kuliah response
      let mkData: MataKuliah[] = []
      if (mkResponse.data) {
        if (Array.isArray(mkResponse.data)) {
          mkData = mkResponse.data
        } else if (mkResponse.data.data && Array.isArray(mkResponse.data.data)) {
          mkData = mkResponse.data.data
        }
      }
      setMataKuliahList(mkData)
      
      // Handle CPL response  
      let cplData: CPL[] = []
      if (cplResponse.data) {
        if (Array.isArray(cplResponse.data)) {
          cplData = cplResponse.data
        } else if ((cplResponse.data as { data?: CPL[] }).data && Array.isArray((cplResponse.data as { data?: CPL[] }).data)) {
          cplData = (cplResponse.data as { data: CPL[] }).data
        }
      }
      setCplList(cplData)
      
      // Fetch CPL yang terkait dengan mata kuliah RPS ini
      if (rps.mata_kuliah_id) {
        try {
          const mappingResponse = await cplMKMappingService.getByMK(rps.mata_kuliah_id)
          if (mappingResponse.success && mappingResponse.data) {
            const responseData = mappingResponse.data as { data?: Array<{ cpl_id: string }> } | Array<{ cpl_id: string }>
            const mappings: Array<{ cpl_id: string }> = Array.isArray(responseData) 
              ? responseData 
              : (responseData.data || [])
            
            // Filter CPL yang ada di mapping
            const relatedCplIds = mappings.map(m => m.cpl_id)
            const filteredCplList = cplData.filter(cpl => relatedCplIds.includes(cpl.id))
            setRelatedCplList(filteredCplList)
            console.log('✅ Loaded', filteredCplList.length, 'CPL terkait dengan mata kuliah')
          } else {
            // Jika tidak ada mapping, gunakan semua CPL
            setRelatedCplList(cplData)
          }
        } catch (err) {
          console.error('Error loading CPL-MK mapping:', err)
          // Fallback ke semua CPL jika gagal
          setRelatedCplList(cplData)
        }
      } else {
        setRelatedCplList(cplData)
      }
      
      // Determine completed steps based on loaded data
      const completed: string[] = []
      
      // Info Dasar - sudah ada jika RPS berhasil di-load
      if (rps.mata_kuliah_id && rps.deskripsi_mk) {
        completed.push("info")
      }
      
      // CPMK - ada jika ada CPMK dengan deskripsi
      if (rps.cpmk && rps.cpmk.length > 0 && rps.cpmk.some(c => c.deskripsi)) {
        completed.push("cpmk")
      }
      
      // Sub-CPMK - ada jika ada sub-CPMK
      const hasSubCpmk = loadedSubCpmkData.some((arr: SubCPMKForm[]) => arr.length > 0)
      if (hasSubCpmk) {
        completed.push("subcpmk")
      }
      
      // Rencana Pembelajaran - ada jika ada yang memiliki topik
      if (rps.rencana_pembelajaran && rps.rencana_pembelajaran.some(rp => rp.topik)) {
        completed.push("rencana")
      }
      
      // Rencana Tugas - ada jika ada tugas yang sudah di-load
      if (loadedRencanaTugas.length > 0 && loadedRencanaTugas.some(t => t.judul)) {
        completed.push("tugas")
      }
      
      // Analisis Ketercapaian - ada jika ada analisis yang sudah di-load
      if (loadedAnalisisKetercapaian.length > 0 && loadedAnalisisKetercapaian.some(a => a.cpl_id)) {
        completed.push("analisis")
      }
      
      // Bahan Bacaan/Pustaka - ada jika ada bahan bacaan dengan judul
      if (rps.bahan_bacaan && rps.bahan_bacaan.some(b => b.judul)) {
        completed.push("pustaka")
      }
      
      setCompletedSteps(completed)
      
      // Navigate to first incomplete step
      const tabOrder = ["info", "cpmk", "subcpmk", "rencana", "tugas", "analisis", "pustaka"]
      const firstIncomplete = tabOrder.find(tab => !completed.includes(tab))
      if (firstIncomplete) {
        setActiveTab(firstIncomplete)
      } else {
        // All complete, go to last tab
        setActiveTab("pustaka")
      }
      
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [router, editRpsId])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Validasi Info Dasar
    if (!formData.mata_kuliah_id) {
      errors.mata_kuliah_id = "Pilih mata kuliah"
    }
    
    if (!formData.tahun_ajaran || !formData.tahun_ajaran.trim()) {
      errors.tahun_ajaran = "Tahun ajaran wajib diisi"
    }
    
    if (!formData.semester_type) {
      errors.semester_type = "Pilih semester"
    }
    
    if (!formData.deskripsi_mk || !formData.deskripsi_mk.trim()) {
      errors.deskripsi_mk = "Deskripsi mata kuliah wajib diisi"
    }
    
    // Validasi CPMK
    if (cpmkList.length === 0) {
      errors.cpmk = "Minimal harus ada 1 CPMK"
    } else {
      const hasEmptyCpmk = cpmkList.some(c => !c.deskripsi || !c.deskripsi.trim())
      if (hasEmptyCpmk) {
        errors.cpmk = "Semua CPMK harus memiliki deskripsi"
      }
      
      const hasEmptyCplMapping = cpmkList.some(c => !c.cpl_ids || c.cpl_ids.length === 0)
      if (hasEmptyCplMapping) {
        errors.cpmk_cpl = "Semua CPMK harus dipetakan ke minimal 1 CPL"
      }
    }

    // Validasi Rencana Pembelajaran
    const validRP = rencanaPembelajaran.filter(rp => rp.topik && rp.topik.trim())
    if (validRP.length === 0) {
      errors.rencana = "Minimal harus ada 1 rencana pembelajaran dengan topik"
    }
    
    setFormErrors(errors)
    
    // Tampilkan semua error jika ada
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n• ')
      setError(`Validasi gagal:\n• ${errorMessages}`)
    }
    
    return Object.keys(errors).length === 0
  }

  // Helper function untuk mendapatkan error message yang user-friendly
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof ApiError) {
      // Prioritas: ambil pesan yang paling user-friendly
      if (err.data) {
        // Cek field message terlebih dahulu
        if (err.data.message && typeof err.data.message === 'string') {
          return err.data.message
        }
        // Cek field error
        if (err.data.error && typeof err.data.error === 'string') {
          return err.data.error
        }
        // Cek field detail
        if (err.data.detail && typeof err.data.detail === 'string') {
          return err.data.detail
        }
        
        // Cek validation errors - gabungkan jadi pesan sederhana
        if (err.data.errors && typeof err.data.errors === 'object') {
          const validationErrors = err.data.errors as Record<string, string[]>
          const messages: string[] = []
          Object.entries(validationErrors).forEach(([, fieldMessages]) => {
            if (Array.isArray(fieldMessages)) {
              fieldMessages.forEach(msg => messages.push(msg))
            }
          })
          if (messages.length > 0) {
            return messages.join(', ')
          }
        }
      }
      
      // Fallback ke message dari ApiError tanpa status code
      return err.message || 'Terjadi kesalahan pada server'
    }
    if (err instanceof Error) {
      return err.message
    }
    return 'Terjadi kesalahan yang tidak diketahui'
  }

  // Get current tab index
  const getCurrentTabIndex = () => tabOrder.indexOf(activeTab)
  
  // Check if current tab is the last tab
  const isLastTab = () => getCurrentTabIndex() === tabOrder.length - 1
  
  // Get next tab
  const getNextTab = () => {
    const currentIndex = getCurrentTabIndex()
    if (currentIndex < tabOrder.length - 1) {
      return tabOrder[currentIndex + 1]
    }
    return null
  }

  // Get previous tab
  const getPreviousTab = () => {
    const currentIndex = getCurrentTabIndex()
    if (currentIndex > 0) {
      return tabOrder[currentIndex - 1]
    }
    return null
  }

  // Validate current step
  const validateCurrentStep = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    switch (activeTab) {
      case "info":
        if (!formData.mata_kuliah_id) errors.push("Pilih mata kuliah")
        if (!formData.tahun_ajaran) errors.push("Tahun ajaran wajib diisi")
        if (!formData.deskripsi_mk?.trim()) errors.push("Deskripsi mata kuliah wajib diisi")
        break
        
      case "cpmk":
        if (cpmkList.length === 0) {
          errors.push("Minimal harus ada 1 CPMK")
        } else {
          const emptyCpmk = cpmkList.filter(c => !c.deskripsi?.trim())
          if (emptyCpmk.length > 0) {
            errors.push(`${emptyCpmk.length} CPMK belum memiliki deskripsi`)
          }
        }
        break
        
      case "subcpmk":
        // Sub-CPMK optional, no validation required
        break
        
      case "rencana":
        const validRP = rencanaPembelajaran.filter(rp => rp.topik?.trim())
        if (validRP.length === 0) {
          errors.push("Minimal harus ada 1 rencana pembelajaran dengan topik")
        } else {
          // Validasi setiap rencana pembelajaran yang sudah diisi
          for (const rp of validRP) {
            const rpErrors: string[] = []
            if (!rp.sub_cpmk_id) {
              rpErrors.push("Sub-CPMK wajib dipilih")
            }
            if (!rp.topik?.trim()) {
              rpErrors.push("Topik wajib diisi")
            }
            if (!rp.metode_pembelajaran?.trim()) {
              rpErrors.push("Metode pembelajaran wajib diisi")
            }
            if (rp.waktu_menit <= 0) {
              rpErrors.push("Waktu (menit) harus lebih dari 0")
            }
            if (rp.bobot_persen < 0) {
              rpErrors.push("Bobot tidak boleh negatif")
            }
            if (rpErrors.length > 0) {
              errors.push(`Minggu ${rp.minggu_ke}: ${rpErrors.join(", ")}`)
            }
          }
        }
        break
        
      case "tugas":
        // Validasi tugas yang diisi - semua field required harus terisi
        const filledTugas = rencanaTugas.filter(t => t.judul?.trim())
        
        if (filledTugas.length === 0 && rencanaTugas.length > 0) {
          // Ada tugas tapi judul kosong
          errors.push("Tugas yang ditambahkan harus memiliki judul")
        }
        
        for (const tugas of filledTugas) {
          const tugasErrors: string[] = []
          
          // Required fields
          if (!tugas.judul?.trim()) {
            tugasErrors.push("Judul wajib diisi")
          }
          if (!tugas.jenis_tugas) {
            tugasErrors.push("Jenis tugas wajib dipilih")
          }
          if (tugas.bobot <= 0) {
            tugasErrors.push("Bobot harus lebih dari 0")
          }
          if (tugas.batas_waktu_minggu <= 0 || tugas.batas_waktu_minggu > 16) {
            tugasErrors.push("Batas waktu harus antara minggu 1-16")
          }
          
          // Recommended fields (warning only)
          if (!tugas.indikator_keberhasilan?.trim()) {
            tugasErrors.push("Indikator keberhasilan sebaiknya diisi")
          }
          if (!tugas.petunjuk_pengerjaan?.trim()) {
            tugasErrors.push("Petunjuk pengerjaan sebaiknya diisi")
          }
          
          if (tugasErrors.length > 0) {
            errors.push(`Tugas "${tugas.judul || tugas.nomor_tugas}": ${tugasErrors.join(", ")}`)
          }
        }
        
        // Total bobot check
        const totalBobotTugas = filledTugas.reduce((sum, t) => sum + (t.bobot || 0), 0)
        if (totalBobotTugas > 100) {
          errors.push(`Total bobot tugas (${totalBobotTugas}%) melebihi 100%`)
        }
        break
        
      case "analisis":
        // Analisis optional
        break
        
      case "pustaka":
        // Pustaka optional, but check if filled properly
        const emptyBahan = bahanBacaan.filter(b => b.judul?.trim() && !b.penulis?.trim())
        if (emptyBahan.length > 0) {
          errors.push(`${emptyBahan.length} bahan bacaan belum lengkap (perlu penulis)`)
        }
        break
    }
    
    return { valid: errors.length === 0, errors }
  }

  // Submit current step data
  const submitCurrentStep = async (): Promise<{ success: boolean; errors: string[] }> => {
    const errors: string[] = []
    
    try {
      setSaving(true)
      
      switch (activeTab) {
        case "info": {
          // Update existing RPS (note: mata_kuliah_id cannot be changed after creation)
          const updateRes = await rpsService.update(editRpsId, {
            tahun_ajaran: formData.tahun_ajaran,
            semester_type: formData.semester_type,
            tanggal_penyusunan: formData.tanggal_penyusunan || undefined,
            penyusun_nama: formData.penyusun_nama || undefined,
            penyusun_nidn: formData.penyusun_nidn || undefined,
            koordinator_rmk_nama: formData.koordinator_rmk_nama || undefined,
            koordinator_rmk_nidn: formData.koordinator_rmk_nidn || undefined,
            kaprodi_nama: formData.kaprodi_nama || undefined,
            kaprodi_nidn: formData.kaprodi_nidn || undefined,
            fakultas: formData.fakultas || undefined,
            program_studi: formData.program_studi || undefined,
            deskripsi_mk: formData.deskripsi_mk.trim(),
            capaian_pembelajaran: formData.capaian_pembelajaran || undefined,
            metode_pembelajaran: formData.metode_pembelajaran.length > 0 ? formData.metode_pembelajaran : undefined,
            media_pembelajaran: formData.media_pembelajaran.length > 0 ? formData.media_pembelajaran : undefined
          })
          if (!updateRes.success) {
            errors.push(`Update RPS gagal: ${updateRes.message}`)
          }
          break
        }
        
        case "cpmk": {
          // First, delete CPMKs that were marked for deletion
          for (const cpmkId of deletedCpmkIds) {
            try {
              const deleteRes = await rpsService.cpmk.delete(cpmkId)
              if (!deleteRes.success) {
                errors.push(`Gagal menghapus CPMK: ${deleteRes.message || 'Error'}`)
              } else {
                console.log(`✅ CPMK ${cpmkId} berhasil dihapus`)
              }
            } catch (err) {
              errors.push(`Gagal menghapus CPMK: ${getErrorMessage(err)}`)
            }
          }
          
          // Clear deleted IDs after processing
          setDeletedCpmkIds([])
          
          const newCreatedIds: Record<string, string> = { ...createdCpmkIds }
          
          for (let idx = 0; idx < cpmkList.length; idx++) {
            const cpmk = cpmkList[idx]
            if (cpmk.deskripsi?.trim()) {
              // Skip if already created
              if (newCreatedIds[idx.toString()]) {
                console.log(`⏭️ CPMK ${cpmk.kode} sudah ada, skip`)
                continue
              }
              
              try {
                const cpmkRes = await rpsService.cpmk.create(editRpsId, {
                  kode: cpmk.kode,
                  deskripsi: cpmk.deskripsi.trim(),
                  cpl_ids: cpmk.cpl_ids.length > 0 ? cpmk.cpl_ids : undefined,
                  urutan: idx + 1
                })
                
                if (!cpmkRes.success) {
                  errors.push(`CPMK ${cpmk.kode}: ${cpmkRes.message || 'Gagal'}`)
                } else if (cpmkRes.data?.id) {
                  newCreatedIds[idx.toString()] = cpmkRes.data.id
                  console.log(`✅ CPMK ${cpmk.kode} berhasil dibuat`)
                }
              } catch (err) {
                errors.push(`CPMK ${cpmk.kode}: ${getErrorMessage(err)}`)
              }
            }
          }
          
          setCreatedCpmkIds(newCreatedIds)
          break
        }
        
        case "subcpmk": {
          if (!editRpsId) {
            errors.push("RPS belum dibuat")
            break
          }
          
          // First, delete Sub-CPMKs that were marked for deletion
          for (const subCpmkId of deletedSubCpmkIds) {
            try {
              const deleteRes = await rpsService.subCpmk?.delete(subCpmkId)
              if (!deleteRes.success) {
                errors.push(`Gagal menghapus Sub-CPMK: ${deleteRes.message || 'Error'}`)
              } else {
                console.log(`✅ Sub-CPMK ${subCpmkId} berhasil dihapus`)
              }
            } catch (err) {
              errors.push(`Gagal menghapus Sub-CPMK: ${getErrorMessage(err)}`)
            }
          }
          
          // Clear deleted IDs after processing
          setDeletedSubCpmkIds([])
          
          for (let cpmkIdx = 0; cpmkIdx < subCpmkList.length; cpmkIdx++) {
            const cpmkId = createdCpmkIds[cpmkIdx.toString()]
            console.log(`🔍 CPMK index ${cpmkIdx}, ID: ${cpmkId}, available IDs:`, createdCpmkIds)
            
            if (!cpmkId) {
              errors.push(`CPMK ${cpmkIdx + 1} belum dibuat. Simpan CPMK terlebih dahulu.`)
              continue
            }
            
            const subs = subCpmkList[cpmkIdx] || []
            console.log(`📋 Processing ${subs.length} Sub-CPMK for CPMK ${cpmkIdx + 1}`)
            
            for (const sub of subs) {
              if (sub.deskripsi?.trim()) {
                try {
                  let subRes: any
                  
                  if (sub.id) {
                    // Update existing Sub-CPMK
                    console.log(`📝 Updating Sub-CPMK ${sub.kode} (ID: ${sub.id})`)
                    subRes = await rpsService.subCpmk?.update(sub.id, {
                      kode: sub.kode,
                      deskripsi: sub.deskripsi.trim(),
                      urutan: sub.urutan
                    })
                  } else {
                    // Create new Sub-CPMK
                    console.log(`➕ Creating Sub-CPMK ${sub.kode}`)
                    subRes = await rpsService.subCpmk?.create(cpmkId, {
                      kode: sub.kode,
                      deskripsi: sub.deskripsi.trim(),
                      urutan: sub.urutan
                    })
                  }
                  
                  console.log(`📤 Sub-CPMK ${sub.kode} response:`, subRes)
                  
                  // Check if response exists and is successful
                  if (!subRes) {
                    errors.push(`Sub-CPMK ${sub.kode}: Service tidak tersedia`)
                  } else if (subRes.data && (subRes.data.id || sub.id)) {
                    // If we have data with ID, consider it successful regardless of success flag
                    console.log(`✅ Sub-CPMK ${sub.kode} ${sub.id ? 'diperbarui' : 'dibuat'}`)
                  } else if (!subRes.success) {
                    errors.push(`Sub-CPMK ${sub.kode}: ${subRes.message || 'Gagal memproses Sub-CPMK'}`)
                  } else {
                    console.log(`✅ Sub-CPMK ${sub.kode} ${sub.id ? 'diperbarui' : 'dibuat'}`)
                  }
                } catch (err) {
                  console.error(`❌ Sub-CPMK ${sub.kode} error:`, err)
                  errors.push(`Sub-CPMK ${sub.kode}: ${getErrorMessage(err)}`)
                }
              }
            }
          }
          break
        }
        
        case "rencana": {
          if (!editRpsId) {
            errors.push("RPS belum dibuat. Silakan simpan Info Dasar terlebih dahulu.")
            break
          }
          
          for (const rp of rencanaPembelajaran) {
            if (rp.topik?.trim()) {
              try {
                const requestData = {
                  minggu_ke: rp.minggu_ke,
                  sub_cpmk_id: rp.sub_cpmk_id || undefined,
                  topik: rp.topik.trim(),
                  sub_topik: rp.sub_topik.length > 0 ? rp.sub_topik : undefined,
                  metode_pembelajaran: rp.metode_pembelajaran || "Tatap Muka",
                  waktu_menit: rp.waktu_menit > 0 ? rp.waktu_menit : 150,
                  teknik_kriteria: rp.teknik_kriteria || "",
                  bobot_persen: rp.bobot_persen > 0 ? rp.bobot_persen : 0
                }
                
                console.log(`📤 Mengirim rencana pembelajaran minggu ${rp.minggu_ke}:`, requestData)
                
                // Check if we need to update or create
                if (rp.id) {
                  // Update existing
                  const rpRes = await rpsService.rencanaPembelajaran.update(rp.id, requestData)
                  if (!rpRes.success) {
                    const errorDetail = rpRes.message || 'Gagal menyimpan'
                    errors.push(`Minggu ${rp.minggu_ke} (${rp.topik}): ${errorDetail}`)
                    console.error(`❌ Minggu ${rp.minggu_ke} gagal:`, rpRes)
                  } else {
                    console.log(`✅ Minggu ${rp.minggu_ke} berhasil diupdate`)
                  }
                } else {
                  // Create new
                  const rpRes = await rpsService.rencanaPembelajaran.create(editRpsId, requestData)
                  if (!rpRes.success) {
                    const errorDetail = rpRes.message || 'Gagal menyimpan'
                    errors.push(`Minggu ${rp.minggu_ke} (${rp.topik}): ${errorDetail}`)
                    console.error(`❌ Minggu ${rp.minggu_ke} gagal:`, rpRes)
                  } else {
                    console.log(`✅ Minggu ${rp.minggu_ke} berhasil dibuat`)
                    // Update local state with returned ID
                    if (rpRes.data?.id) {
                      const rpIndex = rencanaPembelajaran.findIndex(r => r === rp)
                      if (rpIndex >= 0) {
                        const updated = [...rencanaPembelajaran]
                        updated[rpIndex] = { ...updated[rpIndex], id: rpRes.data.id }
                        setRencanaPembelajaran(updated)
                      }
                    }
                  }
                }
              } catch (err) {
                const errorMsg = getErrorMessage(err)
                errors.push(`Minggu ${rp.minggu_ke} (${rp.topik}): ${errorMsg}`)
                console.error(`❌ Error minggu ${rp.minggu_ke}:`, err)
              }
            }
          }
          break
        }
        
        case "tugas": {
          if (!editRpsId) {
            errors.push("RPS belum dibuat")
            break
          }
          
          // Filter tugas yang valid (semua field required terisi)
          const validTugas = rencanaTugas.filter(t => 
            t.judul?.trim() && 
            t.jenis_tugas && 
            t.bobot > 0 &&
            t.batas_waktu_minggu > 0 &&
            t.batas_waktu_minggu <= 16
          )
          
          if (validTugas.length === 0 && rencanaTugas.length > 0) {
            errors.push("Tidak ada tugas yang valid untuk disimpan. Pastikan semua field required terisi.")
            break
          }
          
          for (const tugas of validTugas) {
            try {
              const tugasRes = await rpsService.rencanaTugas?.create(editRpsId, {
                nomor_tugas: tugas.nomor_tugas,
                judul: tugas.judul.trim(),
                sub_cpmk_id: tugas.sub_cpmk_id || undefined,
                indikator_keberhasilan: tugas.indikator_keberhasilan?.trim() || "",
                batas_waktu_minggu: tugas.batas_waktu_minggu,
                petunjuk_pengerjaan: tugas.petunjuk_pengerjaan?.trim() || "",
                jenis_tugas: tugas.jenis_tugas,
                luaran_tugas: tugas.luaran_tugas?.trim() || "",
                kriteria_penilaian: tugas.kriteria_penilaian?.trim() || "",
                teknik_penilaian: tugas.teknik_penilaian || "",
                bobot: tugas.bobot,
                daftar_rujukan: tugas.daftar_rujukan?.trim() || undefined
              })
              if (tugasRes && !tugasRes.success) {
                errors.push(`Tugas "${tugas.judul}": ${tugasRes.message || 'Gagal'}`)
              } else {
                console.log(`✅ Tugas "${tugas.judul}" berhasil disimpan`)
              }
            } catch (err) {
              errors.push(`Tugas "${tugas.judul}": ${getErrorMessage(err)}`)
            }
          }
          
          // Info tugas yang dilewati
          const skippedTugas = rencanaTugas.filter(t => 
            t.judul?.trim() && (
              t.bobot <= 0 || 
              t.batas_waktu_minggu <= 0 || 
              t.batas_waktu_minggu > 16 ||
              !t.jenis_tugas
            )
          )
          if (skippedTugas.length > 0) {
            errors.push(`${skippedTugas.length} tugas dilewati karena data tidak lengkap`)
          }
          break
        }
        
        case "analisis": {
          if (!editRpsId) {
            errors.push("RPS belum dibuat")
            break
          }
          
          for (const analisis of analisisKetercapaian) {
            if (analisis.cpl_id) {
              try {
                const requestData = {
                  minggu_mulai: analisis.minggu_mulai,
                  minggu_selesai: analisis.minggu_selesai || 16,
                  cpl_id: analisis.cpl_id,
                  bobot_kontribusi: analisis.bobot_kontribusi,
                  cpmk_ids: analisis.cpmk_ids.length > 0 ? analisis.cpmk_ids : undefined,
                  sub_cpmk_ids: analisis.sub_cpmk_ids.length > 0 ? analisis.sub_cpmk_ids : undefined,
                  topik_materi: analisis.topik_materi || undefined,
                  jenis_assessment: analisis.jenis_assessment || undefined
                }
                
                let analisisRes
                if (analisis.id) {
                  // Update existing
                  analisisRes = await rpsService.analisisKetercapaian?.update(analisis.id, requestData)
                  if (analisisRes && !analisisRes.success) {
                    errors.push(`Analisis Update: ${analisisRes.message || 'Gagal'}`)
                  } else {
                    console.log(`✅ Analisis ketercapaian updated: ${analisis.id}`)
                  }
                } else {
                  // Create new
                  analisisRes = await rpsService.analisisKetercapaian?.create(editRpsId, requestData)
                  if (analisisRes && !analisisRes.success) {
                    errors.push(`Analisis Create: ${analisisRes.message || 'Gagal'}`)
                  } else {
                    console.log(`✅ Analisis ketercapaian created`)
                  }
                }
              } catch (err) {
                errors.push(`Analisis: ${getErrorMessage(err)}`)
              }
            }
          }
          
          // Delete removed items
          for (const deletedId of deletedAnalisisIds) {
            try {
              const deleteRes = await rpsService.analisisKetercapaian?.delete(deletedId)
              if (deleteRes && !deleteRes.success) {
                errors.push(`Analisis Delete: ${deleteRes.message || 'Gagal'}`)
              } else {
                console.log(`✅ Analisis ketercapaian deleted: ${deletedId}`)
              }
            } catch (err) {
              errors.push(`Analisis Delete: ${getErrorMessage(err)}`)
            }
          }
          // Clear deleted IDs after processing
          setDeletedAnalisisIds([])
          break
        }
        
        case "pustaka": {
          if (!editRpsId) {
            errors.push("RPS belum dibuat")
            break
          }
          
          for (let i = 0; i < bahanBacaan.length; i++) {
            const bb = bahanBacaan[i]
            if (bb.judul?.trim()) {
              try {
                const requestData = {
                  judul: bb.judul.trim(),
                  penulis: bb.penulis || undefined,
                  tahun: bb.tahun > 0 ? bb.tahun : undefined,
                  penerbit: bb.penerbit || undefined,
                  jenis: bb.jenis || undefined,
                  isbn: bb.isbn || undefined,
                  halaman: bb.halaman || undefined,
                  url: bb.url || undefined,
                  is_wajib: bb.is_wajib,
                  urutan: i + 1
                }
                
                let bbRes
                if (bb.id) {
                  // Update existing bahan bacaan
                  bbRes = await rpsService.bahanBacaan.update(bb.id, requestData)
                } else {
                  // Create new bahan bacaan
                  bbRes = await rpsService.bahanBacaan.create(editRpsId, requestData)
                }
                
                if (!bbRes.success) {
                  errors.push(`Pustaka "${bb.judul}": ${bbRes.message || 'Gagal'}`)
                } else {
                  console.log(`✅ Pustaka "${bb.judul}" berhasil ${bb.id ? 'diupdate' : 'dibuat'}`)
                }
              } catch (err) {
                errors.push(`Pustaka "${bb.judul}": ${getErrorMessage(err)}`)
              }
            }
          }
          break
        }
      }
      
    } catch (err) {
      errors.push(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
    
    return { success: errors.length === 0, errors }
  }

  // Handle next step button
  const handleNextStep = async () => {
    setError(null)
    
    // Validate current step
    const validation = validateCurrentStep()
    if (!validation.valid) {
      setError(`Validasi gagal:\n• ${validation.errors.join('\n• ')}`)
      return
    }
    
    // Submit current step
    const result = await submitCurrentStep()
    
    // Update step errors
    setStepErrors(prev => ({
      ...prev,
      [activeTab]: result.errors
    }))
    
    if (result.success) {
      // Mark step as completed
      if (!completedSteps.includes(activeTab)) {
        setCompletedSteps(prev => [...prev, activeTab])
      }
      
      // Go to next tab
      const nextTab = getNextTab()
      if (nextTab) {
        setActiveTab(nextTab)
      }
    } else {
      // Show errors
      setError(`Beberapa data gagal disimpan:\n• ${result.errors.join('\n• ')}`)
    }
  }

  // Handle final submit (Simpan Draft)
  const handleFinalSubmit = async () => {
    setError(null)
    
    // Validate current step first
    const validation = validateCurrentStep()
    if (!validation.valid) {
      setError(`Validasi gagal:\n• ${validation.errors.join('\n• ')}`)
      return
    }
    
    // Submit current step
    const result = await submitCurrentStep()
    
    if (result.errors.length > 0) {
      setStepErrors(prev => ({
        ...prev,
        [activeTab]: result.errors
      }))
    }
    
    // Check all errors
    const allErrors = Object.entries(stepErrors).flatMap(([step, errs]) => 
      errs.map(e => `[${step}] ${e}`)
    ).concat(result.errors)
    
    if (allErrors.length > 0) {
      const confirmSubmit = window.confirm(
        `Ada ${allErrors.length} error saat menyimpan data:\n\n• ${allErrors.slice(0, 5).join('\n• ')}${allErrors.length > 5 ? `\n• ... dan ${allErrors.length - 5} lainnya` : ''}\n\nApakah Anda tetap ingin melihat RPS yang sudah dibuat?`
      )
      
      if (confirmSubmit && editRpsId) {
        router.push(`/dosen/rps/${editRpsId}`)
      }
    } else {
      // Mark as completed
      if (!completedSteps.includes(activeTab)) {
        setCompletedSteps(prev => [...prev, activeTab])
      }
      
      alert('RPS berhasil disimpan!')
      if (editRpsId) {
        router.push(`/dosen/rps/${editRpsId}`)
      }
    }
  }

  // Handle previous step
  const handlePreviousStep = () => {
    const prevTab = getPreviousTab()
    if (prevTab) {
      setActiveTab(prevTab)
    }
  }

  // Get tab label
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

  // CPMK management
  const addCpmk = () => {
    const nextNum = cpmkList.length + 1
    setCpmkList([...cpmkList, { 
      kode: `CPMK-${String(nextNum).padStart(2, '0')}`, 
      deskripsi: "", 
      cpl_ids: [] 
    }])
  }

  const removeCpmk = async (index: number) => {
    const cpmk = cpmkList[index]
    
    // If CPMK has an ID (either from initial load or created), mark for deletion
    if (cpmk.id) {
      setDeletedCpmkIds(prev => [...prev, cpmk.id!])
    } else {
      // Check if it was created in this session
      const createdId = createdCpmkIds[index.toString()]
      if (createdId) {
        setDeletedCpmkIds(prev => [...prev, createdId])
      }
    }
    
    // Remove from local state
    const newCpmkList = cpmkList.filter((_, i) => i !== index)
    const newSubCpmkList = subCpmkList.filter((_, i) => i !== index)
    
    setCpmkList(newCpmkList)
    setSubCpmkList(newSubCpmkList)
    
    // Rebuild createdCpmkIds mapping by shifting indices down
    const newCreatedIds: Record<string, string> = {}
    Object.entries(createdCpmkIds).forEach(([idxStr, id]) => {
      const idx = parseInt(idxStr)
      if (idx < index) {
        // Keep indices before the deleted one
        newCreatedIds[idxStr] = id
      } else if (idx > index) {
        // Shift indices after the deleted one down by 1
        newCreatedIds[(idx - 1).toString()] = id
      }
      // Skip the deleted index
    })
    setCreatedCpmkIds(newCreatedIds)
  }

  const updateCpmk = (index: number, field: keyof CPMKForm, value: string | string[]) => {
    const updated = [...cpmkList]
    updated[index] = { ...updated[index], [field]: value }
    setCpmkList(updated)
  }

  // Sub-CPMK management
  const addSubCpmk = (cpmkIdx: number) => {
    const nextNum = (subCpmkList[cpmkIdx]?.length || 0) + 1
    const updated = [...subCpmkList]
    if (!updated[cpmkIdx]) updated[cpmkIdx] = []
    updated[cpmkIdx] = [
      ...updated[cpmkIdx],
      { kode: `Sub-CPMK-${String(nextNum).padStart(2, '0')}`, deskripsi: '', urutan: nextNum }
    ]
    setSubCpmkList(updated)
  }

  const removeSubCpmk = (cpmkIdx: number, subIdx: number) => {
    const subCpmk = subCpmkList[cpmkIdx]?.[subIdx]
    
    // If Sub-CPMK has an ID, mark for deletion
    if (subCpmk?.id) {
      setDeletedSubCpmkIds(prev => [...prev, subCpmk.id!])
    }
    
    const updated = [...subCpmkList]
    updated[cpmkIdx] = updated[cpmkIdx].filter((_, i) => i !== subIdx)
    setSubCpmkList(updated)
  }

  const updateSubCpmk = (cpmkIdx: number, subIdx: number, field: keyof SubCPMKForm, value: string | number) => {
    const updated = [...subCpmkList]
    updated[cpmkIdx][subIdx] = { ...updated[cpmkIdx][subIdx], [field]: value }
    setSubCpmkList(updated)
  }

  // Bahan Bacaan management
  const addBahanBacaan = () => {
    setBahanBacaan([...bahanBacaan, { 
      judul: "", 
      penulis: "", 
      tahun: new Date().getFullYear(),
      penerbit: "",
      jenis: 'buku',
      isbn: "",
      halaman: "",
      url: "",
      is_wajib: false,
      urutan: bahanBacaan.length + 1
    }])
  }

  const removeBahanBacaan = (index: number) => {
    setBahanBacaan(bahanBacaan.filter((_, i) => i !== index))
  }

  const updateBahanBacaan = (index: number, field: keyof BahanBacaanForm, value: string | number | boolean) => {
    const updated = [...bahanBacaan]
    updated[index] = { ...updated[index], [field]: value }
    setBahanBacaan(updated)
  }

  // Rencana Pembelajaran management
  const updateRencanaPembelajaran = (index: number, field: keyof RencanaPembelajaranForm, value: string | number | string[]) => {
    const updated = [...rencanaPembelajaran]
    updated[index] = { ...updated[index], [field]: value }
    setRencanaPembelajaran(updated)
  }
  
  const addRencanaPembelajaran = () => {
    const nextMinggu = rencanaPembelajaran.length > 0 
      ? Math.max(...rencanaPembelajaran.map(rp => rp.minggu_ke)) + 1 
      : 1
    setRencanaPembelajaran([...rencanaPembelajaran, {
      minggu_ke: nextMinggu,
      sub_cpmk_id: '',
      topik: '',
      sub_topik: [],
      metode_pembelajaran: 'Tatap Muka: Ceramah, Diskusi',
      waktu_menit: 150,
      teknik_kriteria: '',
      bobot_persen: 0
    }])
  }
  
  const removeRencanaPembelajaran = async (index: number) => {
    const rpToRemove = rencanaPembelajaran[index]
    
    // Jika sudah ada di backend (punya ID), hapus via API
    if (rpToRemove.id) {
      try {
        await rpsService.rencanaPembelajaran.delete(rpToRemove.id)
        console.log(`✅ Rencana pembelajaran minggu ${rpToRemove.minggu_ke} dihapus dari server`)
      } catch (err) {
        console.error('Gagal menghapus rencana pembelajaran:', err)
      }
    }
    
    setRencanaPembelajaran(rencanaPembelajaran.filter((_, i) => i !== index))
  }

  // Rencana Tugas management
  const addRencanaTugas = () => {
    const nextNum = rencanaTugas.length + 1
    setRencanaTugas([...rencanaTugas, {
      nomor_tugas: nextNum,
      judul: '',
      sub_cpmk_id: '',
      indikator_keberhasilan: '',
      batas_waktu_minggu: 4,
      petunjuk_pengerjaan: '',
      jenis_tugas: 'individu',
      luaran_tugas: '',
      kriteria_penilaian: '',
      teknik_penilaian: 'Rubrik',
      bobot: 10,
      daftar_rujukan: ''
    }])
  }

  const removeRencanaTugas = (index: number) => {
    setRencanaTugas(rencanaTugas.filter((_, i) => i !== index))
  }

  const updateRencanaTugas = (index: number, field: keyof RencanaTugasForm, value: string | number | boolean) => {
    const updated = [...rencanaTugas]
    updated[index] = { ...updated[index], [field]: value }
    setRencanaTugas(updated)
  }

  // Analisis Ketercapaian management
  const addAnalisisKetercapaian = () => {
    setAnalisisKetercapaian([...analisisKetercapaian, {
      minggu_mulai: 1,
      minggu_selesai: 16,
      cpl_id: '',
      cpmk_ids: [],
      sub_cpmk_ids: [],
      topik_materi: '',
      jenis_assessment: '',
      bobot_kontribusi: 0
    }])
  }

  const removeAnalisisKetercapaian = (index: number) => {
    const itemToRemove = analisisKetercapaian[index]
    // Jika item memiliki ID (sudah disimpan di backend), track untuk delete
    if (itemToRemove.id) {
      setDeletedAnalisisIds(prev => [...prev, itemToRemove.id!])
    }
    setAnalisisKetercapaian(analisisKetercapaian.filter((_, i) => i !== index))
  }

  const updateAnalisisKetercapaian = (index: number, field: keyof AnalisisKetercapaianForm, value: string | number | string[]) => {
    const updated = [...analisisKetercapaian]
    updated[index] = { ...updated[index], [field]: value }
    setAnalisisKetercapaian(updated)
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit RPS</h1>
              <p className="text-slate-600">
                {rpsData?.mata_kuliah_nama ? `${rpsData.mata_kuliah_nama} - ${rpsData.tahun_ajaran}` : `RPS ID: ${editRpsId}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* RPS Status Badge */}
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
            {/* Completed steps count */}
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

        {/* Tampilkan ringkasan validasi error */}
        {Object.keys(formErrors).length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">Data belum lengkap:</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {Object.entries(formErrors).map(([key, message]) => (
                      <li key={key}>{message}</li>
                    ))}
                  </ul>
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
                const hasError = stepErrors[tab]?.length > 0
                const isCompleted = completedSteps.includes(tab)
                const isCurrent = activeTab === tab
                return (
                  <div
                    key={tab}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      hasError ? 'bg-red-500' : 
                      isCompleted ? 'bg-green-500' : 
                      isCurrent ? 'bg-blue-500' : 
                      'bg-slate-200'
                    }`}
                    title={`${getTabLabel(tab)}${hasError ? ' (Ada error)' : isCompleted ? ' (Selesai)' : ''}`}
                  />
                )
              })}
            </div>
            {Object.keys(stepErrors).some(k => stepErrors[k]?.length > 0) && (
              <div className="mt-2 text-sm text-red-600">
                <span className="font-medium">Ada error di: </span>
                {Object.entries(stepErrors)
                  .filter(([, errs]) => errs?.length > 0)
                  .map(([tab]) => getTabLabel(tab))
                  .join(', ')}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            {tabOrder.map((tab) => {
              const hasError = stepErrors[tab]?.length > 0
              const isCompleted = completedSteps.includes(tab)
              return (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className={`relative ${hasError ? 'text-red-600' : isCompleted ? 'text-green-600' : ''}`}
                >
                  {getTabLabel(tab)}
                  {isCompleted && !hasError && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  {hasError && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
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
                <CardDescription>Pilih mata kuliah dan isi informasi dasar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mata_kuliah">Mata Kuliah *</Label>
                    <Select
                      value={formData.mata_kuliah_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, mata_kuliah_id: value }))}
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
                    {formErrors.mata_kuliah_id && (
                      <p className="text-sm text-red-500">{formErrors.mata_kuliah_id}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tahun_ajaran">Tahun Ajaran</Label>
                    <Select
                      value={formData.tahun_ajaran}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tahun_ajaran: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                        <SelectItem value="2026/2027">2026/2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester_type">Semester</Label>
                    <Select
                      value={formData.semester_type}
                      onValueChange={(value: 'ganjil' | 'genap') => setFormData(prev => ({ ...prev, semester_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ganjil">Ganjil</SelectItem>
                        <SelectItem value="genap">Genap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tanggal_penyusunan">Tanggal Penyusunan</Label>
                    <Input
                      id="tanggal_penyusunan"
                      type="date"
                      value={formData.tanggal_penyusunan}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_penyusunan: e.target.value }))}
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
                  <h3 className="font-semibold mb-4">Informasi Penyusun & Pengesahan</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="penyusun_nama">Nama Penyusun</Label>
                      <Input
                        id="penyusun_nama"
                        placeholder="Dr. Nama Lengkap"
                        value={formData.penyusun_nama}
                        onChange={(e) => setFormData(prev => ({ ...prev, penyusun_nama: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="penyusun_nidn">NIDN Penyusun</Label>
                      <Input
                        id="penyusun_nidn"
                        placeholder="197812102005011001"
                        value={formData.penyusun_nidn}
                        onChange={(e) => setFormData(prev => ({ ...prev, penyusun_nidn: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="koordinator_rmk_nama">Nama Koordinator RMK</Label>
                      <Input
                        id="koordinator_rmk_nama"
                        placeholder="Prof. Nama Lengkap"
                        value={formData.koordinator_rmk_nama}
                        onChange={(e) => setFormData(prev => ({ ...prev, koordinator_rmk_nama: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="koordinator_rmk_nidn">NIDN Koordinator RMK</Label>
                      <Input
                        id="koordinator_rmk_nidn"
                        placeholder="1234567890"
                        value={formData.koordinator_rmk_nidn}
                        onChange={(e) => setFormData(prev => ({ ...prev, koordinator_rmk_nidn: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kaprodi_nama">Nama Kaprodi</Label>
                      <Input
                        id="kaprodi_nama"
                        placeholder="Dr. Nama Lengkap"
                        value={formData.kaprodi_nama}
                        onChange={(e) => setFormData(prev => ({ ...prev, kaprodi_nama: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kaprodi_nidn">NIDN Kaprodi</Label>
                      <Input
                        id="kaprodi_nidn"
                        placeholder="9876543210"
                        value={formData.kaprodi_nidn}
                        onChange={(e) => setFormData(prev => ({ ...prev, kaprodi_nidn: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fakultas">Fakultas</Label>
                      <Input
                        id="fakultas"
                        placeholder="Fakultas Teknik"
                        value={formData.fakultas}
                        onChange={(e) => setFormData(prev => ({ ...prev, fakultas: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program_studi">Program Studi</Label>
                      <Input
                        id="program_studi"
                        placeholder="Informatika"
                        value={formData.program_studi}
                        onChange={(e) => setFormData(prev => ({ ...prev, program_studi: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Deskripsi & Capaian */}
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deskripsi_mk">Deskripsi Mata Kuliah *</Label>
                    <Textarea
                      id="deskripsi_mk"
                      placeholder="Deskripsi tentang mata kuliah..."
                      value={formData.deskripsi_mk}
                      onChange={(e) => setFormData(prev => ({ ...prev, deskripsi_mk: e.target.value }))}
                      rows={4}
                    />
                    {formErrors.deskripsi_mk && (
                      <p className="text-sm text-red-500">{formErrors.deskripsi_mk}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capaian_pembelajaran">Capaian Pembelajaran</Label>
                    <Textarea
                      id="capaian_pembelajaran"
                      placeholder="Mahasiswa dapat membangun aplikasi..."
                      value={formData.capaian_pembelajaran}
                      onChange={(e) => setFormData(prev => ({ ...prev, capaian_pembelajaran: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Metode & Media Pembelajaran */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Metode & Media Pembelajaran</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Metode Pembelajaran</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Ceramah', 'Diskusi', 'Praktikum', 'Tugas', 'Presentasi', 'Studi Kasus', 'Project Based Learning'].map(metode => (
                          <Badge 
                            key={metode}
                            variant={formData.metode_pembelajaran.includes(metode) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                metode_pembelajaran: prev.metode_pembelajaran.includes(metode)
                                  ? prev.metode_pembelajaran.filter(m => m !== metode)
                                  : [...prev.metode_pembelajaran, metode]
                              }))
                            }}
                          >
                            {metode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Media Pembelajaran</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Laptop', 'Projector', 'LMS', 'Whiteboard', 'Video', 'E-Book', 'Software'].map(media => (
                          <Badge 
                            key={media}
                            variant={formData.media_pembelajaran.includes(media) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                media_pembelajaran: prev.media_pembelajaran.includes(media)
                                  ? prev.media_pembelajaran.filter(m => m !== media)
                                  : [...prev.media_pembelajaran, media]
                              }))
                            }}
                          >
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                    <CardDescription>Definisikan CPMK dan hubungkan dengan CPL</CardDescription>
                  </div>
                  <Button onClick={addCpmk}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah CPMK
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formErrors.cpmk && (
                  <p className="text-sm text-red-500">{formErrors.cpmk}</p>
                )}
                
                {cpmkList.map((cpmk, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{cpmk.kode}</Badge>
                        {cpmkList.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeCpmk(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Deskripsi CPMK *</Label>
                        <Textarea
                          placeholder="Deskripsi capaian pembelajaran..."
                          value={cpmk.deskripsi}
                          onChange={(e) => updateCpmk(index, 'deskripsi', e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>CPL Terkait</Label>
                        <div className="flex flex-wrap gap-2">
                          {cplList.map(cpl => (
                            <Badge
                              key={cpl.id}
                              variant={cpmk.cpl_ids.includes(cpl.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                const newIds = cpmk.cpl_ids.includes(cpl.id)
                                  ? cpmk.cpl_ids.filter(id => id !== cpl.id)
                                  : [...cpmk.cpl_ids, cpl.id]
                                updateCpmk(index, 'cpl_ids', newIds)
                              }}
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
                <CardDescription>Definisikan Sub-CPMK untuk setiap CPMK</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cpmkList.length === 0 && (
                  <p className="text-sm text-slate-500">Tambahkan CPMK terlebih dahulu</p>
                )}
                {cpmkList.map((cpmk, cpmkIdx) => (
                  <Card key={cpmkIdx} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">{cpmk.kode}</Badge>
                          <p className="text-sm text-slate-600">{cpmk.deskripsi}</p>
                        </div>
                        <Button size="sm" onClick={() => addSubCpmk(cpmkIdx)}>
                          <Plus className="h-4 w-4 mr-2" />Tambah Sub-CPMK
                        </Button>
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
                              onChange={e => updateSubCpmk(cpmkIdx, subIdx, 'kode', e.target.value)}
                              placeholder="Kode"
                            />
                            <Input
                              className="flex-1 h-8 text-xs"
                              value={sub.deskripsi}
                              onChange={e => updateSubCpmk(cpmkIdx, subIdx, 'deskripsi', e.target.value)}
                              placeholder="Deskripsi Sub-CPMK"
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSubCpmk(cpmkIdx, subIdx)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rencana Pembelajaran Mingguan</CardTitle>
                    <CardDescription>Detail topik dan aktivitas untuk setiap minggu pembelajaran</CardDescription>
                  </div>
                  <Button onClick={addRencanaPembelajaran}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Minggu
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {rencanaPembelajaran.length === 0 && (
                  <p className="text-sm text-slate-500 italic text-center py-8">
                    Belum ada rencana pembelajaran. Klik &quot;Tambah Minggu&quot; untuk memulai.
                  </p>
                )}
                {rencanaPembelajaran.map((rp, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-colors ${
                      expandedWeek === rp.minggu_ke ? 'border-blue-300 bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
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
                            <Badge variant="info">{rp.bobot_persen}%</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeRencanaPembelajaran(index)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          {expandedWeek === rp.minggu_ke ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                      
                      {expandedWeek === rp.minggu_ke && (
                        <div className="mt-4 space-y-4 pt-4 border-t">
                          {/* Minggu dan Sub-CPMK */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Minggu Ke-</Label>
                              <Input
                                type="number"
                                min={1}
                                max={16}
                                value={rp.minggu_ke}
                                onChange={(e) => updateRencanaPembelajaran(index, 'minggu_ke', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Kemampuan Akhir Tiap Tahapan (Sub-CPMK)</Label>
                              <Select
                                value={rp.sub_cpmk_id || "none"}
                                onValueChange={(value) => updateRencanaPembelajaran(index, 'sub_cpmk_id', value === "none" ? "" : value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Sub-CPMK" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Tidak Ada</SelectItem>
                                  {subCpmkList.flat().filter(sub => sub.id).map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id!}>
                                      {sub.kode}: {sub.deskripsi}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Topik & Sub-Topik */}
                          <div className="space-y-2">
                            <Label>Topik & Sub-Topik Materi</Label>
                            <Input
                              placeholder="Topik utama pertemuan..."
                              value={rp.topik}
                              onChange={(e) => updateRencanaPembelajaran(index, 'topik', e.target.value)}
                            />
                            <Textarea
                              placeholder="Sub-topik (satu per baris)..."
                              value={rp.sub_topik?.join('\n') || ''}
                              onChange={(e) => updateRencanaPembelajaran(index, 'sub_topik', e.target.value.split('\n').filter(s => s.trim()))}
                              rows={3}
                              className="text-sm"
                            />
                            <p className="text-xs text-slate-500">Masukkan sub-topik, satu per baris</p>
                          </div>

                          {/* Metode Pembelajaran */}
                          <div className="space-y-2">
                            <Label>Metode Pembelajaran (Skema Blended Learning)</Label>
                            <Textarea
                              placeholder="Contoh:&#10;Tatap Muka: Ceramah, Diskusi, dan Praktikum (3 SKS)&#10;Daring: Forum diskusi di LMS (1 SKS)"
                              value={rp.metode_pembelajaran}
                              onChange={(e) => updateRencanaPembelajaran(index, 'metode_pembelajaran', e.target.value)}
                              rows={3}
                            />
                          </div>

                          {/* Waktu */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Waktu (Menit)</Label>
                              <Input
                                type="number"
                                value={rp.waktu_menit}
                                onChange={(e) => updateRencanaPembelajaran(index, 'waktu_menit', parseInt(e.target.value) || 150)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Bobot (%)</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={rp.bobot_persen}
                                onChange={(e) => updateRencanaPembelajaran(index, 'bobot_persen', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          {/* Penilaian */}
                          <div className="space-y-2">
                            <Label>Teknik & Kriteria Penilaian</Label>
                            <Textarea
                              placeholder="Contoh:&#10;Teknik: Observasi partisipasi dan Quiz&#10;Kriteria: Keaktifan, pemahaman konsep dasar, ketepatan jawaban"
                              value={rp.teknik_kriteria}
                              onChange={(e) => updateRencanaPembelajaran(index, 'teknik_kriteria', e.target.value)}
                              rows={3}
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bahan Bacaan / Pustaka</CardTitle>
                    <CardDescription>Referensi utama dan pendukung</CardDescription>
                  </div>
                  <Button onClick={addBahanBacaan}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pustaka
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {bahanBacaan.map((bb, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {bb.jenis ? bb.jenis.charAt(0).toUpperCase() + bb.jenis.slice(1) : 'Buku'}
                        </Badge>
                        {bahanBacaan.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeBahanBacaan(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Jenis</Label>
                          <Select
                            value={bb.jenis}
                            onValueChange={(value: 'buku' | 'jurnal' | 'artikel' | 'website' | 'modul') => updateBahanBacaan(index, 'jenis', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buku">Buku</SelectItem>
                              <SelectItem value="jurnal">Jurnal</SelectItem>
                              <SelectItem value="artikel">Artikel</SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="modul">Modul</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Tahun</Label>
                          <Input
                            type="number"
                            value={bb.tahun}
                            onChange={(e) => updateBahanBacaan(index, 'tahun', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Judul Buku/Referensi</Label>
                        <Input
                          placeholder="Judul buku..."
                          value={bb.judul}
                          onChange={(e) => updateBahanBacaan(index, 'judul', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Penulis</Label>
                          <Input
                            placeholder="Nama penulis..."
                            value={bb.penulis}
                            onChange={(e) => updateBahanBacaan(index, 'penulis', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Penerbit</Label>
                          <Input
                            placeholder="Nama penerbit..."
                            value={bb.penerbit}
                            onChange={(e) => updateBahanBacaan(index, 'penerbit', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>ISBN</Label>
                          <Input
                            placeholder="ISBN..."
                            value={bb.isbn}
                            onChange={(e) => updateBahanBacaan(index, 'isbn', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Halaman</Label>
                          <Input
                            placeholder="Range halaman, misal: 1-50"
                            value={bb.halaman}
                            onChange={(e) => updateBahanBacaan(index, 'halaman', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`is_wajib_${index}`}
                            checked={bb.is_wajib}
                            onChange={(e) => updateBahanBacaan(index, 'is_wajib', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`is_wajib_${index}`} className="cursor-pointer">Wajib</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          placeholder="https://..."
                          value={bb.url}
                          onChange={(e) => updateBahanBacaan(index, 'url', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Rencana Tugas */}
          <TabsContent value="tugas" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-600" />
                      Rencana Tugas
                    </CardTitle>
                    <CardDescription>Definisikan tugas dan penilaian mahasiswa</CardDescription>
                  </div>
                  <Button onClick={addRencanaTugas}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Tugas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rencanaTugas.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada rencana tugas</p>
                    <p className="text-sm">Klik &quot;Tambah Tugas&quot; untuk menambahkan</p>
                  </div>
                )}
                {rencanaTugas.map((tugas, index) => (
                  <Card key={index} className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-amber-50">Tugas {tugas.nomor_tugas}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeRencanaTugas(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      {/* Row 1: Judul dan Jenis Tugas */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Judul Tugas <span className="text-red-500">*</span></Label>
                          <Input
                            value={tugas.judul}
                            onChange={(e) => updateRencanaTugas(index, 'judul', e.target.value)}
                            placeholder="Contoh: Tugas 1: Membuat Program Hello World"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sub-CPMK Terkait</Label>
                          <Select
                            value={tugas.sub_cpmk_id || "none"}
                            onValueChange={(val) => updateRencanaTugas(index, 'sub_cpmk_id', val === "none" ? "" : val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Sub-CPMK" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Tidak Ada</SelectItem>
                              {subCpmkList.flat().filter(sub => sub.id).map((subCpmk) => (
                                <SelectItem key={subCpmk.id} value={subCpmk.id!}>
                                  {subCpmk.kode} - {subCpmk.deskripsi?.substring(0, 50)}...
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Row 2: Jenis Tugas */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Jenis Tugas <span className="text-red-500">*</span></Label>
                          <Select
                            value={tugas.jenis_tugas}
                            onValueChange={(val: 'individu' | 'kelompok') => updateRencanaTugas(index, 'jenis_tugas', val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individu">Individu</SelectItem>
                              <SelectItem value="kelompok">Kelompok</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Row 3: Indikator Keberhasilan */}
                      <div className="space-y-2">
                        <Label>Indikator Keberhasilan</Label>
                        <Textarea
                          value={tugas.indikator_keberhasilan}
                          onChange={(e) => updateRencanaTugas(index, 'indikator_keberhasilan', e.target.value)}
                          placeholder="Contoh: Mahasiswa mampu membuat program sederhana dengan Python"
                          rows={2}
                        />
                      </div>
                      
                      {/* Row 3: Petunjuk Pengerjaan */}
                      <div className="space-y-2">
                        <Label>Petunjuk Pengerjaan</Label>
                        <Textarea
                          value={tugas.petunjuk_pengerjaan}
                          onChange={(e) => updateRencanaTugas(index, 'petunjuk_pengerjaan', e.target.value)}
                          placeholder="Contoh: Buat file hello.py dan upload ke LMS sebelum batas waktu"
                          rows={2}
                        />
                      </div>
                      
                      {/* Row 4: Luaran Tugas */}
                      <div className="space-y-2">
                        <Label>Luaran Tugas</Label>
                        <Input
                          value={tugas.luaran_tugas}
                          onChange={(e) => updateRencanaTugas(index, 'luaran_tugas', e.target.value)}
                          placeholder="Contoh: File Python (.py), Laporan PDF"
                        />
                      </div>
                      
                      {/* Row 5: Kriteria & Teknik Penilaian */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kriteria Penilaian</Label>
                          <Textarea
                            value={tugas.kriteria_penilaian}
                            onChange={(e) => updateRencanaTugas(index, 'kriteria_penilaian', e.target.value)}
                            placeholder="Contoh: Ketepatan output (40%), Kerapihan kode (30%), Dokumentasi (30%)"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Teknik Penilaian</Label>
                          <Select
                            value={tugas.teknik_penilaian || ""}
                            onValueChange={(val) => updateRencanaTugas(index, 'teknik_penilaian', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih teknik penilaian" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Rubrik">Rubrik</SelectItem>
                              <SelectItem value="Checklist">Checklist</SelectItem>
                              <SelectItem value="Portofolio">Portofolio</SelectItem>
                              <SelectItem value="Observasi">Observasi</SelectItem>
                              <SelectItem value="Tes Tertulis">Tes Tertulis</SelectItem>
                              <SelectItem value="Presentasi">Presentasi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Row 6: Batas Waktu dan Bobot */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Batas Waktu (Minggu ke-) <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            min="1"
                            max="16"
                            value={tugas.batas_waktu_minggu}
                            onChange={(e) => updateRencanaTugas(index, 'batas_waktu_minggu', parseInt(e.target.value) || 1)}
                            placeholder="1-16"
                            className={(tugas.batas_waktu_minggu <= 0 || tugas.batas_waktu_minggu > 16) ? "border-red-300" : ""}
                          />
                          {(tugas.batas_waktu_minggu <= 0 || tugas.batas_waktu_minggu > 16) && (
                            <p className="text-xs text-red-500">Batas waktu harus antara 1-16</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Bobot (%) <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={tugas.bobot}
                            onChange={(e) => updateRencanaTugas(index, 'bobot', parseInt(e.target.value) || 0)}
                            placeholder="10"
                            className={tugas.bobot <= 0 ? "border-red-300" : ""}
                          />
                          {tugas.bobot <= 0 && (
                            <p className="text-xs text-red-500">Bobot harus lebih dari 0</p>
                          )}
                        </div>
                      </div>

                      {/* Row 7: Daftar Rujukan */}
                      <div className="space-y-2">
                        <Label>Daftar Rujukan</Label>
                        <Textarea
                          value={tugas.daftar_rujukan}
                          onChange={(e) => updateRencanaTugas(index, 'daftar_rujukan', e.target.value)}
                          placeholder="Daftar rujukan/referensi untuk tugas ini..."
                          rows={2}
                        />
                      </div>
                      
                      {/* Validation Summary */}
                      {tugas.judul?.trim() && (tugas.bobot <= 0 || tugas.batas_waktu_minggu <= 0 || tugas.batas_waktu_minggu > 16) && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Tugas ini tidak akan disimpan karena data belum lengkap
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {/* Total Bobot Tugas */}
                {rencanaTugas.length > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                      {rencanaTugas.filter(t => t.judul?.trim() && t.bobot > 0 && t.batas_waktu_minggu > 0).length} dari {rencanaTugas.length} tugas valid
                    </div>
                    <div className="bg-slate-100 px-4 py-2 rounded-lg">
                      <span className="text-sm text-slate-600">Total Bobot: </span>
                      <span className={`font-bold ${rencanaTugas.reduce((sum, t) => sum + (t.bobot || 0), 0) > 100 ? 'text-red-600' : 'text-slate-900'}`}>
                        {rencanaTugas.reduce((sum, t) => sum + (t.bobot || 0), 0)}%
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Analisis Ketercapaian CPL</CardTitle>
                    <CardDescription>Mapping CPL dengan rencana pembelajaran</CardDescription>
                  </div>
                  <Button onClick={addAnalisisKetercapaian}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Analisis
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analisisKetercapaian.length === 0 && (
                  <p className="text-sm text-slate-500">Belum ada analisis ketercapaian</p>
                )}
                {analisisKetercapaian.map((analisis, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Analisis {index + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeAnalisisKetercapaian(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>CPL Terkait Mata Kuliah *</Label>
                        <Select
                          value={analisis.cpl_id}
                          onValueChange={(val) => updateAnalisisKetercapaian(index, 'cpl_id', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih CPL" />
                          </SelectTrigger>
                          <SelectContent>
                            {relatedCplList.length > 0 ? (
                              relatedCplList.map(cpl => (
                                <SelectItem key={cpl.id} value={cpl.id}>
                                  {cpl.kode} - {cpl.deskripsi?.substring(0, 50)}...
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                Tidak ada CPL terkait mata kuliah ini
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {relatedCplList.length === 0 && (
                          <p className="text-xs text-amber-600">
                            Belum ada CPL yang di-mapping ke mata kuliah ini. Hubungi Kaprodi untuk menambahkan mapping CPL-MK.
                          </p>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Minggu Mulai *</Label>
                          <Input
                            type="number"
                            min="1"
                            max="16"
                            value={analisis.minggu_mulai}
                            onChange={(e) => updateAnalisisKetercapaian(index, 'minggu_mulai', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Minggu Selesai *</Label>
                          <Input
                            type="number"
                            min="1"
                            max="16"
                            value={analisis.minggu_selesai ?? ''}
                            onChange={(e) => updateAnalisisKetercapaian(index, 'minggu_selesai', parseInt(e.target.value) || 16)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bobot Kontribusi (%) *</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={analisis.bobot_kontribusi}
                            onChange={(e) => updateAnalisisKetercapaian(index, 'bobot_kontribusi', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Topik Materi</Label>
                        <Textarea
                          placeholder="Masukkan topik materi yang dipelajari"
                          value={analisis.topik_materi}
                          onChange={(e) => updateAnalisisKetercapaian(index, 'topik_materi', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jenis Assessment</Label>
                        <Input
                          placeholder="Contoh: Quiz, Tugas, UTS, UAS, Presentasi"
                          value={analisis.jenis_assessment}
                          onChange={(e) => updateAnalisisKetercapaian(index, 'jenis_assessment', e.target.value)}
                        />
                      </div>
                      {/* CPMK Selection */}
                      {cpmkList.length > 0 && (
                        <div className="space-y-2">
                          <Label>CPMK Terkait</Label>
                          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-white">
                            {cpmkList.map((c: CPMKForm) => (
                              <label key={c.kode} className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={analisis.cpmk_ids.includes(c.kode)}
                                  onChange={(e) => {
                                    const current = analisis.cpmk_ids
                                    if (e.target.checked) {
                                      updateAnalisisKetercapaian(index, 'cpmk_ids', [...current, c.kode])
                                    } else {
                                      updateAnalisisKetercapaian(index, 'cpmk_ids', current.filter(id => id !== c.kode))
                                    }
                                  }}
                                  className="rounded border-slate-300"
                                />
                                <span>{c.kode}</span>
                              </label>
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
        </Tabs>

        {/* Footer Actions */}
        <Card>
          <CardContent className="p-4">
            {/* Show step-specific errors */}
            {stepErrors[activeTab]?.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold">Error pada {getTabLabel(activeTab)} ({stepErrors[activeTab].length} item gagal):</span>
                  </div>
                  <div className="space-y-2 ml-7">
                    {stepErrors[activeTab].map((err, i) => (
                      <div key={i} className="p-2 bg-white border border-red-100 rounded text-sm">
                        <span className="font-medium text-red-800">{i + 1}.</span>{" "}
                        <span className="text-red-700">{err}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 ml-7 text-sm text-red-600">
                    <strong>Tip:</strong> Periksa data di atas dan pastikan semua field yang diperlukan sudah terisi dengan benar. 
                    Buka console browser (F12) untuk melihat detail request yang dikirim.
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/dosen/rps">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Daftar
                  </Link>
                </Button>
                
                {/* Previous button */}
                {getPreviousTab() && (
                  <Button variant="outline" onClick={handlePreviousStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Sebelumnya ({getTabLabel(getPreviousTab()!)})
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Step indicator */}
                <span className="text-sm text-slate-500">
                  Langkah {tabOrder.indexOf(activeTab) + 1} dari {tabOrder.length}
                </span>
                
                <div className="flex gap-2">
                  {/* Next button - show if not last step */}
                  {getNextTab() ? (
                    <Button onClick={handleNextStep} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Selanjutnya ({getTabLabel(getNextTab()!)})
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    /* Final submit button - show only on last step */
                    <Button onClick={handleFinalSubmit} disabled={saving} className="bg-green-600 hover:bg-green-700">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Simpan RPS
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
