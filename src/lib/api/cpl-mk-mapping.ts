import api, { ApiResponse, PaginatedResponse } from './client';

// CPL-MK Mapping Types
export interface CPLMKMapping {
  id: string;
  cpl_id: string;
  mata_kuliah_id: string;
  level: 'tinggi' | 'sedang' | 'rendah';
  created_at?: string;
  updated_at?: string;
  cpl?: {
    id: string;
    kode: string;
    nama: string;
  };
  mata_kuliah?: {
    id: string;
    kode: string;
    nama: string;
    semester: number;
  };
}

export interface CreateMappingRequest {
  cpl_id: string;
  mata_kuliah_id: string;
  level: 'tinggi' | 'sedang' | 'rendah';
}

export interface UpdateMappingRequest {
  level: 'tinggi' | 'sedang' | 'rendah';
}

export interface MappingListParams {
  cpl_id?: string;
  mata_kuliah_id?: string;
  level?: 'tinggi' | 'sedang' | 'rendah';
  page?: number;
  limit?: number;
}

// CPL-MK Mapping Service
export const cplMKMappingService = {
  // Get all mappings
  getAll: async (params?: MappingListParams): Promise<ApiResponse<PaginatedResponse<CPLMKMapping>>> => {
    return api.get<PaginatedResponse<CPLMKMapping>>('/cpl-mk-mappings', params as Record<string, string | number | boolean | undefined>);
  },

  // Get mapping by ID
  getById: async (id: string): Promise<ApiResponse<CPLMKMapping>> => {
    return api.get<CPLMKMapping>(`/cpl-mk-mappings/${id}`);
  },

  // Get mappings by CPL ID
  getByCPL: async (cplId: string): Promise<ApiResponse<CPLMKMapping[]>> => {
    return api.get<CPLMKMapping[]>(`/cpl-mk-mappings/cpl/${cplId}`);
  },

  // Get mappings by Mata Kuliah ID
  getByMK: async (mkId: string): Promise<ApiResponse<CPLMKMapping[]>> => {
    return api.get<CPLMKMapping[]>(`/cpl-mk-mappings/mk/${mkId}`);
  },

  // Create new mapping
  create: async (data: CreateMappingRequest): Promise<ApiResponse<CPLMKMapping>> => {
    return api.post<CPLMKMapping>('/cpl-mk-mappings', data);
  },

  // Update mapping level
  update: async (id: string, data: UpdateMappingRequest): Promise<ApiResponse<CPLMKMapping>> => {
    return api.put<CPLMKMapping>(`/cpl-mk-mappings/${id}`, data);
  },

  // Delete mapping
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/cpl-mk-mappings/${id}`);
  },

  // Upsert mapping (create or update)
  upsert: async (data: CreateMappingRequest): Promise<ApiResponse<CPLMKMapping>> => {
    return api.post<CPLMKMapping>('/cpl-mk-mappings/upsert', data);
  },

  // Delete mapping by CPL and MK IDs
  deleteByPair: async (cplId: string, mkId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/cpl-mk-mappings/cpl/${cplId}/mk/${mkId}`);
  }
};

export default cplMKMappingService;
