import React, { useState, useRef } from "react";
import MascotWarning from "@shared/assets/images/mascot-icons/pose=1.webp";
import Info from "@shared/assets/images/mascot-icons/Info Square.png";
import { useModalA11y } from "@shared/hooks/useModalA11y";

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  placeholder?: string;
  isLoading?: boolean;
}

export default function RejectReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  placeholder = "Contoh: Foto berkas buram atau data identitas tidak terbaca jelas...",
  isLoading = false,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    containerRef: modalRef,
    initialFocusRef: inputRef,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("Alasan penolakan wajib diisi minimal 5 karakter.");
      return;
    }
    setError("");
    onConfirm(trimmed);
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-4"
    >
      <div className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center shadow-2xl border-2 border-black max-w-sm sm:max-w-md w-full animate-in zoom-in duration-300">
        <div className="mb-4">
          <img
            className="w-32 h-auto drop-shadow-xl"
            src={MascotWarning}
            alt="Warning Mascot"
          />
        </div>

        <div className="flex flex-col items-center gap-2 text-center w-full mb-4">
          <div className="flex items-center gap-2">
            <img className="w-7 h-7" src={Info} alt="Info" />
            <h3 id="reject-modal-title" className="text-2xl font-black text-gray-900">
              {title}
            </h3>
          </div>
          <p className="text-gray-500 font-medium text-sm">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <textarea
              ref={inputRef}
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder={placeholder}
              className={`w-full p-3 bg-gray-50 border-2 rounded-xl text-sm outline-none transition-colors font-medium resize-none ${
                error ? "border-red-500 bg-red-50" : "border-black focus:bg-white"
              }`}
              disabled={isLoading}
              autoFocus
            />
            {error && <p className="text-xs font-bold text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || reason.trim().length < 5}
              className="flex-1 py-3 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Memproses..." : "Tolak Pengajuan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
