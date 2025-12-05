import api, { ApiResponse, PaginatedResponse } from './client';

// Document Types
export interface Document {
  id: string;
  template_id?: string;
  template_name?: string;
  tahun: string;
  status: 'processing' | 'ready' | 'failed' | 'archived';
  file_url?: string;
  file_type: 'docx' | 'pdf' | 'xlsx';
  progress?: number;
  sections?: string[];
  generation_data?: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
  created_by: string;
}

export interface DocumentTemplate {
  id: string;
  nama: string;
  deskripsi?: string;
  sections: string[];
  file_url?: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerateDocumentRequest {
  template_id: string;
  tahun: string;
  sections?: string[];
  file_type: 'docx' | 'pdf' | 'xlsx';
  generation_data?: Record<string, unknown>;
}

export interface CreateTemplateRequest {
  nama: string;
  deskripsi?: string;
  sections: string[];
  file_url?: string;
  version?: string;
  is_active?: boolean;
}

export interface UpdateTemplateRequest {
  nama?: string;
  deskripsi?: string;
  sections?: string[];
  file_url?: string;
  version?: string;
  is_active?: boolean;
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  template_id?: string;
  status?: 'processing' | 'ready' | 'failed' | 'archived';
  tahun?: string;
  file_type?: 'docx' | 'pdf' | 'xlsx';
  sort_by?: 'created_at' | 'completed_at';
  sort_order?: 'asc' | 'desc';
}

// Document Service
export const documentService = {
  // Documents
  getAll: async (params?: DocumentListParams): Promise<ApiResponse<PaginatedResponse<Document>>> => {
    return api.get<PaginatedResponse<Document>>('/documents', params as Record<string, string | number | boolean | undefined>);
  },

  getById: async (id: string): Promise<ApiResponse<Document>> => {
    return api.get<Document>(`/documents/${id}`);
  },

  generate: async (data: GenerateDocumentRequest): Promise<ApiResponse<Document>> => {
    return api.post<Document>('/documents/generate', data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/documents/${id}`);
  },

  // Download document (returns URL or blob)
  getDownloadUrl: (id: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    return `${baseUrl}/documents/${id}/download`;
  },

  // Templates
  templates: {
    getAll: async (): Promise<ApiResponse<DocumentTemplate[]>> => {
      return api.get<DocumentTemplate[]>('/documents/templates');
    },

    getById: async (id: string): Promise<ApiResponse<DocumentTemplate>> => {
      return api.get<DocumentTemplate>(`/documents/templates/${id}`);
    },

    create: async (data: CreateTemplateRequest): Promise<ApiResponse<DocumentTemplate>> => {
      return api.post<DocumentTemplate>('/documents/templates', data);
    },

    update: async (id: string, data: UpdateTemplateRequest): Promise<ApiResponse<DocumentTemplate>> => {
      return api.put<DocumentTemplate>(`/documents/templates/${id}`, data);
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
      return api.delete<null>(`/documents/templates/${id}`);
    },
  },
};

export default documentService;
