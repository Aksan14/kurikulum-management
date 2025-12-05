import api, { ApiResponse, PaginatedResponse } from './client';

// Mata Kuliah Types
export interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  jenis: 'wajib' | 'pilihan';
  deskripsi?: string;
  prasyarat?: string[];
  status: 'aktif' | 'nonaktif' | 'dihapus';
  dosen_pengampu_id?: string;
  koordinator_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  dosen_pengampu?: {
    id: string;
    nama: string;
    email: string;
  };
  koordinator?: {
    id: string;
    nama: string;
    email: string;
  };
}

export interface CreateMataKuliahRequest {
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  jenis?: 'wajib' | 'pilihan';
  deskripsi?: string;
  prasyarat?: string[];
  dosen_pengampu_id?: string;
  koordinator_id?: string;
  status?: 'aktif' | 'nonaktif';
}

export interface UpdateMataKuliahRequest {
  kode?: string;
  nama?: string;
  sks?: number;
  semester?: number;
  jenis?: 'wajib' | 'pilihan';
  deskripsi?: string;
  prasyarat?: string[];
  dosen_pengampu_id?: string;
  koordinator_id?: string;
  status?: 'aktif' | 'nonaktif';
  is_active?: boolean;
}

export interface MataKuliahListParams {
  page?: number;
  limit?: number;
  search?: string;
  semester?: number;
  jenis?: 'wajib' | 'pilihan';
  status?: 'aktif' | 'nonaktif' | 'dihapus';
  sort_by?: 'kode' | 'nama' | 'sks' | 'semester' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Mata Kuliah Service
export const mataKuliahService = {
  // Get all mata kuliah (with pagination)
  getAll: async (params?: MataKuliahListParams): Promise<ApiResponse<PaginatedResponse<MataKuliah>>> => {
    return api.get<PaginatedResponse<MataKuliah>>('/mata-kuliah', params as Record<string, string | number | boolean | undefined>);
  },

  // Get mata kuliah by ID
  getById: async (id: string): Promise<ApiResponse<MataKuliah>> => {
    return api.get<MataKuliah>(`/mata-kuliah/${id}`);
  },

  // Get my mata kuliah (for dosen)
  getMy: async (): Promise<ApiResponse<PaginatedResponse<MataKuliah>>> => {
    return api.get<PaginatedResponse<MataKuliah>>('/mata-kuliah/my');
  },

  // Get mata kuliah by semester
  getBySemester: async (semester: number): Promise<ApiResponse<PaginatedResponse<MataKuliah>>> => {
    return api.get<PaginatedResponse<MataKuliah>>(`/mata-kuliah/semester/${semester}`);
  },

  // Get mata kuliah by dosen
  getByDosen: async (dosenId: string): Promise<ApiResponse<PaginatedResponse<MataKuliah>>> => {
    return api.get<PaginatedResponse<MataKuliah>>(`/mata-kuliah/dosen/${dosenId}`);
  },

  // Create mata kuliah (Kaprodi only)
  create: async (data: CreateMataKuliahRequest): Promise<ApiResponse<MataKuliah>> => {
    return api.post<MataKuliah>('/mata-kuliah', data);
  },

  // Update mata kuliah (Kaprodi only)
  update: async (id: string, data: UpdateMataKuliahRequest): Promise<ApiResponse<MataKuliah>> => {
    return api.put<MataKuliah>(`/mata-kuliah/${id}`, data);
  },

  // Toggle mata kuliah status (Kaprodi only)
  toggleStatus: async (id: string): Promise<ApiResponse<MataKuliah>> => {
    return api.patch<MataKuliah>(`/mata-kuliah/${id}/toggle-status`);
  },

  // Delete mata kuliah (Kaprodi only)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/mata-kuliah/${id}`);
  },
};

export default mataKuliahService;
