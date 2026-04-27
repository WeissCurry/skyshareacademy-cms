import { useEffect, useState } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import Sidebar from "@widgets/Sidebar";

import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";

import BookletSection from "./components/BookletSection";
import AlurSection from "./components/AlurSection";
import TimelineSection from "./components/TimelineSection";
import EventHighlightSection from "./components/EventHighlightSection";
import ActionButtonsSection from "./components/ActionButtonsSection";

interface MentorForm {
  file_booklet?: string;
  gambar_alur_acara?: File | string;
  gambar_timeline?: File | string;
  link_cta?: string;
  link_join_program?: string;
  is_event_active?: boolean;
  event_image_url?: File | string;
  event_cta_link?: string;
  // Temporary states for pasted URLs
  url_alur?: string;
  url_timeline?: string;
  url_event?: string;
}

function CmsMentorForm() {
  const [mentorForm, setMentorForm] = useState<MentorForm>({});
  const [imagePreviewAlur, setImagePreviewAlur] = useState("");
  const [imagePreviewTimeline, setImagePreviewTimeline] = useState("");
  const [imagePreviewEvent, setImagePreviewEvent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    setLoadingMessage("Fetching data...");
    setIsUploading(true);
    try {
      const response = await skyshareApi.get("/mentor");
      const data = response.data.data;
      setMentorForm(data);
      setImagePreviewAlur(data.gambar_alur_acara || "");
      setImagePreviewTimeline(data.gambar_timeline || "");
      setImagePreviewEvent(data.event_image_url || "");
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
    if (mentorForm.file_booklet) formData.append("file_booklet", mentorForm.file_booklet);
    if (mentorForm.gambar_alur_acara instanceof File) formData.append("gambar_alur_acara", mentorForm.gambar_alur_acara);
    if (mentorForm.gambar_timeline instanceof File) formData.append("gambar_timeline", mentorForm.gambar_timeline);
    if (mentorForm.link_cta) formData.append("link_cta", mentorForm.link_cta);
    if (mentorForm.link_join_program) formData.append("link_join_program", mentorForm.link_join_program);
    formData.append("is_event_active", String(mentorForm.is_event_active || false));
    if (mentorForm.event_image_url instanceof File) formData.append("event_image_url", mentorForm.event_image_url);
    if (mentorForm.event_cta_link) formData.append("event_cta_link", mentorForm.event_cta_link);

    setLoadingMessage("Saving changes...");
    setIsUploading(true);
    try {
      await skyshareApi.put("/mentor", formData);
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
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        <div><Sidebar /></div>
        <div className="w-full">
          <div>
            <h1 className="headline-1">Mentor Academy</h1>
            <p className="paragraph">Kelola konten Mentor Academy Anda di sini.</p>
          </div>

          <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-2xl pb-10 px-8 w-full">
            <BookletSection 
              value={mentorForm.file_booklet} 
              onChange={(val) => setMentorForm({ ...mentorForm, file_booklet: val })} 
            />
            
            <AlurSection 
              imagePreviewUrl={imagePreviewAlur}
              urlValue={mentorForm.url_alur || ""}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMentorForm({ ...mentorForm, gambar_alur_acara: file, url_alur: "" });
                  setImagePreviewAlur(URL.createObjectURL(file));
                }
              }}
              onUrlChange={(val) => {
                setMentorForm({ ...mentorForm, url_alur: val, gambar_alur_acara: val });
                setImagePreviewAlur(val);
              }}
            />

            <TimelineSection 
              imagePreviewUrl={imagePreviewTimeline}
              urlValue={mentorForm.url_timeline || ""}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMentorForm({ ...mentorForm, gambar_timeline: file, url_timeline: "" });
                  setImagePreviewTimeline(URL.createObjectURL(file));
                }
              }}
              onUrlChange={(val) => {
                setMentorForm({ ...mentorForm, url_timeline: val, gambar_timeline: val });
                setImagePreviewTimeline(val);
              }}
            />

            <EventHighlightSection 
              isActive={!!mentorForm.is_event_active}
              onToggle={() => setMentorForm({ ...mentorForm, is_event_active: !mentorForm.is_event_active })}
              imageUrl={imagePreviewEvent}
              ctaLink={mentorForm.event_cta_link || ""}
              urlValue={mentorForm.url_event || ""}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMentorForm({ ...mentorForm, event_image_url: file, url_event: "" });
                  setImagePreviewEvent(URL.createObjectURL(file));
                }
              }}
              onUrlChange={(val) => {
                setMentorForm({ ...mentorForm, url_event: val, event_image_url: val });
                setImagePreviewEvent(val);
              }}
              onCtaChange={(val) => setMentorForm({ ...mentorForm, event_cta_link: val })}
            />

            <ActionButtonsSection 
              linkCta={mentorForm.link_cta}
              linkJoinProgram={mentorForm.link_join_program}
              onCtaChange={(val) => setMentorForm({ ...mentorForm, link_cta: val })}
              onJoinProgramChange={(val) => setMentorForm({ ...mentorForm, link_join_program: val })}
              onSave={handleSave}
              onCancel={() => setIsCancelModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <LoadingModal isLoading={isUploading} message={loadingMessage} />
      <SuccessModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Berhasil!" message="Konten Mentor Academy telah diperbarui." />
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

export default CmsMentorForm;