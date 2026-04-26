import { useEffect, useState } from "react";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";

import LoadingModal from "@components/cms/LoadingModal";
import SuccessModal from "@components/cms/SuccessModal";
import ConfirmModal from "@components/cms/ConfirmModal";

import BookletSection from "./components/BookletSection";
import AlurSection from "./components/AlurSection";
import TimelineSection from "./components/TimelineSection";
import ActionButtonsSection from "./components/ActionButtonsSection";

interface ParentsForm {
  file_booklet?: string;
  gambar_alur_acara?: File | string;
  gambar_timeline?: File | string;
  link_cta?: string;
  link_join_program?: string;
  // Temporary states for pasted URLs
  url_alur?: string;
  url_timeline?: string;
}

function CmsParentsForm() {
  const [parentsForm, setParentsForm] = useState<ParentsForm>({});
  const [imagePreviewAlur, setImagePreviewAlur] = useState("");
  const [imagePreviewTimeline, setImagePreviewTimeline] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    setLoadingMessage("Fetching data...");
    setIsUploading(true);
    try {
      const response = await skyshareApi.get("/parent");
      const data = response.data.data;
      setParentsForm(data);
      setImagePreviewAlur(data.gambar_alur_acara || "");
      setImagePreviewTimeline(data.gambar_timeline || "");
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, []);

  const handleSave = async () => {
    const formData = new FormData();
    if (parentsForm.file_booklet) formData.append("file_booklet", parentsForm.file_booklet);
    if (parentsForm.gambar_alur_acara instanceof File) formData.append("gambar_alur_acara", parentsForm.gambar_alur_acara);
    if (parentsForm.gambar_timeline instanceof File) formData.append("gambar_timeline", parentsForm.gambar_timeline);
    if (parentsForm.link_cta) formData.append("link_cta", parentsForm.link_cta);
    if (parentsForm.link_join_program) formData.append("link_join_program", parentsForm.link_join_program);

    setLoadingMessage("Saving changes...");
    setIsUploading(true);
    try {
      await skyshareApi.put("/parent", formData);
      setIsSaveModalOpen(true);
    } catch (error: unknown) {
      const err = error as Error;
      setErrorMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch min-h-screen pb-20">
      <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4">
        <div><CmsNavCard /></div>
        <div className="w-full">
          <div>
            <h1 className="headline-1 text-3xl font-bold">Parents Academy</h1>
            <p className="paragraph text-gray-500 mt-2">Kelola konten Parents Academy Anda di sini.</p>
          </div>

          <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-2xl pb-10 px-8 w-full">
            <BookletSection 
              value={parentsForm.file_booklet} 
              onChange={(val) => setParentsForm({ ...parentsForm, file_booklet: val })} 
            />
            
            <AlurSection 
              imagePreviewUrl={imagePreviewAlur}
              urlValue={parentsForm.url_alur || ""}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setParentsForm({ ...parentsForm, gambar_alur_acara: file, url_alur: "" });
                  setImagePreviewAlur(URL.createObjectURL(file));
                }
              }}
              onUrlChange={(val) => {
                setParentsForm({ ...parentsForm, url_alur: val, gambar_alur_acara: val });
                setImagePreviewAlur(val);
              }}
            />

            <TimelineSection 
              imagePreviewUrl={imagePreviewTimeline}
              urlValue={parentsForm.url_timeline || ""}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setParentsForm({ ...parentsForm, gambar_timeline: file, url_timeline: "" });
                  setImagePreviewTimeline(URL.createObjectURL(file));
                }
              }}
              onUrlChange={(val) => {
                setParentsForm({ ...parentsForm, url_timeline: val, gambar_timeline: val });
                setImagePreviewTimeline(val);
              }}
            />

            <ActionButtonsSection 
              linkCta={parentsForm.link_cta}
              linkJoinProgram={parentsForm.link_join_program}
              onCtaChange={(val) => setParentsForm({ ...parentsForm, link_cta: val })}
              onJoinProgramChange={(val) => setParentsForm({ ...parentsForm, link_join_program: val })}
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
