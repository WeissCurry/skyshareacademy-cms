import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiCalendar, FiUsers } from "react-icons/fi";
import type { CmsEvent } from "../types/event";
import Skeleton from "@shared/ui/Skeleton";

interface EventListTableProps {
  events: CmsEvent[];
  startIndex?: number;
  isLoading: boolean;
  onDelete: (event: CmsEvent) => void;
  onToggleStatus: (event: CmsEvent) => void;
}

export default function EventListTable({
  events,
  startIndex = 0,
  isLoading,
  onDelete,
  onToggleStatus,
}: EventListTableProps) {
  const [nowMs] = useState(() => Date.now());

  if (isLoading) {
    return (
      <div role="status" aria-busy="true" className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
        <span className="sr-only">Memuat data event...</span>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-black text-xs font-bold uppercase tracking-wider text-gray-600">
                <th className="py-3.5 px-4 w-12">No.</th>
                <th className="py-3.5 px-4 w-28">Poster</th>
                <th className="py-3.5 px-4 min-w-[200px]">Informasi Event</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Target Program</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-6" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="w-20 h-14 rounded-lg" />
                  </td>
                  <td className="py-4 px-4 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Skeleton className="h-6 w-16 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
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
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border-2 border-black rounded-2xl p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium text-base mb-1">
          Tidak ada event yang ditemukan
        </p>
        <p className="text-gray-400 text-xs">
          Coba sesuaikan kata kunci pencarian atau filter tanggal kalender di atas.
        </p>
      </div>
    );
  }

  const formatEventDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "talent":
        return { label: "Talents Academy", color: "bg-primary-1/10 text-primary-1 border-primary-1" };
      case "mentor":
        return { label: "Mentor Academy", color: "bg-secondary-1/10 text-secondary-1 border-secondary-1" };
      case "parent":
        return { label: "Parents Academy", color: "bg-[#BF35DF]/10 text-[#BF35DF] border-[#BF35DF]" };
      default:
        return { label: "Umum", color: "bg-gray-100 text-gray-700 border-gray-300" };
    }
  };

  return (
    <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-16">No</th>
              <th className="py-3.5 px-4 w-28">Poster</th>
              <th className="py-3.5 px-4">Event</th>
              <th className="py-3.5 px-4">Tanggal</th>
              <th className="py-3.5 px-4">Target</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {events.map((ev, index) => {
              const isPast = ev.event_date
                ? new Date(ev.event_date).getTime() < nowMs
                : false;

              const role = getRoleBadge(ev.target_role);

              return (
                <tr key={ev.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-4 px-4 font-semibold text-gray-400">
                    {startIndex + index + 1}
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {ev.thumbnail_url ? (
                        <img
                          src={ev.thumbnail_url}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400 text-center font-bold px-1">
                          No Poster
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {isPast ? (
                        <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          Selesai
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-secondary-1/10 text-secondary-1 px-1.5 py-0.5 rounded">
                          Mendatang
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-neutral-1 line-clamp-1">
                      {ev.title}
                    </h3>
                    {ev.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {ev.description}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-700">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <FiCalendar className="text-primary-1 shrink-0 text-sm" />
                      <span>{formatEventDate(ev.event_date)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${role.color}`}
                    >
                      <FiUsers className="text-[10px] shrink-0" />
                      <span>{role.label}</span>
                    </span>
                    {ev.program_id && (
                      <span className="block mt-1 text-[10px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 truncate max-w-[140px]">
                        {ev.program_title || `Program #${ev.program_id}`}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(ev)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${ev.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                    >
                      {ev.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/cms/events/edit/${ev.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Event"
                      >
                        <FiEdit2 className="text-base" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(ev)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Event"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
