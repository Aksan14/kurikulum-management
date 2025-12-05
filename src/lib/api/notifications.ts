import api, { ApiResponse, PaginatedResponse } from './client';

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'approval' | 'rejection' | 'document' | 'info' | 'deadline' | 'system';
  is_read: boolean;
  action_url?: string;
  related_id?: string;
  related_type?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'approval' | 'rejection' | 'document' | 'info' | 'deadline' | 'system';
  action_url?: string;
  related_id?: string;
  related_type?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: 'assignment' | 'approval' | 'rejection' | 'document' | 'info' | 'deadline' | 'system';
  is_read?: boolean;
  sort_order?: 'asc' | 'desc';
}

export interface UnreadCountResponse {
  count: number;
}

// Notification Service
export const notificationService = {
  // Get my notifications (with pagination)
  getAll: async (params?: NotificationListParams): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    return api.get<PaginatedResponse<Notification>>('/notifications', params as Record<string, string | number | boolean | undefined>);
  },

  // Get notification by ID
  getById: async (id: string): Promise<ApiResponse<Notification>> => {
    return api.get<Notification>(`/notifications/${id}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
    return api.get<UnreadCountResponse>('/notifications/unread-count');
  },

  // Create notification (Kaprodi only)
  create: async (data: CreateNotificationRequest): Promise<ApiResponse<Notification>> => {
    return api.post<Notification>('/notifications', data);
  },

  // Mark as read
  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    return api.patch<null>(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    return api.patch<null>('/notifications/read-all');
  },

  // Delete notification
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<null>(`/notifications/${id}`);
  },
};

export default notificationService;
