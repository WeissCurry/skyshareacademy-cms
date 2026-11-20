import React, { useState, useEffect } from "react";
import axios from "axios";
import skyshareApi from "@shared/api/skyshareApi";
import Skeleton from "@shared/ui/Skeleton";
import {
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiClock,
  FiFileText,
  FiZap,
  FiUserCheck,
  FiUserPlus,
  FiBarChart2,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

export interface DeviceStats {
  mobile: number;
  tablet: number;
  desktop: number;
  unknown: number;
}

export interface HeatmapPoint {
  dow: number; // ISO 1=Senin..7=Minggu
  hour: number; // 0..23
  views: number;
}

export interface TopArticleItem {
  id: number;
  title: string;
  path: string;
  views: number;
}

export interface SlowPageItem {
  path: string;
  avg_lcp: number; // in ms
  samples: number;
}

export interface VisitorLoyalty {
  new: number;
  returning: number;
}

export interface InsightsData {
  days: number;
  timezone: string;
  devices: DeviceStats;
  heatmap: HeatmapPoint[];
  topArticles: TopArticleItem[];
  slowPages: SlowPageItem[];
  visitors: VisitorLoyalty;
}

export interface VisitorInsightsProps {
  filterDays: number;
  refreshTrigger?: number;
}

const DOW_SHORT_NAMES: Record<number, string> = {
  1: "Sen",
  2: "Sel",
  3: "Rab",
  4: "Kam",
  5: "Jum",
  6: "Sab",
  7: "Min",
};

export const VisitorInsights: React.FC<VisitorInsightsProps> = ({
  filterDays,
  refreshTrigger = 0,
}) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{
    dow: number;
    hour: number;
    views: number;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    // Use async API call without calling synchronous setState in effect body
    const timer = setTimeout(() => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      setSelectedCell(null);

      skyshareApi
        .get(`/analytics/insights?days=${filterDays}`, { signal: controller.signal })
        .then((res) => {
          if (!isMounted) return;
          setInsights(res.data?.data || null);
        })
        .catch((err) => {
          if (
            axios.isCancel(err) ||
            err?.name === "CanceledError" ||
            err?.name === "AbortError"
          ) {
            return;
          }
          if (!isMounted) return;
          console.error("Failed to load visitor insights:", err);
          setError("Gagal memuat insight pengunjung.");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [filterDays, refreshTrigger, retryCount]);

  // Loading Skeleton State
  if (loading && !insights) {
    return (
      <div className="mb-8" aria-busy="true" aria-label="Memuat Insight Pengunjung">
        <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-lg" />
              <Skeleton className="h-6 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50/50 flex flex-col gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50/50 flex flex-col gap-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-6 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="p-4 border-2 border-black rounded-xl bg-gray-50/50 mb-6 flex flex-col gap-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50/50 flex flex-col gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50/50 flex flex-col gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State: Graceful small inline notice
  if (error && !insights) {
    return (
      <div className="mb-8">
        <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-rose-50 border-2 border-black rounded-xl">
            <div className="flex items-center gap-2.5 text-rose-800 text-xs sm:text-sm font-bold">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{error} Silakan muat ulang bagian insight ini.</span>
            </div>
            <button
              type="button"
              onClick={() => setRetryCount((prev) => prev + 1)}
              className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-black text-black hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Data processing
  const devices = insights?.devices || { mobile: 0, tablet: 0, desktop: 0, unknown: 0 };
  const totalDevices =
    (devices.mobile || 0) +
    (devices.tablet || 0) +
    (devices.desktop || 0) +
    (devices.unknown || 0);

  const mobilePct = totalDevices > 0 ? ((devices.mobile / totalDevices) * 100).toFixed(1) : "0";
  const desktopPct = totalDevices > 0 ? ((devices.desktop / totalDevices) * 100).toFixed(1) : "0";
  const tabletPct = totalDevices > 0 ? ((devices.tablet / totalDevices) * 100).toFixed(1) : "0";
  const unknownPct = totalDevices > 0 ? ((devices.unknown / totalDevices) * 100).toFixed(1) : "0";

  const visitors = insights?.visitors || { new: 0, returning: 0 };
  const totalVisitors = (visitors.new || 0) + (visitors.returning || 0);
  const newPct = totalVisitors > 0 ? ((visitors.new / totalVisitors) * 100).toFixed(1) : "0";
  const returningPct = totalVisitors > 0 ? ((visitors.returning / totalVisitors) * 100).toFixed(1) : "0";

  const heatmap = insights?.heatmap || [];
  const heatmapMap = new Map<string, number>();
  let maxHeatmapViews = 1;
  heatmap.forEach((item) => {
    heatmapMap.set(`${item.dow}-${item.hour}`, item.views);
    if (item.views > maxHeatmapViews) {
      maxHeatmapViews = item.views;
    }
  });

  const topArticles = insights?.topArticles || [];
  const maxArticleViews = Math.max(...topArticles.map((a) => a.views), 1);

  const slowPages = insights?.slowPages || [];

  // Descriptive ARIA labels for 100% stacked bars
  const devicesAriaLabel = `Distribusi perangkat: Mobile ${mobilePct}%, Desktop ${desktopPct}%, Tablet ${tabletPct}%, Lainnya ${unknownPct}%`;
  const visitorsAriaLabel = `Rasio pengunjung: Baru ${newPct}%, Kembali ${returningPct}%`;

  return (
    <div className="mb-8">
      <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 shadow-sm">
        {/* Section Header */}
        <div className="bg-background flex flex-col sm:flex-row justify-between sm:items-center rounded-xl py-3 px-4 mb-6 gap-2 border-2 border-black">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary-1/10 border border-black rounded-lg">
              <FiBarChart2 className="w-5 h-5 text-primary-1 flex-shrink-0" />
            </div>
            <div>
              <h3 className="headline-4 flex items-center gap-2">
                <span>Insight Pengunjung</span>
              </h3>
              <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                Karakteristik perangkat, pola waktu sibuk, loyalitas, dan performa konten ({filterDays} Hari Terakhir)
              </p>
            </div>
          </div>
          <span className="text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-black self-start sm:self-auto shrink-0">
            {filterDays} Hari
          </span>
        </div>

        {/* Row 1: Devices & Visitor Loyalty (2 Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card A: Perangkat Pengunjung */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-xs sm:text-sm text-black flex items-center gap-2">
                  <FiSmartphone className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Kategori Perangkat</span>
                </h4>
                <span
                  className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-300 cursor-help"
                  title="Pengunjung unik dihitung per kategori perangkat; satu orang bisa terhitung di lebih dari satu perangkat"
                >
                  per perangkat
                </span>
              </div>

              {totalDevices === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400">
                  Belum ada data perangkat pada periode ini.
                </div>
              ) : (
                <>
                  {/* 100% Stacked Bar */}
                  <div
                    className="h-5 sm:h-6 w-full rounded-xl overflow-hidden border-2 border-black flex bg-gray-100 shadow-[1.5px_1.5px_0px_#000] mb-3"
                    role="img"
                    aria-label={devicesAriaLabel}
                  >
                    {devices.mobile > 0 && (
                      <div
                        style={{ width: `${(devices.mobile / totalDevices) * 100}%` }}
                        className="bg-[#34BCEE] h-full transition-all hover:opacity-90"
                        title={`Mobile: ${devices.mobile.toLocaleString("id-ID")} (${mobilePct}%)`}
                      />
                    )}
                    {devices.desktop > 0 && (
                      <div
                        style={{ width: `${(devices.desktop / totalDevices) * 100}%` }}
                        className="bg-[#FEA02F] h-full transition-all hover:opacity-90"
                        title={`Desktop: ${devices.desktop.toLocaleString("id-ID")} (${desktopPct}%)`}
                      />
                    )}
                    {devices.tablet > 0 && (
                      <div
                        style={{ width: `${(devices.tablet / totalDevices) * 100}%` }}
                        className="bg-[#A855F7] h-full transition-all hover:opacity-90"
                        title={`Tablet: ${devices.tablet.toLocaleString("id-ID")} (${tabletPct}%)`}
                      />
                    )}
                    {devices.unknown > 0 && (
                      <div
                        style={{ width: `${(devices.unknown / totalDevices) * 100}%` }}
                        className="bg-[#9CA3AF] h-full transition-all hover:opacity-90"
                        title={`Lainnya: ${devices.unknown.toLocaleString("id-ID")} (${unknownPct}%)`}
                      />
                    )}
                  </div>

                  {/* Legend with percentages and counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#34BCEE] border border-black shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-gray-700 block truncate text-[11px] flex items-center gap-1">
                          <FiSmartphone className="w-3 h-3 text-sky-600 inline shrink-0" />
                          Mobile
                        </span>
                        <span className="font-black text-black text-[11px]">
                          {devices.mobile.toLocaleString("id-ID")}{" "}
                          <span className="text-gray-500 font-bold">({mobilePct}%)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FEA02F] border border-black shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-gray-700 block truncate text-[11px] flex items-center gap-1">
                          <FiMonitor className="w-3 h-3 text-amber-600 inline shrink-0" />
                          Desktop
                        </span>
                        <span className="font-black text-black text-[11px]">
                          {devices.desktop.toLocaleString("id-ID")}{" "}
                          <span className="text-gray-500 font-bold">({desktopPct}%)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] border border-black shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-gray-700 block truncate text-[11px] flex items-center gap-1">
                          <FiTablet className="w-3 h-3 text-purple-600 inline shrink-0" />
                          Tablet
                        </span>
                        <span className="font-black text-black text-[11px]">
                          {devices.tablet.toLocaleString("id-ID")}{" "}
                          <span className="text-gray-500 font-bold">({tabletPct}%)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF] border border-black shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-gray-700 block truncate text-[11px]">
                          Lainnya
                        </span>
                        <span className="font-black text-black text-[11px]">
                          {devices.unknown.toLocaleString("id-ID")}{" "}
                          <span className="text-gray-500 font-bold">({unknownPct}%)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card B: Pengunjung Baru vs Kembali */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-xs sm:text-sm text-black flex items-center gap-2">
                  <FiUserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pengunjung Baru vs Kembali</span>
                </h4>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                  {totalVisitors.toLocaleString("id-ID")} Unik
                </span>
              </div>

              {totalVisitors === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400">
                  Belum ada data pengunjung pada periode ini.
                </div>
              ) : (
                <>
                  {/* 100% Stacked Bar */}
                  <div
                    className="h-5 sm:h-6 w-full rounded-xl overflow-hidden border-2 border-black flex bg-gray-100 shadow-[1.5px_1.5px_0px_#000] mb-3"
                    role="img"
                    aria-label={visitorsAriaLabel}
                  >
                    {visitors.new > 0 && (
                      <div
                        style={{ width: `${(visitors.new / totalVisitors) * 100}%` }}
                        className="bg-[#34BCEE] h-full transition-all hover:opacity-90"
                        title={`Pengunjung Baru: ${visitors.new.toLocaleString("id-ID")} (${newPct}%)`}
                      />
                    )}
                    {visitors.returning > 0 && (
                      <div
                        style={{ width: `${(visitors.returning / totalVisitors) * 100}%` }}
                        className="bg-[#10B981] h-full transition-all hover:opacity-90"
                        title={`Pengunjung Kembali: ${visitors.returning.toLocaleString("id-ID")} (${returningPct}%)`}
                      />
                    )}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#34BCEE] border border-black shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-gray-700 block truncate text-[11px] flex items-center gap-1">
                          <FiUserPlus className="w-3 h-3 text-sky-600 inline" />
                          Baru
                        </span>
                        <span className="font-black text-black text-[11px]">
                          {visitors.new.toLocaleString("id-ID")}{" "}
                          <span className="text-gray-500 font-bold">({newPct}%)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-black shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-gray-700 block truncate text-[11px] flex items-center gap-1">
                          <FiUserCheck className="w-3 h-3 text-emerald-600 inline" />
                          Kembali
                        </span>
                        <span className="font-black text-black text-[11px]">
                          {visitors.returning.toLocaleString("id-ID")}{" "}
                          <span className="text-gray-500 font-bold">({returningPct}%)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 font-bold mt-3">
                    💡 Perkiraan berdasarkan IP
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Heatmap 7 Hari x 24 Jam (WIB) */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
            <div>
              <h4 className="font-black text-xs sm:text-sm text-black flex items-center gap-2">
                <FiClock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pola Waktu Kunjungan (Heatmap 7 Hari x 24 Jam)</span>
              </h4>
              <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                Intensitas trafik per jam dalam seminggu (waktu WIB)
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto text-[10px] text-gray-500 font-bold">
              <span>Kurang</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300 inline-block" />
                <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
                <span className="w-3 h-3 rounded-sm bg-amber-300 border border-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-sm bg-[#FEA02F] border border-black inline-block" />
              </div>
              <span>Padat</span>
            </div>
          </div>

          {/* Responsive Heatmap Grid Container: Scrollable horizontally internally if needed */}
          <div
            className="overflow-x-auto pb-2 focus:outline-none"
            tabIndex={0}
            role="region"
            aria-label="Heatmap intensitas kunjungan 7 hari dan 24 jam waktu WIB"
          >
            <div className="min-w-[560px] select-none">
              {/* Hour Header Row (Labeled every 3 hours: 00, 03, 06, 09, 12, 15, 18, 21) */}
              <div className="grid grid-cols-[38px_repeat(24,1fr)] gap-1 mb-1 text-center">
                <div className="text-[9px] font-bold text-gray-400">Hari</div>
                {Array.from({ length: 24 }).map((_, h) => (
                  <div
                    key={`header-h-${h}`}
                    className="text-[9px] font-mono font-bold text-gray-500"
                  >
                    {h % 3 === 0 ? String(h).padStart(2, "0") : ""}
                  </div>
                ))}
              </div>

              {/* 7 Day Rows (1=Senin s/d 7=Minggu) */}
              {[1, 2, 3, 4, 5, 6, 7].map((dow) => (
                <div
                  key={`dow-row-${dow}`}
                  className="grid grid-cols-[38px_repeat(24,1fr)] gap-1 mb-1 items-center"
                >
                  <div className="text-[10px] font-black text-gray-700 text-left truncate pr-1">
                    {DOW_SHORT_NAMES[dow]}
                  </div>

                  {Array.from({ length: 24 }).map((_, h) => {
                    const views = heatmapMap.get(`${dow}-${h}`) || 0;
                    const ratio = views > 0 ? views / maxHeatmapViews : 0;
                    const tooltip = `${DOW_SHORT_NAMES[dow]} ${String(h).padStart(2, "0")}:00 · ${views} kunjungan`;
                    const isSelected = selectedCell?.dow === dow && selectedCell?.hour === h;

                    let bgClass = "bg-gray-100/80 border-gray-200";
                    if (views > 0) {
                      if (ratio <= 0.25) {
                        bgClass = "bg-amber-100 border-amber-300";
                      } else if (ratio <= 0.5) {
                        bgClass = "bg-amber-200 border-amber-400";
                      } else if (ratio <= 0.75) {
                        bgClass = "bg-amber-300 border-amber-500";
                      } else {
                        bgClass = "bg-[#FEA02F] border-black shadow-[0.5px_0.5px_0px_#000]";
                      }
                    }

                    const selectedClass = isSelected
                      ? "ring-2 ring-black ring-offset-1 z-10 scale-110 shadow-sm"
                      : "hover:scale-105";

                    return (
                      <button
                        type="button"
                        key={`cell-${dow}-${h}`}
                        title={tooltip}
                        aria-label={tooltip}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedCell({ dow, hour: h, views })}
                        className={`h-5 sm:h-6 w-full rounded border ${bgClass} ${selectedClass} transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black flex items-center justify-center p-0`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-bold mt-2 gap-1.5">
            <span>💡 Jam 00:00 s/d 23:00 (Waktu Indonesia Barat)</span>
            {selectedCell ? (
              <span className="text-black font-black bg-amber-100 border border-black px-2 py-0.5 rounded">
                {DOW_SHORT_NAMES[selectedCell.dow]} {String(selectedCell.hour).padStart(2, "0")}:00 · {selectedCell.views.toLocaleString("id-ID")} kunjungan
              </span>
            ) : (
              <span className="text-gray-400">
                Sorot kotak untuk melihat jumlah kunjungan
              </span>
            )}
          </div>
        </div>

        {/* Row 3: Top Articles & Slow Pages (2 Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card C: Artikel Terpopuler */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-xs sm:text-sm text-black flex items-center gap-2">
                  <FiFileText className="w-4 h-4 text-primary-1 shrink-0" />
                  <span>Artikel Terpopuler</span>
                </h4>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                  {topArticles.length} Artikel
                </span>
              </div>

              {topArticles.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400">
                  Belum ada data artikel yang dikunjungi pada periode ini.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                  {topArticles.map((art, idx) => {
                    const widthPct = Math.max(4, (art.views / maxArticleViews) * 100);
                    return (
                      <div key={art.id || idx} className="py-2.5 first:pt-1 last:pb-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-mono font-black text-gray-400 w-4 shrink-0">
                              {idx + 1}.
                            </span>
                            <span
                              className="font-bold text-xs text-black truncate max-w-[200px] sm:max-w-[280px]"
                              title={art.title}
                            >
                              {art.title}
                            </span>
                          </div>
                          <span className="font-black text-xs text-black shrink-0">
                            {art.views.toLocaleString("id-ID")}{" "}
                            <span className="text-[10px] text-gray-500 font-bold">views</span>
                          </span>
                        </div>
                        {/* Thin Proportional Bar */}
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                          <div
                            style={{ width: `${widthPct}%` }}
                            className="bg-primary-1 h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Card D: Halaman Paling Lambat */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-xs sm:text-sm text-black flex items-center gap-2">
                  <FiZap className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Halaman Paling Lambat (LCP)</span>
                </h4>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                  {slowPages.length} Path
                </span>
              </div>

              {slowPages.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-emerald-600">
                  ✨ Semua halaman berkinerja baik (&lt;= 2.5s atau data sampel belum mencukupi).
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                  {slowPages.map((page, idx) => {
                    const lcpSec = (page.avg_lcp / 1000).toFixed(1);
                    let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
                    let statusLabel = "Baik";

                    if (page.avg_lcp > 4000) {
                      badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
                      statusLabel = "Buruk";
                    } else if (page.avg_lcp > 2500) {
                      badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
                      statusLabel = "Perlu Perbaikan";
                    }

                    return (
                      <div
                        key={page.path || idx}
                        className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-mono font-black text-gray-400 w-4 shrink-0">
                            {idx + 1}.
                          </span>
                          <div className="truncate">
                            <span
                              className="font-mono font-bold text-xs text-black block truncate max-w-[180px] sm:max-w-[240px]"
                              title={page.path}
                            >
                              {page.path}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold block">
                              {page.samples} sampel terukur
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-xs text-black">{lcpSec}s</span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded border ${badgeColor}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-gray-100 mt-2 text-[10px] text-gray-400 font-bold">
              Target Core Web Vitals: Baik ≤ 2.5s | Perlu Perbaikan ≤ 4.0s | Buruk &gt; 4.0s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorInsights;
