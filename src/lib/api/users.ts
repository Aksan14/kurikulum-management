import api, { ApiResponse, PaginatedResponse } from './client';

// User Types
export interface User {
  id: string;
  nama: string;
  email: string;
  nip?: string;
  role: 'kaprodi' | 'dosen';
  status: 'active' | 'inactive';
  phone?: string;
  avatar_url?: string | null;
  last_login?: string | null;
  created_at: string;
}

export interface CreateUserRequest {
  nama: string;
  email: string;
  password: string;
  role: 'kaprodi' | 'dosen';
  nip?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  nama?: string;
  email?: string;
  role?: 'kaprodi' | 'dosen';
  nip?: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'kaprodi' | 'dosen';
  status?: 'active' | 'inactive';
  sort_by?: 'nama' | 'email' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Users Service
export const usersService = {
  // Get all users (with pagination)
  getAll: async (params?: UserListParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return api.get<PaginatedResponse<User>>('/users', params as Record<string, string | number | boolean | undefined>);
  },

  // Get user by ID
  getById: async (id: string): Promise<ApiResponse<User>> => {
    return api.get<User>(`/users/${id}`);
  },

  // Get all dosen
  getDosen: async (): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return api.get<PaginatedResponse<User>>('/users/dosen');
  },

  // Create user (Kaprodi only)
  create: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    return api.post<User>('/users', data);
  },

  // Update user (Kaprodi only)
  update: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    return api.put<User>(`/users/${id}`, data);
  },

  // Delete user (Kaprodi only)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/users/${id}`);
  },

  // Toggle user status (Kaprodi only)
  toggleStatus: async (id: string): Promise<ApiResponse<User>> => {
    return api.patch<User>(`/users/${id}/toggle-status`);
  },
};

export default usersService;
