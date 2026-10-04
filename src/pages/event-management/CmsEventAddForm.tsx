import { useState, useRef, useEffect } from "react";
import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";
import MediaLibraryMini from "@features/media-library/MediaLibraryMini";
import Show from "@shared/assets/images/mascot-icons/Show.png";
import Chain from "@shared/assets/images/mascot-icons/Link.png";
import ArrowLeft from "@shared/assets/images/mascot-icons/Arrow - Down 3.png";
import Arrow from "@shared/assets/images/mascot-icons/Arrow-down.png";
import Plus from "@shared/assets/images/mascot-icons/Plus-0.png";
import Del from "@shared/assets/images/mascot-icons/Delete-0.png";
import { useEventAddForm } from "./hooks/useEventAddForm";
import { TARGET_PROGRAMS } from "./types/event";

export default function CmsEventAddForm() {
  const { state, actions } = useEventAddForm();
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const programDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const {
    formData,
    imagePreviewUrl,
    urlValue,
    isUploading,
    isSaveModalOpen,
    isCancelModalOpen,
    errorMessage,
    mediaImages,
    isMediaLoading,
    categories,
    selectedCategory,
    isDropdownOpen,
    isDropdownAddOpen,
    categoryName,
    colorInput,
    deleteMessage,
    isCategoryModalOpen,
  } = state;

  const {
    setFormValue,
    handleFileChange,
    handleUrlChange,
    handleSubmit,
    setIsSaveModalOpen,
    setIsCancelModalOpen,
    setErrorMessage,
    navigate,
    setSelectedCategory,
    setIsDropdownOpen,
    setIsDropdownAddOpen,
    setCategoryName,
    setColorInput,
    setCategoryToDeleteId,
    setDeleteMessage,
    setIsCategoryModalOpen,
    addCategory,
    deleteCategory,
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
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsDropdownOpen]);

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
              <h1 className="headline-1">Tambah Event Baru</h1>
              <p className="text-sm font-medium text-black mt-1">
                Lengkapi formulir di bawah ini untuk membuat event atau kegiatan baru
              </p>
            </div>
          </div>

          <div className="bg-neutral-white mt-8 border-2 border-black rounded-xl p-6 sm:p-8 w-full overflow-hidden space-y-8 shadow-sm">
            {/* Thumbnail Poster */}
            <div>
              <label className="font-bold block mb-2 text-sm">
                Poster / Thumbnail Event <span className="text-orange-500">*</span>
              </label>
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
                    <p className="text-white font-bold">Upload File Baru</p>
                    <img className="w-6 -rotate-90" src={Show} alt="" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <img src={Chain} className="w-5" alt="" />
                  </div>
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar di sini..."
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
            </div>

            {/* Judul Event */}
            <div>
              <label className="font-bold block mb-2 text-sm">
                Nama / Judul Event <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormValue({ title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                placeholder="Contoh: UI/UX Masterclass Batch 4..."
              />
            </div>

            {/* Grid Tanggal, Kategori, Target Program */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tanggal Pelaksanaan (Date only) */}
              <div>
                <label className="font-bold block mb-2 text-sm">
                  Tanggal Pelaksanaan <span className="text-orange-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormValue({ event_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors text-sm"
                />
              </div>

              {/* Kategori Event (Sumber sama dengan Artikel) */}
              <div className="relative" ref={categoryDropdownRef}>
                <label className="font-bold block mb-2 text-sm">
                  Kategori Event <span className="text-orange-500">*</span>
                </label>
                <div
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setIsProgramDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl flex justify-between items-center cursor-pointer hover:border-black transition-colors bg-white min-h-[50px]"
                >
                  {selectedCategory ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1 rounded-full text-white text-xs font-bold"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        {selectedCategory.name}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Pilih Kategori</span>
                  )}
                  <img
                    className={`w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    src={Arrow}
                    alt=""
                  />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto p-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer group mb-1"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setFormValue({
                              category_id: String(cat.id),
                              event_type: cat.name,
                            });
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="px-3 py-1 rounded-full text-white text-xs font-bold"
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.name}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryToDeleteId(String(cat.id));
                              setDeleteMessage(`Hapus kategori "${cat.name}"?`);
                              setIsCategoryModalOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg transition-all text-red-500"
                            title="Hapus Kategori"
                          >
                            <img className="w-4" src={Del} alt="Delete" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDropdownAddOpen(true)}
                      className="w-full p-3 bg-gray-50 flex items-center justify-center gap-2 font-bold hover:bg-gray-100 border-t text-xs text-neutral-1"
                    >
                      <img className="w-4" src={Plus} alt="" /> Tambah Kategori
                    </button>
                  </div>
                )}
              </div>

              {/* Target Program (4 Pilihan - Seragam dengan Dropdown Kategori) */}
              <div className="relative" ref={programDropdownRef}>
                <label className="font-bold block mb-2 text-sm">
                  Target Program
                </label>
                <div
                  onClick={() => {
                    setIsProgramDropdownOpen(!isProgramDropdownOpen);
                    setIsDropdownOpen(false);
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
                          className={`flex items-center justify-between p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer group transition-colors ${
                            formData.target_role === prog.id ? "bg-gray-50 font-bold" : ""
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
            </div>

            {/* Deskripsi Event */}
            <div>
              <label className="font-bold block mb-2 text-sm">
                Deskripsi Event
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormValue({ description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors text-sm"
                placeholder="Jelaskan deskripsi kegiatan, materi yang dibahas, atau informasi penting lainnya..."
              />
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="is_active_toggle"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormValue({ is_active: e.target.checked })}
                className="w-5 h-5 rounded text-primary-1 focus:ring-primary-1 cursor-pointer"
              />
              <label htmlFor="is_active_toggle" className="text-sm font-bold cursor-pointer">
                Tampilkan Event Ini ke Publik (Aktif)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition-colors text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full sm:w-auto px-8 py-3 bg-primary-1 text-white font-bold rounded-xl hover:bg-primary-2 transition-colors shadow-sm text-center disabled:opacity-50"
              >
                {isUploading ? "Menyimpan..." : "Simpan Event"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Kategori */}
      {isDropdownAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-black">
            <h3 className="text-xl font-bold mb-4">Tambah Kategori Baru</h3>
            <form onSubmit={addCategory} className="space-y-4">
              <div>
                <label className="text-sm font-bold block mb-1">Nama Kategori</label>
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-black text-sm"
                  placeholder="Contoh: Webinar"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Warna Label</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                  />
                  <input
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg font-mono uppercase text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDropdownAddOpen(false)}
                  className="flex-1 py-2 bg-gray-100 rounded-lg font-bold text-sm hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-1 text-white rounded-lg font-bold text-sm hover:bg-primary-2"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Kategori */}
      <ConfirmModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onConfirm={deleteCategory}
        title="Hapus Kategori?"
        message={deleteMessage}
        confirmText="Hapus"
      />

      <LoadingModal isLoading={isUploading} message="Sedang menyimpan data event..." />
      <SuccessModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          navigate("/cms/events");
        }}
        title="Berhasil!"
        message="Event baru telah berhasil ditambahkan."
      />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => navigate("/cms/events")}
        title="Batalkan Pengisian?"
        message="Data yang sudah Anda isi tidak akan tersimpan."
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
