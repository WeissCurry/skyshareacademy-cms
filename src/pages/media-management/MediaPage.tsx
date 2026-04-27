import { FaCopy, FaExternalLinkAlt, FaTrash, FaCloudUploadAlt, FaCheck, FaSquare, FaCheckSquare, FaRedo } from "react-icons/fa";
import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";



import { useMediaPage } from "./hooks/useMediaPage";

const CmsMedia = () => {
  const { state, actions } = useMediaPage();
  
  const {
    images,
    loading,
    isUploading,
    isSuccessModalOpen,
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    isDragging,
    isSelectMode,
    selectedIds,
    nextCursor,
    currentPage,
  } = state;

  const {
    setIsSuccessModalOpen,
    setIsDeleteModalOpen,
    setIsBulkDeleteModalOpen,
    setDeletePublicId,
    setIsSelectMode,
    setSelectedIds,
    fetchImages,
    handleNextPage,
    handlePrevPage,
    handleUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDelete,
    handleBulkDelete,
    toggleSelectImage,
    selectAllOnPage,
    copyToClipboard,
  } = actions;

  return (
    <div className="bg-background min-h-screen flex flex-col pt-12 items-center self-stretch pb-20">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex-1">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="headline-1">Media Library</h1>
              <p className="paragraph">Kelola aset gambar Anda ({images.length} item di halaman ini)</p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  setSelectedIds([]);
                }}
                className={`py-3 px-6 rounded-xl font-bold flex items-center gap-2 border-2 border-black transition-all ${isSelectMode ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                {isSelectMode ? <FaCheck /> : <FaSquare />} {isSelectMode ? "Cancel Select" : "Select Mode"}
              </button>

              <input 
                type="file" 
                id="media-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleUpload}
              />
              <label 
                htmlFor="media-upload"
                className="bg-primary-1 text-white py-3 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer hover:bg-primary-2 active:translate-y-0.5 transition-all"
              >
                <FaCloudUploadAlt className="text-xl" /> Upload
              </label>
            </div>
          </div>

          {isSelectMode && (
            <div className="mb-6 flex justify-between items-center bg-primary-1/5 p-4 rounded-xl border-2 border-primary-1/20 border-dashed">
              <div className="flex items-center gap-4">
                <button 
                  onClick={selectAllOnPage}
                  className="text-sm font-bold flex items-center gap-2 hover:text-primary-1"
                >
                  {selectedIds.length === images.length ? <FaCheckSquare /> : <FaSquare />}
                  Select All on Page
                </button>
                <span className="text-sm font-medium text-gray-600">{selectedIds.length} item dipilih</span>
              </div>
              
              {selectedIds.length > 0 && (
                <button 
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-600 shadow-sm transition-all"
                >
                  <FaTrash /> Hapus {selectedIds.length} Item
                </button>
              )}
            </div>
          )}

          <div 
            className={`bg-white border-2 border-black rounded-2xl p-6 relative transition-all duration-300 ${isDragging ? 'ring-4 ring-primary-1 ring-offset-2 border-primary-1' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-primary-1/10 backdrop-blur-sm rounded-2xl border-4 border-dashed border-primary-1 m-1 pointer-events-none">
                <div className="bg-white p-6 rounded-full shadow-2xl mb-4 animate-bounce">
                  <FaCloudUploadAlt className="text-primary-1 text-5xl" />
                </div>
                <h3 className="text-2xl font-bold text-primary-1 uppercase tracking-tighter">Lepaskan untuk Upload</h3>
                <p className="text-primary-1/70 font-medium">Gambar akan otomatis masuk ke library</p>
              </div>
            )}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-bounce mb-4">
                  <div className="w-16 h-16 bg-primary-1 rounded-full flex items-center justify-center shadow-lg">
                    <FaCloudUploadAlt className="text-white text-3xl animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-500 font-bold text-lg">Memuat Galeri...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-lg">Library kosong atau tidak ditemukan aset di folder ini.</p>
                <button onClick={() => fetchImages()} className="mt-4 text-primary-1 font-bold flex items-center gap-2 mx-auto hover:underline">
                   <FaRedo /> Coba Lagi
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {images.map((img) => (
                    <div 
                      key={img.asset_id} 
                      className={`group relative bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 ${isSelectMode && selectedIds.includes(img.public_id) ? 'border-primary-1 ring-4 ring-primary-1/10' : 'border-gray-200 hover:border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'}`}
                      onClick={() => isSelectMode && toggleSelectImage(img.public_id)}
                    >
                      {/* Checkbox overlay for select mode */}
                      {isSelectMode && (
                        <div className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${selectedIds.includes(img.public_id) ? 'bg-primary-1 border-primary-1 text-white' : 'bg-white/80 border-gray-400 text-transparent'}`}>
                          <FaCheck size={12} />
                        </div>
                      )}

                      <div className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer">
                        <img 
                          src={img.secure_url} 
                          alt={img.public_id} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        
                        {!isSelectMode && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                            <a
                              href={img.secure_url}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white p-3 rounded-lg shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaExternalLinkAlt className="text-black text-lg" />
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletePublicId(img.public_id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="bg-red-500 p-3 rounded-lg shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                            >
                              <FaTrash className="text-white text-lg" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-mono text-gray-400 truncate mb-2 uppercase tracking-tighter">
                          {img.public_id.split('/').pop()}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(img.secure_url);
                          }}
                          className="w-full bg-[#f89e2e] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#e68d24] active:translate-y-0.5 transition-all shadow-sm"
                        >
                          <FaCopy /> Salin URL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-12 flex justify-center items-center gap-4 border-t pt-8">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-6 py-2 rounded-xl border-2 border-black font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Prev
                  </button>
                  <span className="font-bold text-gray-500">Page {currentPage}</span>
                  <button 
                    onClick={handleNextPage}
                    disabled={!nextCursor}
                    className="px-6 py-2 rounded-xl border-2 border-black font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <LoadingModal isLoading={isUploading} message="Processing..." />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Berhasil!" />
      
      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete} 
        title="Hapus Gambar?" 
        message="Gambar ini akan dihapus secara permanen dari Cloudinary."
        type="danger"
        confirmText="Hapus"
      />

      <ConfirmModal 
        isOpen={isBulkDeleteModalOpen} 
        onClose={() => setIsBulkDeleteModalOpen(false)} 
        onConfirm={handleBulkDelete} 
        title="Hapus Terpilih?" 
        message={`Anda akan menghapus ${selectedIds.length} gambar sekaligus. Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        confirmText="Hapus Semua"
      />
    </div>
  );
};

export default CmsMedia;