import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from "react-icons/fi";
import type { CmsEvent } from "../types/event";

interface EventCalendarProps {
  events: CmsEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onAddEventOnDate?: (dateStr: string) => void;
}

export default function EventCalendar({
  events,
  selectedDate,
  onSelectDate,
}: EventCalendarProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    onSelectDate(todayStr);
  };

  // Map events to date strings YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CmsEvent[]>();

    events.forEach((ev) => {
      if (!ev.event_date) return;
      const d = new Date(ev.event_date);
      if (isNaN(d.getTime())) return;
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const list = map.get(dateKey) || [];
      list.push(ev);
      map.set(dateKey, list);
    });

    return map;
  }, [events]);

  // Calendar grid calculation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      events: CmsEvent[];
    }> = [];

    const pad = (n: number) => String(n).padStart(2, "0");

    // Days from prev month to fill the first row
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${pad(prevMonth + 1)}-${pad(d)}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate.get(dateStr) || [],
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        events: eventsByDate.get(dateStr) || [],
      });
    }

    // Next month padding to fill grid to multiple of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${pad(nextMonth + 1)}-${pad(d)}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate.get(dateStr) || [],
      });
    }

    return cells;
  }, [year, month, eventsByDate]);

  const [currentDate] = useState(() => new Date());
  const nowMs = useMemo(() => currentDate.getTime(), [currentDate]);
  const todayStr = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
  }, [currentDate]);

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-secondary-1 text-xl" />
          <h2 className="text-lg font-bold text-neutral-1">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <FiX className="text-sm" />
              Reset Filter Tanggal ({selectedDate})
            </button>
          )}

          <button
            type="button"
            onClick={handleToday}
            className="text-xs bg-secondary-1/10 hover:bg-secondary-1/20 text-secondary-1 font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            Hari Ini
          </button>

          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-gray-100 transition-colors text-gray-600"
              title="Bulan sebelumnya"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-gray-100 transition-colors text-gray-600"
              title="Bulan berikutnya"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-400 mb-2">
        <span className="text-red-500">Min</span>
        <span>Sen</span>
        <span>Sel</span>
        <span>Rab</span>
        <span>Kam</span>
        <span>Jum</span>
        <span className="text-blue-500">Sab</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, idx) => {
          const isSelected = selectedDate === cell.dateStr;
          const isToday = todayStr === cell.dateStr;
          const hasEvents = cell.events.length > 0;

          // Categorize event dots: upcoming (blue) or past (orange)
          const hasUpcoming = cell.events.some((ev) =>
            ev.event_date ? new Date(ev.event_date).getTime() >= nowMs : false
          );
          const hasPast = cell.events.some((ev) =>
            ev.event_date ? new Date(ev.event_date).getTime() < nowMs : false
          );

          return (
            <button
              key={`${cell.dateStr}-${idx}`}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onSelectDate(null);
                } else {
                  onSelectDate(cell.dateStr);
                }
              }}
              className={`min-h-[56px] p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all relative group text-left ${
                isSelected
                  ? "border-primary-1 bg-primary-1/10 ring-2 ring-primary-1"
                  : isToday
                  ? "border-secondary-1 bg-secondary-1/5"
                  : cell.isCurrentMonth
                  ? "border-gray-200 hover:border-gray-400 bg-white"
                  : "border-gray-100 bg-gray-50/50 text-gray-300 hover:bg-gray-100"
              }`}
            >
              <div className="w-full flex justify-between items-center">
                <span
                  className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday
                      ? "bg-secondary-1 text-white"
                      : isSelected
                      ? "bg-primary-1 text-white"
                      : cell.isCurrentMonth
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}
                >
                  {cell.day}
                </span>

                {hasEvents && (
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1 rounded">
                    {cell.events.length}
                  </span>
                )}
              </div>

              {/* Event indicator dots */}
              <div className="flex gap-1 mt-1">
                {hasUpcoming && (
                  <span
                    className="w-2 h-2 rounded-full bg-secondary-1"
                    title="Ada event mendatang"
                  />
                )}
                {hasPast && (
                  <span
                    className="w-2 h-2 rounded-full bg-primary-1"
                    title="Ada event lampau"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend & Hint */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-1"></span>
            <span>Akan Datang</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-1"></span>
            <span>Telah Berlangsung</span>
          </div>
        </div>
        <p className="text-[11px] italic text-gray-400">
          Klik pada tanggal untuk memfilter event pada tanggal tersebut
        </p>
      </div>
    </div>
  );
}
