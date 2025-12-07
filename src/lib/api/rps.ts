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
  minggu_mulai?: number;
  minggu_selesai?: number;
  topik?: string;
  sub_topik?: string[];
  cpmk_ids?: string[];
  sub_cpmk_ids?: string[];
  indikator?: string[];
  metode?: string;
  media_lms?: string;
  waktu?: number;
  waktu_tm?: number;
  waktu_bm?: number;
  waktu_pt?: number;
  materi?: string;
  teknik_penilaian?: string;
  kriteria_penilaian?: string;
  bobot_penilaian?: number;
  // Legacy fields
  kemampuan_akhir?: string;
  waktu_menit?: number;
  metode_pembelajaran?: string;
  pengalaman_belajar?: string;
  bobot_nilai?: number;
  referensi?: string;
}

export interface BahanBacaan {
  id: string;
  rps_id: string;
  judul: string;
  penulis?: string;
  tahun?: number;
  penerbit?: string;
  jenis?: 'buku' | 'jurnal' | 'artikel' | 'website' | 'modul';
  isbn?: string;
  halaman?: string;
  url?: string;
  is_wajib?: boolean;
  urutan?: number;
}

export interface Evaluasi {
  id: string;
  rps_id: string;
  komponen: string;
  teknik_penilaian?: string;
  instrumen?: string;
  bobot: number;
  minggu_mulai?: number;
  minggu_selesai?: number;
  topik_materi?: string;
  jenis_assessment?: string;
  urutan?: number;
  created_at?: string;
  // Legacy fields (keep for backward compatibility)
  jenis?: string;
  deskripsi?: string;
  minggu_pelaksanaan?: number[];
  kriteria_penilaian?: string;
  rubrik_penilaian?: string;
  cpmk_ids?: string[];
}

// Sub-CPMK Types
export interface SubCPMK {
  id: string;
  cpmk_id: string;
  kode: string;
  deskripsi: string;
  urutan: number;
  created_at?: string;
}

export interface CreateSubCPMKRequest {
  kode: string;
  deskripsi: string;
  urutan?: number;
}

export interface UpdateSubCPMKRequest {
  kode?: string;
  deskripsi?: string;
  urutan?: number;
}

// Rencana Tugas Types
export interface RencanaTugas {
  id: string;
  rps_id: string;
  nomor_tugas: number;
  judul: string;
  sub_cpmk_ids?: string[];
  indikator_keberhasilan?: string;
  batas_waktu_minggu?: number;
  batas_waktu_tanggal?: string;
  petunjuk_pengerjaan?: string;
  jenis_tugas: 'Individu' | 'Kelompok';
  luaran_tugas?: string;
  kriteria_penilaian?: string;
  teknik_penilaian?: string;
  bobot: number;
  created_at?: string;
}

export interface CreateRencanaTugasRequest {
  nomor_tugas: number;
  judul: string;
  sub_cpmk_ids?: string[];
  indikator_keberhasilan?: string;
  batas_waktu_minggu?: number;
  batas_waktu_tanggal?: string;
  petunjuk_pengerjaan?: string;
  jenis_tugas: 'Individu' | 'Kelompok';
  luaran_tugas?: string;
  kriteria_penilaian?: string;
  teknik_penilaian?: string;
  bobot: number;
}

export interface UpdateRencanaTugasRequest extends Partial<CreateRencanaTugasRequest> {}

// Analisis Ketercapaian CPL Types
export interface AnalisisKetercapaianCPL {
  id: string;
  rps_id: string;
  minggu_mulai: number;
  minggu_selesai: number;
  cpl_id: string;
  cpmk_ids?: string[];
  sub_cpmk_ids?: string[];
  topik_materi?: string;
  jenis_assessment?: string;
  bobot_kontribusi: number;
  created_at?: string;
  cpl?: {
    id: string;
    kode: string;
    deskripsi: string;
  };
}

export interface CreateAnalisisKetercapaianRequest {
  minggu_mulai: number;
  minggu_selesai: number;
  cpl_id: string;
  cpmk_ids?: string[];
  sub_cpmk_ids?: string[];
  topik_materi?: string;
  jenis_assessment?: string;
  bobot_kontribusi: number;
}

export interface UpdateAnalisisKetercapaianRequest extends Partial<CreateAnalisisKetercapaianRequest> {}

// Skala Penilaian Types
export interface SkalaPenilaian {
  id: string;
  rps_id: string;
  nilai_min: number;
  nilai_max: number;
  huruf_mutu: string;
  bobot_nilai: number;
  is_lulus: boolean;
  created_at?: string;
}

export interface CreateSkalaPenilaianRequest {
  nilai_min: number;
  nilai_max: number;
  huruf_mutu: string;
  bobot_nilai: number;
  is_lulus: boolean;
}

export interface BatchSkalaPenilaianRequest {
  skala_penilaian: CreateSkalaPenilaianRequest[];
}

export interface UpdateSkalaPenilaianRequest extends Partial<CreateSkalaPenilaianRequest> {}

export interface RPS {
  id: string;
  mata_kuliah_id: string;
  mata_kuliah_nama: string;
  kode_mk: string;
  sks: number;
  semester: number;
  tahun_akademik: string;
  tahun_ajaran?: string;
  semester_type?: 'ganjil' | 'genap';
  tanggal_penyusunan?: string;
  penyusun_nama?: string;
  penyusun_nidn?: string;
  koordinator_rmk_nama?: string;
  koordinator_rmk_nidn?: string;
  kaprodi_nama?: string;
  kaprodi_nidn?: string;
  fakultas?: string;
  program_studi?: string;
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
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision' | 'published';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  review_notes?: string;
  cpmk?: CPMK[];
  rencana_pembelajaran?: RencanaPembelajaran[];
  bahan_bacaan?: BahanBacaan[];
  evaluasi?: Evaluasi[];
  rencana_tugas?: RencanaTugas[];
  analisis_ketercapaian?: AnalisisKetercapaianCPL[];
  skala_penilaian?: SkalaPenilaian[];
}

export interface CreateRPSRequest {
  mata_kuliah_id: string;
  tahun_akademik?: string;
  tahun_ajaran?: string;
  semester_type?: 'ganjil' | 'genap';
  tanggal_penyusunan?: string;
  penyusun_nama?: string;
  penyusun_nidn?: string;
  koordinator_rmk_nama?: string;
  koordinator_rmk_nidn?: string;
  kaprodi_nama?: string;
  kaprodi_nidn?: string;
  fakultas?: string;
  program_studi?: string;
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

// Rencana Pembelajaran Types - sesuai API docs
export interface CreateRencanaPembelajaranRequest {
  pertemuan: number;
  minggu_mulai: number;
  minggu_selesai?: number;
  topik: string;
  sub_topik?: string[];
  cpmk_ids?: string[];
  sub_cpmk_ids?: string[];
  indikator?: string[];
  metode?: string;
  media_lms?: string;
  waktu?: number;
  waktu_tm?: number;
  waktu_bm?: number;
  waktu_pt?: number;
  materi?: string;
  teknik_penilaian?: string;
  kriteria_penilaian?: string;
  bobot_penilaian?: number;
}

export interface UpdateRencanaPembelajaranRequest extends Partial<CreateRencanaPembelajaranRequest> {}

// Bahan Bacaan Types - sesuai API docs
export interface CreateBahanBacaanRequest {
  judul: string;
  penulis?: string;
  tahun?: number;
  penerbit?: string;
  jenis?: 'buku' | 'jurnal' | 'artikel' | 'website' | 'modul';
  isbn?: string;
  halaman?: string;
  url?: string;
  is_wajib?: boolean;
  urutan?: number;
}

export interface UpdateBahanBacaanRequest extends Partial<CreateBahanBacaanRequest> {}

// Evaluasi Types - sesuai API backend
export interface CreateEvaluasiRequest {
  komponen: string;
  teknik_penilaian?: string;
  instrumen?: string;
  bobot: number;
  minggu_mulai?: number;
  minggu_selesai?: number;
  topik_materi?: string;
  jenis_assessment?: string;
  urutan?: number;
}

export interface UpdateEvaluasiRequest extends Partial<CreateEvaluasiRequest> {}

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
    // Get all CPMK from all RPS
    getAllGlobal: async (): Promise<ApiResponse<CPMK[]>> => {
      return api.get<CPMK[]>('/rps/cpmk');
    },

    getAll: async (rpsId: string): Promise<ApiResponse<CPMK[]>> => {
      return api.get<CPMK[]>(`/rps/${rpsId}/cpmk`);
    },

    create: async (rpsId: string, data: CreateCPMKRequest): Promise<ApiResponse<CPMK>> => {
      return api.post<CPMK>(`/rps/${rpsId}/cpmk`, data);
    },

    // Backend uses /rps/cpmk/:cpmk_id for update/delete
    update: async (cpmkId: string, data: UpdateCPMKRequest): Promise<ApiResponse<CPMK>> => {
      return api.put<CPMK>(`/rps/cpmk/${cpmkId}`, data);
    },

    delete: async (cpmkId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/cpmk/${cpmkId}`);
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

    // Backend uses /rps/rencana-pembelajaran/:id for update/delete
    update: async (rpId: string, data: UpdateRencanaPembelajaranRequest): Promise<ApiResponse<RencanaPembelajaran>> => {
      return api.put<RencanaPembelajaran>(`/rps/rencana-pembelajaran/${rpId}`, data);
    },

    delete: async (rpId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/rencana-pembelajaran/${rpId}`);
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

    // Backend uses /rps/bahan-bacaan/:id for update/delete
    update: async (bbId: string, data: UpdateBahanBacaanRequest): Promise<ApiResponse<BahanBacaan>> => {
      return api.put<BahanBacaan>(`/rps/bahan-bacaan/${bbId}`, data);
    },

    delete: async (bbId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/bahan-bacaan/${bbId}`);
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

    // Backend uses /rps/evaluasi/:id for update/delete
    update: async (evalId: string, data: UpdateEvaluasiRequest): Promise<ApiResponse<Evaluasi>> => {
      return api.put<Evaluasi>(`/rps/evaluasi/${evalId}`, data);
    },

    delete: async (evalId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/evaluasi/${evalId}`);
    },
  },

  // Sub-CPMK Sub-resource
  subCpmk: {
    getAll: async (cpmkId: string): Promise<ApiResponse<SubCPMK[]>> => {
      return api.get<SubCPMK[]>(`/rps/cpmk/${cpmkId}/sub-cpmk`);
    },

    create: async (cpmkId: string, data: CreateSubCPMKRequest): Promise<ApiResponse<SubCPMK>> => {
      return api.post<SubCPMK>(`/rps/cpmk/${cpmkId}/sub-cpmk`, data);
    },

    update: async (subCpmkId: string, data: UpdateSubCPMKRequest): Promise<ApiResponse<SubCPMK>> => {
      return api.put<SubCPMK>(`/rps/sub-cpmk/${subCpmkId}`, data);
    },

    delete: async (subCpmkId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/sub-cpmk/${subCpmkId}`);
    },
  },

  // Rencana Tugas Sub-resource
  rencanaTugas: {
    getAll: async (rpsId: string): Promise<ApiResponse<RencanaTugas[]>> => {
      return api.get<RencanaTugas[]>(`/rps/${rpsId}/rencana-tugas`);
    },

    create: async (rpsId: string, data: CreateRencanaTugasRequest): Promise<ApiResponse<RencanaTugas>> => {
      return api.post<RencanaTugas>(`/rps/${rpsId}/rencana-tugas`, data);
    },

    update: async (tugasId: string, data: UpdateRencanaTugasRequest): Promise<ApiResponse<RencanaTugas>> => {
      return api.put<RencanaTugas>(`/rps/rencana-tugas/${tugasId}`, data);
    },

    delete: async (tugasId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/rencana-tugas/${tugasId}`);
    },
  },

  // Analisis Ketercapaian CPL Sub-resource
  analisisKetercapaian: {
    getAll: async (rpsId: string): Promise<ApiResponse<AnalisisKetercapaianCPL[]>> => {
      return api.get<AnalisisKetercapaianCPL[]>(`/rps/${rpsId}/analisis-ketercapaian`);
    },

    create: async (rpsId: string, data: CreateAnalisisKetercapaianRequest): Promise<ApiResponse<AnalisisKetercapaianCPL>> => {
      return api.post<AnalisisKetercapaianCPL>(`/rps/${rpsId}/analisis-ketercapaian`, data);
    },

    update: async (analisisId: string, data: UpdateAnalisisKetercapaianRequest): Promise<ApiResponse<AnalisisKetercapaianCPL>> => {
      return api.put<AnalisisKetercapaianCPL>(`/rps/analisis-ketercapaian/${analisisId}`, data);
    },

    delete: async (analisisId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/analisis-ketercapaian/${analisisId}`);
    },
  },

  // Skala Penilaian Sub-resource
  skalaPenilaian: {
    getAll: async (rpsId: string): Promise<ApiResponse<SkalaPenilaian[]>> => {
      return api.get<SkalaPenilaian[]>(`/rps/${rpsId}/skala-penilaian`);
    },

    create: async (rpsId: string, data: CreateSkalaPenilaianRequest): Promise<ApiResponse<SkalaPenilaian>> => {
      return api.post<SkalaPenilaian>(`/rps/${rpsId}/skala-penilaian`, data);
    },

    batchCreate: async (rpsId: string, data: BatchSkalaPenilaianRequest): Promise<ApiResponse<SkalaPenilaian[]>> => {
      return api.post<SkalaPenilaian[]>(`/rps/${rpsId}/skala-penilaian/batch`, data);
    },

    update: async (skalaId: string, data: UpdateSkalaPenilaianRequest): Promise<ApiResponse<SkalaPenilaian>> => {
      return api.put<SkalaPenilaian>(`/rps/skala-penilaian/${skalaId}`, data);
    },

    delete: async (skalaId: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/rps/skala-penilaian/${skalaId}`);
    },
  },
};

export default rpsService;
