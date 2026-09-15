import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";

export interface EventPopupForm {
  is_event_active?: boolean;
  event_image_url?: File | string;
  event_cta_link?: string;
  url_event?: string;
}

export function useEventForm() {
  const [eventForm, setEventForm] = useState<EventPopupForm>({});
  const [imagePreviewEvent, setImagePreviewEvent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoadingMessage("Mengambil data event...");
    setIsUploading(true);
    try {
      const response = await skyshareApi.get("/mentor");
      const data = response.data.data;
      setEventForm({
        is_event_active: Boolean(data.is_event_active),
        event_image_url: data.event_image_url || "",
        event_cta_link: data.event_cta_link || "",
        url_event: typeof data.event_image_url === "string" ? data.event_image_url : "",
      });
      setImagePreviewEvent(data.event_image_url || "");
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
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
    setLoadingMessage("Menyimpan perubahan...");
    setIsUploading(true);
    try {
      // Ambil data mentor saat ini terlebih dahulu agar field mentor lainnya tidak tertimpa/hilang
      const currentMentorRes = await skyshareApi.get("/mentor");
      const currentData = currentMentorRes.data.data || {};

      const formData = new FormData();
      if (currentData.file_booklet) formData.append("file_booklet", currentData.file_booklet);
      if (currentData.gambar_alur_acara) formData.append("gambar_alur_acara", currentData.gambar_alur_acara);
      if (currentData.gambar_timeline) formData.append("gambar_timeline", currentData.gambar_timeline);
      if (currentData.link_cta) formData.append("link_cta", currentData.link_cta);
      if (currentData.link_join_program) formData.append("link_join_program", currentData.link_join_program);

      // Field popup event yang diubah
      formData.append("is_event_active", String(eventForm.is_event_active || false));
      if (eventForm.event_image_url instanceof File || typeof eventForm.event_image_url === "string") {
        formData.append("event_image_url", eventForm.event_image_url);
      }
      if (eventForm.event_cta_link) {
        formData.append("event_cta_link", eventForm.event_cta_link);
      }

      await skyshareApi.put("/mentor", formData);
      logActivity("Memperbarui pengaturan Event Popup / Pengumuman Global");
      setIsSaveModalOpen(true);
    } catch (error: unknown) {
      const err = error as Error;
      setErrorMessage(err.message || "Gagal menyimpan data event");
    } finally {
      setIsUploading(false);
    }
  };

  const updateFormValue = (updates: Partial<EventPopupForm>) => {
    setEventForm((prev) => ({ ...prev, ...updates }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormValue({ event_image_url: file, url_event: "" });
      setImagePreviewEvent(URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (val: string) => {
    updateFormValue({ url_event: val, event_image_url: val });
    setImagePreviewEvent(val);
  };

  return {
    state: {
      eventForm,
      imagePreviewEvent,
      isUploading,
      isSaveModalOpen,
      isCancelModalOpen,
      loadingMessage,
      errorMessage,
    },
    actions: {
      setEventForm,
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
      fetchData,
    },
  };
}
