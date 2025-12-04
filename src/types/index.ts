// CPL Types
export interface CPL {
  id: string;
  kode: string;
  judul: string;
  deskripsi: string;
  aspek: 'sikap' | 'pengetahuan' | 'keterampilan_umum' | 'keterampilan_khusus';
  kategori: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CPLAssignment {
  id: string;
  cplId: string;
  dosenId: string;
  dosenName: string;
  mataKuliah: string;
  status: 'assigned' | 'accepted' | 'rejected' | 'done';
  assignedAt: string;
  acceptedAt?: string;
}

// RPS Types
export interface RPS {
  id: string;
  mataKuliahId: string;
  mataKuliahNama: string;
  kodeMK: string;
  sks: number;
  semester: number;
  tahunAkademik: string;
  dosenId: string;
  dosenNama: string;
  deskripsi: string;
  tujuan: string;
  metode: string[];
  bobotNilai: BobotNilai;
  cpmk: CPMK[];
  rencanaPembelajaran: RencanaPembelajaran[];
  bahanBacaan: BahanBacaan[];
  evaluasi: Evaluasi[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  reviewNotes?: string;
}

export interface BobotNilai {
  tugas: number;
  uts: number;
  uas: number;
  kehadiran: number;
  praktikum?: number;
}

export interface CPMK {
  id: string;
  kode: string;
  deskripsi: string;
  cplIds: string[];
}

export interface RencanaPembelajaran {
  pertemuan: number;
  topik: string;
  subTopik: string[];
  metode: string;
  waktu: number;
  cpmkIds: string[];
  materi: string;
}

export interface BahanBacaan {
  id: string;
  judul: string;
  penulis: string;
  tahun: number;
  jenis: 'buku' | 'jurnal' | 'artikel' | 'website';
  url?: string;
}

export interface Evaluasi {
  id: string;
  jenis: string;
  bobot: number;
  deskripsi: string;
  minggu: number[];
}

// Mapping Types
export interface RPSCPLMapping {
  id: string;
  rpsId: string;
  cpmkId: string;
  cplId: string;
  level: 'rendah' | 'sedang' | 'tinggi';
}

// Document Types
export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  tahun: string;
  status: 'processing' | 'ready' | 'archived';
  fileUrl?: string;
  fileType: 'docx' | 'pdf';
  createdAt: string;
  createdBy: string;
  sections: string[];
}

export interface DocumentTemplate {
  id: string;
  nama: string;
  deskripsi: string;
  sections: string[];
  fileUrl: string;
  version: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'approval' | 'rejection' | 'document' | 'info';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// User Types
export interface User {
  id: string;
  nama: string;
  email: string;
  role: 'kaprodi' | 'dosen' | 'admin';
  avatar?: string;
  departemen?: string;
  lastLogin?: string;
}

// Mata Kuliah Types
export interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  jenis: 'wajib' | 'pilihan';
  prasyarat?: string[];
}

// Dashboard Stats
export interface DashboardStats {
  totalCPL: number;
  publishedCPL: number;
  totalRPS: number;
  approvedRPS: number;
  pendingReview: number;
  totalDosen: number;
  activeAssignments: number;
  documentsGenerated: number;
}
