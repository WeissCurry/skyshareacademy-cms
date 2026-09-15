import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";
import EventHighlightSection from "./components/EventHighlightSection";
import { useEventForm } from "./hooks/useEventForm";

export default function CmsEventManagement() {
  const { state, actions } = useEventForm();

  const {
    eventForm,
    imagePreviewEvent,
    isUploading,
    isSaveModalOpen,
    isCancelModalOpen,
    loadingMessage,
    errorMessage,
  } = state;

  const {
    setIsSaveModalOpen,
    setIsCancelModalOpen,
    setErrorMessage,
    updateFormValue,
    handleSave,
    handleFileChange,
    handleUrlChange,
  } = actions;

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch min-h-screen pb-20">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        <div className="shrink-0">
          <Sidebar />
        </div>
        <div className="w-full min-w-0">
          <div>
            <h1 className="headline-1">Event & Announcement</h1>
            <p className="paragraph">
              Kelola pop-up event dan banner pengumuman global yang tampil di website.
            </p>
          </div>

          <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-2xl pb-10 px-8 w-full">
            <EventHighlightSection
              isActive={!!eventForm.is_event_active}
              onToggle={() =>
                updateFormValue({ is_event_active: !eventForm.is_event_active })
              }
              imageUrl={imagePreviewEvent}
              ctaLink={eventForm.event_cta_link || ""}
              urlValue={eventForm.url_event || ""}
              onFileChange={handleFileChange}
              onUrlChange={handleUrlChange}
              onCtaChange={(val) => updateFormValue({ event_cta_link: val })}
            />

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-3 bg-primary-1 text-white font-bold rounded-xl hover:bg-primary-2 transition-colors shadow-sm"
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
        message="Pengaturan popup event telah diperbarui."
      />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => window.location.reload()}
        title="Batalkan?"
        message="Perubahan yang belum disimpan akan hilang."
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
