import { CPL, CPLAssignment, RPS, Notification, User, MataKuliah, DashboardStats, GeneratedDocument, DocumentTemplate } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    nama: 'Dr. Ahmad Hidayat, M.Kom',
    email: 'ahmad.hidayat@univ.ac.id',
    role: 'kaprodi',
    avatar: '/avatars/kaprodi.jpg',
    departemen: 'Teknik Informatika'
  },
  {
    id: '2',
    nama: 'Budi Santoso, M.T.',
    email: 'budi.santoso@univ.ac.id',
    role: 'dosen',
    departemen: 'Teknik Informatika'
  },
  {
    id: '3',
    nama: 'Dr. Citra Dewi, M.Sc.',
    email: 'citra.dewi@univ.ac.id',
    role: 'dosen',
    departemen: 'Teknik Informatika'
  },
  {
    id: '4',
    nama: 'Dian Pratama, M.Kom',
    email: 'dian.pratama@univ.ac.id',
    role: 'dosen',
    departemen: 'Teknik Informatika'
  }
];

// Mock CPL Data
export const mockCPLs: CPL[] = [
  {
    id: '1',
    kode: 'CPL-01',
    judul: 'Kemampuan Berpikir Kritis',
    deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi.',
    aspek: 'pengetahuan',
    kategori: 'Kompetensi Utama',
    status: 'published',
    version: 1,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    createdBy: '1'
  },
  {
    id: '2',
    kode: 'CPL-02',
    judul: 'Kemampuan Komunikasi',
    deskripsi: 'Mampu berkomunikasi secara efektif baik lisan maupun tulisan dalam bahasa Indonesia dan bahasa Inggris.',
    aspek: 'keterampilan_umum',
    kategori: 'Kompetensi Utama',
    status: 'published',
    version: 1,
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
    createdBy: '1'
  },
  {
    id: '3',
    kode: 'CPL-03',
    judul: 'Pengembangan Perangkat Lunak',
    deskripsi: 'Mampu merancang dan mengembangkan perangkat lunak sesuai dengan kebutuhan pengguna menggunakan metodologi pengembangan yang terstruktur.',
    aspek: 'keterampilan_khusus',
    kategori: 'Kompetensi Pendukung',
    status: 'published',
    version: 2,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-02-01T14:00:00Z',
    createdBy: '1'
  },
  {
    id: '4',
    kode: 'CPL-04',
    judul: 'Etika Profesional',
    deskripsi: 'Mampu menunjukkan sikap bertanggung jawab atas pekerjaan di bidangnya secara mandiri dan menjunjung tinggi etika profesi.',
    aspek: 'sikap',
    kategori: 'Kompetensi Utama',
    status: 'draft',
    version: 1,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
    createdBy: '1'
  },
  {
    id: '5',
    kode: 'CPL-05',
    judul: 'Manajemen Proyek TI',
    deskripsi: 'Mampu mengelola proyek teknologi informasi dengan memperhatikan aspek waktu, biaya, dan kualitas.',
    aspek: 'keterampilan_khusus',
    kategori: 'Kompetensi Pendukung',
    status: 'published',
    version: 1,
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-25T08:00:00Z',
    createdBy: '1'
  },
  {
    id: '6',
    kode: 'CPL-06',
    judul: 'Analisis dan Desain Sistem',
    deskripsi: 'Mampu menganalisis kebutuhan sistem dan merancang solusi teknologi informasi yang tepat guna.',
    aspek: 'keterampilan_khusus',
    kategori: 'Kompetensi Utama',
    status: 'published',
    version: 1,
    createdAt: '2024-01-19T09:30:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
    createdBy: '1'
  }
];

// Mock CPL Assignments
export const mockAssignments: CPLAssignment[] = [
  {
    id: '1',
    cplId: '1',
    dosenId: '2',
    dosenName: 'Budi Santoso, M.T.',
    mataKuliah: 'Algoritma dan Pemrograman',
    status: 'accepted',
    assignedAt: '2024-02-01T08:00:00Z',
    acceptedAt: '2024-02-02T10:00:00Z'
  },
  {
    id: '2',
    cplId: '3',
    dosenId: '3',
    dosenName: 'Dr. Citra Dewi, M.Sc.',
    mataKuliah: 'Rekayasa Perangkat Lunak',
    status: 'assigned',
    assignedAt: '2024-02-05T09:00:00Z'
  },
  {
    id: '3',
    cplId: '5',
    dosenId: '4',
    dosenName: 'Dian Pratama, M.Kom',
    mataKuliah: 'Manajemen Proyek TI',
    status: 'done',
    assignedAt: '2024-01-28T08:00:00Z',
    acceptedAt: '2024-01-29T11:00:00Z'
  },
  {
    id: '4',
    cplId: '2',
    dosenId: '2',
    dosenName: 'Budi Santoso, M.T.',
    mataKuliah: 'Komunikasi Profesional',
    status: 'assigned',
    assignedAt: '2024-02-10T08:00:00Z'
  }
];

// Mock RPS Data
export const mockRPS: RPS[] = [
  {
    id: '1',
    mataKuliahId: 'mk1',
    mataKuliahNama: 'Algoritma dan Pemrograman',
    kodeMK: 'IF101',
    sks: 3,
    semester: 1,
    tahunAkademik: '2024/2025',
    dosenId: '2',
    dosenNama: 'Budi Santoso, M.T.',
    deskripsi: 'Mata kuliah ini membahas konsep dasar algoritma dan pemrograman menggunakan bahasa pemrograman tingkat tinggi.',
    tujuan: 'Mahasiswa mampu merancang algoritma dan mengimplementasikannya dalam program komputer.',
    metode: ['Ceramah', 'Praktikum', 'Diskusi', 'Tugas'],
    bobotNilai: { tugas: 20, uts: 25, uas: 35, kehadiran: 10, praktikum: 10 },
    cpmk: [
      { id: 'cpmk1', kode: 'CPMK-01', deskripsi: 'Mampu memahami konsep dasar algoritma', cplIds: ['1'] },
      { id: 'cpmk2', kode: 'CPMK-02', deskripsi: 'Mampu membuat program sederhana', cplIds: ['1', '3'] }
    ],
    rencanaPembelajaran: [
      { pertemuan: 1, topik: 'Pengantar Algoritma', subTopik: ['Definisi', 'Sejarah', 'Manfaat'], metode: 'Ceramah', waktu: 150, cpmkIds: ['cpmk1'], materi: 'Slide presentasi' },
      { pertemuan: 2, topik: 'Flowchart', subTopik: ['Simbol', 'Aturan', 'Contoh'], metode: 'Ceramah & Praktikum', waktu: 150, cpmkIds: ['cpmk1'], materi: 'Modul praktikum' }
    ],
    bahanBacaan: [
      { id: 'bb1', judul: 'Introduction to Algorithms', penulis: 'Cormen et al.', tahun: 2022, jenis: 'buku' },
      { id: 'bb2', judul: 'Python Programming', penulis: 'John Doe', tahun: 2023, jenis: 'buku' }
    ],
    evaluasi: [
      { id: 'ev1', jenis: 'Tugas', bobot: 20, deskripsi: 'Tugas individu pembuatan algoritma', minggu: [3, 5, 7] },
      { id: 'ev2', jenis: 'UTS', bobot: 25, deskripsi: 'Ujian tengah semester', minggu: [8] }
    ],
    status: 'approved',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-15T14:00:00Z',
    updatedBy: '2'
  },
  {
    id: '2',
    mataKuliahId: 'mk2',
    mataKuliahNama: 'Rekayasa Perangkat Lunak',
    kodeMK: 'IF301',
    sks: 4,
    semester: 5,
    tahunAkademik: '2024/2025',
    dosenId: '3',
    dosenNama: 'Dr. Citra Dewi, M.Sc.',
    deskripsi: 'Mata kuliah ini membahas metodologi dan teknik dalam rekayasa perangkat lunak.',
    tujuan: 'Mahasiswa mampu menerapkan prinsip rekayasa perangkat lunak dalam pengembangan sistem.',
    metode: ['Ceramah', 'Project-Based Learning', 'Diskusi'],
    bobotNilai: { tugas: 30, uts: 20, uas: 30, kehadiran: 10, praktikum: 10 },
    cpmk: [
      { id: 'cpmk3', kode: 'CPMK-01', deskripsi: 'Mampu menerapkan metodologi pengembangan perangkat lunak', cplIds: ['3'] },
      { id: 'cpmk4', kode: 'CPMK-02', deskripsi: 'Mampu melakukan analisis kebutuhan sistem', cplIds: ['3', '6'] }
    ],
    rencanaPembelajaran: [],
    bahanBacaan: [],
    evaluasi: [],
    status: 'submitted',
    createdAt: '2024-02-05T09:00:00Z',
    updatedAt: '2024-02-20T11:00:00Z',
    updatedBy: '3'
  },
  {
    id: '3',
    mataKuliahId: 'mk3',
    mataKuliahNama: 'Basis Data',
    kodeMK: 'IF201',
    sks: 3,
    semester: 3,
    tahunAkademik: '2024/2025',
    dosenId: '4',
    dosenNama: 'Dian Pratama, M.Kom',
    deskripsi: 'Mata kuliah ini membahas konsep dan implementasi sistem basis data relasional.',
    tujuan: 'Mahasiswa mampu merancang dan mengelola basis data relasional.',
    metode: ['Ceramah', 'Praktikum', 'Tugas'],
    bobotNilai: { tugas: 25, uts: 25, uas: 30, kehadiran: 10, praktikum: 10 },
    cpmk: [],
    rencanaPembelajaran: [],
    bahanBacaan: [],
    evaluasi: [],
    status: 'draft',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-10T08:00:00Z',
    updatedBy: '4'
  },
  {
    id: '4',
    mataKuliahId: 'mk4',
    mataKuliahNama: 'Jaringan Komputer',
    kodeMK: 'IF302',
    sks: 3,
    semester: 5,
    tahunAkademik: '2024/2025',
    dosenId: '2',
    dosenNama: 'Budi Santoso, M.T.',
    deskripsi: 'Mata kuliah ini membahas arsitektur dan protokol jaringan komputer.',
    tujuan: 'Mahasiswa mampu memahami dan mengkonfigurasi jaringan komputer.',
    metode: ['Ceramah', 'Praktikum', 'Simulasi'],
    bobotNilai: { tugas: 20, uts: 25, uas: 35, kehadiran: 10, praktikum: 10 },
    cpmk: [],
    rencanaPembelajaran: [],
    bahanBacaan: [],
    evaluasi: [],
    status: 'rejected',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-02-18T09:00:00Z',
    updatedBy: '2',
    reviewNotes: 'CPMK belum lengkap dan belum dipetakan ke CPL. Mohon dilengkapi.'
  }
];

// Mock Mata Kuliah
export const mockMataKuliah: MataKuliah[] = [
  { id: 'mk1', kode: 'IF101', nama: 'Algoritma dan Pemrograman', sks: 3, semester: 1, jenis: 'wajib' },
  { id: 'mk2', kode: 'IF301', nama: 'Rekayasa Perangkat Lunak', sks: 4, semester: 5, jenis: 'wajib' },
  { id: 'mk3', kode: 'IF201', nama: 'Basis Data', sks: 3, semester: 3, jenis: 'wajib' },
  { id: 'mk4', kode: 'IF302', nama: 'Jaringan Komputer', sks: 3, semester: 5, jenis: 'wajib' },
  { id: 'mk5', kode: 'IF401', nama: 'Kecerdasan Buatan', sks: 3, semester: 7, jenis: 'pilihan' },
  { id: 'mk6', kode: 'IF102', nama: 'Matematika Diskrit', sks: 3, semester: 1, jenis: 'wajib' },
  { id: 'mk7', kode: 'IF202', nama: 'Struktur Data', sks: 3, semester: 3, jenis: 'wajib' },
  { id: 'mk8', kode: 'IF303', nama: 'Pemrograman Web', sks: 3, semester: 5, jenis: 'wajib' }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Penugasan CPL Baru',
    message: 'Anda mendapat tugas untuk mengisi RPS mata kuliah Algoritma dan Pemrograman dengan CPL-01.',
    type: 'assignment',
    isRead: false,
    createdAt: '2024-02-10T08:00:00Z',
    actionUrl: '/dosen/tugas'
  },
  {
    id: '2',
    userId: '2',
    title: 'RPS Disetujui',
    message: 'RPS Algoritma dan Pemrograman telah disetujui oleh Kaprodi.',
    type: 'approval',
    isRead: true,
    createdAt: '2024-02-15T14:00:00Z',
    actionUrl: '/dosen/rps/1'
  },
  {
    id: '3',
    userId: '1',
    title: 'RPS Menunggu Review',
    message: 'RPS Rekayasa Perangkat Lunak dari Dr. Citra Dewi menunggu review Anda.',
    type: 'info',
    isRead: false,
    createdAt: '2024-02-20T11:00:00Z',
    actionUrl: '/kaprodi/rps/review/2'
  },
  {
    id: '4',
    userId: '2',
    title: 'RPS Ditolak',
    message: 'RPS Jaringan Komputer ditolak. Silakan periksa catatan review.',
    type: 'rejection',
    isRead: false,
    createdAt: '2024-02-18T09:00:00Z',
    actionUrl: '/dosen/rps/4'
  },
  {
    id: '5',
    userId: '1',
    title: 'Dokumen Selesai',
    message: 'Dokumen Kurikulum 2024/2025 telah selesai di-generate.',
    type: 'document',
    isRead: true,
    createdAt: '2024-02-22T16:00:00Z',
    actionUrl: '/kaprodi/dokumen'
  }
];

// Mock Generated Documents
export const mockGeneratedDocuments: GeneratedDocument[] = [
  {
    id: '1',
    templateId: 'tpl1',
    templateName: 'Template Kurikulum Standar',
    tahun: '2024/2025',
    status: 'ready',
    fileUrl: '/documents/kurikulum-2024-2025.docx',
    fileType: 'docx',
    createdAt: '2024-02-22T16:00:00Z',
    createdBy: '1',
    sections: ['profil_lulusan', 'cpl', 'matriks_cpl_mk', 'rps_ringkasan']
  },
  {
    id: '2',
    templateId: 'tpl2',
    templateName: 'Template RPS Lengkap',
    tahun: '2024/2025',
    status: 'ready',
    fileUrl: '/documents/rps-lengkap-2024-2025.pdf',
    fileType: 'pdf',
    createdAt: '2024-02-20T10:00:00Z',
    createdBy: '1',
    sections: ['rps_detail', 'silabus']
  },
  {
    id: '3',
    templateId: 'tpl1',
    templateName: 'Template Kurikulum Standar',
    tahun: '2023/2024',
    status: 'archived',
    fileUrl: '/documents/kurikulum-2023-2024.docx',
    fileType: 'docx',
    createdAt: '2023-08-15T14:00:00Z',
    createdBy: '1',
    sections: ['profil_lulusan', 'cpl', 'matriks_cpl_mk']
  }
];

// Mock Document Templates
export const mockDocumentTemplates: DocumentTemplate[] = [
  {
    id: 'tpl1',
    nama: 'Template Kurikulum Standar',
    deskripsi: 'Template lengkap untuk dokumen kurikulum sesuai standar DIKTI',
    sections: ['profil_lulusan', 'cpl', 'matriks_cpl_mk', 'rps_ringkasan', 'evaluasi'],
    fileUrl: '/templates/kurikulum-standar.docx',
    version: '2.0'
  },
  {
    id: 'tpl2',
    nama: 'Template RPS Lengkap',
    deskripsi: 'Template untuk compile semua RPS dalam satu dokumen',
    sections: ['rps_detail', 'silabus', 'jadwal_pertemuan', 'evaluasi'],
    fileUrl: '/templates/rps-lengkap.docx',
    version: '1.5'
  },
  {
    id: 'tpl3',
    nama: 'Template Matriks CPL',
    deskripsi: 'Template khusus untuk matriks CPL dan mata kuliah',
    sections: ['matriks_cpl_mk', 'pemetaan_cpl_cpmk'],
    fileUrl: '/templates/matriks-cpl.docx',
    version: '1.0'
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalCPL: 6,
  publishedCPL: 5,
  totalRPS: 4,
  approvedRPS: 1,
  pendingReview: 1,
  totalDosen: 3,
  activeAssignments: 2,
  documentsGenerated: 3
};

// Current logged in user (for demo)
export const currentUser: User = mockUsers[0]; // Kaprodi by default
