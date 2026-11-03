import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiUploadCloud,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import type { QrisSettingItem } from "@features/mentor-access/types";
import { fetchQrisSetting, updateQrisSetting } from "@features/mentor-access/api";
import { resolveAssetUrl } from "@shared/utils/urlUtils";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";
import Button from "@shared/ui/Button";
import FormField from "@shared/ui/FormField";
import Skeleton from "@shared/ui/Skeleton";

export default function CmsQrisSettingsPage() {
  const [qrisData, setQrisData] = useState<QrisSettingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Upload state
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadQris = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchQrisSetting();
      setQrisData(data);
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat konfigurasi QRIS.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      try {
        const data = await fetchQrisSetting();
        if (active) {
          setQrisData(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          setErrorMessage((err as Error).message || "Gagal memuat konfigurasi QRIS.");
          setIsLoading(false);
        }
      }
    };
    fetchInit();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFile(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    }
  };

  const handleSave = async () => {
    if (!newFile) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("qris_image", newFile);
      const updated = await updateQrisSetting(fd);
      setQrisData(updated);
      setNewFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setIsConfirmOpen(false);
      setSuccessMessage("Gambar master QRIS berhasil diperbarui!");
      loadQris();
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal memperbarui QRIS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
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
              <h1 className="headline-1">Pengaturan QRIS</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Kelola barcode QRIS statis SkyShare Academy yang ditampilkan kepada calon mentor saat memesan program.
              </p>
            </div>

            <button
              type="button"
              onClick={loadQris}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-sm hover:shadow self-start sm:self-auto"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div role="alert" className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Current QRIS Image Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                    Master QRIS Saat Ini
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Aktif Digunakan</span>
                  </span>
                </div>

                <div className="w-full h-80 bg-gray-50 border-2 border-black rounded-xl flex items-center justify-center p-4 overflow-hidden">
                  {isLoading ? (
                    <div role="status" aria-busy="true" className="w-full h-full flex flex-col items-center justify-center p-6 space-y-3">
                      <span className="sr-only">Memuat gambar QRIS...</span>
                      <Skeleton className="w-48 h-48 rounded-xl border border-gray-300" />
                      <Skeleton className="w-32 h-3" />
                    </div>
                  ) : qrisData?.qris_image_url || qrisData?.value ? (
                    <img
                      src={resolveAssetUrl(qrisData.qris_image_url || qrisData.value)}
                      alt="Current Master QRIS Barcode"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-gray-400 font-medium">Belum ada gambar QRIS tersimpan.</p>
                  )}
                </div>

                {qrisData && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1.5 font-medium">
                      <FiClock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Terakhir diperbarui: <strong className="text-gray-900">{formatDate(qrisData.updated_at || qrisData.updatedAt)}</strong></span>
                    </p>
                    {qrisData.updated_by_name && (
                      <p className="flex items-center gap-1.5 font-medium">
                        <FiUser className="w-3.5 h-3.5 text-gray-400" />
                        <span>Oleh: <strong className="text-gray-900">{qrisData.updated_by_name}</strong></span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Upload Replacement QRIS (Copies CmsArticleAddForm.tsx) */}
              <div className="space-y-4">
                <div className="pb-2 border-b-2 border-black">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                    Unggah / Ganti Gambar QRIS Baru
                  </h3>
                </div>

                <FormField label="Pilih File Gambar Barcode" required>
                  <div className="border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white min-h-[160px] relative group overflow-hidden">
                    {previewUrl ? (
                      <div className="flex justify-center h-full p-2 w-full">
                        <img
                          src={previewUrl}
                          alt="Preview QRIS Baru"
                          className="w-full max-w-[280px] h-auto object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm">Belum ada file QRIS baru dipilih</p>
                    )}
                  </div>
                  <div className="flex justify-center mt-2 mb-4">
                    <p className="text-xs text-gray-500 font-bold">Mendukung format PNG, JPG, atau WebP (Maksimal 5MB)</p>
                  </div>

                  <div className="bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative h-[52px]">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="cursor-pointer z-10 opacity-0 w-full h-full absolute"
                    />
                    <div className="flex gap-2 items-center">
                      <p className="text-white font-bold">Pilih File QRIS Baru</p>
                      <FiUploadCloud className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </FormField>

                {/* Actions when new file selected */}
                {previewUrl && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setNewFile(null);
                        setPreviewUrl(null);
                      }}
                      className="flex-1"
                    >
                      Batalkan
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsConfirmOpen(true)}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Simpan QRIS Baru
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSave}
        title="Ganti Master QRIS?"
        message="Gambar barcode QRIS ini akan langsung menggantikan master barcode yang ditampilkan kepada seluruh calon mentor saat checkout program."
        confirmText="Ya, Terapkan"
      />

      {/* Success Notification */}
      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Berhasil"
        message={successMessage || ""}
      />
    </div>
  );
}
