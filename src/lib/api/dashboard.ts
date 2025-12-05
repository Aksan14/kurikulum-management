import api, { ApiResponse } from './client';

// Dashboard Types
export interface KaprodiDashboard {
  total_cpl: number;
  published_cpl: number;
  draft_cpl: number;
  total_rps: number;
  approved_rps: number;
  submitted_rps?: number;
  pending_review?: number;
  rejected_rps: number;
  active_dosen: number;
  active_assignments?: number;
  accepted_assignments?: number;
  pending_assignments?: number;
  completed_assignments?: number;
  ready_documents?: number;
  documents_generated?: number;
}

export interface DosenDashboard {
  total_assignments?: number;
  my_assignments?: number;
  accepted_assignments: number;
  pending_assignments: number;
  completed_assignments: number;
  total_rps?: number;
  my_rps?: number;
  approved_rps: number;
  draft_rps: number;
  submitted_rps: number;
  rejected_rps?: number;
  my_mata_kuliah?: number;
}

// Dashboard Service
export const dashboardService = {
  // Get dashboard (role-based)
  get: async (): Promise<ApiResponse<KaprodiDashboard | DosenDashboard>> => {
    return api.get<KaprodiDashboard | DosenDashboard>('/dashboard');
  },

  // Get kaprodi dashboard
  getKaprodi: async (): Promise<ApiResponse<KaprodiDashboard>> => {
    return api.get<KaprodiDashboard>('/dashboard/kaprodi');
  },

  // Get dosen dashboard
  getDosen: async (): Promise<ApiResponse<DosenDashboard>> => {
    return api.get<DosenDashboard>('/dashboard/dosen');
  },
};

export default dashboardService;
