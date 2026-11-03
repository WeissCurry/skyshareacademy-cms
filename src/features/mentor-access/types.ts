// Type definitions for Mentor Access, KYC, Program Orders, and Gated Content
// Follows API contract: skyshareacademy-server/doc/mentor-access-design.md

export type KycStatus = "REGISTERED" | "KYC_SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type OrderStatus = "AWAITING_PAYMENT" | "PROOF_SUBMITTED" | "ACTIVE" | "PAYMENT_REJECTED" | "EXPIRED";
export type MaterialType = "pdf" | "link";
export type SubmissionStatus = "submitted" | "accepted" | "revision";
export type AuditEntityType = "KYC" | "PROGRAM_ORDER" | "ASSIGNMENT" | "SYSTEM";

export interface MentorKycSummary {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  nik: string; // Masked in queue: "3201************"
  bank_name: string;
  bank_account_number: string; // Masked in queue: "****-****-5678"
  bank_account_holder: string;
  status: KycStatus;
  submitted_at: string | null;
  ktp_url?: string | null;
  reject_reason?: string | null;
  roles?: string[];
  student_roles?: string[];
}

export interface MentorKycDetail {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  nik: string; // Unmasked: "3201123456780001"
  ktp_file_path: string;
  ktp_url: string;
  bank_name: string;
  bank_account_number: string; // Unmasked
  bank_account_holder: string;
  instagram_handle?: string | null;
  facebook_handle?: string | null;
  status: KycStatus;
  reject_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
  roles?: string[];
  student_roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramOrderSummary {
  id: number;
  order_code: string;
  student_id: number;
  student_name?: string;
  student_email?: string;
  program_id: number;
  program_title: string;
  base_amount: number;
  unique_code: number;
  total_amount: number;
  status: OrderStatus;
  expires_at: string;
  proof_uploaded_at?: string | null;
  proof_url?: string | null;
  payment_proof_url?: string | null;
  payment_proof_path?: string | null;
  reject_reason?: string | null;
  roles?: string[];
  student_roles?: string[];
}

export interface ReviewQueueItem {
  id?: number;
  student_id?: number;
  roles?: string[];
  student_roles?: string[];
  kyc: MentorKycSummary | null;
  order: ProgramOrderSummary | null;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ProgramCategory = "MAN" | "TEACHME_SERIES" | "PARENT_ACADEMY";
export type ProgramLevel = "BASIC" | "INTERMEDIATE" | "ADVANCE";
export type ProgramTargetRole = "mentor" | "parent" | "talent" | "all";

export interface ProgramItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: number; // Integer rupiah
  category?: ProgramCategory;
  level?: ProgramLevel | null;
  target_role?: ProgramTargetRole;
  qris_image_url?: string | null;
  is_active: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  materials_count?: number;
  assignments_count?: number;
  orders_count?: number;
}

export interface ProgramFormData {
  title: string;
  slug?: string;
  description: string;
  price: number;
  category: ProgramCategory;
  level?: ProgramLevel | null;
  target_role: ProgramTargetRole;
  is_active: boolean;
}

export interface ProgramMaterialItem {
  id: number;
  program_id: number;
  title: string;
  description?: string | null;
  type: MaterialType;
  file_path?: string | null;
  external_url?: string | null;
  order_index: number;
  is_active: boolean;
  download_url?: string | null;
  file_url?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramAssignmentItem {
  id: number;
  program_id: number;
  title: string;
  instructions: string;
  due_date?: string | null;
  is_active: boolean;
  submissions_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentSubmissionItem {
  id: number;
  assignment_id: number;
  mentor_id: number;
  mentor_name: string;
  mentor_email?: string;
  file_path: string;
  file_name: string;
  download_url?: string | null;
  file_url?: string | null;
  notes?: string | null;
  status: SubmissionStatus;
  admin_grade?: number | null; // 0 - 100
  admin_feedback?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  submitted_at: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccessAuditLogItem {
  id: number;
  admin_id: number | null;
  admin_name: string;
  student_id: number | null;
  student_name?: string | null;
  entity_type: AuditEntityType;
  entity_id: number;
  action: string;
  from_status: string | null;
  to_status: string;
  reason: string | null;
  ip_address: string | null;
  createdAt: string;
}

export interface QrisSettingItem {
  key?: string;
  value?: string | null;
  qris_image_url?: string | null;
  description?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  errors?: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface ApiErrorResponse {
  error: boolean;
  status: "error";
  code?: string;
  message: string;
  details?: Record<string, unknown> | null;
}

// -------------------------------------------------------------
// Phase 2 Types: Assessment, Attendance OTP, Contributor, Points
// -------------------------------------------------------------

export type AssessmentResult = "PASSED" | "FAILED";

export interface ProgramAssessmentItem {
  id?: number;
  student_id: number;
  student_name: string;
  student_email: string;
  roles?: string[];
  student_roles?: string[];
  attendance_rate?: number;
  attended_sessions?: number;
  total_sessions?: number;
  attendance_attended?: number;
  attendance_total?: number;
  assignments_completed?: number;
  assignments_total?: number;
  average_grade?: number | null;
  result: AssessmentResult | null;
  note?: string | null;
  assessed_by?: number | null;
  assessed_by_name?: string | null;
  assessed_at?: string | null;
}

export interface EventOtpData {
  event_id: number;
  code: string;
  expires_in_seconds: number;
  step: number;
  is_open: boolean;
}

export interface AttendanceAttendeeItem {
  id: number;
  event_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  roles?: string[];
  student_roles?: string[];
  attended_at: string;
  method: "OTP" | "MANUAL_ADMIN";
  ip_address?: string | null;
  user_agent?: string | null;
  reason?: string | null;
}

export interface MentorContributorItem {
  id: number;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  is_contributor: boolean;
  contributor_granted_by?: number | null;
  contributor_granted_by_name?: string | null;
  contributor_granted_at?: string | null;
  created_at?: string;
}

export type ContributorArticleStatus = "DRAFT" | "SUBMITTED" | "PUBLISHED" | "REJECTED";

export interface ContributorArticleItem {
  id: number;
  title: string;
  content: string;
  image_heading?: string | null;
  category_id?: number | string | null;
  category_name?: string | null;
  author_student_id: number;
  author_name?: string;
  author_email?: string;
  author_roles?: string[];
  status: ContributorArticleStatus;
  reject_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PointLedgerItem {
  id: number;
  student_id: number;
  delta: number;
  reason_code: string;
  note?: string | null;
  ref_type?: string | null;
  ref_id?: number | null;
  created_by?: number | null;
  created_at: string;
}

export interface MentorPointsSummary {
  student_id: number;
  student_name?: string;
  student_email?: string;
  balance: number;
  history: PointLedgerItem[];
}
