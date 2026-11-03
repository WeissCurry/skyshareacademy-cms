import { useState, useEffect, useCallback } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import type { ReviewQueueItem } from "@features/mentor-access/types";
import { fetchReviewQueue, fetchPrograms } from "@features/mentor-access/api";
import KycOrderDetailModal from "./components/KycOrderDetailModal";
import SuccessModal from "@shared/ui/SuccessModal";
import Skeleton from "@shared/ui/Skeleton";
import { UserRoleBadge } from "@shared/ui/UserRoleBadge";

export default function CmsReviewQueuePage() {
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [programs, setPrograms] = useState<{ id: number; title: string }[]>([]);

  // Server pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const itemsPerPage = 8;

  // Selected item for detail modal
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Success Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch available programs for dropdown filter on mount
  useEffect(() => {
    let active = true;
    fetchPrograms({ all: true })
      .then((data) => {
        if (active) {
          setPrograms(data.map((p) => ({ id: p.id, title: p.title })));
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil daftar program:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch queue with server pagination, search, filter and AbortController
  useEffect(() => {
    const controller = new AbortController();

    fetchReviewQueue({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch.trim() || undefined,
      program_id: selectedProgram === "all" ? undefined : selectedProgram,
      signal: controller.signal,
    })
      .then((res) => {
        setQueueItems(res.items);
        setTotalItems(res.total);
        setTotalPages(res.totalPages || 1);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setErrorMessage((err as Error).message || "Gagal mengambil data antrean verifikasi.");
        setQueueItems([]);
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [currentPage, debouncedSearch, selectedProgram, refreshIndex]);

  const loadQueue = useCallback(() => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  const handleOpenDetail = (item: ReviewQueueItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleActionComplete = (message: string) => {
    setIsDetailOpen(false);
    setSelectedItem(null);
    setSuccessMessage(message);
    loadQueue();
  };

  const handleConflictRefresh = () => {
    setIsDetailOpen(false);
    setSelectedItem(null);
    loadQueue();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
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
              <h1 className="headline-1">Antrian Review Verifikasi</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Validasi identitas legal (KYC) dan konfirmasi mutasi pembayaran manual QRIS calon mentor.
              </p>
            </div>

            <button
              type="button"
              onClick={loadQueue}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-sm hover:shadow self-start sm:self-auto"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Antrean</span>
            </button>
          </div>

          {/* Controls: Search, Program Filter & Pagination Bar (Copies CmsEventManagement.tsx) */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col lg:flex-row flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-3 w-full items-center">
              {/* Search */}
              <div className="relative w-full md:w-64 shrink-0">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Contoh: Cari nama Budi, email@example.com, atau NIK..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors font-medium placeholder:font-normal placeholder:text-gray-400"
                />
              </div>

              {/* Program Dropdown Filter */}
              <div className="relative w-full md:w-56 shrink-0">
                <select
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors cursor-pointer appearance-none font-bold"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "16px",
                  }}
                >
                  <option value="all">Semua Program</option>
                  {programs.map((prog) => (
                    <option key={prog.id} value={String(prog.id)}>
                      {prog.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Total & Pagination Controls */}
              <div className="flex flex-row items-center justify-between w-full md:w-auto md:flex-1 md:justify-end gap-3">
                <div className="text-sm text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap shrink-0">
                  {totalItems} Antrean
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={currentPage === 1 || isLoading}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 bg-white border-2 border-black rounded-lg font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      Prev
                    </button>
                    <span className="text-sm font-bold min-w-[3rem] text-center">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="px-3 py-1.5 bg-white border-2 border-black rounded-lg font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={loadQueue}
                className="underline text-xs hover:text-red-900"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat antrean verifikasi...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Mentor</th>
                      <th className="py-3.5 px-4">Status Registrasi</th>
                      <th className="py-3.5 px-4">Program Dipilih</th>
                      <th className="py-3.5 px-4">Nominal Bayar</th>
                      <th className="py-3.5 px-4">Waktu Pengajuan</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                            <div className="space-y-1.5 flex-1">
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-3 w-44" />
                              <Skeleton className="h-3 w-28" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 space-y-1.5">
                          <Skeleton className="h-5 w-24 rounded-full" />
                          <Skeleton className="h-5 w-28 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-32 rounded-md" />
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-28" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Skeleton className="h-7 w-20 rounded-xl mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : queueItems.length === 0 ? (
              /* Empty state following Anti-AI-Slop & Component Reference Design */
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                  <FiCheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Antrean Bersih & Lengkap!</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Tidak ada permohonan KYC atau pembayaran yang menunggu ditinjau saat ini. Mentor baru yang mengunggah bukti bayar akan muncul di sini.
                </p>
                {searchQuery || selectedProgram !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedProgram("all");
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-xl text-xs font-bold transition-all"
                  >
                    Reset Filter Pencarian
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Mentor & Akun</th>
                      <th className="py-3.5 px-4">NIK (Masked)</th>
                      <th className="py-3.5 px-4">Program & Kode Order</th>
                      <th className="py-3.5 px-4">Total & Kode Unik</th>
                      <th className="py-3.5 px-4">Waktu Unggah</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {queueItems.map((item, idx) => {
                      const studentName = item.kyc?.student_name || item.order?.student_name || `Mentor #${item.student_id || idx + 1}`;
                      const studentEmail = item.kyc?.student_email || item.order?.student_email || "-";
                      const kycStatus = item.kyc?.status || "BELUM_KYC";
                      const rowKey = `${item.student_id || idx}-${item.kyc?.id || "nokyc"}-${item.order?.id || "noorder"}`;

                      return (
                        <tr
                          key={rowKey}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Mentor Info */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900">{studentName}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{studentEmail}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                {kycStatus}
                              </span>
                              <UserRoleBadge roles={item.student_roles || item.kyc?.student_roles} />
                            </div>
                          </td>

                          {/* Masked NIK & Bank */}
                          <td className="py-3.5 px-4">
                            {item.kyc ? (
                              <>
                                <p className="font-mono text-xs font-bold text-gray-900 tracking-wide">{item.kyc.nik || "-"}</p>
                                <p className="text-[11px] text-gray-600 mt-0.5">
                                  {item.kyc.bank_name || "-"} &bull; <span className="font-mono">{item.kyc.bank_account_number || "-"}</span>
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Data KYC belum ada</p>
                            )}
                          </td>

                          {/* Program & Order */}
                          <td className="py-3.5 px-4">
                            {item.order ? (
                              <>
                                <p className="font-bold text-gray-900 line-clamp-1">{item.order.program_title}</p>
                                <p className="font-mono text-xs text-gray-500 mt-0.5">{item.order.order_code}</p>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Hanya KYC (Belum ada pesanan)</span>
                            )}
                          </td>

                          {/* Total Amount + Highlighted Unique Code */}
                          <td className="py-3.5 px-4">
                            {item.order ? (
                              <>
                                <p className="font-mono font-black text-gray-900 text-sm">
                                  {formatRupiah(item.order.total_amount)}
                                </p>
                                <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                                  Kode: {item.order.unique_code}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>

                          {/* Uploaded time */}
                          <td className="py-3.5 px-4">
                            <p className="text-xs text-gray-800 font-medium">
                              {formatDate(item.order?.proof_uploaded_at || item.kyc?.submitted_at)}
                            </p>
                            {item.order?.expires_at && (
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <FiClock className="w-3 h-3" />
                                <span>Exp: {formatDate(item.order.expires_at)}</span>
                              </p>
                            )}
                          </td>

                          {/* Action: Open verification detail */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-1 hover:bg-primary-2 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t-2 border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-700">
                <p>
                  Halaman <span className="text-black font-black">{currentPage}</span> dari{" "}
                  <span className="text-black font-black">{totalPages}</span> ({totalItems} antrean)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      <KycOrderDetailModal
        queueItem={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
        onActionComplete={handleActionComplete}
        onConflictRefresh={handleConflictRefresh}
      />

      {/* Success Notification */}
      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Verifikasi Sukses"
        message={successMessage || ""}
      />
    </div>
  );
}
