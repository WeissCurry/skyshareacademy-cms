import skyshareApi from "@shared/api/skyshareApi";
import type {
  ReviewQueueItem,
  ReviewQueueResponse,
  MentorKycSummary,
  MentorKycDetail,
  ProgramOrderSummary,
  ProgramItem,
  ProgramFormData,
  ProgramMaterialItem,
  ProgramAssignmentItem,
  AssignmentSubmissionItem,
  AccessAuditLogItem,
  QrisSettingItem,
  ProgramAssessmentItem,
  EventOtpData,
  AttendanceAttendeeItem,
  MentorContributorItem,
  ContributorArticleItem,
  MentorPointsSummary,
} from "./types";
import {
  fixtureReviewQueue,
  fixtureKycDetailMap,
  fixturePrograms,
  fixtureMaterials,
  fixtureAssignments,
  fixtureSubmissions,
  fixtureAuditLogs,
  fixtureQris,
  fixtureAssessments,
  fixtureOtpData,
  fixtureAttendees,
  fixtureContributors,
  fixtureContributorArticles,
  fixturePointsSummary,
} from "./fixtures";

const USE_FIXTURES = import.meta.env.VITE_USE_FIXTURES === "true";

export class ApiConflictError extends Error {
  code: string;
  details?: unknown;
  constructor(message: string, code = "CONFLICT", details?: unknown) {
    super(message);
    this.name = "ApiConflictError";
    this.code = code;
    this.details = details;
  }
}

export class ApiRestrictError extends Error {
  code: string;
  details?: unknown;
  constructor(message: string, code = "RESTRICT_FOREIGN_KEY", details?: unknown) {
    super(message);
    this.name = "ApiRestrictError";
    this.code = code;
    this.details = details;
  }
}

function normalizeError(error: unknown): Error {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as { response?: { status?: number; data?: { message?: string; code?: string; details?: unknown } } };
    const status = err.response?.status;
    const resData = err.response?.data;
    const fallbackMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    const message = resData?.message || fallbackMessage;
    const code = resData?.code || "";

    if (status === 409 || code.includes("CONFLICT") || message.toLowerCase().includes("conflict") || message.toLowerCase().includes("telah berubah")) {
      return new ApiConflictError(message, code || "CONFLICT", resData?.details);
    }

    if (
      status === 400 &&
      (code.includes("RESTRICT") || message.toLowerCase().includes("restrict") || message.toLowerCase().includes("foreign key") || message.toLowerCase().includes("terkait"))
    ) {
      return new ApiRestrictError(message, code || "RESTRICT_FOREIGN_KEY", resData?.details);
    }

    return new Error(message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

// -------------------------------------------------------------
// 1. Antrian Review (Review Queue) & KYC
// -------------------------------------------------------------

export async function fetchReviewQueue(params?: {
  page?: number;
  limit?: number;
  search?: string;
  program_id?: string | number;
  signal?: AbortSignal;
}): Promise<ReviewQueueResponse> {
  if (USE_FIXTURES) {
    let items = [...fixtureReviewQueue];
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (it) =>
          (it.kyc?.student_name && it.kyc.student_name.toLowerCase().includes(q)) ||
          (it.order?.student_name && it.order.student_name.toLowerCase().includes(q)) ||
          (it.order?.program_title && it.order.program_title.toLowerCase().includes(q))
      );
    }
    if (params?.program_id && params.program_id !== "all") {
      items = items.filter(
        (it) =>
          it.order?.program_title === params.program_id ||
          String(it.order?.program_id) === String(params.program_id)
      );
    }
    const page = params?.page || 1;
    const limit = params?.limit || 8;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = items.slice((page - 1) * limit, page * limit);
    return {
      items: paginated,
      page,
      limit,
      total,
      totalPages,
    };
  }

  try {
    const queryParams: Record<string, unknown> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.search) queryParams.search = params.search;
    if (params?.program_id && params.program_id !== "all") queryParams.program_id = params.program_id;

    let res;
    try {
      res = await skyshareApi.get("/admin/kyc/review-queue", {
        params: queryParams,
        signal: params?.signal,
      });
    } catch (err: unknown) {
      if (params?.signal?.aborted) throw err;
      const axErr = err as { response?: { status?: number } };
      if (axErr.response?.status === 404) {
        res = await skyshareApi.get("/admin/review-queue", {
          params: queryParams,
          signal: params?.signal,
        });
      } else {
        throw err;
      }
    }

    const raw = res.data?.data;
    const paginationMeta = res.data?.pagination || res.data?.meta || {};
    let joinedItems: ReviewQueueItem[] = [];

    if (Array.isArray(raw)) {
      joinedItems = raw.map((item: {
        id?: number;
        student_id?: number;
        roles?: string[];
        student_roles?: string[];
        kyc?: MentorKycSummary | null;
        order?: ProgramOrderSummary | null;
      }) => ({
        id: item.id,
        student_id: item.student_id || item.kyc?.student_id || item.order?.student_id,
        roles: item.roles || item.student_roles,
        student_roles: item.student_roles || item.roles,
        kyc: item.kyc ?? null,
        order: item.order ?? null,
      }));
    } else if (raw) {
      const kycQueue: MentorKycSummary[] = Array.isArray(raw.kyc_queue) ? raw.kyc_queue : [];
      const ordersQueue: ProgramOrderSummary[] = Array.isArray(raw.orders_queue) ? raw.orders_queue : [];

      const ordersByStudent = new Map<number, ProgramOrderSummary>();
      ordersQueue.forEach((o) => {
        if (o.student_id) ordersByStudent.set(o.student_id, o);
      });

      const kycByStudent = new Map<number, MentorKycSummary>();
      kycQueue.forEach((k) => {
        if (k.student_id) kycByStudent.set(k.student_id, k);
      });

      const allStudentIds = new Set<number>([
        ...kycQueue.map((k) => k.student_id).filter(Boolean),
        ...ordersQueue.map((o) => o.student_id).filter(Boolean),
      ]);

      joinedItems = Array.from(allStudentIds).map((studentId) => ({
        student_id: studentId,
        kyc: kycByStudent.get(studentId) ?? null,
        order: ordersByStudent.get(studentId) ?? null,
      }));
    }

    const page = paginationMeta.page || params?.page || 1;
    const limit = paginationMeta.limit || params?.limit || (joinedItems.length > 0 ? joinedItems.length : 8);
    const total = paginationMeta.total !== undefined ? paginationMeta.total : joinedItems.length;
    const totalPages = paginationMeta.totalPages || Math.ceil(total / limit) || 1;

    return {
      items: joinedItems,
      page,
      limit,
      total,
      totalPages,
    };
  } catch (err: unknown) {
    if (params?.signal?.aborted) throw err;
    throw normalizeError(err);
  }
}

export async function fetchKycDetail(kycId: number, signal?: AbortSignal): Promise<MentorKycDetail> {
  if (USE_FIXTURES) {
    const item = fixtureKycDetailMap[kycId] || {
      id: kycId,
      student_id: 999,
      student_name: "Mentor Mock",
      student_email: "mentor@mock.com",
      nik: "3201123456789999",
      ktp_file_path: "storage/private/kyc/mock.webp",
      ktp_url: "https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=600&auto=format&fit=crop&q=80",
      bank_name: "BCA",
      bank_account_number: "1234567890",
      bank_account_holder: "Mentor Mock",
      instagram_handle: "@mockmentor",
      facebook_handle: null,
      status: "PENDING_REVIEW",
      submitted_at: new Date().toISOString(),
    };
    return Promise.resolve(item);
  }

  try {
    const res = await skyshareApi.get(`/admin/kyc/${kycId}`, { signal });
    return res.data?.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    throw normalizeError(err);
  }
}

export async function reviewKycAction(
  kycId: number,
  status: "APPROVED" | "REJECTED",
  reason?: string
): Promise<void> {
  if (USE_FIXTURES) {
    return Promise.resolve();
  }

  try {
    await skyshareApi.put(`/admin/kyc/${kycId}/review`, {
      status,
      reason: reason || null,
    });
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function reviewOrderAction(
  orderId: number,
  status: "ACTIVE" | "PAYMENT_REJECTED",
  reason?: string
): Promise<void> {
  if (USE_FIXTURES) {
    return Promise.resolve();
  }

  try {
    await skyshareApi.put(`/admin/orders/${orderId}/review`, {
      status,
      reason: reason || null,
    });
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function reviewUnifiedAction(
  kycId: number,
  orderId: number,
  kycStatus: "APPROVED" | "REJECTED" = "APPROVED",
  orderStatus: "ACTIVE" | "PAYMENT_REJECTED" = "ACTIVE",
  reason?: string | null,
  kycReason?: string | null,
  orderReason?: string | null
): Promise<void> {
  if (USE_FIXTURES) {
    return Promise.resolve();
  }

  try {
    const body: Record<string, unknown> = {
      kyc_status: kycStatus,
      order_status: orderStatus,
    };

    const finalKycReason = kycReason || (kycStatus === "REJECTED" ? reason : null);
    const finalOrderReason = orderReason || (orderStatus === "PAYMENT_REJECTED" ? reason : null);

    if (finalKycReason) {
      body.kyc_reason = finalKycReason;
    }
    if (finalOrderReason) {
      body.order_reason = finalOrderReason;
    }
    if (reason && (kycStatus === "REJECTED" || orderStatus === "PAYMENT_REJECTED")) {
      body.reason = reason;
    }

    await skyshareApi.put(`/admin/kyc-order/${kycId}/${orderId}/review-unified`, body);
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 2. Program Master CRUD
// -------------------------------------------------------------

export async function fetchPrograms(params?: {
  search?: string;
  is_active?: boolean;
  all?: boolean;
}): Promise<ProgramItem[]> {
  if (USE_FIXTURES) {
    let list = [...fixturePrograms];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    if (params?.is_active !== undefined) {
      list = list.filter((p) => p.is_active === params.is_active);
    }
    return Promise.resolve(list);
  }

  try {
    const query = new URLSearchParams();
    if (params?.all !== false) {
      query.set("all", "true");
      query.set("limit", "500");
    }
    if (params?.search) query.set("search", params.search);
    if (params?.is_active !== undefined) query.set("is_active", String(params.is_active));

    const res = await skyshareApi.get(`/admin/programs?${query.toString()}`);
    const data = res.data?.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function createProgram(data: ProgramFormData): Promise<ProgramItem> {
  if (USE_FIXTURES) {
    const newProg: ProgramItem = {
      id: Date.now(),
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description,
      price: data.price,
      is_active: data.is_active,
      createdAt: new Date().toISOString(),
    };
    return Promise.resolve(newProg);
  }

  try {
    const res = await skyshareApi.post("/admin/programs", data);
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function updateProgram(id: number, data: Partial<ProgramFormData>): Promise<ProgramItem> {
  if (USE_FIXTURES) {
    return Promise.resolve({
      id,
      title: data.title || "Updated Program",
      slug: data.slug || "updated-program",
      description: data.description || "",
      price: data.price || 0,
      is_active: data.is_active ?? true,
    });
  }

  try {
    const res = await skyshareApi.put(`/admin/programs/${id}`, data);
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function deleteProgram(id: number): Promise<void> {
  if (USE_FIXTURES) {
    return Promise.resolve();
  }

  try {
    await skyshareApi.delete(`/admin/programs/${id}`);
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 3. Program Materials (Materi)
// -------------------------------------------------------------

export async function fetchMaterials(programId: number): Promise<ProgramMaterialItem[]> {
  if (USE_FIXTURES) {
    return Promise.resolve(fixtureMaterials.filter((m) => m.program_id === programId));
  }

  try {
    const res = await skyshareApi.get(`/admin/programs/${programId}/materials`);
    return res.data?.data || [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function createMaterial(programId: number, data: FormData | Record<string, unknown>): Promise<ProgramMaterialItem> {
  if (USE_FIXTURES) {
    const item: ProgramMaterialItem = {
      id: Date.now(),
      program_id: programId,
      title: "New Material Mock",
      type: "pdf",
      order_index: 1,
      is_active: true,
      createdAt: new Date().toISOString(),
    };
    return Promise.resolve(item);
  }

  try {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const res = await skyshareApi.post(`/admin/programs/${programId}/materials`, data, { headers });
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function updateMaterial(id: number, data: FormData | Record<string, unknown>): Promise<ProgramMaterialItem> {
  if (USE_FIXTURES) {
    return Promise.resolve({
      id,
      program_id: 1,
      title: "Updated Material",
      type: "pdf",
      order_index: 1,
      is_active: true,
    });
  }

  try {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const res = await skyshareApi.put(`/admin/materials/${id}`, data, { headers });
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function deleteMaterial(id: number): Promise<void> {
  if (USE_FIXTURES) {
    return Promise.resolve();
  }

  try {
    await skyshareApi.delete(`/admin/materials/${id}`);
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 4. Program Assignments (Tugas) & Submissions (Penilaian)
// -------------------------------------------------------------

export async function fetchAssignments(programId: number): Promise<ProgramAssignmentItem[]> {
  if (USE_FIXTURES) {
    return Promise.resolve(fixtureAssignments.filter((a) => a.program_id === programId));
  }

  try {
    const res = await skyshareApi.get(`/admin/programs/${programId}/assignments`);
    return res.data?.data || [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function createAssignment(programId: number, data: Record<string, unknown>): Promise<ProgramAssignmentItem> {
  if (USE_FIXTURES) {
    const item: ProgramAssignmentItem = {
      id: Date.now(),
      program_id: programId,
      title: String(data.title || "Tugas Baru"),
      instructions: String(data.instructions || ""),
      due_date: (data.due_date as string) || null,
      is_active: Boolean(data.is_active ?? true),
      submissions_count: 0,
      createdAt: new Date().toISOString(),
    };
    return Promise.resolve(item);
  }

  try {
    const res = await skyshareApi.post(`/admin/programs/${programId}/assignments`, data);
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function updateAssignment(id: number, data: Record<string, unknown>): Promise<ProgramAssignmentItem> {
  if (USE_FIXTURES) {
    return Promise.resolve({
      id,
      program_id: 1,
      title: String(data.title || ""),
      instructions: String(data.instructions || ""),
      is_active: Boolean(data.is_active ?? true),
    });
  }

  try {
    const res = await skyshareApi.put(`/admin/assignments/${id}`, data);
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function deleteAssignment(id: number): Promise<void> {
  if (USE_FIXTURES) {
    return Promise.resolve();
  }

  try {
    await skyshareApi.delete(`/admin/assignments/${id}`);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function fetchSubmissions(assignmentId: number): Promise<AssignmentSubmissionItem[]> {
  if (USE_FIXTURES) {
    return Promise.resolve(fixtureSubmissions.filter((s) => s.assignment_id === assignmentId));
  }

  try {
    const res = await skyshareApi.get(`/admin/assignments/${assignmentId}/submissions`);
    return res.data?.data || [];
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function gradeSubmissionAction(
  submissionId: number,
  data: {
    status: "accepted" | "revision";
    admin_grade?: number | null;
    admin_feedback?: string | null;
  }
): Promise<void> {
  if (USE_FIXTURES) {
    return Promise.resolve();
  }

  try {
    await skyshareApi.put(`/admin/assignments/submissions/${submissionId}/grade`, data);
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 5. QRIS Settings
// -------------------------------------------------------------

export async function fetchQrisSetting(): Promise<QrisSettingItem> {
  if (USE_FIXTURES) {
    return Promise.resolve(fixtureQris);
  }

  try {
    const res = await skyshareApi.get("/admin/settings/qris");
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function updateQrisSetting(
  payload: FormData | { value: string; description?: string }
): Promise<QrisSettingItem> {
  if (USE_FIXTURES) {
    return Promise.resolve({
      ...fixtureQris,
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    const headers =
      payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const res = await skyshareApi.put("/admin/settings/qris", payload, { headers });
    return res.data?.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 6. Access Audit Logs
// -------------------------------------------------------------

export async function fetchAccessAuditLogs(params?: {
  page?: number;
  limit?: number;
  entity_type?: string;
  search?: string;
  signal?: AbortSignal;
}): Promise<{ items: AccessAuditLogItem[]; total: number; totalPages: number }> {
  if (USE_FIXTURES) {
    let list = [...fixtureAuditLogs];
    if (params?.entity_type && params.entity_type !== "all") {
      list = list.filter((l) => l.entity_type === params.entity_type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.admin_name.toLowerCase().includes(q) ||
          (l.student_name && l.student_name.toLowerCase().includes(q)) ||
          l.action.toLowerCase().includes(q) ||
          (l.reason && l.reason.toLowerCase().includes(q))
      );
    }
    return Promise.resolve({
      items: list,
      total: list.length,
      totalPages: 1,
    });
  }

  try {
    const queryParts: string[] = [];
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    if (params?.entity_type && params.entity_type !== "all") queryParts.push(`entity_type=${encodeURIComponent(params.entity_type)}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    const qStr = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    const res = await skyshareApi.get(`/admin/access-audit-logs${qStr}`, { signal: params?.signal });
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return {
        items: data,
        total: res.data?.pagination?.total || data.length,
        totalPages: res.data?.pagination?.totalPages || 1,
      };
    }
    return {
      items: data?.items || [],
      total: data?.total || data?.items?.length || 0,
      totalPages: data?.totalPages || 1,
    };
  } catch (err: unknown) {
    if (params?.signal?.aborted) throw err;
    // Fallback: /admin/audit-logs
    try {
      const fallback = await skyshareApi.get("/admin/audit-logs", { signal: params?.signal });
      const data = fallback.data?.data;
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          totalPages: 1,
        };
      }
      return {
        items: data?.items || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 1,
      };
    } catch {
      throw normalizeError(err);
    }
  }
}

// -------------------------------------------------------------
// 8. Kelulusan Jenjang MAN (Program Assessments)
// -------------------------------------------------------------

export async function fetchProgramAssessments(programId: number, signal?: AbortSignal): Promise<ProgramAssessmentItem[]> {
  if (USE_FIXTURES) {
    return fixtureAssessments;
  }
  try {
    const res = await skyshareApi.get(`/admin/programs/${programId}/assessments`, { signal });
    const rawData = res.data?.data;
    const rawList = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.students)
      ? rawData.students
      : [];

    return rawList.map((item: {
      id?: number;
      student_id: number;
      student_name?: string;
      name?: string;
      email?: string;
      student_email?: string;
      roles?: string[];
      student_roles?: string[];
      attendance_rate?: number;
      attended_sessions?: number;
      total_sessions?: number;
      attendance_attended?: number;
      attendance_total?: number;
      attendance?: {
        attended_sessions?: number;
        total_sessions?: number;
        attendance_rate?: number;
      };
      assignments_completed?: number;
      assignments_total?: number;
      assignments?: {
        completed?: number;
        total?: number;
        average_grade?: number | null;
      };
      average_grade?: number | null;
      result?: "PASSED" | "FAILED" | null;
      note?: string | null;
      assessment?: {
        id?: number;
        result?: "PASSED" | "FAILED" | null;
        note?: string | null;
        attendance_rate?: number;
        assignments_completed?: number;
        assignments_total?: number;
        assessed_at?: string | null;
        assessed_by?: number | null;
        assessed_by_name?: string | null;
      } | null;
      assessed_by?: number | null;
      assessed_by_name?: string | null;
      assessed_at?: string | null;
    }) => {
      const attended = item.attendance_attended ?? item.attended_sessions ?? item.attendance?.attended_sessions ?? 0;
      const total = item.attendance_total ?? item.total_sessions ?? item.attendance?.total_sessions ?? 0;
      const rate = item.attendance_rate ?? item.attendance?.attendance_rate ?? (total > 0 ? (attended / total) * 100 : 100);

      return {
        id: item.assessment?.id || item.id,
        student_id: item.student_id,
        student_name: item.student_name || item.name || `Mentor #${item.student_id}`,
        student_email: item.email || item.student_email || "-",
        roles: item.roles || item.student_roles,
        student_roles: item.student_roles || item.roles,
        attendance_rate: rate,
        attended_sessions: attended,
        total_sessions: total,
        attendance_attended: attended,
        attendance_total: total,
        assignments_completed: item.assignments_completed ?? item.assignments?.completed ?? item.assessment?.assignments_completed ?? 0,
        assignments_total: item.assignments_total ?? item.assignments?.total ?? item.assessment?.assignments_total ?? 0,
        average_grade: item.average_grade ?? item.assignments?.average_grade ?? null,
        result: item.result || item.assessment?.result || "PENDING",
        note: item.note ?? item.assessment?.note ?? null,
        assessed_by: item.assessed_by || item.assessment?.assessed_by || null,
        assessed_by_name: item.assessed_by_name || item.assessment?.assessed_by_name || null,
        assessed_at: item.assessed_at || item.assessment?.assessed_at || null,
      };
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (USE_FIXTURES) return fixtureAssessments;
    throw normalizeError(err);
  }
}

export async function saveProgramAssessment(
  programId: number,
  studentId: number,
  payload: { result: "PASSED" | "FAILED"; note?: string }
): Promise<void> {
  if (USE_FIXTURES) {
    const idx = fixtureAssessments.findIndex((a) => a.student_id === studentId);
    if (idx >= 0) {
      fixtureAssessments[idx] = {
        ...fixtureAssessments[idx],
        result: payload.result,
        note: payload.note || null,
        assessed_at: new Date().toISOString(),
      };
    }
    return;
  }
  try {
    await skyshareApi.put(`/admin/programs/${programId}/assessments/${studentId}`, payload);
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 9. Absensi Sesi Berbasis OTP Berputar
// -------------------------------------------------------------

export async function fetchEventOtp(eventId: number, signal?: AbortSignal): Promise<EventOtpData> {
  if (USE_FIXTURES) {
    return {
      ...fixtureOtpData,
      event_id: eventId,
    };
  }
  try {
    const res = await skyshareApi.get(`/admin/events/${eventId}/attendance-otp`, { signal });
    return res.data?.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    if (USE_FIXTURES) return fixtureOtpData;
    throw normalizeError(err);
  }
}

export async function toggleEventAttendance(eventId: number, isOpen: boolean): Promise<{ is_open: boolean }> {
  if (USE_FIXTURES) {
    fixtureOtpData.is_open = isOpen;
    return { is_open: isOpen };
  }
  try {
    const res = await skyshareApi.post(`/admin/events/${eventId}/attendance/toggle`, { is_open: isOpen });
    return res.data?.data || { is_open: isOpen };
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function fetchEventAttendees(eventId: number, signal?: AbortSignal): Promise<AttendanceAttendeeItem[]> {
  if (USE_FIXTURES) {
    return fixtureAttendees.filter((a) => a.event_id === eventId || eventId > 0);
  }
  let rawItems: {
    id?: number;
    event_id?: number;
    student_id: number;
    student_name?: string;
    student_email?: string;
    email?: string;
    roles?: string[];
    student_roles?: string[];
    attended_at?: string;
    createdAt?: string;
    method?: "OTP" | "MANUAL_ADMIN";
    ip_address?: string | null;
    user_agent?: string | null;
    reason?: string | null;
    notes?: string | null;
  }[] = [];

  try {
    const res = await skyshareApi.get(`/admin/events/${eventId}/attendance`, { signal });
    rawItems = res.data?.data || [];
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    // Fallback: try export endpoint format=json
    try {
      const fallback = await skyshareApi.get(`/admin/events/${eventId}/attendance/export?format=json`, { signal });
      rawItems = fallback.data?.data || [];
    } catch (fallbackErr: unknown) {
      if (signal?.aborted) throw fallbackErr;
      if (USE_FIXTURES) return fixtureAttendees;
      throw normalizeError(fallbackErr);
    }
  }

  return rawItems.map((item) => ({
    id: item.id || Date.now(),
    event_id: item.event_id || eventId,
    student_id: item.student_id,
    student_name: item.student_name || `Peserta #${item.student_id}`,
    student_email: item.student_email || item.email || "-",
    roles: item.roles || item.student_roles || ["mentor"],
    student_roles: item.student_roles || item.roles || ["mentor"],
    attended_at: item.attended_at || item.createdAt || new Date().toISOString(),
    method: item.method || "OTP",
    ip_address: item.ip_address || null,
    user_agent: item.user_agent || null,
    reason: item.reason || item.notes || null,
  }));
}

export async function manualAddAttendance(
  eventId: number,
  studentId: number,
  reason: string
): Promise<void> {
  if (USE_FIXTURES) {
    fixtureAttendees.push({
      id: Date.now(),
      event_id: eventId,
      student_id: studentId,
      student_name: `Peserta #${studentId}`,
      student_email: `student${studentId}@example.com`,
      roles: ["mentor"],
      attended_at: new Date().toISOString(),
      method: "MANUAL_ADMIN",
      ip_address: "192.168.1.10",
      user_agent: "Admin Manual Override",
      reason,
    });
    return;
  }
  try {
    await skyshareApi.post(`/admin/events/${eventId}/attendance/manual`, {
      student_id: studentId,
      reason,
    });
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function exportAttendanceCsv(eventId: number): Promise<Blob> {
  if (USE_FIXTURES) {
    const headers = "No,ID Siswa,Nama Peserta,Email,Waktu Absen,Metode,IP Address,Catatan\n";
    const rows = fixtureAttendees
      .map(
        (a, i) =>
          `${i + 1},${a.student_id},"${a.student_name}","${a.student_email}","${a.attended_at}",${a.method},${a.ip_address || "-"},"${a.reason || "-"}"`
      )
      .join("\n");
    return new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
  }
  try {
    const res = await skyshareApi.get(`/admin/events/${eventId}/attendance/export?format=csv`, {
      responseType: "blob",
    });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 10. Kontributor Artikel
// -------------------------------------------------------------

export async function fetchMentorContributors(search = "", signal?: AbortSignal): Promise<MentorContributorItem[]> {
  if (USE_FIXTURES) {
    if (!search) return fixtureContributors;
    const q = search.toLowerCase();
    return fixtureContributors.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }
  let items: {
    id: number;
    name?: string;
    student_name?: string;
    email: string;
    role: string;
    roles?: string[];
    student_roles?: string[];
    is_contributor?: boolean;
    contributor_granted_by?: number | null;
    contributor_granted_by_name?: string | null;
    contributor_granted_at?: string | null;
    createdAt?: string;
    created_at?: string;
  }[] = [];

  const qStr = search ? `search=${encodeURIComponent(search)}` : "";
  try {
    const res = await skyshareApi.get(`/admin/mentor-contributors${qStr ? `?${qStr}` : ""}`, { signal });
    items = res.data?.data || [];
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    // Fallback: try /admin/students?role=mentor
    try {
      const fallback = await skyshareApi.get(`/admin/students?role=mentor${qStr ? `&${qStr}` : ""}`, { signal });
      items = fallback.data?.data || [];
    } catch (fallbackErr: unknown) {
      if (signal?.aborted) throw fallbackErr;
      if (USE_FIXTURES) return fixtureContributors;
      throw normalizeError(fallbackErr);
    }
  }

  return items.map((st) => ({
    id: st.id,
    name: st.name || st.student_name || `Mentor #${st.id}`,
    email: st.email,
    role: st.role || "mentor",
    roles: st.roles || [st.role || "mentor"],
    student_roles: st.student_roles || st.roles || [st.role || "mentor"],
    is_contributor: Boolean(st.is_contributor),
    contributor_granted_by: st.contributor_granted_by || null,
    contributor_granted_by_name: st.contributor_granted_by_name || null,
    contributor_granted_at: st.contributor_granted_at || null,
    created_at: st.createdAt || st.created_at,
  }));
}

export async function toggleMentorContributor(studentId: number, isContributor: boolean): Promise<void> {
  if (USE_FIXTURES) {
    const found = fixtureContributors.find((c) => c.id === studentId);
    if (found) {
      found.is_contributor = isContributor;
      found.contributor_granted_at = isContributor ? new Date().toISOString() : null;
    }
    return;
  }
  try {
    await skyshareApi.put(`/admin/mentors/${studentId}/contributor-toggle`, {
      is_contributor: isContributor,
    });
  } catch (err) {
    // Fallback: try /admin/students/:id/contributor-toggle
    try {
      await skyshareApi.put(`/admin/students/${studentId}/contributor-toggle`, {
        is_contributor: isContributor,
      });
    } catch {
      throw normalizeError(err);
    }
  }
}

// -------------------------------------------------------------
// 11. Review Artikel Kontributor
// -------------------------------------------------------------

export async function fetchContributorArticlesQueue(signal?: AbortSignal): Promise<ContributorArticleItem[]> {
  if (USE_FIXTURES) {
    return fixtureContributorArticles.filter((a) => a.status === "SUBMITTED");
  }
  try {
    const res = await skyshareApi.get("/admin/articles/contributor-queue", { signal });
    return res.data?.data || [];
  } catch (queueErr) {
    if (signal?.aborted) throw queueErr;
    // Fallback: /admin/articles?status=SUBMITTED
    try {
      const fallback = await skyshareApi.get("/admin/articles?status=SUBMITTED", { signal });
      return fallback.data?.data || [];
    } catch (err) {
      if (signal?.aborted) throw err;
      if (USE_FIXTURES) return fixtureContributorArticles;
      throw normalizeError(err);
    }
  }
}

export async function reviewContributorArticle(
  articleId: number,
  payload: { status: "PUBLISHED" | "REJECTED"; reject_reason?: string }
): Promise<void> {
  if (USE_FIXTURES) {
    const found = fixtureContributorArticles.find((a) => a.id === articleId);
    if (found) {
      found.status = payload.status;
      found.reject_reason = payload.reject_reason || null;
      found.reviewed_at = new Date().toISOString();
    }
    return;
  }
  try {
    await skyshareApi.put(`/admin/articles/${articleId}/review`, payload);
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------------------------------------------------
// 12. Poin Gamifikasi (Point Ledger)
// -------------------------------------------------------------

export async function fetchMentorPoints(studentId: number, signal?: AbortSignal): Promise<MentorPointsSummary> {
  if (USE_FIXTURES) {
    return {
      ...fixturePointsSummary,
      student_id: studentId,
    };
  }
  try {
    const res = await skyshareApi.get(`/admin/students/${studentId}/points`, { signal });
    return res.data?.data || { student_id: studentId, balance: 0, history: [] };
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    // Fallback: try /admin/points/students/:id
    try {
      const fallback = await skyshareApi.get(`/admin/points/students/${studentId}`, { signal });
      return fallback.data?.data || { student_id: studentId, balance: 0, history: [] };
    } catch (fallbackErr: unknown) {
      if (signal?.aborted) throw fallbackErr;
      if (USE_FIXTURES) return fixturePointsSummary;
      throw normalizeError(fallbackErr);
    }
  }
}

export async function adjustMentorPoints(
  studentId: number,
  delta: number,
  note: string,
  reasonCode = "MANUAL_ADJUSTMENT"
): Promise<void> {
  if (USE_FIXTURES) {
    fixturePointsSummary.balance += delta;
    fixturePointsSummary.history.unshift({
      id: Date.now(),
      student_id: studentId,
      delta,
      reason_code: reasonCode,
      note,
      created_by: 1,
      created_at: new Date().toISOString(),
    });
    return;
  }
  try {
    await skyshareApi.post("/admin/points/adjust", {
      student_id: studentId,
      delta,
      reason_code: reasonCode,
      note,
    });
  } catch (err) {
    throw normalizeError(err);
  }
}
