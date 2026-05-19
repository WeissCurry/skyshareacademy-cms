import { useState, useEffect } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import Sidebar from "@widgets/Sidebar";
import EditIcon from "@shared/assets/images/mascot-icons/Edit.png";
import InfoIcon from "@shared/assets/images/mascot-icons/Info Square.png";
import {
  FiUsers,
  FiActivity,
  FiZap,
  FiGlobe,
  FiExternalLink,
  FiCalendar,
  FiArrowRight,
  FiCompass,
} from "react-icons/fi";

interface TodayStats {
  pageviews: number;
  unique_visitors: number;
}

interface PerformanceStats {
  avg_load_time: number;
  avg_fcp: number;
  avg_lcp: number;
  avg_cls: number;
  avg_fid: number;
}

interface TimeSeriesPoint {
  date: string;
  pageviews: number;
  unique_visitors: number;
}

interface TopPage {
  path: string;
  views: number;
}

interface TopReferrer {
  referrer: string;
  views: number;
}

interface DashboardData {
  today: TodayStats;
  performance: PerformanceStats;
  timeSeries: TimeSeriesPoint[];
  topPages: TopPage[];
  topReferrers: TopReferrer[];
}

function DashboardSkeleton() {
  return (
    <div className="bg-background min-h-screen flex flex-col pt-12 items-center self-stretch text-black font-sans">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        {/* Sidebar remains fully visible and interactive */}
        <div>
          <Sidebar />
        </div>
        <div className="w-full animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="h-8 bg-gray-200 w-56 rounded-lg border-2 border-black"></div>
              <div className="h-4 bg-gray-200 w-80 rounded-lg mt-2 border border-black"></div>
            </div>
            <div className="h-10 bg-gray-200 w-44 rounded-xl border-2 border-black"></div>
          </div>

          {/* Connection status Skeleton */}
          <div className="h-14 bg-gray-200 border-2 border-black rounded-xl mb-6"></div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-neutral-white border-2 border-black rounded-2xl p-5 h-36 flex flex-col justify-between shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg border border-black"></div>
                  <div className="w-14 h-4 bg-gray-200 rounded-full border border-black"></div>
                </div>
                <div className="h-8 bg-gray-200 w-20 rounded-lg border border-black"></div>
                <div className="h-3 bg-gray-200 w-24 rounded border border-black"></div>
              </div>
            ))}
          </div>

          {/* Row 2 Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 h-[340px] lg:col-span-2 flex flex-col justify-between shadow-sm">
              <div className="h-11 bg-gray-200 rounded-lg border border-black"></div>
              <div className="h-[210px] bg-gray-100 rounded-lg border border-black mt-4"></div>
            </div>
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 h-[340px] flex flex-col justify-between shadow-sm">
              <div className="h-11 bg-gray-200 rounded-lg border border-black"></div>
              <div className="flex-1 flex flex-col gap-4 justify-center mt-4">
                <div className="h-9 bg-gray-200 rounded border border-black"></div>
                <div className="h-9 bg-gray-200 rounded border border-black"></div>
                <div className="h-9 bg-gray-200 rounded border border-black"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CmsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDays, setFilterDays] = useState(90);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await skyshareApi.get(`/analytics/dashboard?days=${filterDays}`);
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to load analytics dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [filterDays]);

  // Use the premium flat skeleton loader when loading
  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  // Real-time zero states
  const activeData = data || {
    today: { pageviews: 0, unique_visitors: 0 },
    performance: { avg_load_time: 0, avg_fcp: 0, avg_lcp: 0, avg_cls: 0, avg_fid: 0 },
    timeSeries: [],
    topPages: [],
    topReferrers: [],
  };

  const totalUniqueVisitors = activeData.timeSeries.reduce(
    (acc, point) => acc + point.unique_visitors,
    0
  );

  const hasData = activeData.timeSeries.length > 0;

  // SVG Chart Scaling
  const svgWidth = 800;
  const svgHeight = 250;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = (points: TimeSeriesPoint[]) => {
    if (points.length === 0) return [];
    const maxVal = Math.max(...points.map((p) => Math.max(p.pageviews, p.unique_visitors)), 1);
    
    return points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * (svgWidth - 2 * paddingX);
      const yUnique = svgHeight - paddingY - (p.unique_visitors / maxVal) * (svgHeight - 2 * paddingY);
      const yViews = svgHeight - paddingY - (p.pageviews / maxVal) * (svgHeight - 2 * paddingY);
      return { x, yUnique, yViews, ...p };
    });
  };

  const coords = getCoordinates(activeData.timeSeries);

  const generateAreaPath = (points: typeof coords, type: "unique" | "views") => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${svgHeight - paddingY}`;
    points.forEach((p) => {
      path += ` L ${p.x} ${type === "unique" ? p.yUnique : p.yViews}`;
    });
    path += ` L ${points[points.length - 1].x} ${svgHeight - paddingY} Z`;
    return path;
  };

  const generateLinePath = (points: typeof coords, type: "unique" | "views") => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${type === "unique" ? points[0].yUnique : points[0].yViews}`;
    points.forEach((p) => {
      path += ` L ${p.x} ${type === "unique" ? p.yUnique : p.yViews}`;
    });
    return path;
  };

  const getFcpStatus = (val: number) => {
    if (val === 0) return { label: "N/A", color: "bg-gray-100 text-gray-500" };
    if (val < 1800) return { label: "Cepat", color: "bg-emerald-500 text-white" };
    if (val < 3000) return { label: "Sedang", color: "bg-amber-500 text-white" };
    return { label: "Lambat", color: "bg-rose-500 text-white" };
  };

  const getLcpStatus = (val: number) => {
    if (val === 0) return { label: "N/A", color: "bg-gray-100 text-gray-500" };
    if (val < 2500) return { label: "Cepat", color: "bg-emerald-500 text-white" };
    if (val < 4000) return { label: "Sedang", color: "bg-amber-500 text-white" };
    return { label: "Lambat", color: "bg-rose-500 text-white" };
  };

  return (
    <div className="bg-background min-h-screen flex flex-col pt-12 items-center self-stretch text-black font-sans">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        {/* Embedded Sidebar Layout */}
        <div>
          <Sidebar />
        </div>

        <div className="w-full">
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="headline-1">Website Analytics</h1>
              <p className="paragraph mt-2">
                Monitor kunjungan dan performa website secara real-time.
              </p>
            </div>

            {/* High-Contrast Neobrutalist Days Selector */}
            <div className="flex items-center gap-2 bg-neutral-white border-2 border-black rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setFilterDays(7)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterDays === 7 ? "bg-primary-1 text-white border-2 border-black" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setFilterDays(30)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterDays === 30 ? "bg-primary-1 text-white border-2 border-black" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                30 Hari
              </button>
              <button
                onClick={() => setFilterDays(90)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterDays === 90 ? "bg-primary-1 text-white border-2 border-black" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                90 Hari
              </button>
            </div>
          </div>

          {/* Connection Status indicator - Short & sweet */}
          <div className="mb-6 bg-neutral-white border-2 border-black rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-black"></span>
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                  Koneksi Real-time Aktif
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {totalUniqueVisitors === 0
                    ? "Menunggu data masuk dari website Next.js."
                    : "Menampilkan data kunjungan riil siswa & orang tua."}
                </span>
              </div>
            </div>
            
            <div className="text-[11px] text-primary-1 font-bold underline cursor-help self-start sm:self-auto">
              💡 Buka website Next.js untuk memicu traffic baru!
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Card 1 */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 hover:bg-gray-50/30 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-blue-100 border border-black text-blue-700 p-2 rounded-xl">
                  <FiUsers className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-black">
                  Hari Ini
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight">{activeData.today.unique_visitors}</h3>
              <p className="text-gray-500 text-xs font-bold mt-1">Pengunjung Unik</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-gray-500 text-[10px] font-bold">
                <span>Pageviews:</span>
                <span className="text-black font-black">{activeData.today.pageviews}</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 hover:bg-gray-50/30 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-purple-100 border border-black text-purple-700 p-2 rounded-xl">
                  <FiActivity className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-black">
                  {filterDays} Hari
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight">{totalUniqueVisitors}</h3>
              <p className="text-gray-500 text-xs font-bold mt-1">Total Kunjungan</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-gray-500 text-[10px] font-bold">
                <span>Rerata Harian:</span>
                <span className="text-black font-black">
                  {activeData.timeSeries.length > 0
                    ? Math.round(totalUniqueVisitors / activeData.timeSeries.length)
                    : 0}
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 hover:bg-gray-50/30 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-emerald-100 border border-black text-emerald-700 p-2 rounded-xl">
                  <FiZap className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-black">
                  Speed
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight">
                {activeData.performance.avg_load_time > 0
                  ? `${(activeData.performance.avg_load_time / 1000).toFixed(2)}s`
                  : "0.00s"}
              </h3>
              <p className="text-gray-500 text-xs font-bold mt-1">Kecepatan Muat</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-gray-500 text-[10px] font-bold">
                <span>Paint Awal (FCP):</span>
                <span className="text-black font-black">
                  {activeData.performance.avg_fcp > 0
                    ? `${(activeData.performance.avg_fcp / 1000).toFixed(2)}s`
                    : "0.00s"}
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 hover:bg-gray-50/30 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-amber-100 border border-black text-amber-700 p-2 rounded-xl">
                  <FiGlobe className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-black">
                  Layout
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight">
                {activeData.performance.avg_cls.toFixed(3)}
              </h3>
              <p className="text-gray-500 text-xs font-bold mt-1">Stabilitas (CLS)</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-gray-500 text-[10px] font-bold">
                <span>Respon Sentuh:</span>
                <span className="text-black font-black">{activeData.performance.avg_fid}ms</span>
              </div>
            </div>
          </div>

          {/* Row 2: SVG Chart and Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* SVG Interactive Chart Box */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="bg-background flex flex-col sm:flex-row justify-between sm:items-center rounded-xl py-3 px-4 mb-4 gap-2 border-2 border-black">
                  <div className="flex items-center gap-3">
                    <img className="w-5" src={EditIcon} alt="" />
                    <h4 className="headline-4">Tren Pengunjung</h4>
                  </div>
                  {hasData && (
                    <div className="flex gap-3 text-[10px] font-bold self-start sm:self-auto">
                      <span className="flex items-center gap-1 text-blue-600">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block border border-black"></span>
                        Kunjungan
                      </span>
                      <span className="flex items-center gap-1 text-purple-600">
                        <span className="w-2.5 h-2.5 bg-purple-500 rounded-full inline-block border border-black"></span>
                        Pageviews
                      </span>
                    </div>
                  )}
                </div>

                {/* Empty State placeholder */}
                {!hasData ? (
                  <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 text-center p-6 my-2">
                    <FiActivity className="w-10 h-10 text-gray-400 mb-3 animate-pulse" />
                    <h5 className="font-bold text-sm text-neutral-800">Menunggu Kunjungan Pertama...</h5>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Belum ada data traffic masuk. Buka website Next.js Anda untuk melihat visualisasi data real-time!
                    </p>
                  </div>
                ) : (
                  /* SVG Area Chart */
                  <div className="relative pt-2 overflow-x-auto">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[550px]">
                      <defs>
                        <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
                      <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
                      <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#000" strokeWidth={1.5} />

                      <path d={generateAreaPath(coords, "unique")} fill="url(#uniqueGrad)" />
                      <path d={generateAreaPath(coords, "views")} fill="url(#viewsGrad)" />

                      <path d={generateLinePath(coords, "unique")} fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      <path d={generateLinePath(coords, "views")} fill="none" stroke="#a855f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />

                      {coords.map((p, i) => (
                        <g
                          key={i}
                          onMouseEnter={() => setHoveredPoint(i)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          className="cursor-pointer"
                        >
                          <rect x={p.x - 12} y={0} width={24} height={svgHeight} fill="transparent" />
                          {hoveredPoint === i && (
                            <line x1={p.x} y1={paddingY} x2={p.x} y2={svgHeight - paddingY} stroke="#000" strokeWidth={1.5} strokeDasharray="4 4" />
                          )}
                          <circle cx={p.x} cy={p.yUnique} r={hoveredPoint === i ? 6 : 4} fill="#3b82f6" stroke="#000" strokeWidth={2} />
                          <circle cx={p.x} cy={p.yViews} r={hoveredPoint === i ? 5.5 : 3.5} fill="#a855f7" stroke="#000" strokeWidth={1.5} />
                        </g>
                      ))}
                    </svg>

                    {hoveredPoint !== null && coords[hoveredPoint] && (
                      <div
                        className="absolute bg-neutral-white border-2 border-black shadow-sm rounded-xl p-3 text-[11px] font-bold pointer-events-none transition-all z-20"
                        style={{
                          left: `${Math.min(
                            Math.max(coords[hoveredPoint].x - 60, 10),
                            svgWidth - 145
                          )}px`,
                          top: `${Math.max(coords[hoveredPoint].yUnique - 80, 10)}px`,
                        }}
                      >
                        <p className="text-gray-500 mb-1 flex items-center gap-1">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {new Date(coords[hoveredPoint].date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-blue-600 flex justify-between gap-4">
                            <span>Unik:</span>
                            <span>{coords[hoveredPoint].unique_visitors}</span>
                          </span>
                          <span className="text-purple-600 flex justify-between gap-4">
                            <span>Views:</span>
                            <span>{coords[hoveredPoint].pageviews}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {hasData && (
                <div className="border-t border-gray-100 pt-3 flex justify-between text-[10px] text-gray-500 font-bold mt-4">
                  <span>📅 Mulai: {new Date(activeData.timeSeries[0]?.date).toLocaleDateString("id-ID")}</span>
                  <span>📅 Akhir: {new Date(activeData.timeSeries[activeData.timeSeries.length - 1]?.date).toLocaleDateString("id-ID")}</span>
                </div>
              )}
            </div>

            {/* Performance Panel */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="bg-background flex items-center gap-3 rounded-xl py-3 px-4 mb-4 border-2 border-black">
                  <img className="w-5" src={InfoIcon} alt="" />
                  <h4 className="headline-4">Kinerja Website</h4>
                </div>

                <div className="flex flex-col gap-5 mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-gray-700">FCP (Paint Awal)</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border border-black ${getFcpStatus(activeData.performance.avg_fcp).color}`}>
                        {getFcpStatus(activeData.performance.avg_fcp).label}
                      </span>
                    </div>
                    <div className="w-full bg-background border-2 border-black h-3 rounded-full overflow-hidden p-[1px]">
                      <div
                        style={{ width: `${activeData.performance.avg_fcp > 0 ? Math.min((activeData.performance.avg_fcp / 3500) * 100, 100) : 0}%` }}
                        className={`h-full rounded-full transition-all ${
                          activeData.performance.avg_fcp < 1800 ? "bg-emerald-500" : activeData.performance.avg_fcp < 3000 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-gray-700">LCP (Konten Utama)</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border border-black ${getLcpStatus(activeData.performance.avg_lcp).color}`}>
                        {getLcpStatus(activeData.performance.avg_lcp).label}
                      </span>
                    </div>
                    <div className="w-full bg-background border-2 border-black h-3 rounded-full overflow-hidden p-[1px]">
                      <div
                        style={{ width: `${activeData.performance.avg_lcp > 0 ? Math.min((activeData.performance.avg_lcp / 5000) * 100, 100) : 0}%` }}
                        className={`h-full rounded-full transition-all ${
                          activeData.performance.avg_lcp < 2500 ? "bg-emerald-500" : activeData.performance.avg_lcp < 4000 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-gray-700">FID (Respon Sentuh)</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border border-black ${activeData.performance.avg_fid > 0 ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {activeData.performance.avg_fid > 0 ? "Cepat" : "N/A"}
                      </span>
                    </div>
                    <div className="w-full bg-background border-2 border-black h-3 rounded-full overflow-hidden p-[1px]">
                      <div
                        style={{ width: `${activeData.performance.avg_fid > 0 ? Math.min((activeData.performance.avg_fid / 150) * 100, 100) : 0}%` }}
                        className="h-full rounded-full bg-emerald-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-background border-2 border-black rounded-xl p-3 flex gap-2.5 text-[10px] text-gray-600 leading-relaxed font-bold">
                <FiCompass className="w-5 h-5 flex-shrink-0 text-primary-1 mt-0.5" />
                <div>
                  <span className="text-black block mb-0.5 font-black">Kecepatan Ideal</span>
                  Indikator hijau menunjukkan kecepatan muat ideal bagi kenyamanan pengunjung.
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Insights Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Pages Table Box */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 shadow-sm">
              <div className="bg-background flex justify-between items-center rounded-xl py-3 px-4 mb-4 border-2 border-black">
                <div className="flex items-center gap-3">
                  <FiGlobe className="w-5 h-5 text-primary-1" />
                  <h4 className="headline-4">Halaman Terpopuler</h4>
                </div>
                <FiArrowRight className="text-gray-400 w-5 h-5" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-gray-500 font-bold border-b border-gray-200 pb-3">
                      <th className="pb-3 w-3/4">URL Path</th>
                      <th className="pb-3 text-right">Kunjungan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.topPages.length > 0 ? (
                      activeData.topPages.map((page, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-all">
                          <td className="py-3 font-bold text-gray-700 truncate max-w-[210px] flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 w-4 inline-block font-black">{index + 1}.</span>
                            <code className="text-[10px] text-primary-1 bg-background border border-gray-200 px-2 py-0.5 rounded font-mono font-bold">
                              {page.path}
                            </code>
                          </td>
                          <td className="py-3 text-right font-black text-black">{page.views.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center py-6 text-gray-500 font-bold">
                          Belum ada kunjungan terekam.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Referrer Table Box */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 shadow-sm">
              <div className="bg-background flex justify-between items-center rounded-xl py-3 px-4 mb-4 border-2 border-black">
                <div className="flex items-center gap-3">
                  <FiExternalLink className="w-5 h-5 text-primary-1" />
                  <h4 className="headline-4">Sumber Traffic</h4>
                </div>
                <FiExternalLink className="text-gray-400 w-5 h-5" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-gray-500 font-bold border-b border-gray-200 pb-3">
                      <th className="pb-3 w-3/4">Sumber Referensi</th>
                      <th className="pb-3 text-right">Kunjungan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.topReferrers.length > 0 ? (
                      activeData.topReferrers.map((ref, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-all">
                          <td className="py-3 font-bold text-gray-700 flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 w-4 inline-block font-black">{index + 1}.</span>
                            <span className="text-black font-black">{ref.referrer}</span>
                          </td>
                          <td className="py-3 text-right font-black text-black">{ref.views.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center py-6 text-gray-500 font-bold">
                          Belum ada data referensi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
