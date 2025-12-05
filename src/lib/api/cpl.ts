import api, { ApiResponse, PaginatedResponse } from './client';

// CPL Types
export interface CPL {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  published_at?: string;
  creator?: {
    id: string;
    nama: string;
    email: string;
  };
}

export interface CPLStatistics {
  total_cpl: number;
  published: number;
  draft: number;
  archived: number;
}

export interface CreateCPLRequest {
  kode: string;
  nama: string;
  deskripsi: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateCPLRequest {
  kode?: string;
  nama?: string;
  deskripsi?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface CPLListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  sort_by?: 'kode' | 'nama' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// CPL Service
export const cplService = {
  // Get all CPL (with pagination)
  getAll: async (params?: CPLListParams): Promise<ApiResponse<PaginatedResponse<CPL>>> => {
    return api.get<PaginatedResponse<CPL>>('/cpl', params as Record<string, string | number | boolean | undefined>);
  },

  // Get CPL by ID
  getById: async (id: string): Promise<ApiResponse<CPL>> => {
    return api.get<CPL>(`/cpl/${id}`);
  },

  // Get active CPL (published only)
  getActive: async (): Promise<ApiResponse<PaginatedResponse<CPL>>> => {
    return api.get<PaginatedResponse<CPL>>('/cpl/active');
  },

  // Get CPL statistics
  getStatistics: async (): Promise<ApiResponse<CPLStatistics>> => {
    return api.get<CPLStatistics>('/cpl/statistics');
  },

  // Create CPL (Kaprodi only)
  create: async (data: CreateCPLRequest): Promise<ApiResponse<CPL>> => {
    return api.post<CPL>('/cpl', data);
  },

  // Update CPL (Kaprodi only)
  update: async (id: string, data: UpdateCPLRequest): Promise<ApiResponse<CPL>> => {
    return api.put<CPL>(`/cpl/${id}`, data);
  },

  // Update CPL status (Kaprodi only)
  updateStatus: async (id: string, status: 'draft' | 'published' | 'archived'): Promise<ApiResponse<CPL>> => {
    return api.patch<CPL>(`/cpl/${id}/status`, { status });
  },

  // Delete CPL (Kaprodi only)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/cpl/${id}`);
  },
};

export default cplService;
