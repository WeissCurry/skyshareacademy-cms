
import Sidebar from "@widgets/Sidebar";
import Arrow from "@shared/assets/images/mascot-icons/Arrow-down.png";
import Del from "@shared/assets/images/mascot-icons/Delete-0.png";

import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";
import RichTextEditor from "@shared/ui/RichTextEditor";
import MediaLibraryMini from "@features/media-library/MediaLibraryMini";

import Show from "@shared/assets/images/mascot-icons/Show.png";
import Chain from "@shared/assets/images/mascot-icons/Link.png";
import ArrowLeft from "@shared/assets/images/mascot-icons/Arrow - Down 3.png";

import { useArticleEditForm } from "./hooks/useArticleEditForm";

function CmsArticleEditForm() {
  const { state, actions } = useArticleEditForm();
  
  const {
    isDropdownOpen,
    isModalOpen,
    isSaveModalOpen,
    isCancelModalOpen,
    isCategorySelected,
    deleteMessage,
    categories,
    articleForm,
    imagePreviewUrl,
    urlValue,
    isUploading,
    loadingMessage,
    selectedCategory,
    mediaImages,
    isMediaLoading,
  } = state;

  const {
    setIsDropdownOpen,
    setIsModalOpen,
    setIsCancelModalOpen,
    setIsCategorySelected,
    setDeleteMessage,
    setSelectedCategory,
    setCategoryId,
    setFormValue,
    handleFileChange,
    handleUrlChange,
    handleArticleUpdate,
    deleteCategory,
    navigate,
  } = actions;

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch h-auto pb-44">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        <div><Sidebar /></div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-4">
            <button onClick={() => navigate("/cms/article")} className="hover:scale-110 transition-transform mt-1">
              <img className="w-10 rotate-90 invert" src={ArrowLeft} alt="Back" />
            </button>
            <div>
              <h1 className="headline-1">Edit Article</h1>
              <p className="text-sm font-medium text-black mt-1">Masukkan data pada field yang tertera</p>
            </div>
          </div>
          
          <div className="bg-neutral-white mt-8 border-2 border-black rounded-xl p-8 w-full overflow-hidden space-y-8 shadow-sm">
            
            {/* Heading Image */}
            <div>
              <label className="font-bold block mb-2 text-sm">Upload gambar heading <span className="text-orange-500">*</span></label>
              <div className="border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white min-h-[160px] relative group overflow-hidden">
                {imagePreviewUrl ? (
                  <div className="flex justify-center h-full p-2 w-full">
                    <img src={imagePreviewUrl} alt="Preview" className="w-full max-w-[400px] h-auto object-contain rounded-lg border border-gray-200" />
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">No image preview available</p>
                )}
              </div>
              <div className="flex justify-center mt-2 mb-4">
                <p className="text-xs text-gray-500 font-bold">Minimal Ukuran (956 x 350px)</p>
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
                <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pilih salah satu: Upload file atau tempel link dari Media Library</h4>
              </div>
              <div className="mt-6">
                <MediaLibraryMini images={mediaImages} isLoading={isMediaLoading} onSelect={handleUrlChange} />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="font-bold block mb-2 text-sm">Judul <span className="text-orange-500">*</span></label>
              <input
                value={articleForm.title}
                onChange={(e) => setFormValue({ title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                placeholder="Masukkan judul artikel"
              />
            </div>
            
            {/* CTA Link */}
            <div>
              <label className="font-bold block mb-2 text-sm">CTA Link</label>
              <input
                value={articleForm.link}
                onChange={(e) => setFormValue({ link: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                placeholder="https://..."
              />
            </div>

            {/* Category */}
            <div className="relative">
              <label className="font-bold block mb-2 text-sm">Kategori <span className="text-orange-500">*</span></label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl flex justify-between items-center cursor-pointer hover:border-black transition-colors"
              >
                {isCategorySelected ? (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: selectedCategory?.color }}>
                      {selectedCategory?.name}
                    </div>
                  </div>
                ) : <span className="text-gray-400">Pilih Kategori</span>}
                <img className={`w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} src={Arrow} alt="" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto p-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer group mb-1" onClick={() => {
                        setSelectedCategory(cat);
                        setFormValue({ category_id: cat.id });
                        setIsCategorySelected(true);
                        setIsDropdownOpen(false);
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: cat.color }}>
                            {cat.name}
                          </div>
                        </div>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setCategoryId(cat.id);
                          setDeleteMessage(`Hapus kategori "${cat.name}"?`);
                          setIsModalOpen(true);
                        }} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all text-red-500">
                          <img className="w-4" src={Del} alt="Delete" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0">
              <label className="font-bold block mb-2 text-sm">Berikan isi <span className="text-orange-500">*</span></label>
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden mt-2">
                <RichTextEditor 
                  value={articleForm.content} 
                  onChange={(content) => setFormValue({ content })} 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-4">
              <button onClick={() => setIsCancelModalOpen(true)} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors text-sm">Batal</button>
              <button onClick={handleArticleUpdate} className="px-10 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-bold transition-all active:scale-95 text-sm shadow-md">Simpan</button>
            </div>

          </div>
        </div>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteCategory} title="Hapus Kategori?" message={deleteMessage} type="danger" confirmText="Hapus" />
      <ConfirmModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={() => navigate("/cms/article")} title="Batalkan Perubahan?" message="Progres yang Anda buat tidak akan tersimpan." confirmText="Ya, Batalkan" cancelText="Lanjutkan Edit" />
      <SuccessModal isOpen={isSaveModalOpen} onClose={() => navigate("/cms/article")} title="Artikel Berhasil Diupdate" />
      <LoadingModal isLoading={isUploading} message={loadingMessage} />
    </div>
  );
}

export default CmsArticleEditForm;
