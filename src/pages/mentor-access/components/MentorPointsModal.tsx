import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiMinus,
  FiX,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import type { MentorPointsSummary } from "@features/mentor-access/types";
import { fetchMentorPoints, adjustMentorPoints } from "@features/mentor-access/api";
import { useModalA11y } from "@shared/hooks/useModalA11y";
import ConfirmModal from "@shared/ui/ConfirmModal";
import Button from "@shared/ui/Button";
import Skeleton from "@shared/ui/Skeleton";

interface MentorPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  studentEmail?: string;
  onSuccess?: () => void;
}

export default function MentorPointsModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentEmail,
  onSuccess,
}: MentorPointsModalProps) {
  const [data, setData] = useState<MentorPointsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Adjustment form
  const [deltaMode, setDeltaMode] = useState<"ADD" | "SUBTRACT">("ADD");
  const [deltaAmount, setDeltaAmount] = useState<string>("50");
  const [adjustNote, setAdjustNote] = useState<string>("");
  const [adjustError, setAdjustError] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useModalA11y({
    isOpen,
    onClose,
    containerRef,
  });

  const loadPoints = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetchMentorPoints(studentId);
      setData(res);
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat saldo poin mentor.");
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();

    fetchMentorPoints(studentId, controller.signal)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setErrorMessage((err as Error).message || "Gagal memuat saldo poin mentor.");
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [isOpen, studentId]);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(deltaAmount.trim(), 10);
    if (!amount || amount <= 0 || isNaN(amount)) {
      setAdjustError("Jumlah poin harus berupa angka positif.");
      return;
    }
    if (!adjustNote.trim()) {
      setAdjustError("Alasan / catatan penyesuaian wajib diisi.");
      return;
    }
    setAdjustError("");
    setIsConfirmOpen(true);
  };

  const handleConfirmAdjust = async () => {
    const rawAmount = parseInt(deltaAmount.trim(), 10);
    const finalDelta = deltaMode === "ADD" ? rawAmount : -rawAmount;

    setIsSubmitting(true);
    try {
      await adjustMentorPoints(
        studentId,
        finalDelta,
        adjustNote.trim(),
        "MANUAL_ADJUSTMENT"
      );
      setIsConfirmOpen(false);
      setAdjustNote("");
      setDeltaAmount("50");
      if (onSuccess) onSuccess();
      loadPoints();
    } catch (err) {
      setIsConfirmOpen(false);
      setAdjustError((err as Error).message || "Gagal menyimpan penyesuaian poin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentBalance = data?.balance ?? 0;
  const history = data?.history || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        ref={containerRef}
        className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-black flex items-center justify-center text-amber-700">
              <FiAward className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">
                Poin Gamifikasi Mentor
              </h3>
              <p className="text-xs text-gray-600">
                {studentName} {studentEmail ? `(${studentEmail})` : ""} - ID: #{studentId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-black hover:bg-gray-100 transition-colors"
            aria-label="Tutup modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-xs font-bold"
          >
            {errorMessage}
          </div>
        )}

        {/* Balance Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1 bg-amber-50 border-2 border-black rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Saldo Saat Ini
            </span>
            {isLoading ? (
              <Skeleton className="h-9 w-24 my-2" />
            ) : (
              <div className="my-2">
                <span className="text-3xl font-black font-mono text-amber-950">
                  {currentBalance}
                </span>
                <span className="text-xs font-bold text-amber-800 ml-1.5">Poin</span>
              </div>
            )}
            <span className="text-[10px] text-amber-700 font-medium">
              Dapat ditukarkan dengan reward platform
            </span>
          </div>

          {/* Manual Adjust Form */}
          <div className="sm:col-span-2 bg-gray-50 border-2 border-black rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Penyesuaian Manual Poin
            </h4>

            {adjustError && (
              <p className="text-[11px] font-bold text-red-600 bg-red-50 p-1.5 rounded border border-red-200">
                {adjustError}
              </p>
            )}

            <form onSubmit={handleOpenConfirm} className="space-y-3">
              <div className="flex gap-2">
                {/* Mode toggle */}
                <div className="inline-flex rounded-lg border-2 border-black p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setDeltaMode("ADD")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                      deltaMode === "ADD"
                        ? "bg-green-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeltaMode("SUBTRACT")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                      deltaMode === "SUBTRACT"
                        ? "bg-red-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <FiMinus className="w-3.5 h-3.5" />
                    <span>Kurang</span>
                  </button>
                </div>

                {/* Amount */}
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    required
                    value={deltaAmount}
                    onChange={(e) => setDeltaAmount(e.target.value)}
                    placeholder="Contoh: 50"
                    className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold font-mono outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                    Poin
                  </span>
                </div>
              </div>

              {/* Reason note */}
              <div>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Alasan wajib (contoh: Apresiasi kontribusi materi kelas)..."
                  className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-medium outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs py-1.5 px-4 font-bold"
                >
                  Proses Penyesuaian
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Points History Ledger */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5 text-gray-500" />
              <span>Riwayat Transaksi Poin (Ledger)</span>
            </h4>
            <span className="text-[11px] text-gray-500 font-semibold">
              {history.length} entri
            </span>
          </div>

          <div className="border-2 border-black rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto">
            {isLoading ? (
              <div role="status" aria-busy="true" className="p-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 space-y-1">
                <FiAlertCircle className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="font-bold">Belum ada riwayat mutasi poin.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Delta</th>
                    <th className="py-2.5 px-3">Kode Alasan</th>
                    <th className="py-2.5 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/50">
                      <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {entry.delta > 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-bold font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            <FiTrendingUp className="w-3 h-3" />
                            +{entry.delta}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 font-bold font-mono text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <FiTrendingDown className="w-3 h-3" />
                            {entry.delta}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-gray-700">
                        {entry.reason_code}
                      </td>
                      <td className="py-2 px-3 text-gray-600 max-w-xs truncate">
                        {entry.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} className="text-xs px-5 font-bold">
            Tutup
          </Button>
        </div>
      </div>

      {/* Adjustment Confirmation */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAdjust}
        title="Konfirmasi Penyesuaian Poin"
        message={`Apakah Anda yakin ingin ${
          deltaMode === "ADD" ? "MENAMBAHKAN" : "MENGURANGI"
        } ${deltaAmount} poin untuk ${studentName}? Alasan: "${adjustNote.trim()}". Perubahan ini akan langsung dicatat pada ledger audit poin.`}
        confirmText={
          isSubmitting
            ? "Menyimpan..."
            : deltaMode === "ADD"
            ? "Ya, Tambahkan Poin"
            : "Ya, Kurangi Poin"
        }
        type={deltaMode === "ADD" ? undefined : "danger"}
      />
    </div>
  );
}
