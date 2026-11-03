import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@widgets/Sidebar";
import { useSearchParams } from "react-router-dom";
import {
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiDownload,
  FiUserPlus,
  FiCalendar,
  FiUsers,
  FiX,
  FiKey,
} from "react-icons/fi";
import skyshareApi from "@shared/api/skyshareApi";
import type {
  EventOtpData,
  AttendanceAttendeeItem,
} from "@features/mentor-access/types";
import {
  fetchEventOtp,
  toggleEventAttendance,
  fetchEventAttendees,
  manualAddAttendance,
  exportAttendanceCsv,
} from "@features/mentor-access/api";
import { UserRoleBadge } from "@shared/ui/UserRoleBadge";
import ConfirmModal from "@shared/ui/ConfirmModal";
import SuccessModal from "@shared/ui/SuccessModal";
import Button from "@shared/ui/Button";
import Skeleton from "@shared/ui/Skeleton";
import { useModalA11y } from "@shared/hooks/useModalA11y";

interface BasicEventItem {
  id: number;
  title: string;
  event_date?: string | null;
  target_role?: string;
  is_active?: boolean;
}

export default function CmsAttendanceOtpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEventId = searchParams.get("event_id");

  const [events, setEvents] = useState<BasicEventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    initialEventId ? parseInt(initialEventId, 10) : null
  );

  const [otpData, setOtpData] = useState<EventOtpData | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [attendees, setAttendees] = useState<AttendanceAttendeeItem[]>([]);
  const [isLoadingOtp, setIsLoadingOtp] = useState<boolean>(false);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Toggle Confirm Modal
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isSubmittingToggle, setIsSubmittingToggle] = useState(false);

  // Manual Add Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState("");

  // CSV Export state
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const manualModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({
    isOpen: isManualModalOpen,
    onClose: () => setIsManualModalOpen(false),
    containerRef: manualModalRef,
  });

  // Fetch events on mount
  useEffect(() => {
    let active = true;
    const loadEvents = async () => {
      try {
        const res = await skyshareApi.get("/admin/events");
        const list: BasicEventItem[] = res.data?.data || [];
        if (active) {
          setEvents(list);
          setSelectedEventId((prev) => (!prev && list.length > 0 ? list[0].id : prev));
        }
      } catch (err) {
        console.error("Gagal memuat event:", err);
      }
    };
    loadEvents();
    return () => {
      active = false;
    };
  }, []);

  // Update query params when event changes
  const handleSelectEvent = (id: number) => {
    setSelectedEventId(id);
    setIsLoadingOtp(true);
    setIsLoadingAttendees(true);
    setSearchParams({ event_id: id.toString() });
  };

  const isRefreshingOtpRef = useRef(false);
  const isPollingAttendeesRef = useRef(false);

  // Fetch OTP details
  const refreshOtp = useCallback(async (signal?: AbortSignal) => {
    if (!selectedEventId || isRefreshingOtpRef.current) return;
    isRefreshingOtpRef.current = true;
    setIsLoadingOtp(true);
    setErrorMessage("");
    try {
      const data = await fetchEventOtp(selectedEventId, signal);
      setOtpData(data);
      setSecondsRemaining(data.expires_in_seconds || 180);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat OTP absensi event.");
    } finally {
      isRefreshingOtpRef.current = false;
      setIsLoadingOtp(false);
    }
  }, [selectedEventId]);

  // Fetch Attendee list
  const refreshAttendees = useCallback(async (signal?: AbortSignal) => {
    if (!selectedEventId || isPollingAttendeesRef.current) return;
    isPollingAttendeesRef.current = true;
    setIsLoadingAttendees(true);
    try {
      const list = await fetchEventAttendees(selectedEventId, signal);
      setAttendees(list);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      console.error("Gagal memuat daftar hadir:", err);
    } finally {
      isPollingAttendeesRef.current = false;
      setIsLoadingAttendees(false);
    }
  }, [selectedEventId]);

  // Load both when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;

    const controller = new AbortController();

    Promise.all([
      fetchEventOtp(selectedEventId, controller.signal),
      fetchEventAttendees(selectedEventId, controller.signal),
    ])
      .then(([otp, attList]) => {
        setOtpData(otp);
        setSecondsRemaining(otp.expires_in_seconds || 180);
        setAttendees(attList);
        setIsLoadingOtp(false);
        setIsLoadingAttendees(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setErrorMessage((err as Error).message || "Gagal memuat OTP absensi event.");
        setIsLoadingOtp(false);
        setIsLoadingAttendees(false);
      });

    return () => {
      controller.abort();
    };
  }, [selectedEventId]);

  // Countdown timer & rotation handler
  useEffect(() => {
    if (!otpData?.is_open || !selectedEventId) return;

    let rotController: AbortController | null = null;
    const timer = setInterval(() => {
      // Pause if tab is not visible
      if (document.visibilityState === "hidden") return;

      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (!isRefreshingOtpRef.current) {
            rotController = new AbortController();
            refreshOtp(rotController.signal);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (rotController) {
        rotController.abort();
      }
    };
  }, [otpData?.is_open, selectedEventId, refreshOtp]);

  // Live polling attendee list (~10s) while open and page is visible, preventing overlap
  useEffect(() => {
    if (!otpData?.is_open || !selectedEventId) return;

    let pollController: AbortController | null = null;
    const attendeeInterval = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (isPollingAttendeesRef.current) return;
      pollController = new AbortController();
      refreshAttendees(pollController.signal);
    }, 10000);

    return () => {
      clearInterval(attendeeInterval);
      if (pollController) {
        pollController.abort();
      }
    };
  }, [otpData?.is_open, selectedEventId, refreshAttendees]);

  // Listen for visibility change: immediately re-sync when tab becomes visible
  useEffect(() => {
    let visController: AbortController | null = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && selectedEventId) {
        visController = new AbortController();
        refreshOtp(visController.signal);
        refreshAttendees(visController.signal);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visController) {
        visController.abort();
      }
    };
  }, [selectedEventId, refreshOtp, refreshAttendees]);

  // Toggle open/close attendance
  const handleConfirmToggle = async () => {
    if (!selectedEventId || !otpData) return;
    setIsSubmittingToggle(true);
    try {
      const nextState = !otpData.is_open;
      await toggleEventAttendance(selectedEventId, nextState);
      setIsToggleModalOpen(false);
      setSuccessMessage(
        nextState
          ? "Sesi absensi berhasil DIBUKA. Kode OTP 6-digit kini aktif."
          : "Sesi absensi berhasil DITUTUP. Peserta tidak dapat mengisi absensi."
      );
      await refreshOtp();
      await refreshAttendees();
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal mengubah status sesi absensi.");
    } finally {
      setIsSubmittingToggle(false);
    }
  };

  // Manual Add submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    const studentIdNum = parseInt(manualStudentId.trim(), 10);
    if (!studentIdNum || isNaN(studentIdNum)) {
      setManualError("ID Peserta / Akun harus berupa angka.");
      return;
    }
    if (!manualReason.trim()) {
      setManualError("Alasan penambahan manual wajib diisi.");
      return;
    }

    setIsSubmittingManual(true);
    setManualError("");
    try {
      await manualAddAttendance(selectedEventId, studentIdNum, manualReason.trim());
      setIsManualModalOpen(false);
      setManualStudentId("");
      setManualReason("");
      setSuccessMessage("Absensi manual berhasil dicatat.");
      refreshAttendees();
    } catch (err) {
      setManualError((err as Error).message || "Gagal menambahkan absensi manual.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Export CSV download
  const handleExportCsv = async () => {
    if (!selectedEventId) return;
    setIsExporting(true);
    try {
      const blob = await exportAttendanceCsv(selectedEventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `absensi_event_${selectedEventId}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal mengekspor data absensi CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Minutes and seconds for display
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

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
              <h1 className="headline-1">Absensi OTP Sesi</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Kelola absensi sesi live berbasis kode OTP berputar 180 detik anti titip absen.
              </p>
            </div>
          </div>

          {/* Event Picker Bar */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <FiCalendar className="w-5 h-5 text-gray-500 shrink-0" />
              <label htmlFor="event-selector" className="text-xs font-bold text-gray-700 uppercase tracking-wider shrink-0">
                Pilih Sesi:
              </label>
              <select
                id="event-selector"
                value={selectedEventId || ""}
                onChange={(e) => handleSelectEvent(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-gray-50 border-2 border-black rounded-lg text-sm font-bold outline-none focus:bg-white transition-colors"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    #{ev.id} - {ev.title} {ev.event_date ? `(${new Date(ev.event_date).toLocaleDateString("id-ID")})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                refreshOtp();
                refreshAttendees();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg text-xs font-bold transition-all shrink-0"
              title="Muat ulang status sekarang"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingOtp ? "animate-spin" : ""}`} />
              <span>Sinkronisasi</span>
            </button>
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
                onClick={() => refreshOtp()}
                className="underline text-xs hover:text-red-950 font-bold"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* OTP Live Broadcast Display Card */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm">
            {isLoadingOtp && !otpData ? (
              <div role="status" aria-busy="true" className="space-y-4 py-8 text-center">
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-20 w-80 mx-auto rounded-xl" />
                <Skeleton className="h-4 w-36 mx-auto" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Status & Controls */}
                <div className="space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                        otpData?.is_open
                          ? "bg-green-100 text-green-800 border-green-400 animate-pulse"
                          : "bg-gray-100 text-gray-700 border-gray-400"
                      }`}
                    >
                      {otpData?.is_open ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          <span>SESI ABSENSI DIBUKA</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                          <span>SESI ABSENSI DITUTUP</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Event #{selectedEventId}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-gray-900 leading-snug">
                    {selectedEvent?.title || `Event #${selectedEventId}`}
                  </h2>

                  <p className="text-xs text-gray-600 max-w-md">
                    {otpData?.is_open
                      ? "Bagikan kode numerik 6-digit ini di layar webinar. Kode berputar otomatis setiap 180 detik dengan grace period untuk toleransi jaringan."
                      : "Sesi absensi sedang nonaktif. Klik tombol di bawah untuk membuka sesi dan menghasilkan kode OTP absensi."}
                  </p>

                  <div className="pt-2">
                    <Button
                      variant={otpData?.is_open ? "danger" : "primary"}
                      onClick={() => setIsToggleModalOpen(true)}
                      className="font-bold text-xs"
                    >
                      {otpData?.is_open ? "Tutup Sesi Absensi" : "Buka Sesi Absensi Sekarang"}
                    </Button>
                  </div>
                </div>

                {/* Right: Large 6-Digit TOTP Box */}
                <div className="w-full md:w-auto">
                  {otpData?.is_open ? (
                    <div className="bg-gray-50 border-2 border-black rounded-2xl p-6 text-center shadow-inner flex flex-col items-center min-w-[280px]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                        <FiKey className="w-3.5 h-3.5 text-primary-1" />
                        <span>Kode Absensi Live</span>
                      </div>

                      {/* 6-Digit code */}
                      <div className="font-mono text-5xl md:text-6xl font-black tracking-widest text-primary-1 my-2 select-all py-2 px-4 bg-white rounded-xl border-2 border-black">
                        {otpData.code || "------"}
                      </div>

                      {/* Countdown */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mt-2">
                        <FiClock className="w-4 h-4 text-amber-500" />
                        <span>
                          Berputar dalam: <strong className="text-black font-mono">{timeFormatted}</strong> ({secondsRemaining}s)
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden border border-gray-300">
                        <div
                          className="bg-primary-1 h-full transition-all duration-1000 ease-linear rounded-full"
                          style={{ width: `${Math.max(0, (secondsRemaining / 180) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center min-w-[280px]">
                      <FiClock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-bold text-gray-700 text-sm">Absensi Sedang Tertutup</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Buka sesi untuk menampilkan kode OTP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attendee List Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-black text-gray-900">
                  Daftar Hadir Peserta ({attendees.length})
                </h3>
                {otpData?.is_open && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                    Live Auto-Refresh ~10s
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border-2 border-black rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <FiUserPlus className="w-3.5 h-3.5 text-primary-1" />
                  <span>Tambah Manual</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={isExporting || attendees.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-1 hover:bg-primary-2 disabled:bg-gray-200 disabled:text-gray-400 text-white border-2 border-black rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span>{isExporting ? "Mengekspor..." : "Ekspor CSV"}</span>
                </button>
              </div>
            </div>

            {/* Attendees Table */}
            <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
              {isLoadingAttendees && attendees.length === 0 ? (
                <div role="status" aria-busy="true" className="overflow-x-auto">
                  <span className="sr-only">Memuat daftar kehadiran...</span>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="py-3 px-4">Peserta & Role</th>
                        <th className="py-3 px-4">Waktu Hadir</th>
                        <th className="py-3 px-4">Metode</th>
                        <th className="py-3 px-4">Detail Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="py-3.5 px-4 space-y-1">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24" />
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-4 w-28" />
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-3 w-32" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : attendees.length === 0 ? (
                <div className="py-12 px-4 text-center max-w-sm mx-auto space-y-2">
                  <FiUsers className="w-10 h-10 text-gray-400 mx-auto" />
                  <h4 className="font-bold text-gray-900 text-sm">Belum Ada Peserta Hadir</h4>
                  <p className="text-xs text-gray-500">
                    Buka sesi absensi dan bagikan kode OTP kepada peserta live untuk mulai mencatat kehadiran.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="py-3 px-4">Peserta & Role</th>
                        <th className="py-3 px-4">Waktu Hadir</th>
                        <th className="py-3 px-4">Metode</th>
                        <th className="py-3 px-4">Detail Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendees.map((att) => (
                        <tr key={att.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900">{att.student_name}</p>
                            <p className="text-xs text-gray-500">{att.student_email}</p>
                            <div className="mt-1">
                              <UserRoleBadge roles={att.student_roles || att.roles} />
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-xs font-medium text-gray-700 whitespace-nowrap">
                            {new Date(att.attended_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>

                          <td className="py-3.5 px-4">
                            {att.method === "OTP" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                                <FiCheckCircle className="w-3 h-3" />
                                <span>OTP Live</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <FiUserPlus className="w-3 h-3" />
                                <span>Manual Admin</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-gray-600">
                            {att.reason && (
                              <p className="font-semibold text-gray-900">
                                Alasan: {att.reason}
                              </p>
                            )}
                            {att.ip_address && (
                              <p className="font-mono text-[11px] text-gray-400">
                                IP: {att.ip_address}
                              </p>
                            )}
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
      </div>

      {/* Toggle Open/Close Confirm Modal */}
      <ConfirmModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={otpData?.is_open ? "Tutup Sesi Absensi" : "Buka Sesi Absensi"}
        message={
          otpData?.is_open
            ? `Apakah Anda yakin ingin MENUTUP sesi absensi untuk "${selectedEvent?.title}"? Kode OTP akan dinonaktifkan dan peserta tidak dapat melakukan absensi lagi.`
            : `Apakah Anda yakin ingin MEMBUKA sesi absensi untuk "${selectedEvent?.title}"? Sistem akan mengaktifkan kode TOTP 6-digit yang berganti otomatis setiap 180 detik.`
        }
        confirmText={
          isSubmittingToggle
            ? "Memproses..."
            : otpData?.is_open
            ? "Ya, Tutup Sesi"
            : "Ya, Buka Sesi"
        }
        type={otpData?.is_open ? "danger" : undefined}
      />

      {/* Manual Add Attendance Modal */}
      {isManualModalOpen && (
        <div
          ref={manualModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FiUserPlus className="w-5 h-5 text-primary-1" />
                <span>Tambah Hadir Manual</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg border border-black hover:bg-gray-100"
                aria-label="Tutup modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {manualError && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-xs font-bold"
              >
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  ID Akun Peserta (student_id) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  placeholder="Contoh: 42"
                  className="w-full p-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold outline-none focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  Alasan Penambahan Manual <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Contoh: Terkendala koneksi Zoom, kehadiran diverifikasi oleh host..."
                  className="w-full p-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-medium outline-none focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="secondary"
                  onClick={() => setIsManualModalOpen(false)}
                  disabled={isSubmittingManual}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingManual}
                  className="flex-1 font-bold"
                >
                  Simpan Hadir
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
