import api, { ApiResponse, PaginatedResponse } from './client';

// RPS Types
export interface BobotNilai {
  tugas: number;
  uts: number;
  uas: number;
  kehadiran: number;
  praktikum?: number;
}

export interface CPMK {
  id: string;
  rps_id: string;
  kode: string;
  deskripsi: string;
  bobot?: number;
  cpl_ids?: string[];
  urutan: number;
  created_at?: string;
}

export interface RencanaPembelajaran {
  id: string;
  rps_id: string;
  pertemuan: number;
  kemampuan_akhir?: string;
  indikator?: string;
  topik?: string;
  materi?: string;
  sub_topik?: string[];
  metode?: string;
  metode_pembelajaran?: string;
  waktu_menit?: number;
  waktu?: number;
  pengalaman_belajar?: string;
  kriteria_penilaian?: string;
  bobot_nilai?: number;
  referensi?: string;
  cpmk_ids?: string[];
}

export interface BahanBacaan {
  id: string;
  rps_id: string;
  jenis: 'utama' | 'pendukung' | 'buku' | 'jurnal' | 'artikel' | 'website' | 'modul';
  judul: string;
  penulis?: string;
  penerbit?: string;
  tahun?: number;
  isbn?: string;
  url?: string;
  halaman?: string;
  urutan: number;
}

export interface Evaluasi {
  id: string;
  rps_id: string;
  komponen?: string;
  jenis?: string;
  teknik_penilaian?: string;
  instrumen?: string;
  bobot: number;
  kriteria_penilaian?: string;
  deskripsi?: string;
  minggu_pelaksanaan?: number[];
  rubrik_penilaian?: string;
  urutan: number;
}

export interface RPS {
  id: string;
  mata_kuliah_id: string;
  mata_kuliah_nama: string;
  kode_mk: string;
  sks: number;
  semester: number;
  tahun_akademik: string;
  semester_type?: 'ganjil' | 'genap';
  dosen_id: string;
  dosen_nama: string;
  deskripsi?: string;
  deskripsi_mk?: string;
  tujuan?: string;
  capaian_pembelajaran?: string;
  metode?: string[];
  metode_pembelajaran?: string[];
  media_pembelajaran?: string[];
  bobot_nilai?: BobotNilai;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  review_notes?: string;
  cpmk?: CPMK[];
  rencana_pembelajaran?: RencanaPembelajaran[];
  bahan_bacaan?: BahanBacaan[];
  evaluasi?: Evaluasi[];
}

export interface CreateRPSRequest {
  mata_kuliah_id: string;
  tahun_akademik?: string;
  tahun_ajaran?: string;
  semester_type?: 'ganjil' | 'genap';
  deskripsi?: string;
  deskripsi_mk?: string;
  tujuan?: string;
  capaian_pembelajaran?: string;
  metode?: string[];
  metode_pembelajaran?: string[];
  media_pembelajaran?: string[];
  bobot_nilai?: BobotNilai;
}

export interface UpdateRPSRequest {
  tahun_akademik?: string;
  tahun_ajaran?: string;
  semester_type?: 'ganjil' | 'genap';
  deskripsi?: string;
  deskripsi_mk?: string;
  tujuan?: string;
  capaian_pembelajaran?: string;
  metode?: string[];
  metode_pembelajaran?: string[];
  media_pembelajaran?: string[];
  bobot_nilai?: BobotNilai;
}

export interface RPSListParams {
  page?: number;
  limit?: number;
  search?: string;
  mata_kuliah_id?: string;
  dosen_id?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  tahun_akademik?: string;
  semester?: number;
  sort_by?: 'mata_kuliah_nama' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

// CPMK Types
export interface CreateCPMKRequest {
  kode: string;
  deskripsi: string;
  bobot?: number;
  cpl_ids?: string[];
  urutan?: number;
}

export interface UpdateCPMKRequest {
  kode?: string;
  deskripsi?: string;
  bobot?: number;
  cpl_ids?: string[];
  urutan?: number;
}

// Rencana Pembelajaran Types
export interface CreateRencanaPembelajaranRequest {
  pertemuan: number;
  kemampuan_akhir?: string;
  indikator?: string;
  topik?: string;
  materi?: string;
  sub_topik?: string[];
  metode?: string;
  metode_pembelajaran?: string;
  waktu_menit?: number;
  waktu?: number;
  pengalaman_belajar?: string;
  kriteria_penilaian?: string;
  bobot_nilai?: number;
  referensi?: string;
  cpmk_ids?: string[];
}

export interface UpdateRencanaPembelajaranRequest extends CreateRencanaPembelajaranRequest {}

// Bahan Bacaan Types
export interface CreateBahanBacaanRequest {
  jenis: 'utama' | 'pendukung' | 'buku' | 'jurnal' | 'artikel' | 'website' | 'modul';
  judul: string;
  penulis?: string;
  penerbit?: string;
  tahun?: number;
  isbn?: string;
  url?: string;
  halaman?: string;
  urutan?: number;
}

export interface UpdateBahanBacaanRequest extends CreateBahanBacaanRequest {}

// Evaluasi Types
export interface CreateEvaluasiRequest {
  komponen?: string;
  jenis?: string;
  teknik_penilaian?: string;
  instrumen?: string;
  bobot: number;
  kriteria_penilaian?: string;
  deskripsi?: string;
  minggu_pelaksanaan?: number[];
  rubrik_penilaian?: string;
  urutan?: number;
}

export interface UpdateEvaluasiRequest extends CreateEvaluasiRequest {}

// Review Types
export interface ReviewRequest {
  catatan?: string;
  review_notes?: string;
  alasan?: string;
}

// RPS Service
export const rpsService = {
  // Get all RPS (with pagination)
  getAll: async (params?: RPSListParams): Promise<ApiResponse<PaginatedResponse<RPS>>> => {
    return api.get<PaginatedResponse<RPS>>('/rps', params as Record<string, string | number | boolean | undefined>);
  },

  // Get RPS by ID
  getById: async (id: string): Promise<ApiResponse<RPS>> => {
    return api.get<RPS>(`/rps/${id}`);
  },

  // Get my RPS (for dosen)
  getMy: async (): Promise<ApiResponse<PaginatedResponse<RPS>>> => {
    return api.get<PaginatedResponse<RPS>>('/rps/my');
  },

  // Get RPS by Mata Kuliah
  getByMataKuliah: async (mataKuliahId: string): Promise<ApiResponse<PaginatedResponse<RPS>>> => {
    return api.get<PaginatedResponse<RPS>>(`/rps/mata-kuliah/${mataKuliahId}`);
  },

  // Create RPS
  create: async (data: CreateRPSRequest): Promise<ApiResponse<RPS>> => {
    return api.post<RPS>('/rps', data);
  },

  // Update RPS
  update: async (id: string, data: UpdateRPSRequest): Promise<ApiResponse<RPS>> => {
    return api.put<RPS>(`/rps/${id}`, data);
  },

  // Delete RPS
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/rps/${id}`);
  },

  // RPS Workflow
  submit: async (id: string): Promise<ApiResponse<RPS>> => {
    return api.patch<RPS>(`/rps/${id}/submit`);
  },

  approve: async (id: string, data?: ReviewRequest): Promise<ApiResponse<RPS>> => {
    return api.patch<RPS>(`/rps/${id}/approve`, data);
  },

  reject: async (id: string, data: ReviewRequest): Promise<ApiResponse<RPS>> => {
    return api.patch<RPS>(`/rps/${id}/reject`, data);
  },

  requestRevision: async (id: string, data: ReviewRequest): Promise<ApiResponse<RPS>> => {
    return api.patch<RPS>(`/rps/${id}/request-revision`, data);
  },

  // CPMK Sub-resource
  cpmk: {
    getAll: async (rpsId: string): Promise<ApiResponse<CPMK[]>> => {
      return api.get<CPMK[]>(`/rps/${rpsId}/cpmk`);
    },

    create: async (rpsId: string, data: CreateCPMKRequest): Promise<ApiResponse<CPMK>> => {
      return api.post<CPMK>(`/rps/${rpsId}/cpmk`, data);
    },

    update: async (rpsId: string, cpmkId: string, data: UpdateCPMKRequest): Promise<ApiResponse<CPMK>> => {
      return api.put<CPMK>(`/rps/${rpsId}/cpmk/${cpmkId}`, data);
    },

    delete: async (rpsId: string, cpmkId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/${rpsId}/cpmk/${cpmkId}`);
    },
  },

  // Rencana Pembelajaran Sub-resource
  rencanaPembelajaran: {
    getAll: async (rpsId: string): Promise<ApiResponse<RencanaPembelajaran[]>> => {
      return api.get<RencanaPembelajaran[]>(`/rps/${rpsId}/rencana-pembelajaran`);
    },

    create: async (rpsId: string, data: CreateRencanaPembelajaranRequest): Promise<ApiResponse<RencanaPembelajaran>> => {
      return api.post<RencanaPembelajaran>(`/rps/${rpsId}/rencana-pembelajaran`, data);
    },

    update: async (rpsId: string, rpId: string, data: UpdateRencanaPembelajaranRequest): Promise<ApiResponse<RencanaPembelajaran>> => {
      return api.put<RencanaPembelajaran>(`/rps/${rpsId}/rencana-pembelajaran/${rpId}`, data);
    },

    delete: async (rpsId: string, rpId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/${rpsId}/rencana-pembelajaran/${rpId}`);
    },
  },

  // Bahan Bacaan Sub-resource
  bahanBacaan: {
    getAll: async (rpsId: string): Promise<ApiResponse<BahanBacaan[]>> => {
      return api.get<BahanBacaan[]>(`/rps/${rpsId}/bahan-bacaan`);
    },

    create: async (rpsId: string, data: CreateBahanBacaanRequest): Promise<ApiResponse<BahanBacaan>> => {
      return api.post<BahanBacaan>(`/rps/${rpsId}/bahan-bacaan`, data);
    },

    update: async (rpsId: string, bbId: string, data: UpdateBahanBacaanRequest): Promise<ApiResponse<BahanBacaan>> => {
      return api.put<BahanBacaan>(`/rps/${rpsId}/bahan-bacaan/${bbId}`, data);
    },

    delete: async (rpsId: string, bbId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/${rpsId}/bahan-bacaan/${bbId}`);
    },
  },

  // Evaluasi Sub-resource
  evaluasi: {
    getAll: async (rpsId: string): Promise<ApiResponse<Evaluasi[]>> => {
      return api.get<Evaluasi[]>(`/rps/${rpsId}/evaluasi`);
    },

    create: async (rpsId: string, data: CreateEvaluasiRequest): Promise<ApiResponse<Evaluasi>> => {
      return api.post<Evaluasi>(`/rps/${rpsId}/evaluasi`, data);
    },

    update: async (rpsId: string, evalId: string, data: UpdateEvaluasiRequest): Promise<ApiResponse<Evaluasi>> => {
      return api.put<Evaluasi>(`/rps/${rpsId}/evaluasi/${evalId}`, data);
    },

    delete: async (rpsId: string, evalId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/${rpsId}/evaluasi/${evalId}`);
    },
  },
};

export default rpsService;
