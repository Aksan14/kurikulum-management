// Types untuk form RPS
// File ini berisi semua interface yang digunakan di halaman RPS

import type { CPL } from "@/lib/api/cpl"
import type { MataKuliah } from "@/lib/api/mata-kuliah"

// Form Data untuk Info Dasar RPS
export interface RPSFormData {
  mata_kuliah_id: string
  tahun_ajaran: string
  semester_type: 'ganjil' | 'genap'
  tanggal_penyusunan: string
  penyusun_nama: string
  penyusun_nidn: string
  koordinator_rmk_nama: string
  koordinator_rmk_nidn: string
  kaprodi_nama: string
  kaprodi_nidn: string
  fakultas: string
  program_studi: string
  deskripsi_mk: string
  capaian_pembelajaran: string
  metode_pembelajaran: string[]
  media_pembelajaran: string[]
}

// CPMK Form
export interface CPMKForm {
  id?: string
  kode: string
  deskripsi: string
  cpl_ids: string[]
}

// Sub-CPMK Form
export interface SubCPMKForm {
  id?: string
  cpmk_id: string
  kode: string
  deskripsi: string
  urutan: number
}

// Rencana Pembelajaran Form
export interface RencanaPembelajaranForm {
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

// Bahan Bacaan Form
export interface BahanBacaanForm {
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

// Rencana Tugas Form
export interface RencanaTugasForm {
  id?: string
  nomor_tugas: number
  judul: string
  sub_cpmk_id: string
  sub_cpmk?: {
    id: string
    kode: string
    deskripsi: string
  }
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

// Analisis Ketercapaian Form
export interface AnalisisKetercapaianForm {
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

// Props untuk komponen tab
export interface RPSTabProps {
  isViewOnly?: boolean
}

// Props untuk Info Dasar
export interface InfoDasarTabProps extends RPSTabProps {
  formData: RPSFormData
  setFormData?: React.Dispatch<React.SetStateAction<RPSFormData>>
  mataKuliahList: MataKuliah[]
  selectedMK: MataKuliah | undefined
}

// Props untuk CPMK
export interface CPMKTabProps extends RPSTabProps {
  cpmkList: CPMKForm[]
  setCpmkList?: React.Dispatch<React.SetStateAction<CPMKForm[]>>
  cplList: CPL[]
  subCpmkList?: SubCPMKForm[][]
  setSubCpmkList?: React.Dispatch<React.SetStateAction<SubCPMKForm[][]>>
}

// Props untuk Sub-CPMK
export interface SubCPMKTabProps extends RPSTabProps {
  cpmkList: CPMKForm[]
  subCpmkList: SubCPMKForm[][]
  setSubCpmkList?: React.Dispatch<React.SetStateAction<SubCPMKForm[][]>>
}

// Props untuk Rencana Pembelajaran
export interface RencanaPembelajaranTabProps extends RPSTabProps {
  rencanaPembelajaran: RencanaPembelajaranForm[]
  setRencanaPembelajaran?: React.Dispatch<React.SetStateAction<RencanaPembelajaranForm[]>>
  subCpmkList: SubCPMKForm[][]
  cpmkList: CPMKForm[]
  expandedWeek?: number | null
  setExpandedWeek?: React.Dispatch<React.SetStateAction<number | null>>
}

// Props untuk Rencana Tugas
export interface RencanaTugasTabProps extends RPSTabProps {
  rencanaTugas: RencanaTugasForm[]
  setRencanaTugas?: React.Dispatch<React.SetStateAction<RencanaTugasForm[]>>
  subCpmkList: SubCPMKForm[][]
  cpmkList: CPMKForm[]
}

// Props untuk Analisis Ketercapaian
export interface AnalisisTabProps extends RPSTabProps {
  analisisKetercapaian: AnalisisKetercapaianForm[]
  setAnalisisKetercapaian?: React.Dispatch<React.SetStateAction<AnalisisKetercapaianForm[]>>
  cplList: CPL[]
  cpmkList: CPMKForm[]
  subCpmkList: SubCPMKForm[][]
}

// Props untuk Pustaka
export interface PustakaTabProps extends RPSTabProps {
  bahanBacaan: BahanBacaanForm[]
  setBahanBacaan?: React.Dispatch<React.SetStateAction<BahanBacaanForm[]>>
}

// Default values
export const DEFAULT_FORM_DATA: RPSFormData = {
  mata_kuliah_id: "",
  tahun_ajaran: "2024/2025",
  semester_type: "ganjil",
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
  metode_pembelajaran: ["Ceramah", "Diskusi", "Praktikum"],
  media_pembelajaran: ["Laptop", "Projector", "LMS"]
}

export const DEFAULT_CPMK: CPMKForm = {
  kode: "CPMK-01",
  deskripsi: "",
  cpl_ids: []
}

export const DEFAULT_BAHAN_BACAAN: BahanBacaanForm = {
  judul: "",
  penulis: "",
  tahun: new Date().getFullYear(),
  penerbit: "",
  jenis: 'buku',
  isbn: "",
  halaman: "",
  url: "",
  is_wajib: true,
  urutan: 1
}

// Tab order
export const TAB_ORDER = ["info", "cpmk", "subcpmk", "rencana", "tugas", "analisis", "pustaka"] as const
export type TabType = typeof TAB_ORDER[number]

// Tab labels
export const TAB_LABELS: Record<TabType, string> = {
  info: "Info Dasar",
  cpmk: "CPMK",
  subcpmk: "Sub-CPMK",
  rencana: "Rencana Pembelajaran",
  tugas: "Rencana Tugas",
  analisis: "Analisis",
  pustaka: "Pustaka"
}

export function getTabLabel(tab: string): string {
  return TAB_LABELS[tab as TabType] || tab
}
