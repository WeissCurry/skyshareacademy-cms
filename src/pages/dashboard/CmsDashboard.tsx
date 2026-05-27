import { useState, useEffect, useCallback } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import EditIcon from "@shared/assets/images/mascot-icons/Edit.png";
import InfoIcon from "@shared/assets/images/mascot-icons/Info Square.png";
import {
  FiUsers,
  FiActivity,
  FiZap,
  FiGlobe,
  FiExternalLink,
  FiArrowRight,
  FiCompass,
  FiRefreshCw,
  FiMaximize2,
  FiX,
  FiSearch,
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

interface ProvinceStat {
  province: string;
  visitors: number;
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
  provinces?: ProvinceStat[];
}

function DashboardSkeleton() {
  return (
    <div className="bg-background min-h-screen flex flex-col pt-12 items-center self-stretch text-black font-sans">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        {/* Sidebar remains fully visible and interactive */}
        <div className="self-start">
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
  const [svgContent, setSvgContent] = useState<string>("");
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  // Load idmap.svg statically on mount
  useEffect(() => {
    fetch("/idmap.svg")
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch((err) => console.error("Failed to load idmap.svg:", err));
  }, []);

  // Dynamically color active provinces in the SVG based on visitor stats
  useEffect(() => {
    if (!svgContent || !data) return;

    // Standardize and sanitize provinces list to avoid NaN or crash errors
    const provData = (data.provinces || []).map((p) => ({
      province: p?.province || "",
      visitors: Number(p?.visitors) || 0,
    }));
    const maxVisitors = Math.max(...provData.map((p) => p.visitors), 1);

    const mapContainers = document.querySelectorAll(".inline-svg-map-container");

    mapContainers.forEach((container) => {
      const svgEl = container.querySelector("#features");
      if (svgEl) {
        const paths = svgEl.getElementsByTagName("path");
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const provName = path.getAttribute("name");

          const match = provData.find(
            (p) => p && p.province && p.province.toLowerCase() === (provName || "").trim().toLowerCase()
          );

          const hasVisitors = match && match.visitors > 0;

          // Determine base styling (heat map scale: deeper orange/jingga for more visitors)
          let baseFill = "#EFEFEF"; // 0 visitors (gray)
          let baseStroke = "#cccccc";
          let baseStrokeWidth = "0.5";

          if (hasVisitors) {
            const intensity = match.visitors / maxVisitors;
            baseStroke = "#000000";
            baseStrokeWidth = "1";

            // 4-step vibrant color scale representing visitor density (makin banyak makin pekat jingga)
            if (intensity <= 0.25) {
              baseFill = "#FFEBD1"; // very soft light warm peach
            } else if (intensity <= 0.5) {
              baseFill = "#FFC583"; // soft warm gold/orange
            } else if (intensity <= 0.75) {
              baseFill = "#FEA02F"; // standard vibrant orange (jingga)
            } else {
              baseFill = "#D85300"; // deep rich neobrutalist dark orange/jingga
            }
          }

          // Set base attributes
          path.setAttribute("fill", baseFill);
          path.setAttribute("fill-opacity", "1");
          path.setAttribute("stroke", baseStroke);
          path.setAttribute("stroke-width", baseStrokeWidth);
          path.style.cursor = "default"; // remove pointer since it's no longer interactive

          // Remove native tooltips
          const titleEl = path.getElementsByTagName("title")[0];
          if (titleEl) path.removeChild(titleEl);
        }
      }
    });
  }, [svgContent, data, isFullscreenMapOpen]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await skyshareApi.get(`/analytics/dashboard?days=${filterDays}`);
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to load analytics dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [filterDays]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

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
    provinces: [],
  };

  const filteredProvinces = (activeData.provinces || []).filter((prov) =>
    prov.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUniqueVisitors = activeData.timeSeries.reduce(
    (acc, point) => acc + point.unique_visitors,
    0
  );

  const hasData = activeData.timeSeries.length > 0;

  // Always pad the chart to show exactly N points (7, 30, or 90) representing each day in the range
  const chartPoints = (() => {
    const points: TimeSeriesPoint[] = [];
    const dateMap = new Map<string, TimeSeriesPoint>();
    
    // Index existing records from the backend by YYYY-MM-DD
    (activeData.timeSeries || []).forEach((p) => {
      try {
        const key = new Date(p.date).toISOString().split("T")[0];
        dateMap.set(key, p);
      } catch {
        dateMap.set(p.date, p);
      }
    });

    for (let i = 0; i < filterDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (filterDays - 1 - i));
      const dateStr = d.toISOString().split("T")[0];
      
      const existing = dateMap.get(dateStr);
      if (existing) {
        points.push({
          ...existing,
          date: dateStr,
        });
      } else {
        points.push({
          date: dateStr,
          pageviews: 0,
          unique_visitors: 0,
        });
      }
    }
    return points;
  })();

  // SVG Chart Scaling
  const svgWidth = 800;
  const svgHeight = 250;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = (points: TimeSeriesPoint[]) => {
    if (points.length === 0) return [];
    const maxUnique = Math.max(...points.map((p) => p.unique_visitors), 1);
    const maxViews = Math.max(...points.map((p) => p.pageviews), 1);

    if (points.length === 1) {
      const p = points[0];
      const x = svgWidth / 2;
      const yUnique = svgHeight - paddingY - (p.unique_visitors / maxUnique) * (svgHeight - 2 * paddingY);
      const yViews = svgHeight - paddingY - (p.pageviews / maxViews) * (svgHeight - 2 * paddingY);
      return [{ x, yUnique, yViews, ...p }];
    }

    return points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * (svgWidth - 2 * paddingX);
      const yUnique = svgHeight - paddingY - (p.unique_visitors / maxUnique) * (svgHeight - 2 * paddingY);
      const yViews = svgHeight - paddingY - (p.pageviews / maxViews) * (svgHeight - 2 * paddingY);
      return { x, yUnique, yViews, ...p };
    });
  };

  const coords = getCoordinates(chartPoints);

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
        <div className="self-start">
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
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${filterDays === 7 ? "bg-primary-1 text-white border-2 border-black" : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setFilterDays(30)}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${filterDays === 30 ? "bg-primary-1 text-white border-2 border-black" : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                30 Hari
              </button>
              <button
                onClick={() => setFilterDays(90)}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${filterDays === 90 ? "bg-primary-1 text-white border-2 border-black" : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                90 Hari
              </button>
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
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between shadow-sm">
              <div>
                <div className="bg-background flex flex-col sm:flex-row justify-between sm:items-center rounded-xl py-3 px-4 mb-4 gap-2 border-2 border-black">
                  <div className="flex items-center gap-3">
                    <img className="w-5" src={EditIcon} alt="" />
                    <h4 className="headline-4">Tren Pengunjung ({filterDays} Hari)</h4>
                    {!hasData && (
                      <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-black animate-pulse">
                        Preview (Data Kosong)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-[10px] font-bold self-start sm:self-auto">
                    <span className="flex items-center gap-1 text-secondary-1">
                      <span className="w-2.5 h-2.5 bg-secondary-1 rounded-full inline-block border border-black"></span>
                      Kunjungan
                    </span>
                    <span className="flex items-center gap-1 text-primary-1">
                      <span className="w-2.5 h-2.5 bg-primary-1 rounded-full inline-block border border-black"></span>
                      Pageviews
                    </span>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="relative pt-2">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                    <defs>
                      <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34BCEE" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#34BCEE" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FEA02F" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#FEA02F" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
                    <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
                    <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#000" strokeWidth={1.5} />

                    <path d={generateAreaPath(coords, "unique")} fill="url(#uniqueGrad)" />
                    <path d={generateAreaPath(coords, "views")} fill="url(#viewsGrad)" />

                    <path d={generateLinePath(coords, "unique")} fill="none" stroke="#34BCEE" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    <path d={generateLinePath(coords, "views")} fill="none" stroke="#FEA02F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />

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
                        <circle cx={p.x} cy={p.yUnique} r={hoveredPoint === i ? 6 : 4} fill="#34BCEE" stroke="#000" strokeWidth={2} />
                        <circle cx={p.x} cy={p.yViews} r={hoveredPoint === i ? 6 : 4} fill="#FEA02F" stroke="#000" strokeWidth={2} />
                      </g>
                    ))}

                    {/* Native SVG Tooltip (Scales perfectly and never gets cropped) */}
                    {hoveredPoint !== null && coords[hoveredPoint] && (() => {
                      const p = coords[hoveredPoint];
                      const tooltipX = Math.min(Math.max(p.x, 70), svgWidth - 70);
                      const tooltipY = Math.max(Math.min(p.yUnique, p.yViews) - 85, 10);
                      return (
                        <g pointerEvents="none">
                          {/* Shadow Offset Rect for Neobrutalist look */}
                          <rect
                            x={tooltipX - 56}
                            y={tooltipY + 4}
                            width={120}
                            height={70}
                            rx={10}
                            fill="#000000"
                          />
                          {/* Foreground White Rect */}
                          <rect
                            x={tooltipX - 60}
                            y={tooltipY}
                            width={120}
                            height={70}
                            rx={10}
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth={2}
                          />
                          {/* Date text */}
                          <text
                            x={tooltipX}
                            y={tooltipY + 18}
                            textAnchor="middle"
                            fontSize={10}
                            fontFamily="sans-serif"
                            fontWeight="bold"
                            fill="#6b7280"
                          >
                            {new Date(p.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </text>
                          {/* Unik label & value */}
                          <text
                            x={tooltipX - 45}
                            y={tooltipY + 38}
                            textAnchor="start"
                            fontSize={11}
                            fontFamily="sans-serif"
                            fontWeight="bold"
                            fill="#34BCEE"
                          >
                            Unik:
                          </text>
                          <text
                            x={tooltipX + 45}
                            y={tooltipY + 38}
                            textAnchor="end"
                            fontSize={11}
                            fontFamily="sans-serif"
                            fontWeight="black"
                            fill="#34BCEE"
                          >
                            {p.unique_visitors}
                          </text>
                          {/* Views label & value */}
                          <text
                            x={tooltipX - 45}
                            y={tooltipY + 54}
                            textAnchor="start"
                            fontSize={11}
                            fontFamily="sans-serif"
                            fontWeight="bold"
                            fill="#FEA02F"
                          >
                            Views:
                          </text>
                          <text
                            x={tooltipX + 45}
                            y={tooltipY + 54}
                            textAnchor="end"
                            fontSize={11}
                            fontFamily="sans-serif"
                            fontWeight="black"
                            fill="#FEA02F"
                          >
                            {p.pageviews}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-[10px] text-gray-500 font-bold mt-4">
                <span>📅 Mulai: {new Date(chartPoints[0]?.date).toLocaleDateString("id-ID")}</span>
                <span>📅 Akhir: {new Date(chartPoints[chartPoints.length - 1]?.date).toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            {/* Performance Panel */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="bg-background flex items-center justify-between gap-1 rounded-xl py-2 px-2 mb-4 border-2 border-black">
                  <div className="flex items-center gap-1 min-w-0">
                    <img className="w-4 flex-shrink-0" src={InfoIcon} alt="" />
                    <h4 className="font-bold text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Performa</h4>
                  </div>
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="p-1 bg-white border border-black rounded-md hover:bg-gray-50 active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Perbarui Metrik"
                  >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  </button>
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
                        className={`h-full rounded-full transition-all ${activeData.performance.avg_fcp < 1800 ? "bg-emerald-500" : activeData.performance.avg_fcp < 3000 ? "bg-amber-500" : "bg-rose-500"
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
                        className={`h-full rounded-full transition-all ${activeData.performance.avg_lcp < 2500 ? "bg-emerald-500" : activeData.performance.avg_lcp < 4000 ? "bg-amber-500" : "bg-rose-500"
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

          {/* Row 3: Geographical Map and Province Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Province Distribution Table Card */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-[380px]">
              <div>
                <div className="bg-background flex justify-between items-center rounded-xl py-2 px-3 mb-4 border-2 border-black">
                  <div className="flex items-center gap-2 min-w-0">
                    <FiUsers className="w-4 h-4 flex-shrink-0 text-primary-1" />
                    <h4 className="font-bold text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Distribusi Wilayah ({filterDays} Hari)</h4>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[240px] pr-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-gray-500 font-bold border-b border-gray-200 pb-3">
                        <th className="pb-3 w-3/4">Provinsi / Wilayah</th>
                        <th className="pb-3 text-right">Pengunjung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeData.provinces && activeData.provinces.length > 0 ? (
                        activeData.provinces.map((prov, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-all">
                            <td className="py-2.5 font-bold text-gray-700 flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 w-4 inline-block font-black">{index + 1}.</span>
                              <span className="text-black font-black truncate max-w-[150px]">{prov.province}</span>
                            </td>
                            <td className="py-2.5 text-right font-black text-black">{prov.visitors.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-12 text-gray-500 font-bold">
                            Belum ada data distribusi wilayah.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 bg-background border border-black rounded-xl p-2.5 flex gap-2 text-[9px] text-gray-600 leading-relaxed font-bold">
                <FiCompass className="w-4 h-4 flex-shrink-0 text-primary-1 mt-0.5" />
                <div>
                  Kategori "Luar Negeri" mencakup akses VPN, IP luar negeri, atau proxy terenkripsi.
                </div>
              </div>
            </div>

            {/* Indonesia Map Card */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between shadow-sm min-h-[380px]">
              <div>
                <div className="bg-background flex items-center justify-between gap-3 rounded-xl py-3 px-4 mb-4 border-2 border-black">
                  <div className="flex items-center gap-3">
                    <FiGlobe className="w-5 h-5 text-primary-1" />
                    <h4 className="headline-4">Geografis Pengunjung ({filterDays} Hari)</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullscreenMapOpen(true)}
                      className="p-2 bg-white border border-black rounded-lg hover:bg-gray-100 active:translate-x-[1.5px] active:translate-y-[1.5px] transition-all flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] active:shadow-none"
                      title="Perbesar Layar Peta"
                    >
                      <FiMaximize2 className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>

                {/* Inline SVG Map Render */}
                <div className="relative pt-2 flex items-center justify-center min-h-[220px] overflow-hidden">
                  {svgContent ? (
                    <div
                      className="w-full h-auto max-w-[480px] inline-svg-map-container"
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <div className="text-gray-400 font-bold py-12">Memuat Peta Geografis...</div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-[10px] text-gray-500 font-bold mt-4">
                <span>💡 Sorot provinsi untuk melihat jumlah pengunjung spesifik.</span>
                <span>🇮🇩 Peta Jangkauan Indonesia</span>
              </div>
            </div>
          </div>

          {/* Row 4: Insights Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Top Pages Table Box */}
            <div className="bg-neutral-white border-2 border-black rounded-2xl p-5 shadow-sm">
              <div className="bg-background flex justify-between items-center rounded-xl py-3 px-4 mb-4 border-2 border-black">
                <div className="flex items-center gap-3">
                  <FiGlobe className="w-5 h-5 text-primary-1" />
                  <h4 className="headline-4">Halaman Terpopuler ({filterDays} Hari)</h4>
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
                  <h4 className="headline-4">Sumber Traffic ({filterDays} Hari)</h4>
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
      <LoadingModal isLoading={loading && !!data} message="Memperbarui Data..." />

      <style>{`
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalContentIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-backdrop-in {
          animation: modalBackdropIn 0.2s ease-out forwards;
        }
        .animate-modal-in {
          animation: modalContentIn 0.28s cubic-bezier(0.34, 1.6, 0.64, 1) forwards;
        }
      `}</style>

      {/* Fullscreen Interactive Modal */}
      {isFullscreenMapOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-backdrop-in"
          onClick={() => {
            setIsFullscreenMapOpen(false);
            setSearchQuery("");
          }}
        >
          <div
            className="bg-background border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-[1250px] h-[90vh] flex flex-col justify-between animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 text-black">
                  <FiGlobe className="w-5 h-5 md:w-6 md:h-6 text-primary-1" />
                  Analisis Geografis Pengunjung ({filterDays} Hari Terakhir)
                </h2>
                <p className="text-gray-500 text-xs font-bold mt-1">
                  Visualisasi jangkauan akses dan statistik pengunjung per wilayah Indonesia.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFullscreenMapOpen(false);
                  setSearchQuery("");
                }}
                className="p-1.5 md:p-2 bg-white border-2 border-black rounded-xl hover:bg-rose-50 hover:text-rose-600 active:translate-x-[1.5px] active:translate-y-[1.5px] transition-all shadow-[2px_2px_0px_#000] active:shadow-none"
              >
                <FiX className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Modal Grid Body */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
              {/* Kolom Kiri: Peta SVG Interaktif */}
              <div className="lg:col-span-2 bg-white border-2 border-black rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-full">
                <div className="absolute top-4 left-4 bg-background border border-black rounded-lg px-2.5 py-1 text-[9px] font-black uppercase text-gray-500">
                  PETA INTERAKTIF
                </div>
                <div
                  className="w-full h-full max-h-[85%] flex items-center justify-center inline-svg-map-container"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
                <div className="absolute bottom-4 left-4 text-[10px] text-gray-500 font-bold">
                  💡 Arahkan kursor ke wilayah untuk melihat detail pengunjung.
                </div>
              </div>

              {/* Kolom Rerata/Kanan: Tabel Distribusi Detail dengan Pencarian */}
              <div className="bg-white border-2 border-black rounded-2xl p-5 flex flex-col h-full overflow-hidden">
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari provinsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-background border-2 border-black rounded-xl focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000] focus:shadow-none transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-gray-500 font-bold border-b border-gray-200 pb-3 sticky top-0 bg-white z-10">
                        <th className="pb-3 w-3/4">Provinsi / Wilayah</th>
                        <th className="pb-3 text-right">Pengunjung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProvinces && filteredProvinces.length > 0 ? (
                        filteredProvinces.map((prov, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-all">
                            <td className="py-2.5 font-bold text-gray-700 flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 w-4 inline-block font-black">{index + 1}.</span>
                              <span className="text-black font-black truncate">{prov.province}</span>
                            </td>
                            <td className="py-2.5 text-right font-black text-black">
                              {prov.visitors.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-12 text-gray-500 font-bold">
                            Provinsi "{searchQuery}" tidak ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t-2 border-black mt-4 flex justify-between items-center text-[10px] text-gray-500 font-bold">
              <span>🇮🇩 Data Wilayah Indonesia ({filterDays} Hari Terakhir)</span>
              <span>Total: {activeData.provinces?.length || 0} Provinsi Tercatat</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
