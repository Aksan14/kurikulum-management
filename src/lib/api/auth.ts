import api, { ApiResponse, PaginatedResponse, setTokens, clearTokens, setUser, getUser } from './client';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nama: string;
  email: string;
  password: string;
  role: 'kaprodi' | 'dosen';
  nip?: string;
  phone?: string;
}

export interface AuthUser {
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

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface ProfileUpdateRequest {
  nama?: string;
  phone?: string;
  avatar_url?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// Auth Service
export const authService = {
  // Login
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    if (response.success && response.data) {
      setTokens(response.data.access_token, response.data.refresh_token);
      setUser(response.data.user);
    }
    return response;
  },

  // Register
  register: async (data: RegisterRequest): Promise<ApiResponse<{ user: AuthUser }>> => {
    return api.post<{ user: AuthUser }>('/auth/register', data);
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  // Get Profile
  getProfile: async (): Promise<ApiResponse<AuthUser>> => {
    return api.get<AuthUser>('/auth/profile');
  },

  // Update Profile
  updateProfile: async (data: ProfileUpdateRequest): Promise<ApiResponse<AuthUser>> => {
    const response = await api.put<AuthUser>('/auth/profile', data);
    if (response.success && response.data) {
      setUser(response.data);
    }
    return response;
  },

  // Change Password
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    return api.post<null>('/auth/change-password', data);
  },

  // Get current user from localStorage
  getCurrentUser: (): AuthUser | null => {
    return getUser();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
