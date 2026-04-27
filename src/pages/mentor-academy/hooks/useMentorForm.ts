import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import skyshareApi from "@shared/api/skyshareApi";

export interface MentorForm {
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

export function useMentorForm() {
  const [mentorForm, setMentorForm] = useState<MentorForm>({});
  const [imagePreviewAlur, setImagePreviewAlur] = useState("");
  const [imagePreviewTimeline, setImagePreviewTimeline] = useState("");
  const [imagePreviewEvent, setImagePreviewEvent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, [fetchData]);

  const handleSave = async () => {
    const formData = new FormData();
    if (mentorForm.file_booklet) formData.append("file_booklet", mentorForm.file_booklet);
    if (mentorForm.gambar_alur_acara instanceof File || typeof mentorForm.gambar_alur_acara === "string") formData.append("gambar_alur_acara", mentorForm.gambar_alur_acara);
    if (mentorForm.gambar_timeline instanceof File || typeof mentorForm.gambar_timeline === "string") formData.append("gambar_timeline", mentorForm.gambar_timeline);
    if (mentorForm.link_cta) formData.append("link_cta", mentorForm.link_cta);
    if (mentorForm.link_join_program) formData.append("link_join_program", mentorForm.link_join_program);
    formData.append("is_event_active", String(mentorForm.is_event_active || false));
    if (mentorForm.event_image_url instanceof File || typeof mentorForm.event_image_url === "string") formData.append("event_image_url", mentorForm.event_image_url);
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

  const updateFormValue = (updates: Partial<MentorForm>) => {
    setMentorForm(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (field: keyof MentorForm, previewSetter: (url: string) => void, urlField: keyof MentorForm) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormValue({ [field]: file, [urlField]: "" });
      previewSetter(URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (field: keyof MentorForm, previewSetter: (url: string) => void, urlField: keyof MentorForm) => (val: string) => {
    updateFormValue({ [urlField]: val, [field]: val });
    previewSetter(val);
  };

  return {
    state: {
      mentorForm,
      imagePreviewAlur,
      imagePreviewTimeline,
      imagePreviewEvent,
      isUploading,
      isSaveModalOpen,
      isCancelModalOpen,
      loadingMessage,
      errorMessage,
    },
    actions: {
      setMentorForm,
      setImagePreviewAlur,
      setImagePreviewTimeline,
      setImagePreviewEvent,
      setIsUploading,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setLoadingMessage,
      setErrorMessage,
      updateFormValue,
      handleSave,
      handleFileChange,
      handleUrlChange,
    }
  };
}
