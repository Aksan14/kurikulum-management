import api, { ApiResponse, PaginatedResponse } from './client';

// Backup Types
export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'rps' | 'users' | 'system' | 'cpl' | 'mata_kuliah';
  size: number;
  size_formatted?: string;
  status: 'completed' | 'failed' | 'in_progress' | 'pending';
  description?: string;
  file_path?: string;
  download_url?: string;
  created_at: string;
  completed_at?: string;
  created_by?: string;
  error_message?: string;
}

export interface CreateBackupRequest {
  type: 'full' | 'rps' | 'users' | 'system' | 'cpl' | 'mata_kuliah';
  name?: string;
  description?: string;
}

export interface RestoreBackupRequest {
  backup_id: string;
  confirm?: boolean;
}

export interface BackupSettings {
  auto_backup_enabled: boolean;
  backup_schedule: string; // cron format
  retention_days: number;
  encryption_enabled: boolean;
  backup_types: string[];
}

export interface UpdateBackupSettingsRequest {
  auto_backup_enabled?: boolean;
  backup_schedule?: string;
  retention_days?: number;
  encryption_enabled?: boolean;
  backup_types?: string[];
}

export interface BackupListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

// Backup Service
export const backupService = {
  // Get all backups
  getAll: async (params?: BackupListParams): Promise<ApiResponse<PaginatedResponse<Backup>>> => {
    const queryParams = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return api.get<PaginatedResponse<Backup>>(`/backups${queryParams}`);
  },

  // Get backup by ID
  getById: async (id: string): Promise<ApiResponse<Backup>> => {
    return api.get<Backup>(`/backups/${id}`);
  },

  // Create new backup
  create: async (data: CreateBackupRequest): Promise<ApiResponse<Backup>> => {
    return api.post<Backup>('/backups', data);
  },

  // Restore from backup
  restore: async (data: RestoreBackupRequest): Promise<ApiResponse<{ message: string }>> => {
    return api.post<{ message: string }>('/backups/restore', data);
  },

  // Delete backup
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/backups/${id}`);
  },

  // Download backup
  download: async (id: string): Promise<Blob> => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    
    const response = await fetch(`${API_BASE_URL}/backups/${id}/download`, {
      method: 'GET',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download backup');
    }

    return response.blob();
  },

  // Get backup settings
  getSettings: async (): Promise<ApiResponse<BackupSettings>> => {
    return api.get<BackupSettings>('/backups/settings');
  },

  // Update backup settings
  updateSettings: async (data: UpdateBackupSettingsRequest): Promise<ApiResponse<BackupSettings>> => {
    return api.put<BackupSettings>('/backups/settings', data);
  },

  // Get backup statistics
  getStatistics: async (): Promise<ApiResponse<{
    total_backups: number;
    total_size: number;
    total_size_formatted: string;
    last_backup?: Backup;
    next_scheduled?: string;
  }>> => {
    return api.get('/backups/statistics');
  }
};

export default backupService;
