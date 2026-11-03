import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiClipboard,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiUsers,
  FiCalendar,
  FiDownload,
  FiAward,
} from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import type {
  ProgramItem,
  ProgramAssignmentItem,
  AssignmentSubmissionItem,
} from "@features/mentor-access/types";
import {
  fetchPrograms,
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  fetchSubmissions,
  gradeSubmissionAction,
} from "@features/mentor-access/api";
import { resolveAssetUrl } from "@shared/utils/urlUtils";
import { useModalA11y } from "@shared/hooks/useModalA11y";
import ConfirmModal from "@shared/ui/ConfirmModal";
import SuccessModal from "@shared/ui/SuccessModal";
import FormField from "@shared/ui/FormField";
import FormInput from "@shared/ui/FormInput";
import Button from "@shared/ui/Button";
import Skeleton from "@shared/ui/Skeleton";

export default function CmsAssignmentsManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProgramId = searchParams.get("program_id");

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    initialProgramId ? parseInt(initialProgramId, 10) : null
  );

  const [assignments, setAssignments] = useState<ProgramAssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Assignment Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ProgramAssignmentItem | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Assignment Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ProgramAssignmentItem | null>(null);

  // Submissions Modal
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [activeAssignmentForSubmissions, setActiveAssignmentForSubmissions] = useState<ProgramAssignmentItem | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionItem[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Grading Modal
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmissionItem | null>(null);
  const [gradeStatus, setGradeStatus] = useState<"accepted" | "revision">("accepted");
  const [adminGrade, setAdminGrade] = useState<number>(85);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [gradingError, setGradingError] = useState("");

  // Success Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formModalRef = useRef<HTMLDivElement>(null);
  const submissionsModalRef = useRef<HTMLDivElement>(null);
  const gradingModalRef = useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen: isFormOpen,
    onClose: () => setIsFormOpen(false),
    containerRef: formModalRef,
  });

  useModalA11y({
    isOpen: isSubmissionsOpen && !isGradingOpen,
    onClose: () => setIsSubmissionsOpen(false),
    containerRef: submissionsModalRef,
  });

  useModalA11y({
    isOpen: isGradingOpen,
    onClose: () => setIsGradingOpen(false),
    containerRef: gradingModalRef,
  });

  // Load programs
  useEffect(() => {
    const loadProgs = async () => {
      try {
        const data = await fetchPrograms();
        setPrograms(data);
        if (data.length > 0 && !selectedProgramId) {
          setSelectedProgramId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProgs();
  }, [selectedProgramId]);

  // Load assignments
  const loadAssignments = useCallback(async (progId: number) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchAssignments(progId);
      setAssignments(data);
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat tugas program.");
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (selectedProgramId) {
      setSearchParams({ program_id: String(selectedProgramId) });
      const fetchInit = async () => {
        try {
          const data = await fetchAssignments(selectedProgramId);
          if (active) {
            setAssignments(data);
            setIsLoading(false);
          }
        } catch (err) {
          if (active) {
            setErrorMessage((err as Error).message || "Gagal memuat tugas program.");
            setAssignments([]);
            setIsLoading(false);
          }
        }
      };
      fetchInit();
    }
    return () => {
      active = false;
    };
  }, [selectedProgramId, setSearchParams]);

  const currentProgram = useMemo(() => {
    return programs.find((p) => p.id === selectedProgramId);
  }, [programs, selectedProgramId]);

  // Open Add Assignment
  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setTitle("");
    setInstructions("");
    setDueDate("");
    setIsActive(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Assignment
  const handleOpenEdit = (item: ProgramAssignmentItem) => {
    setEditingAssignment(item);
    setTitle(item.title);
    setInstructions(item.instructions);
    setDueDate(item.due_date ? item.due_date.substring(0, 16) : "");
    setIsActive(item.is_active);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Submit Assignment
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) return;

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Judul tugas wajib diisi.";
    if (!instructions.trim()) errors.instructions = "Petunjuk pengerjaan tugas wajib diisi.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        instructions: instructions.trim(),
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        is_active: isActive,
      };

      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, payload);
        setSuccessMessage("Tugas berhasil diperbarui!");
      } else {
        await createAssignment(selectedProgramId, payload);
        setSuccessMessage("Tugas baru berhasil ditambahkan ke program!");
      }

      setIsFormOpen(false);
      loadAssignments(selectedProgramId);
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal menyimpan tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Assignment
  const handleConfirmDelete = async () => {
    if (!assignmentToDelete || !selectedProgramId) return;
    setIsSubmitting(true);
    try {
      await deleteAssignment(assignmentToDelete.id);
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
      setSuccessMessage("Tugas berhasil dihapus.");
      loadAssignments(selectedProgramId);
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal menghapus tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active
  const handleToggleActiveQuick = async (item: ProgramAssignmentItem) => {
    if (!selectedProgramId) return;
    try {
      await updateAssignment(item.id, { is_active: !item.is_active });
      loadAssignments(selectedProgramId);
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal mengubah status tugas.");
    }
  };

  // Submissions handler
  const handleOpenSubmissions = async (item: ProgramAssignmentItem) => {
    setActiveAssignmentForSubmissions(item);
    setIsSubmissionsOpen(true);
    setIsLoadingSubmissions(true);
    try {
      const data = await fetchSubmissions(item.id);
      setSubmissions(data);
    } catch (err) {
      console.error(err);
      setSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // Open Grading Modal
  const handleOpenGrading = (sub: AssignmentSubmissionItem) => {
    setGradingSubmission(sub);
    setGradeStatus(sub.status === "revision" ? "revision" : "accepted");
    setAdminGrade(sub.admin_grade !== null && sub.admin_grade !== undefined ? sub.admin_grade : 85);
    setAdminFeedback(sub.admin_feedback || "");
    setGradingError("");
    setIsGradingOpen(true);
  };

  // Submit Grade
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    if (adminGrade < 0 || adminGrade > 100) {
      setGradingError("Nilai wajib berada dalam rentang 0 sampai 100.");
      return;
    }

    if (gradeStatus === "revision" && !adminFeedback.trim()) {
      setGradingError("Catatan feedback wajib disertakan jika meminta revisi tugas.");
      return;
    }

    setIsSubmitting(true);
    try {
      await gradeSubmissionAction(gradingSubmission.id, {
        status: gradeStatus,
        admin_grade: adminGrade,
        admin_feedback: adminFeedback.trim(),
      });
      setIsGradingOpen(false);
      setSuccessMessage("Penilaian tugas berhasil disimpan!");

      // Refresh submissions
      if (activeAssignmentForSubmissions) {
        const updated = await fetchSubmissions(activeAssignmentForSubmissions.id);
        setSubmissions(updated);
      }
    } catch (err) {
      setGradingError((err as Error).message || "Gagal menyimpan penilaian.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch min-h-screen pb-24">
      <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4 md:px-0">
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>

        <div className="w-full min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="headline-1">Tugas</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Buat lembar penugasan program dan evaluasi lembar jawaban yang dikumpulkan mentor.
              </p>
            </div>

            <button
              type="button"
              disabled={!selectedProgramId}
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-1 hover:bg-primary-2 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            >
              <FiPlus className="w-5 h-5" />
              <span>Tambah Tugas</span>
            </button>
          </div>

          {/* Program Selector Toolbar */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-auto flex items-center gap-3">
              <label htmlFor="program-selector" className="text-xs font-bold uppercase tracking-wider text-gray-700 shrink-0">
                Pilih Program:
              </label>
              <select
                id="program-selector"
                value={selectedProgramId || ""}
                onChange={(e) => setSelectedProgramId(parseInt(e.target.value, 10))}
                className="w-full sm:w-80 px-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm font-bold focus:bg-white outline-none cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  backgroundSize: "16px",
                }}
              >
                {!selectedProgramId && (
                  <option value="" disabled>
                    Pilih program mentor
                  </option>
                )}
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.is_active ? "" : "(Nonaktif)"}
                  </option>
                ))}
              </select>
            </div>

            {currentProgram && (
              <div className="text-sm text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap shrink-0">
                {assignments.length} Tugas &bull; {currentProgram.title}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div role="alert" className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold">
              {errorMessage}
            </div>
          )}

          {/* Table */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat penugasan program...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Judul Tugas</th>
                      <th className="py-3.5 px-4">Batas Pengumpulan (Due Date)</th>
                      <th className="py-3.5 px-4">Pengumpulan (Submisi)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 space-y-1.5">
                          <Skeleton className="h-4 w-52" />
                          <Skeleton className="h-3 w-72" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-7 w-36 rounded-xl" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex gap-2 justify-center">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                  <FiClipboard className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Belum Ada Tugas</h3>
                <p className="text-xs text-gray-500 font-medium">
                  Program ini belum memiliki penugasan praktik untuk peserta. Klik tombol di bawah untuk membuat tugas pertama.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-1 hover:bg-primary-2 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Buat Lembar Tugas</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Judul Tugas</th>
                      <th className="py-3.5 px-4">Batas Pengumpulan (Due Date)</th>
                      <th className="py-3.5 px-4">Pengumpulan (Submisi)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignments.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{item.instructions}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                            <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(item.due_date)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleOpenSubmissions(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-xl text-xs font-bold shadow-sm transition-colors"
                          >
                            <FiUsers className="w-3.5 h-3.5 text-primary-1" />
                            <span>Lihat Submisi & Nilai</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActiveQuick(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                              item.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                          >
                            {item.is_active ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                            <span>{item.is_active ? "Aktif" : "Draft"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Tugas"
                              aria-label={`Edit ${item.title}`}
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAssignmentToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Tugas"
                              aria-label={`Hapus ${item.title}`}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Assignment Modal */}
      {isFormOpen && (
        <div
          ref={formModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingAssignment ? "Edit Penugasan" : "Tambah Penugasan Baru"}
                </h3>
                <p className="text-xs font-semibold text-gray-500">{currentProgram?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg border border-black hover:bg-gray-100"
                aria-label="Tutup modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <FormField label="Judul Tugas" required error={formErrors.title}>
                <FormInput
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tugas Praktik 01: Perancangan Schema Database"
                  error={Boolean(formErrors.title)}
                />
              </FormField>

              <FormField label="Tenggat Waktu Pengumpulan (Due Date)" optional>
                <FormInput
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="font-semibold"
                />
              </FormField>

              <FormField label="Instruksi & Kriteria Penilaian" required error={formErrors.instructions}>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Contoh: Buatlah ERD lengkap dan query DDL migrasi tabel relasional dalam format PDF atau link repo Git..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm outline-none font-medium resize-none focus:border-black transition-colors placeholder:text-gray-400"
                />
              </FormField>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="assignment-active-toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-black text-primary-1 focus:ring-primary-1 cursor-pointer"
                />
                <label htmlFor="assignment-active-toggle" className="text-sm font-bold text-gray-900 cursor-pointer">
                  Status Aktif (Ditampilkan pada portal peserta mentor)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t-2 border-gray-100">
                <Button
                  variant="secondary"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  {editingAssignment ? "Simpan Perubahan" : "Tambahkan Tugas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {isSubmissionsOpen && activeAssignmentForSubmissions && (
        <div
          ref={submissionsModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-4xl p-5 md:p-6 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black shrink-0 mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  Submisi Lembar Jawaban: {activeAssignmentForSubmissions.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {submissions.length} Pengumpulan tugas mentor tercatat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmissionsOpen(false)}
                className="p-1.5 rounded-lg border border-black hover:bg-gray-100"
                aria-label="Tutup"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingSubmissions ? (
                <div role="status" aria-busy="true" className="divide-y-2 divide-gray-100 border-2 border-black rounded-xl overflow-hidden">
                  <span className="sr-only">Memuat berkas jawaban...</span>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-28 rounded-xl" />
                        <Skeleton className="h-8 w-24 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500 font-medium">
                  Belum ada peserta mentor yang mengumpulkan tugas ini.
                </div>
              ) : (
                <div className="divide-y-2 divide-gray-100 border-2 border-black rounded-xl overflow-hidden">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-4 bg-white hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{sub.mentor_name}</p>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                              sub.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : sub.status === "revision"
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            {sub.status === "accepted" ? "Lulus / Diterima" : sub.status === "revision" ? "Perlu Revisi" : "Menunggu Dinilai"}
                          </span>

                          {sub.admin_grade !== null && sub.admin_grade !== undefined && (
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-800">
                              Nilai: {sub.admin_grade}/100
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 font-medium">
                          Diunggah: {formatDate(sub.submitted_at)} &bull; File: <span className="font-bold text-black">{sub.file_name}</span>
                        </p>

                        {sub.notes && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 mt-1">
                            <span className="font-bold">Catatan Mentor:</span> {sub.notes}
                          </p>
                        )}

                        {sub.admin_feedback && (
                          <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                            <span className="font-bold">Feedback Admin:</span> {sub.admin_feedback}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        {(sub.download_url || sub.file_url || sub.file_path) && (
                          <a
                            href={resolveAssetUrl(sub.download_url || sub.file_url || sub.file_path)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-xl text-xs font-bold transition-colors shadow-sm"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                            <span>Unduh Berkas</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenGrading(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-1 hover:bg-primary-2 text-white border-2 border-black rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                        >
                          <FiAward className="w-3.5 h-3.5" />
                          <span>{sub.admin_grade !== null ? "Ubah Nilai" : "Beri Nilai"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {isGradingOpen && gradingSubmission && (
        <div
          ref={gradingModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h3 className="text-xl font-black text-gray-900">
                Penilaian: {gradingSubmission.mentor_name}
              </h3>
              <button
                type="button"
                onClick={() => setIsGradingOpen(false)}
                className="p-1 rounded-lg border border-black hover:bg-gray-100"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <FormField label="Keputusan Evaluasi" required>
                <select
                  value={gradeStatus}
                  onChange={(e) => setGradeStatus(e.target.value as "accepted" | "revision")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-bold focus:border-black outline-none cursor-pointer"
                >
                  <option value="accepted">Accepted (Tugas Diterima / Lulus)</option>
                  <option value="revision">Revision (Perlu Revisi Lembar Kerja)</option>
                </select>
              </FormField>

              <FormField label="Nilai Akhir (Skala 0 - 100)" required>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                    Skor:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={adminGrade}
                    onChange={(e) => setAdminGrade(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
                    placeholder="Contoh: 85"
                    className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-xl text-base font-mono font-black outline-none focus:border-black placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </FormField>

              <FormField label="Catatan Feedback / Arahan Revisi" optional>
                <textarea
                  rows={3}
                  value={adminFeedback}
                  onChange={(e) => {
                    setAdminFeedback(e.target.value);
                    if (gradingError) setGradingError("");
                  }}
                  placeholder="Contoh: Penjelasan logika sudah sangat baik. Perhatikan optimasi index pada tabel transaksi..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm outline-none font-medium resize-none focus:border-black placeholder:text-gray-400"
                />
              </FormField>

              {gradingError && <p className="text-xs font-bold text-red-600">{gradingError}</p>}

              <div className="flex gap-3 pt-3 border-t-2 border-gray-100">
                <Button
                  variant="secondary"
                  onClick={() => setIsGradingOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  Simpan Penilaian
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Tugas?"
        message={`Apakah Anda yakin ingin menghapus lembar tugas "${assignmentToDelete?.title}"?`}
        confirmText="Ya, Hapus"
        type="danger"
      />

      {/* Success Notification */}
      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Berhasil"
        message={successMessage || ""}
      />
    </div>
  );
}
