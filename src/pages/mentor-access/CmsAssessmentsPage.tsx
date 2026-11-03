import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "@widgets/Sidebar";
import { useSearchParams } from "react-router-dom";
import {
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiSearch,
  FiUserCheck,
  FiFileText,
  FiX,
} from "react-icons/fi";
import type {
  ProgramItem,
  ProgramAssessmentItem,
} from "@features/mentor-access/types";
import {
  fetchPrograms,
  fetchProgramAssessments,
  saveProgramAssessment,
} from "@features/mentor-access/api";
import { UserRoleBadge } from "@shared/ui/UserRoleBadge";
import ConfirmModal from "@shared/ui/ConfirmModal";
import SuccessModal from "@shared/ui/SuccessModal";
import Button from "@shared/ui/Button";
import Skeleton from "@shared/ui/Skeleton";
import { useModalA11y } from "@shared/hooks/useModalA11y";

export default function CmsAssessmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProgramId = searchParams.get("program_id");

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    initialProgramId ? parseInt(initialProgramId, 10) : null
  );
  const [assessments, setAssessments] = useState<ProgramAssessmentItem[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState<string>("ALL");

  // Assessment action state
  const [activeItem, setActiveItem] = useState<ProgramAssessmentItem | null>(null);
  const [targetResult, setTargetResult] = useState<"PASSED" | "FAILED">("PASSED");
  const [evalNote, setEvalNote] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const noteModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({
    isOpen: isNoteModalOpen,
    onClose: () => setIsNoteModalOpen(false),
    containerRef: noteModalRef,
  });

  // Load programs on mount
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchPrograms();
        if (active) {
          setPrograms(data);
          setSelectedProgramId((prev) => (!prev && data.length > 0 ? data[0].id : prev));
          setIsLoadingPrograms(false);
        }
      } catch (err) {
        if (active) {
          setErrorMessage((err as Error).message || "Gagal memuat program.");
          setIsLoadingPrograms(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Update query params when program selection changes
  const handleSelectProgram = (id: number) => {
    setSelectedProgramId(id);
    setSearchParams({ program_id: id.toString() });
  };

  // Load assessments when selectedProgramId changes
  const loadAssessments = useCallback(async () => {
    if (!selectedProgramId) return;
    setIsLoadingAssessments(true);
    setErrorMessage("");
    try {
      const data = await fetchProgramAssessments(selectedProgramId);
      setAssessments(data);
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat data evaluasi peserta.");
      setAssessments([]);
    } finally {
      setIsLoadingAssessments(false);
    }
  }, [selectedProgramId]);

  useEffect(() => {
    if (!selectedProgramId) return;

    const controller = new AbortController();

    fetchProgramAssessments(selectedProgramId, controller.signal)
      .then((data) => {
        setAssessments(data);
        setIsLoadingAssessments(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setErrorMessage((err as Error).message || "Gagal memuat data evaluasi peserta.");
        setAssessments([]);
        setIsLoadingAssessments(false);
      });

    return () => {
      controller.abort();
    };
  }, [selectedProgramId]);

  const selectedProgram = useMemo(() => {
    return programs.find((p) => p.id === selectedProgramId) || null;
  }, [programs, selectedProgramId]);

  const filteredAssessments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return assessments.filter((item) => {
      const matchesSearch =
        !q ||
        item.student_name.toLowerCase().includes(q) ||
        item.student_email.toLowerCase().includes(q);

      const matchesResult =
        filterResult === "ALL" || item.result === filterResult;

      return matchesSearch && matchesResult;
    });
  }, [assessments, searchQuery, filterResult]);

  // Click evaluate button
  const handleInitiateEvaluation = (
    item: ProgramAssessmentItem,
    result: "PASSED" | "FAILED"
  ) => {
    setActiveItem(item);
    setTargetResult(result);
    setEvalNote(
      item.note ||
        (result === "PASSED"
          ? "Peserta telah memenuhi kriteria kelulusan kehadiran minimal dan seluruh tugas modul dinilai tuntas."
          : "Kehadiran atau penugasan belum memenuhi standar kelulusan jenjang ini.")
    );
    setIsNoteModalOpen(true);
  };

  // Step 1: Note modal confirmed, open confirm modal
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalNote.trim()) return;
    setIsNoteModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  // Step 2: Confirm final submission
  const handleConfirmAction = async () => {
    if (!selectedProgramId || !activeItem) return;
    setIsSubmitting(true);
    try {
      await saveProgramAssessment(selectedProgramId, activeItem.student_id, {
        result: targetResult,
        note: evalNote.trim(),
      });
      setIsConfirmModalOpen(false);
      setSuccessMessage(
        `Berhasil menetapkan status ${targetResult} untuk ${activeItem.student_name}.`
      );
      loadAssessments();
    } catch (err: unknown) {
      const errorObj = err as { status?: number; code?: string; message?: string };
      setIsConfirmModalOpen(false);
      if (errorObj?.status === 409 || errorObj?.code === "CONFLICT") {
        setErrorMessage(
          "Terjadi konflik data (409 Conflict): Status evaluasi peserta telah diperbarui oleh sesi lain. Memuat ulang data..."
        );
        loadAssessments();
      } else {
        setErrorMessage(errorObj?.message || "Gagal menyimpan evaluasi kelulusan.");
      }
    } finally {
      setIsSubmitting(false);
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
              <h1 className="headline-1">Kelulusan Jenjang MAN</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Evaluasi kelulusan peserta berdasarkan rekap kehadiran sesi live dan penyelesaian tugas program.
              </p>
            </div>
          </div>

          {/* Program Selector & Controls Card */}
          <div className="p-5 bg-white border-2 border-black rounded-xl shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              {/* Program dropdown */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pilih Program Kohort
                </label>
                {isLoadingPrograms ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                ) : (
                  <select
                    value={selectedProgramId || ""}
                    onChange={(e) => handleSelectProgram(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold outline-none focus:bg-white transition-colors"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.category || "MAN"}{p.level ? ` - ${p.level}` : ""}] {p.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Filter Status Hasil
                </label>
                <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black rounded-xl px-3 py-2 text-sm font-bold text-gray-700">
                  <FiFilter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer w-full font-bold text-black"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PASSED">Lulus (PASSED)</option>
                    <option value="FAILED">Tidak Lulus (FAILED)</option>
                    <option value="PENDING">Belum Dinilai (PENDING)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative pt-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama peserta atau alamat email (contoh: Budi, sarah@example.com)..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm focus:bg-white outline-none transition-colors font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Active program meta summary */}
            {selectedProgram && (
              <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Program Terpilih:</span>
                  <span className="font-semibold text-primary-1">{selectedProgram.title}</span>
                  {selectedProgram.level && (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      Jenjang {selectedProgram.level}
                    </span>
                  )}
                </div>
                <div className="font-bold text-gray-600">
                  Total Peserta: {filteredAssessments.length} orang
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold flex items-center justify-between"
            >
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={loadAssessments}
                className="underline text-xs hover:text-red-950 font-bold"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoadingAssessments ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat data kelulusan peserta...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Peserta & Role</th>
                      <th className="py-3.5 px-4">Kehadiran (Live)</th>
                      <th className="py-3.5 px-4">Tugas & Nilai</th>
                      <th className="py-3.5 px-4">Status & Catatan</th>
                      <th className="py-3.5 px-4 text-center">Aksi Keputusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-3.5 px-4 space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex gap-2 justify-center">
                            <Skeleton className="h-8 w-16 rounded-lg" />
                            <Skeleton className="h-8 w-16 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                  <FiAward className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Tidak Ada Data Peserta</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {searchQuery || filterResult !== "ALL"
                    ? "Tidak ada peserta yang cocok dengan filter atau pencarian."
                    : "Belum ada peserta yang terdaftar aktif pada program ini."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Peserta & Role</th>
                      <th className="py-3.5 px-4">Kehadiran (Live)</th>
                      <th className="py-3.5 px-4">Tugas & Nilai</th>
                      <th className="py-3.5 px-4">Status & Catatan</th>
                      <th className="py-3.5 px-4 text-center">Aksi Keputusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAssessments.map((item) => {
                      const attended = item.attendance_attended ?? item.attended_sessions ?? 0;
                      const total = item.attendance_total ?? item.total_sessions ?? 0;
                      const attPercent =
                        item.attendance_rate !== undefined && item.attendance_rate !== null
                          ? Math.round(Number(item.attendance_rate))
                          : total > 0
                          ? Math.round((attended / total) * 100)
                          : 0;

                      return (
                        <tr key={item.student_id} className="hover:bg-gray-50 transition-colors">
                          {/* Peserta */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900 text-sm">{item.student_name}</p>
                            <p className="text-xs text-gray-500">{item.student_email}</p>
                            <div className="mt-1">
                              <UserRoleBadge roles={item.student_roles || item.roles} />
                            </div>
                          </td>

                          {/* Kehadiran */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                              <span>
                                {attended}/{total} Sesi
                              </span>
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                                  attPercent >= 80
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : attPercent >= 50
                                    ? "bg-amber-50 text-amber-800 border-amber-300"
                                    : "bg-red-50 text-red-800 border-red-300"
                                }`}
                              >
                                {attPercent}%
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">Sesi Live Kelas</p>
                          </td>

                          {/* Tugas */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-sm text-gray-900">
                              {item.assignments_completed}/{item.assignments_total} Tugas Selesai
                            </div>
                            {item.average_grade !== null && item.average_grade !== undefined ? (
                              <p className="text-xs font-semibold text-primary-1 mt-0.5">
                                Rata-rata Nilai: {item.average_grade}
                              </p>
                            ) : (
                              <p className="text-[11px] text-gray-400 mt-0.5">Belum dinilai</p>
                            )}
                          </td>

                          {/* Status & Catatan */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              {item.result === "PASSED" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                                  <FiCheckCircle className="w-3.5 h-3.5" />
                                  <span>LULUS</span>
                                </span>
                              ) : item.result === "FAILED" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                                  <FiXCircle className="w-3.5 h-3.5" />
                                  <span>TIDAK LULUS</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                  <FiAlertCircle className="w-3.5 h-3.5" />
                                  <span>BELUM DINILAI</span>
                                </span>
                              )}
                            </div>
                            {item.note && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                {item.note}
                              </p>
                            )}
                            {item.assessed_at && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Dinilai: {new Date(item.assessed_at).toLocaleDateString("id-ID")}
                              </p>
                            )}
                          </td>

                          {/* Aksi */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => handleInitiateEvaluation(item, "PASSED")}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                              >
                                <FiUserCheck className="w-3.5 h-3.5" />
                                <span>Lulus</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInitiateEvaluation(item, "FAILED")}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                              >
                                <FiXCircle className="w-3.5 h-3.5" />
                                <span>Tidak Lulus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Input Modal */}
      {isNoteModalOpen && activeItem && (
        <div
          ref={noteModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FiFileText className="w-5 h-5 text-primary-1" />
                <span>
                  Evaluasi: {targetResult === "PASSED" ? "LULUS" : "TIDAK LULUS"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg border border-black hover:bg-gray-100"
                aria-label="Tutup modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs space-y-1">
              <p>
                <span className="font-bold text-gray-700">Nama Peserta:</span>{" "}
                <span className="font-bold text-black">{activeItem.student_name}</span>
              </p>
              <p>
                <span className="font-bold text-gray-700">Program:</span>{" "}
                <span className="font-bold text-black">{selectedProgram?.title}</span>
              </p>
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  Catatan Resmi Evaluasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={evalNote}
                  onChange={(e) => setEvalNote(e.target.value)}
                  placeholder="Contoh: Peserta telah menyelesaikan seluruh modul dan kuis dengan nilai memuaskan..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm font-medium outline-none focus:border-black transition-colors resize-none placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Catatan ini akan tampil pada profil progres kelulusan portal peserta.
                </p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="secondary"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant={targetResult === "PASSED" ? "primary" : "secondary"}
                  className="flex-1 font-bold"
                >
                  Lanjut ke Konfirmasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={`Konfirmasi Evaluasi: ${targetResult === "PASSED" ? "LULUS" : "TIDAK LULUS"}`}
        message={`Apakah Anda yakin menyatakan ${activeItem?.student_name} ${targetResult === "PASSED" ? "LULUS" : "TIDAK LULUS"} pada program "${selectedProgram?.title}"? Hasil penilaian akan tercatat resmi pada audit log dan menentukan prasyarat jenjang berikutnya.`}
        confirmText={
          isSubmitting
            ? "Menyimpan..."
            : `Ya, Tetapkan ${targetResult === "PASSED" ? "Lulus" : "Tidak Lulus"}`
        }
        type={targetResult === "PASSED" ? undefined : "danger"}
      />

      {/* Success Notification */}
      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Evaluasi Disimpan"
        message={successMessage || ""}
      />
    </div>
  );
}
