import React, { useState, useId, useCallback, useRef, useEffect } from "react";
import { toLocalDateKey } from "../utils/dateUtils";

export interface TimeSeriesPoint {
  date: string;
  pageviews: number;
  unique_visitors: number;
}

export interface TrendChartProps {
  points: TimeSeriesPoint[];
  height?: number;
  dense?: boolean;
  onPointFocus?: (point: TimeSeriesPoint | null, index: number | null) => void;
  className?: string;
  filterDays?: number;
}

/**
 * Generates nice round tick marks based on 1, 2, 5 x 10^n steps
 * targeting 4 to 5 ticks (e.g. 0, 100, 200, 300, 400).
 */
function calculateNiceTicks(
  rawMax: number,
  targetTicks = 4
): { ticks: number[]; maxTick: number } {
  if (rawMax <= 0) {
    return { ticks: [0, 1, 2, 3, 4], maxTick: 4 };
  }

  const rawStep = rawMax / targetTicks;
  const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const fraction = rawStep / power;

  let niceFraction = 1;
  if (fraction <= 1.0) {
    niceFraction = 1;
  } else if (fraction <= 2.0) {
    niceFraction = 2;
  } else if (fraction <= 5.0) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }

  const step = Math.max(1, Math.round(niceFraction * power));
  let maxTick = Math.ceil(rawMax / step) * step;
  if (maxTick / step < 3) {
    maxTick = step * 3;
  }

  const ticks: number[] = [];
  for (let val = 0; val <= maxTick; val += step) {
    ticks.push(val);
  }

  return { ticks, maxTick: ticks[ticks.length - 1] };
}

/**
 * Format Y-axis tick numbers in id-ID format:
 * - >= 1.000.000 -> "jt" (e.g. 1,5 jt)
 * - >= 1.000 -> "rb" (e.g. 1,5 rb)
 * - < 1.000 -> raw formatted number
 */
function formatYTick(val: number): string {
  if (val >= 1000000) {
    const formatted = (val / 1000000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `${formatted} jt`;
  }
  if (val >= 1000) {
    const formatted = (val / 1000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `${formatted} rb`;
  }
  return val.toLocaleString("id-ID");
}

/**
 * Format date in Indonesian locale (e.g., '14 Nov').
 */
function formatXDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Determine X-axis tick indices:
 * - On narrow screens (< 480px): reduce to 3-4 ticks to prevent crowding
 * - On wider screens: 6 to 8 evenly spaced ticks (or all if <= 7)
 */
function getXAxisTickIndices(totalPoints: number, isNarrow = false): number[] {
  if (totalPoints <= (isNarrow ? 3 : 7)) {
    return Array.from({ length: totalPoints }, (_, i) => i);
  }
  const targetTicks = isNarrow
    ? totalPoints <= 7
      ? 3
      : 4
    : totalPoints <= 31
    ? 6
    : 7;
  const indices: number[] = [0];
  const step = (totalPoints - 1) / (targetTicks - 1);
  for (let i = 1; i < targetTicks - 1; i++) {
    indices.push(Math.round(i * step));
  }
  indices.push(totalPoints - 1);
  return Array.from(new Set(indices)).sort((a, b) => a - b);
}

export const TrendChart: React.FC<TrendChartProps> = ({
  points = [],
  height = 250,
  dense,
  onPointFocus,
  className = "",
}) => {
  const chartInstanceId = useId().replace(/:/g, "_");
  const uniqueGradId = `uniqueGrad_${chartInstanceId}`;
  const viewsGradId = `viewsGrad_${chartInstanceId}`;

  // Interactive Series Visibility (at least one must stay active)
  const [showUnique, setShowUnique] = useState(true);
  const [showViews, setShowViews] = useState(true);

  // Focus & Hover state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor container width to reduce X axis labels on narrow screens (< 480px)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsNarrow(entry.contentRect.width < 480);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : focusedIndex;

  // Toggle series with invariant: minimum one series must stay active
  const handleToggleSeries = (type: "unique" | "views") => {
    if (type === "unique") {
      if (showUnique && !showViews) return; // Keep at least one active
      setShowUnique((prev) => !prev);
    } else {
      if (showViews && !showUnique) return; // Keep at least one active
      setShowViews((prev) => !prev);
    }
  };

  // Notify parent on point focus
  useEffect(() => {
    if (onPointFocus) {
      if (activeIndex !== null && points[activeIndex]) {
        onPointFocus(points[activeIndex], activeIndex);
      } else {
        onPointFocus(null, null);
      }
    }
  }, [activeIndex, points, onPointFocus]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (points.length === 0) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev === null ? points.length - 1 : Math.max(0, prev - 1)
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev === null ? 0 : Math.min(points.length - 1, prev + 1)
        );
      } else if (e.key === "Escape") {
        e.preventDefault();
        setHoveredIndex(null);
        setFocusedIndex(null);
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusedIndex(points.length - 1);
      }
    },
    [points.length]
  );

  // SVG Dimension Constants
  const svgWidth = 800;
  const svgHeight = height;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 22;
  const paddingBottom = 32;

  const plotX = paddingLeft;
  const plotWidth = Math.max(10, svgWidth - paddingLeft - paddingRight);
  const plotY = paddingTop;
  const plotHeight = Math.max(10, svgHeight - paddingTop - paddingBottom);

  // Density rule: if points > 31, hide circles unless hovered/focused
  const isDense = dense !== undefined ? dense : points.length > 31;

  // Identify today's date using local calendar key (timezone-safe)
  const todayStr = toLocalDateKey(new Date());
  const todayIndex = points.findIndex((p) => toLocalDateKey(p.date) === todayStr);

  // Calculate Unified Max & Nice Ticks across visible series
  const rawMax = Math.max(
    ...points.flatMap((p) => [
      showUnique ? p.unique_visitors || 0 : 0,
      showViews ? p.pageviews || 0 : 0,
    ]),
    1
  );

  const { ticks, maxTick } = calculateNiceTicks(rawMax);

  // Coordinate Calculations
  const getCoordinates = () => {
    if (points.length === 0) return [];

    if (points.length === 1) {
      const p = points[0];
      const x = plotX + plotWidth / 2;
      const yUnique = plotY + plotHeight - (p.unique_visitors / maxTick) * plotHeight;
      const yViews = plotY + plotHeight - (p.pageviews / maxTick) * plotHeight;
      return [{ x, yUnique, yViews, ...p }];
    }

    return points.map((p, i) => {
      const x = plotX + (i / (points.length - 1)) * plotWidth;
      const yUnique =
        plotY + plotHeight - (Math.max(0, p.unique_visitors) / maxTick) * plotHeight;
      const yViews =
        plotY + plotHeight - (Math.max(0, p.pageviews) / maxTick) * plotHeight;
      return { x, yUnique, yViews, ...p };
    });
  };

  const coords = getCoordinates();

  // Generate Area & Line SVG Path Data
  const generateAreaPath = (type: "unique" | "views") => {
    if (coords.length === 0) return "";
    const baselineY = plotY + plotHeight;
    let path = `M ${coords[0].x} ${baselineY}`;
    coords.forEach((p) => {
      path += ` L ${p.x} ${type === "unique" ? p.yUnique : p.yViews}`;
    });
    path += ` L ${coords[coords.length - 1].x} ${baselineY} Z`;
    return path;
  };

  const generateLinePath = (type: "unique" | "views") => {
    if (coords.length === 0) return "";
    let path = `M ${coords[0].x} ${type === "unique" ? coords[0].yUnique : coords[0].yViews}`;
    coords.forEach((p) => {
      path += ` L ${p.x} ${type === "unique" ? p.yUnique : p.yViews}`;
    });
    return path;
  };

  const xTickIndices = getXAxisTickIndices(points.length, isNarrow);

  // Compute Aria Summary
  const totalUnique = points.reduce((acc, p) => acc + (p.unique_visitors || 0), 0);
  const totalViews = points.reduce((acc, p) => acc + (p.pageviews || 0), 0);
  const startDateStr = points[0] ? formatXDate(points[0].date) : "";
  const endDateStr = points[points.length - 1]
    ? formatXDate(points[points.length - 1].date)
    : "";

  const ariaSummary = `Grafik tren ${points.length} hari dari ${startDateStr} sampai ${endDateStr}. Total pengunjung unik ${totalUnique.toLocaleString(
    "id-ID"
  )}, total pageviews ${totalViews.toLocaleString("id-ID")}. Gunakan tombol panah kiri dan kanan untuk menelusuri data per hari.`;

  // Dynamic live announcement for screen readers when point focus changes
  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const liveAnnouncement = activePoint
    ? `${formatXDate(activePoint.date)}: ${
        showUnique
          ? `Pengunjung unik ${(activePoint.unique_visitors || 0).toLocaleString("id-ID")}`
          : ""
      }${showUnique && showViews ? ", " : ""}${
        showViews
          ? `Pageviews ${(activePoint.pageviews || 0).toLocaleString("id-ID")}`
          : ""
      }${toLocalDateKey(activePoint.date) === todayStr ? " (Data sementara)" : ""}`
    : "";

  // Step width between points for non-overlapping hover slices
  const dx = points.length > 1 ? plotWidth / (points.length - 1) : plotWidth;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={ariaSummary}
      onKeyDown={handleKeyDown}
      className={`relative outline-none focus-visible:ring-2 focus-visible:ring-black rounded-xl select-none ${className}`}
    >
      {/* Screen reader live polite announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Interactive Legend Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="text-[11px] font-bold text-gray-500">
          {points.length > 0 && (
            <span>
              {points.length} Hari ({startDateStr} - {endDateStr})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Unique Visitors Toggle */}
          <button
            type="button"
            onClick={() => handleToggleSeries("unique")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
              showUnique
                ? "bg-sky-50 text-sky-900 border-black shadow-[1.5px_1.5px_0px_#000]"
                : "bg-gray-100 text-gray-400 border-gray-300 opacity-60 line-through"
            }`}
            title={
              showUnique && !showViews
                ? "Minimal satu seri harus aktif"
                : showUnique
                ? "Klik untuk sembunyikan Pengunjung Unik"
                : "Klik untuk tampilkan Pengunjung Unik"
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full border border-black ${
                showUnique ? "bg-[#34BCEE]" : "bg-gray-300"
              }`}
            />
            <span>Pengunjung unik</span>
          </button>

          {/* Pageviews Toggle */}
          <button
            type="button"
            onClick={() => handleToggleSeries("views")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
              showViews
                ? "bg-amber-50 text-amber-900 border-black shadow-[1.5px_1.5px_0px_#000]"
                : "bg-gray-100 text-gray-400 border-gray-300 opacity-60 line-through"
            }`}
            title={
              showViews && !showUnique
                ? "Minimal satu seri harus aktif"
                : showViews
                ? "Klik untuk sembunyikan Pageviews"
                : "Klik untuk tampilkan Pageviews"
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full border border-black ${
                showViews ? "bg-[#FEA02F]" : "bg-gray-300"
              }`}
            />
            <span>Pageviews</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Gradients with instance-unique IDs */}
            <linearGradient id={uniqueGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34BCEE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34BCEE" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={viewsGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEA02F" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FEA02F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Horizontal Grid Lines & Ticks */}
          {ticks.map((tickVal) => {
            const yPos =
              plotY + plotHeight - (tickVal / maxTick) * plotHeight;
            const isBaseline = tickVal === 0;

            return (
              <g key={`ytick-${tickVal}`}>
                <line
                  x1={plotX}
                  y1={yPos}
                  x2={plotX + plotWidth}
                  y2={yPos}
                  stroke={isBaseline ? "#000000" : "#e5e7eb"}
                  strokeWidth={isBaseline ? 1.5 : 1}
                  strokeDasharray={isBaseline ? undefined : "3 3"}
                />
                <text
                  x={plotX - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  fontSize={10}
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fill="#6b7280"
                >
                  {formatYTick(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Today's Guide Line (Provisional indicator) */}
          {todayIndex !== -1 && coords[todayIndex] && (
            <g pointerEvents="none">
              <line
                x1={coords[todayIndex].x}
                y1={plotY}
                x2={coords[todayIndex].x}
                y2={plotY + plotHeight}
                stroke="#9ca3af"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* Area Fills */}
          {showUnique && (
            <path
              d={generateAreaPath("unique")}
              fill={`url(#${uniqueGradId})`}
            />
          )}
          {showViews && (
            <path
              d={generateAreaPath("views")}
              fill={`url(#${viewsGradId})`}
            />
          )}

          {/* Trend Lines */}
          {showUnique && (
            <path
              d={generateLinePath("unique")}
              fill="none"
              stroke="#34BCEE"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {showViews && (
            <path
              d={generateLinePath("views")}
              fill="none"
              stroke="#FEA02F"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />
          )}

          {/* X-Axis Ticks & Date Labels */}
          {xTickIndices.map((idx) => {
            const p = coords[idx];
            if (!p) return null;
            const isFirst = idx === 0;
            const isLast = idx === points.length - 1;
            const textAnchor = isFirst ? "start" : isLast ? "end" : "middle";

            return (
              <g key={`xtick-${idx}`}>
                <line
                  x1={p.x}
                  y1={plotY + plotHeight}
                  x2={p.x}
                  y2={plotY + plotHeight + 5}
                  stroke="#9ca3af"
                  strokeWidth={1}
                />
                <text
                  x={p.x}
                  y={plotY + plotHeight + 18}
                  textAnchor={textAnchor}
                  fontSize={10}
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fill="#6b7280"
                >
                  {formatXDate(p.date)}
                </text>
              </g>
            );
          })}

          {/* Data Points (Circles) */}
          {coords.map((p, i) => {
            const isHovered = activeIndex === i;
            const isToday = i === todayIndex;

            // Density rule: hide default circles if dense > 31 points unless hovered or today
            if (isDense && !isHovered && !isToday) {
              return null;
            }

            return (
              <g key={`circles-${i}`} pointerEvents="none">
                {/* Today's subtle outer ring */}
                {isToday && (
                  <circle
                    cx={p.x}
                    cy={showUnique ? p.yUnique : p.yViews}
                    r={isHovered ? 9 : 7}
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                )}

                {showUnique && (
                  <circle
                    cx={p.x}
                    cy={p.yUnique}
                    r={isHovered ? 6 : isDense ? 3 : 3.5}
                    fill="#34BCEE"
                    stroke="#000000"
                    strokeWidth={isHovered ? 2 : 1.5}
                  />
                )}
                {showViews && (
                  <circle
                    cx={p.x}
                    cy={p.yViews}
                    r={isHovered ? 6 : isDense ? 3 : 3.5}
                    fill="#FEA02F"
                    stroke="#000000"
                    strokeWidth={isHovered ? 2 : 1.5}
                  />
                )}
              </g>
            );
          })}

          {/* Active Guide Crosshair (Vertical) */}
          {activeIndex !== null && coords[activeIndex] && (
            <line
              x1={coords[activeIndex].x}
              y1={plotY}
              x2={coords[activeIndex].x}
              y2={plotY + plotHeight}
              stroke="#000000"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              pointerEvents="none"
            />
          )}

          {/* Non-overlapping Hover & Pointer Slices */}
          {coords.map((p, i) => {
            const isFirst = i === 0;
            const isLast = i === points.length - 1;
            const left = isFirst ? plotX : p.x - dx / 2;
            const right = isLast ? plotX + plotWidth : p.x + dx / 2;
            const sliceWidth = Math.max(1, right - left);

            return (
              <rect
                key={`slice-${i}`}
                x={left}
                y={plotY}
                width={sliceWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onPointerEnter={() => setHoveredIndex(i)}
                onPointerLeave={() => setHoveredIndex(null)}
                onPointerDown={() => {
                  setFocusedIndex(i);
                  setHoveredIndex(i);
                }}
              />
            );
          })}

          {/* Neo-brutalist Tooltip (Native SVG, clamped) */}
          {activeIndex !== null && coords[activeIndex] && (() => {
            const p = coords[activeIndex];
            const isToday = activeIndex === todayIndex;

            const tooltipWidth = 142;
            const tooltipHeight = 72 + (isToday ? 14 : 0);

            // Clamp tooltip within SVG bounds
            const tooltipX = Math.min(
              Math.max(p.x, tooltipWidth / 2 + 8),
              svgWidth - tooltipWidth / 2 - 8
            );

            // Determine if tooltip fits above the points or flips below
            const minYPoint = Math.min(
              showUnique ? p.yUnique : Infinity,
              showViews ? p.yViews : Infinity
            );
            const preferredY = minYPoint - tooltipHeight - 14;
            const tooltipY =
              preferredY >= plotY ? preferredY : Math.min(minYPoint + 18, svgHeight - tooltipHeight - 6);

            const rectLeft = tooltipX - tooltipWidth / 2;

            return (
              <g pointerEvents="none" className="transition-all duration-75">
                {/* Neobrutalist Offset Shadow */}
                <rect
                  x={rectLeft + 3}
                  y={tooltipY + 3}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx={8}
                  fill="#000000"
                />
                {/* Foreground Box */}
                <rect
                  x={rectLeft}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx={8}
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth={2}
                />

                {/* Date Header */}
                <text
                  x={tooltipX}
                  y={tooltipY + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fill="#4b5563"
                >
                  {new Date(p.date).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </text>

                {/* Provisional Badge for Today */}
                {isToday && (
                  <text
                    x={tooltipX}
                    y={tooltipY + 28}
                    textAnchor="middle"
                    fontSize={9}
                    fontFamily="sans-serif"
                    fontWeight="black"
                    fill="#d97706"
                  >
                    (Data Sementara)
                  </text>
                )}

                {/* Unique Visitors Row */}
                {showUnique && (
                  <g>
                    <circle
                      cx={rectLeft + 16}
                      cy={tooltipY + (isToday ? 42 : 34)}
                      r={3.5}
                      fill="#34BCEE"
                      stroke="#000"
                      strokeWidth={1}
                    />
                    <text
                      x={rectLeft + 25}
                      y={tooltipY + (isToday ? 45 : 37)}
                      textAnchor="start"
                      fontSize={10}
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      fill="#0284c7"
                    >
                      Unik:
                    </text>
                    <text
                      x={rectLeft + tooltipWidth - 14}
                      y={tooltipY + (isToday ? 45 : 37)}
                      textAnchor="end"
                      fontSize={11}
                      fontFamily="sans-serif"
                      fontWeight="black"
                      fill="#0284c7"
                    >
                      {(p.unique_visitors || 0).toLocaleString("id-ID")}
                    </text>
                  </g>
                )}

                {/* Pageviews Row */}
                {showViews && (
                  <g>
                    <circle
                      cx={rectLeft + 16}
                      cy={tooltipY + (isToday ? 58 : 52)}
                      r={3.5}
                      fill="#FEA02F"
                      stroke="#000"
                      strokeWidth={1}
                    />
                    <text
                      x={rectLeft + 25}
                      y={tooltipY + (isToday ? 61 : 55)}
                      textAnchor="start"
                      fontSize={10}
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      fill="#d97706"
                    >
                      Views:
                    </text>
                    <text
                      x={rectLeft + tooltipWidth - 14}
                      y={tooltipY + (isToday ? 61 : 55)}
                      textAnchor="end"
                      fontSize={11}
                      fontFamily="sans-serif"
                      fontWeight="black"
                      fill="#d97706"
                    >
                      {(p.pageviews || 0).toLocaleString("id-ID")}
                    </text>
                  </g>
                )}
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

export default TrendChart;
