// API Client and Services
export { default as api, apiClient, setTokens, clearTokens, setUser, getUser, ApiError } from './client';
export type { ApiResponse, PaginatedResponse } from './client';

// Auth Service
export { default as authService } from './auth';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthUser, 
  LoginResponse, 
  ProfileUpdateRequest, 
  ChangePasswordRequest 
} from './auth';

// Users Service
export { default as usersService } from './users';
export type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserListParams 
} from './users';

// CPL Service
export { default as cplService } from './cpl';
export type { 
  CPL, 
  CPLStatistics, 
  CreateCPLRequest, 
  UpdateCPLRequest, 
  CPLListParams 
} from './cpl';

// Mata Kuliah Service
export { default as mataKuliahService } from './mata-kuliah';
export type { 
  MataKuliah, 
  CreateMataKuliahRequest, 
  UpdateMataKuliahRequest, 
  MataKuliahListParams,
  AssignDosenRequest,
  UnassignDosenRequest
} from './mata-kuliah';

// CPL Assignment Service
export { default as cplAssignmentService } from './cpl-assignment';
export type { 
  CPLAssignment, 
  CreateAssignmentRequest, 
  UpdateAssignmentStatusRequest, 
  AssignmentListParams 
} from './cpl-assignment';

// RPS Service
export { default as rpsService } from './rps';
export type { 
  RPS, 
  BobotNilai, 
  CPMK, 
  RencanaPembelajaran, 
  BahanBacaan, 
  Evaluasi,
  CreateRPSRequest, 
  UpdateRPSRequest, 
  RPSListParams,
  CreateCPMKRequest,
  UpdateCPMKRequest,
  CreateRencanaPembelajaranRequest,
  UpdateRencanaPembelajaranRequest,
  CreateBahanBacaanRequest,
  UpdateBahanBacaanRequest,
  CreateEvaluasiRequest,
  UpdateEvaluasiRequest,
  ReviewRequest
} from './rps';

// Notification Service
export { default as notificationService } from './notifications';
export type { 
  Notification, 
  CreateNotificationRequest, 
  NotificationListParams, 
  UnreadCountResponse 
} from './notifications';

// Dashboard Service
export { default as dashboardService } from './dashboard';
export type { 
  KaprodiDashboard, 
  DosenDashboard 
} from './dashboard';

// Document Service
export { default as documentService } from './documents';
export type { 
  Document, 
  DocumentTemplate, 
  GenerateDocumentRequest, 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  DocumentListParams 
} from './documents';

// File Service
export { default as fileService } from './files';
export type { UploadedFile } from './files';
