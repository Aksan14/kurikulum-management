import { ApiResponse } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// File Upload Types
export interface UploadedFile {
  id?: string;
  filename?: string;
  original_name?: string;
  stored_name?: string;
  file_path?: string;
  file_size?: number;
  size?: number;
  mime_type?: string;
  file_type?: string;
  url: string;
  created_at?: string;
}

// File Service
export const fileService = {
  // Upload file
  upload: async (file: File): Promise<ApiResponse<UploadedFile>> => {
    const formData = new FormData();
    formData.append('file', file);

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'File upload failed');
    }

    return response.json();
  },

  // Get file URL
  getFileUrl: (filename: string): string => {
    return `${API_BASE_URL}/files/${filename}`;
  },

  // Get file info
  getInfo: async (path: string): Promise<ApiResponse<UploadedFile>> => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const response = await fetch(`${API_BASE_URL}/files/info?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get file info');
    }

    return response.json();
  },

  // Delete file
  delete: async (path: string): Promise<ApiResponse<null>> => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const response = await fetch(`${API_BASE_URL}/files?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete file');
    }

    return response.json();
  },
};

export default fileService;
