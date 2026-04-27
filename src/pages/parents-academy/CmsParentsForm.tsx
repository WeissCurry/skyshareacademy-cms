import Sidebar from "@widgets/Sidebar";

import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";

import BookletSection from "./components/BookletSection";
import AlurSection from "./components/AlurSection";
import TimelineSection from "./components/TimelineSection";
import ActionButtonsSection from "./components/ActionButtonsSection";

import { useParentsForm } from "./hooks/useParentsForm";

function CmsParentsForm() {
  const { state, actions } = useParentsForm();
  
  const {
    parentsForm,
    imagePreviewAlur,
    imagePreviewTimeline,
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
        <div><Sidebar /></div>
        <div className="w-full">
          <div>
            <h1 className="headline-1">Parents Academy</h1>
            <p className="paragraph">Kelola konten Parents Academy Anda di sini.</p>
          </div>

          <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-2xl pb-10 px-8 w-full">
            <BookletSection 
              value={parentsForm.file_booklet} 
              onChange={(val) => updateFormValue({ file_booklet: val })} 
            />
            
            <AlurSection 
              imagePreviewUrl={imagePreviewAlur}
              urlValue={parentsForm.url_alur || ""}
              onFileChange={handleFileChange('gambar_alur_acara', actions.setImagePreviewAlur, 'url_alur')}
              onUrlChange={handleUrlChange('gambar_alur_acara', actions.setImagePreviewAlur, 'url_alur')}
            />

            <TimelineSection 
              imagePreviewUrl={imagePreviewTimeline}
              urlValue={parentsForm.url_timeline || ""}
              onFileChange={handleFileChange('gambar_timeline', actions.setImagePreviewTimeline, 'url_timeline')}
              onUrlChange={handleUrlChange('gambar_timeline', actions.setImagePreviewTimeline, 'url_timeline')}
            />

            <ActionButtonsSection 
              linkCta={parentsForm.link_cta}
              linkJoinProgram={parentsForm.link_join_program}
              onCtaChange={(val) => updateFormValue({ link_cta: val })}
              onJoinProgramChange={(val) => updateFormValue({ link_join_program: val })}
              onSave={handleSave}
              onCancel={() => setIsCancelModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <LoadingModal isLoading={isUploading} message={loadingMessage} />
      <SuccessModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Berhasil!" message="Konten Parents Academy telah diperbarui." />
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

export default CmsParentsForm;
