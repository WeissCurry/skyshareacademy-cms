import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiClock,
} from "react-icons/fi";
import type { MentorContributorItem } from "@features/mentor-access/types";
import {
  fetchMentorContributors,
  toggleMentorContributor,
} from "@features/mentor-access/api";
import { UserRoleBadge } from "@shared/ui/UserRoleBadge";
import ConfirmModal from "@shared/ui/ConfirmModal";
import SuccessModal from "@shared/ui/SuccessModal";
import Skeleton from "@shared/ui/Skeleton";
import MentorPointsModal from "./components/MentorPointsModal";

export default function CmsContributorsPage() {
  const [mentors, setMentors] = useState<MentorContributorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterContributor, setFilterContributor] = useState<string>("ALL");

  // Toggle contributor state
  const [targetMentor, setTargetMentor] = useState<MentorContributorItem | null>(null);
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
  const [isSubmittingToggle, setIsSubmittingToggle] = useState(false);

  // Points modal state
  const [pointsMentor, setPointsMentor] = useState<MentorContributorItem | null>(null);

  // Success notification
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadMentors = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchMentorContributors();
      setMentors(data);
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat data akun mentor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchMentorContributors("", controller.signal)
      .then((data) => {
        setMentors(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setErrorMessage((err as Error).message || "Gagal memuat data akun mentor.");
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  const filteredMentors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return mentors.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);

      const matchesStatus =
        filterContributor === "ALL" ||
        (filterContributor === "CONTRIBUTOR" && m.is_contributor) ||
        (filterContributor === "NON_CONTRIBUTOR" && !m.is_contributor);

      return matchesSearch && matchesStatus;
    });
  }, [mentors, searchQuery, filterContributor]);

  const handleOpenToggle = (mentor: MentorContributorItem) => {
    setTargetMentor(mentor);
    setIsConfirmToggleOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetMentor) return;
    setIsSubmittingToggle(true);
    try {
      const nextState = !targetMentor.is_contributor;
      await toggleMentorContributor(targetMentor.id, nextState);
      setIsConfirmToggleOpen(false);
      setSuccessMessage(
        nextState
          ? `Hak akses kontributor berhasil DIBERIKAN kepada ${targetMentor.name}.`
          : `Hak akses kontributor ${targetMentor.name} berhasil DINONAKTIFKAN.`
      );
      setTargetMentor(null);
      loadMentors();
    } catch (err) {
      setIsConfirmToggleOpen(false);
      setErrorMessage((err as Error).message || "Gagal mengubah status kontributor.");
    } finally {
      setIsSubmittingToggle(false);
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
              <h1 className="headline-1">Izin Kontributor & Poin</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Kelola hak akses menulis artikel bagi mentor dan penyesuaian saldo poin gamifikasi platform.
              </p>
            </div>
          </div>

          {/* Controls: Search & Filters */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mentor (nama atau email)..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700">
                <FiFilter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500">Status:</span>
                <select
                  value={filterContributor}
                  onChange={(e) => setFilterContributor(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer font-bold text-black"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="CONTRIBUTOR">Kontributor Aktif</option>
                  <option value="NON_CONTRIBUTOR">Bukan Kontributor</option>
                </select>
              </div>

              <div className="text-xs text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap shrink-0">
                {filteredMentors.length} Akun
              </div>
            </div>
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
                onClick={loadMentors}
                className="underline text-xs hover:text-red-950 font-bold"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat data kontributor...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Mentor & Role</th>
                      <th className="py-3.5 px-4">Status Kontributor</th>
                      <th className="py-3.5 px-4">Izin Diberikan</th>
                      <th className="py-3.5 px-4 text-center">Poin & Gamifikasi</th>
                      <th className="py-3.5 px-4 text-center">Aksi Hak Tulis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-3.5 px-4 space-y-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-28" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Skeleton className="h-8 w-24 mx-auto rounded-lg" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Skeleton className="h-8 w-28 mx-auto rounded-lg" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                  <FiUsers className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Tidak Ada Akun Ditemukan</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {searchQuery || filterContributor !== "ALL"
                    ? "Tidak ada akun mentor yang sesuai dengan filter atau kata kunci."
                    : "Belum ada akun mentor terdaftar."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Mentor & Role</th>
                      <th className="py-3.5 px-4">Status Kontributor</th>
                      <th className="py-3.5 px-4">Izin Diberikan</th>
                      <th className="py-3.5 px-4 text-center">Poin & Gamifikasi</th>
                      <th className="py-3.5 px-4 text-center">Aksi Hak Tulis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMentors.map((mentor) => (
                      <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                        {/* Mentor & Roles */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{mentor.name}</p>
                          <p className="text-xs text-gray-500">{mentor.email}</p>
                          <div className="mt-1">
                            <UserRoleBadge roles={mentor.roles} role={mentor.role} />
                          </div>
                        </td>

                        {/* Contributor Status */}
                        <td className="py-3.5 px-4">
                          {mentor.is_contributor ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              <FiCheckCircle className="w-3.5 h-3.5" />
                              <span>Kontributor Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                              <FiXCircle className="w-3.5 h-3.5 text-gray-400" />
                              <span>Bukan Kontributor</span>
                            </span>
                          )}
                        </td>

                        {/* Granted Info */}
                        <td className="py-3.5 px-4 text-xs text-gray-600">
                          {mentor.is_contributor && mentor.contributor_granted_at ? (
                            <div className="space-y-0.5">
                              <p className="font-medium text-gray-800 flex items-center gap-1">
                                <FiClock className="w-3 h-3 text-gray-400" />
                                <span>
                                  {new Date(mentor.contributor_granted_at).toLocaleDateString("id-ID")}
                                </span>
                              </p>
                              {mentor.contributor_granted_by_name && (
                                <p className="text-[11px] text-gray-500">
                                  Oleh: {mentor.contributor_granted_by_name}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Points Management Button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setPointsMentor(mentor)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-400 rounded-xl text-xs font-bold transition-all shadow-xs"
                            title="Lihat saldo dan sesuaikan poin"
                          >
                            <FiAward className="w-3.5 h-3.5 text-amber-600" />
                            <span>Kelola Poin</span>
                          </button>
                        </td>

                        {/* Contributor Toggle Action */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenToggle(mentor)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${
                              mentor.is_contributor
                                ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                                : "bg-purple-600 hover:bg-purple-700 text-white border-purple-800 shadow-xs"
                            }`}
                          >
                            <FiEdit className="w-3.5 h-3.5" />
                            <span>
                              {mentor.is_contributor
                                ? "Cabut Izin Tulis"
                                : "Beri Izin Kontributor"}
                            </span>
                          </button>
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

      {/* Contributor Toggle Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmToggleOpen}
        onClose={() => setIsConfirmToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        title={
          targetMentor?.is_contributor
            ? "Cabut Status Kontributor"
            : "Beri Status Kontributor"
        }
        message={
          targetMentor?.is_contributor
            ? `Apakah Anda yakin ingin MENCABUT izin kontributor artikel untuk ${targetMentor?.name}? Mentor ini tidak akan dapat lagi membuat atau mengirim draf artikel baru.`
            : `Apakah Anda yakin ingin MEMBERIKAN izin kontributor artikel kepada ${targetMentor?.name}? Mentor ini akan mendapatkan hak akses menu penulisan artikel di Portal Mentor.`
        }
        confirmText={
          isSubmittingToggle
            ? "Memproses..."
            : targetMentor?.is_contributor
            ? "Ya, Cabut Izin"
            : "Ya, Berikan Izin"
        }
        type={targetMentor?.is_contributor ? "danger" : undefined}
      />

      {/* Points Modal */}
      {pointsMentor && (
        <MentorPointsModal
          isOpen={!!pointsMentor}
          onClose={() => setPointsMentor(null)}
          studentId={pointsMentor.id}
          studentName={pointsMentor.name}
          studentEmail={pointsMentor.email}
          onSuccess={() => {
            setSuccessMessage(`Saldo poin ${pointsMentor.name} berhasil diperbarui.`);
          }}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Berhasil"
        message={successMessage || ""}
      />
    </div>
  );
}
