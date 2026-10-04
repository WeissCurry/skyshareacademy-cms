import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";
import PopupListEditor from "../event-management/components/PopupListEditor";
import { useMultiPopupForm } from "../event-management/hooks/useMultiPopupForm";

export default function CmsPopupManagement() {
  const { state, actions } = useMultiPopupForm();

  const {
    config,
    isUploading,
    loadingMessage,
    isSaveModalOpen,
    isCancelModalOpen,
    errorMessage,
  } = state;

  const {
    toggleGlobalActive,
    toggleRandomize,
    addPopup,
    addPopupsFromMedia,
    updatePopup,
    removePopup,
    handleSave,
    handleCancel,
    setIsSaveModalOpen,
    setIsCancelModalOpen,
    setErrorMessage,
  } = actions;

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch min-h-screen pb-20">
      <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4 md:px-0">
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>
        <div className="w-full min-w-0">
          <div className="mb-6">
            <h1 className="headline-1">Popup Management</h1>
            <p className="text-sm text-neutral-3 mt-1">
              Atur banner popup yang ditampilkan kepada pengunjung website
            </p>
          </div>

          <div className="shadow-md bg-neutral-white mt-4 border-2 border-black rounded-2xl p-5 sm:p-8 w-full">
            <PopupListEditor
              config={config}
              onToggleGlobalActive={toggleGlobalActive}
              onToggleRandomize={toggleRandomize}
              onAddPopup={addPopup}
              onAddPopupsFromMedia={addPopupsFromMedia}
              onUpdatePopup={updatePopup}
              onRemovePopup={removePopup}
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition-colors text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto px-8 py-3 bg-primary-1 text-white font-bold rounded-xl hover:bg-primary-2 transition-colors shadow-sm text-center"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoadingModal isLoading={isUploading} message={loadingMessage} />
      <SuccessModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Berhasil!"
        message="Konfigurasi popup telah berhasil disimpan."
      />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Batalkan Perubahan?"
        message="Perubahan yang belum disimpan akan dikembalikan ke pengaturan awal."
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
