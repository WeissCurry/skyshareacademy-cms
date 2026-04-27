import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import skyshareApi from "@shared/api/skyshareApi";

export interface ParentsForm {
  file_booklet?: string;
  gambar_alur_acara?: File | string;
  gambar_timeline?: File | string;
  link_cta?: string;
  link_join_program?: string;
  // Temporary states for pasted URLs
  url_alur?: string;
  url_timeline?: string;
}

export function useParentsForm() {
  const [parentsForm, setParentsForm] = useState<ParentsForm>({});
  const [imagePreviewAlur, setImagePreviewAlur] = useState("");
  const [imagePreviewTimeline, setImagePreviewTimeline] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, [fetchData]);

  const handleSave = async () => {
    const formData = new FormData();
    if (parentsForm.file_booklet) formData.append("file_booklet", parentsForm.file_booklet);
    if (parentsForm.gambar_alur_acara instanceof File || typeof parentsForm.gambar_alur_acara === "string") formData.append("gambar_alur_acara", parentsForm.gambar_alur_acara);
    if (parentsForm.gambar_timeline instanceof File || typeof parentsForm.gambar_timeline === "string") formData.append("gambar_timeline", parentsForm.gambar_timeline);
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

  const updateFormValue = (updates: Partial<ParentsForm>) => {
    setParentsForm(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (field: keyof ParentsForm, previewSetter: (url: string) => void, urlField: keyof ParentsForm) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormValue({ [field]: file, [urlField]: "" });
      previewSetter(URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (field: keyof ParentsForm, previewSetter: (url: string) => void, urlField: keyof ParentsForm) => (val: string) => {
    updateFormValue({ [urlField]: val, [field]: val });
    previewSetter(val);
  };

  return {
    state: {
      parentsForm,
      imagePreviewAlur,
      imagePreviewTimeline,
      isUploading,
      isSaveModalOpen,
      isCancelModalOpen,
      loadingMessage,
      errorMessage,
    },
    actions: {
      setImagePreviewAlur,
      setImagePreviewTimeline,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setErrorMessage,
      updateFormValue,
      handleSave,
      handleFileChange,
      handleUrlChange,
    }
  };
}
