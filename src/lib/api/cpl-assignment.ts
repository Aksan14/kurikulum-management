import api, { ApiResponse, PaginatedResponse } from './client';

// CPL Assignment Types
export interface CPLAssignment {
  id: string;
  cpl_id: string;
  dosen_id: string;
  mata_kuliah?: string;
  mata_kuliah_id?: string;
  status: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled';
  assigned_at: string;
  accepted_at?: string;
  completed_at?: string;
  deadline?: string;
  comment?: string;
  rejection_reason?: string;
  created_by: string;
  cpl?: {
    id: string;
    kode: string;
    judul: string;
    deskripsi?: string;
  };
  dosen?: {
    id: string;
    nama: string;
    email?: string;
  };
}

export interface CreateAssignmentRequest {
  cpl_id: string;
  dosen_id: string;
  mata_kuliah?: string;
  mata_kuliah_id?: string;
  deadline?: string;
  catatan?: string;
}

export interface UpdateAssignmentStatusRequest {
  status: 'accepted' | 'rejected' | 'done' | 'cancelled';
  comment?: string;
  rejection_reason?: string;
}

export interface AssignmentListParams {
  page?: number;
  limit?: number;
  cpl_id?: string;
  dosen_id?: string;
  status?: 'assigned' | 'accepted' | 'rejected' | 'done' | 'cancelled';
  sort_by?: 'assigned_at' | 'deadline' | 'status';
  sort_order?: 'asc' | 'desc';
}

// CPL Assignment Service
export const cplAssignmentService = {
  // Get all assignments (with pagination)
  getAll: async (params?: AssignmentListParams): Promise<ApiResponse<PaginatedResponse<CPLAssignment>>> => {
    return api.get<PaginatedResponse<CPLAssignment>>('/cpl-assignments', params as Record<string, string | number | boolean | undefined>);
  },

  // Get assignment by ID
  getById: async (id: string): Promise<ApiResponse<CPLAssignment>> => {
    return api.get<CPLAssignment>(`/cpl-assignments/${id}`);
  },

  // Get my assignments (for dosen)
  getMy: async (): Promise<ApiResponse<PaginatedResponse<CPLAssignment>>> => {
    return api.get<PaginatedResponse<CPLAssignment>>('/cpl-assignments/my');
  },

  // Get assignments by CPL
  getByCPL: async (cplId: string): Promise<ApiResponse<PaginatedResponse<CPLAssignment>>> => {
    return api.get<PaginatedResponse<CPLAssignment>>(`/cpl-assignments/cpl/${cplId}`);
  },

  // Create assignment (Kaprodi only)
  create: async (data: CreateAssignmentRequest): Promise<ApiResponse<CPLAssignment>> => {
    return api.post<CPLAssignment>('/cpl-assignments', data);
  },

  // Update assignment status
  updateStatus: async (id: string, data: UpdateAssignmentStatusRequest): Promise<ApiResponse<CPLAssignment>> => {
    return api.patch<CPLAssignment>(`/cpl-assignments/${id}/status`, data);
  },

  // Delete assignment (Kaprodi only)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/cpl-assignments/${id}`);
  },
};

export default cplAssignmentService;
