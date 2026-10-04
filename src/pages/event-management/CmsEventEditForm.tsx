import { useState, useRef, useEffect } from "react";
import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";
import Button from "@shared/ui/Button";
import FormField from "@shared/ui/FormField";
import FormInput from "@shared/ui/FormInput";
import FormTextarea from "@shared/ui/FormTextarea";
import MediaLibraryMini from "@features/media-library/MediaLibraryMini";
import Show from "@shared/assets/images/mascot-icons/Show.png";
import Chain from "@shared/assets/images/mascot-icons/Link.png";
import ArrowLeft from "@shared/assets/images/mascot-icons/Arrow - Down 3.png";
import Arrow from "@shared/assets/images/mascot-icons/Arrow-down.png";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";

import { useEventEditForm } from "./hooks/useEventEditForm";
import { TARGET_PROGRAMS } from "./types/event";

export default function CmsEventEditForm() {
  const { state, actions } = useEventEditForm();
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);

  const programDropdownRef = useRef<HTMLDivElement>(null);
  const {
    formData,
    imagePreviewUrl,
    urlValue,
    isLoading,
    isUploading,
    isSaveModalOpen,
    isCancelModalOpen,
    errorMessage,
    mediaImages,
    isMediaLoading,
  } = state;

  const {
    setFormValue,
    handleFileChange,
    handleUrlChange,
    addDocumentationUrls,
    removeDocumentationUrl,
    uploadDocumentationFiles,
    handleSubmit,
    setIsSaveModalOpen,
    setIsCancelModalOpen,
    setErrorMessage,
    navigate,
  } = actions;

  const currentProgram =
    TARGET_PROGRAMS.find((p) => p.id === formData.target_role) || TARGET_PROGRAMS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        programDropdownRef.current &&
        !programDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProgramDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-background flex flex-col pt-12 items-center self-stretch min-h-screen">
        <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4 md:px-0">
          <div className="hidden md:block shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-1 border-t-transparent mb-3" />
            <p className="text-gray-500 font-medium">Memuat data event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch min-h-screen pb-44">
      <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4 md:px-0">
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="hover:scale-110 transition-transform"
            >
              <img className="w-10 rotate-90 invert" src={ArrowLeft} alt="Back" />
            </button>
            <div>
              <h1 className="headline-1">Edit Event</h1>
              <p className="text-sm font-medium text-black mt-1">
                Perbarui informasi dan jadwal event
              </p>
            </div>
          </div>

          <div className="bg-neutral-white mt-8 border-2 border-black rounded-xl p-6 sm:p-8 w-full overflow-hidden space-y-8 shadow-sm">
            {/* Thumbnail Poster */}
            <FormField label="Poster / Thumbnail Event" required>
              <div className="border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white min-h-[180px] relative group overflow-hidden">
                {imagePreviewUrl ? (
                  <div className="flex justify-center h-full p-2 w-full">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full max-w-[420px] max-h-[260px] object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    Belum ada poster dipilih (Rekomendasi rasio 16:9 atau 4:3)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative h-[52px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer z-10 opacity-0 w-full h-full absolute"
                  />
                  <div className="flex gap-2 items-center">
                    <p className="text-white font-bold">Ganti File Poster</p>
                    <img className="w-6 -rotate-90" src={Show} alt="" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <img src={Chain} className="w-5" alt="" />
                  </div>
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar baru di sini..."
                    value={urlValue}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-4 border-2 border-gray-400 rounded-xl outline-none focus:border-black transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Pilih salah satu: Upload file atau pilih dari Media Library
                </h4>
              </div>
              <div className="mt-6">
                <MediaLibraryMini
                  images={mediaImages}
                  isLoading={isMediaLoading}
                  onSelect={handleUrlChange}
                />
              </div>
            </FormField>

            {/* Judul Event */}
            <FormField label="Nama / Judul Event" required>
              <FormInput
                type="text"
                value={formData.title}
                onChange={(e) => setFormValue({ title: e.target.value })}
                placeholder="Contoh: UI/UX Masterclass Batch 4..."
              />
            </FormField>

            {/* Grid Tanggal, Kategori, Target Program */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tanggal Pelaksanaan (Date only) */}
              <FormField label="Tanggal Pelaksanaan" required>
                <FormInput
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormValue({ event_date: e.target.value })}
                />
              </FormField>


              {/* Target Program (4 Pilihan - Seragam dengan Dropdown Kategori) */}
              <FormField label="Target Program">
                <div className="relative" ref={programDropdownRef}>
                <div
                  onClick={() => {
                    setIsProgramDropdownOpen(!isProgramDropdownOpen);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl flex justify-between items-center cursor-pointer hover:border-black transition-colors bg-white min-h-[50px]"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: currentProgram.color }}
                    >
                      {currentProgram.label}
                    </div>
                  </div>
                  <img
                    className={`w-4 transition-transform ${isProgramDropdownOpen ? "rotate-180" : ""}`}
                    src={Arrow}
                    alt=""
                  />
                </div>

                {isProgramDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 space-y-1">
                      {TARGET_PROGRAMS.map((prog) => (
                        <div
                          key={prog.id}
                          className={`flex items-center justify-between p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer group transition-colors ${formData.target_role === prog.id ? "bg-gray-50 font-bold" : ""
                            }`}
                          onClick={() => {
                            setFormValue({ target_role: prog.id });
                            setIsProgramDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="px-3 py-1 rounded-full text-white text-xs font-bold"
                              style={{ backgroundColor: prog.color }}
                            >
                              {prog.label}
                            </div>
                          </div>
                          {formData.target_role === prog.id && (
                            <span className="text-xs text-primary-1 font-bold">Terpilih</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormField>
          </div>

            {/* Deskripsi Event */}
            <FormField label="Deskripsi Event">
              <FormTextarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormValue({ description: e.target.value })}
                placeholder="Jelaskan deskripsi kegiatan, materi yang dibahas, atau informasi penting lainnya..."
              />
            </FormField>

            {/* Foto Dokumentasi (Opsional) */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <label className="font-bold block text-sm">
                  Foto Dokumentasi Acara <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <span className="text-xs text-gray-500 font-medium">
                  {formData.documentation_urls.length} Foto Ditambahkan
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Dokumentasi ini akan otomatis tampil dalam slider di popup detail event publik ketika acara telah selesai dilaksanakan.
              </p>

              {/* Preview Grid */}
              {formData.documentation_urls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {formData.documentation_urls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-video rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50"
                    >
                      <img
                        src={url}
                        alt={`Dokumentasi ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeDocumentationUrl(idx)}
                          className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                          title="Hapus Foto"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/50 mb-4">
                  <p className="text-sm text-gray-400 italic">
                    Belum ada foto dokumentasi ditambahkan.
                  </p>
                </div>
              )}

              {/* Add Documentation Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative h-[48px] px-4 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) uploadDocumentationFiles(e.target.files);
                      e.target.value = "";
                    }}
                    className="cursor-pointer z-10 opacity-0 w-full h-full absolute top-0 left-0"
                  />
                  <div className="flex gap-2 items-center text-white font-bold text-sm">
                    <FiUploadCloud className="w-4 h-4" />
                    <span>Upload Foto Dokumentasi</span>
                  </div>
                </label>

              </div>

              {/* Media Library Selector for Documentation */}
              <div className="mt-4">
                <MediaLibraryMini
                  multiSelect={true}
                  selectedUrls={formData.documentation_urls}
                  onMultiSelect={(urls) => addDocumentationUrls(urls)}
                  buttonLabel="Pilih Dokumentasi dari Media Library"
                />
              </div>
            </div>

            {/* CTA Button (Opsional) */}
            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CTA Link */}
              <FormField label="CTA Link" optional>
                <FormInput
                  type="text"
                  value={formData.cta_link}
                  onChange={(e) => setFormValue({ cta_link: e.target.value })}
                  placeholder="https://google.com/forms/..."
                />
              </FormField>

              {/* CTA Label */}
              <FormField label="Label Tombol CTA" optional>
                <FormInput
                  type="text"
                  value={formData.cta_label}
                  onChange={(e) => setFormValue({ cta_label: e.target.value })}
                  placeholder="Contoh: Daftar Sekarang"
                />
              </FormField>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="is_active_toggle_edit"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormValue({ is_active: e.target.checked })}
                className="w-5 h-5 rounded text-primary-1 focus:ring-primary-1 cursor-pointer"
              />
              <label htmlFor="is_active_toggle_edit" className="text-sm font-bold cursor-pointer">
                Tampilkan Event Ini ke Publik (Aktif)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isUploading}
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LoadingModal isLoading={isUploading} message="Sedang memperbarui event..." />
      <SuccessModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          navigate("/cms/events");
        }}
        title="Berhasil!"
        message="Event telah berhasil diperbarui."
      />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => navigate("/cms/events")}
        title="Batalkan Perubahan?"
        message="Perubahan yang belum disimpan akan dikembalikan seperti semula."
      />
      {errorMessage && (
        <ConfirmModal
          isOpen={!!errorMessage}
          onClose={() => setErrorMessage("")}
          onConfirm={() => setErrorMessage("")}
          title="Gagal"
          message={errorMessage}
          confirmText="Tutup"
        />
      )}
    </div>
  );
}
