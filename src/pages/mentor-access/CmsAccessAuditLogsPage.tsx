import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiActivity,
  FiSearch,
  FiRefreshCw,
  FiClock,
  FiUser,
  FiArrowRight,
} from "react-icons/fi";
import type { AccessAuditLogItem } from "@features/mentor-access/types";
import { fetchAccessAuditLogs } from "@features/mentor-access/api";
import Skeleton from "@shared/ui/Skeleton";

export default function CmsAccessAuditLogsPage() {
  const [logs, setLogs] = useState<AccessAuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const limit = 15;

  const loadAuditLogs = useCallback(() => {
    setRefreshIndex((p) => p + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      setIsLoading(true);
      setErrorMessage("");
      fetchAccessAuditLogs({
        page: currentPage,
        limit,
        entity_type: selectedEntityType,
        search: searchQuery,
        signal: controller.signal,
      })
        .then((data) => {
          setLogs(data.items);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || data.items.length);
          setIsLoading(false);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error(err);
          setErrorMessage((err as Error).message || "Gagal mengambil log audit akses.");
          setLogs([]);
          setIsLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentPage, selectedEntityType, searchQuery, refreshIndex]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const getEntityBadge = (type: string) => {
    switch (type) {
      case "KYC":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "PROGRAM_ORDER":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ASSIGNMENT":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const entityTypeCounts = useMemo(() => {
    return {
      all: totalItems,
    };
  }, [totalItems]);

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
              <h1 className="headline-1">Audit Log Akses</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Rekam jejak kepatuhan persetujuan KYC, aktivasi pembayaran pesanan, dan penilaian tugas oleh admin.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAuditLogs}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-sm hover:shadow self-start sm:self-auto"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Controls: Search, Entity Filter & Pagination Bar (Copies CmsEventManagement.tsx) */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col lg:flex-row flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-3 w-full items-center">
              {/* Search Input */}
              <div className="relative w-full md:w-64 shrink-0">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Contoh: Cari admin, VERIFY_KYC, atau alasan..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors font-medium placeholder:font-normal placeholder:text-gray-400"
                />
              </div>

              {/* Entity Filter Select */}
              <div className="relative w-full md:w-48 shrink-0">
                <select
                  value={selectedEntityType}
                  onChange={(e) => {
                    setSelectedEntityType(e.target.value);
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
                  <option value="all">Semua Entitas</option>
                  <option value="KYC">KYC</option>
                  <option value="PROGRAM_ORDER">Pesanan</option>
                  <option value="ASSIGNMENT">Tugas</option>
                </select>
              </div>

              {/* Total Info & Pagination Controls */}
              <div className="flex flex-row items-center justify-between w-full md:w-auto md:flex-1 md:justify-end gap-3">
                <div className="text-sm text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap shrink-0">
                  {entityTypeCounts.all} Log
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 bg-white border-2 border-black rounded-lg font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      Prev
                    </button>
                    <span className="text-sm font-bold min-w-[3rem] text-center">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
            <div role="alert" className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold">
              {errorMessage}
            </div>
          )}

          {/* Table */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat riwayat audit log...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Waktu (WIB)</th>
                      <th className="py-3.5 px-4">Admin Pelaksana</th>
                      <th className="py-3.5 px-4">Entitas & Target</th>
                      <th className="py-3.5 px-4">Aksi & Perubahan Status</th>
                      <th className="py-3.5 px-4">Alasan / Catatan Review</th>
                      <th className="py-3.5 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-28" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-20 font-mono" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                  <FiActivity className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Belum Ada Rekaman Audit</h3>
                <p className="text-xs text-gray-500 font-medium">
                  Setiap keputusan persetujuan KYC atau aktivasi pesanan yang dilakukan admin akan dicatat secara otomatis di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Waktu (WIB)</th>
                      <th className="py-3.5 px-4">Admin Pelaksana</th>
                      <th className="py-3.5 px-4">Entitas & Target</th>
                      <th className="py-3.5 px-4">Aksi & Perubahan Status</th>
                      <th className="py-3.5 px-4">Alasan / Catatan Review</th>
                      <th className="py-3.5 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <FiClock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(log.createdAt)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <FiUser className="w-3.5 h-3.5 text-primary-1" />
                            <span className="font-bold text-gray-900 text-xs">{log.admin_name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getEntityBadge(
                                log.entity_type
                              )}`}
                            >
                              {log.entity_type} #{log.entity_id}
                            </span>
                            {log.student_name && (
                              <span className="text-xs text-gray-600 font-medium truncate max-w-[140px]">
                                Mentor: {log.student_name}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-mono font-bold text-xs text-gray-900">{log.action}</p>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 mt-0.5">
                            <span>{log.from_status || "INIT"}</span>
                            <FiArrowRight className="w-3 h-3 text-primary-1" />
                            <span className="text-black font-black">{log.to_status}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {log.reason ? (
                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 line-clamp-2 max-w-xs font-medium">
                              {log.reason}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Tanpa catatan tambahan</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                          {log.ip_address || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t-2 border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-700">
                <p>
                  Halaman <span className="text-black font-black">{currentPage}</span> dari{" "}
                  <span className="text-black font-black">{totalPages}</span> ({entityTypeCounts.all} entri log)
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
    </div>
  );
}
