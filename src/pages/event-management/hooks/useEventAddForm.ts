import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import type { EventFormData } from "../types/event";


export interface MediaImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

export function useEventAddForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    event_date: "",
    event_type: "workshop",
    thumbnail_url: null,
    documentation_urls: [],
    target_role: "all",
    is_active: true,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [urlValue, setUrlValue] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState<boolean>(false);

  const fetchMedia = async () => {
    setIsMediaLoading(true);
    try {
      const response = await skyshareApi.get("/media");
      setMediaImages(response.data.data || []);
    } catch (err) {
      console.error("Failed to load media images:", err);
    } finally {
      setIsMediaLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMedia();
    };
    init();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail_url: file }));
      setImagePreviewUrl(URL.createObjectURL(file));
      setUrlValue("");
    }
  };

  const handleUrlChange = (val: string) => {
    setUrlValue(val);
    setFormData((prev) => ({ ...prev, thumbnail_url: val }));
    setImagePreviewUrl(val);
  };

  const addDocumentationUrls = (urls: string[]) => {
    const cleaned = urls.filter((u) => u && typeof u === "string" && u.trim());
    setFormData((prev) => ({
      ...prev,
      documentation_urls: Array.from(new Set([...prev.documentation_urls, ...cleaned])),
    }));
  };

  const removeDocumentationUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documentation_urls: prev.documentation_urls.filter((_, i) => i !== index),
    }));
  };

  const uploadDocumentationFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of fileArray) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await skyshareApi.post("/media", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const fileData = res.data?.data;
        const url =
          fileData?.file?.[0]?.path ||
          fileData?.file?.[0]?.secure_url ||
          fileData?.path ||
          fileData?.secure_url;
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        addDocumentationUrls(uploadedUrls);
        await fetchMedia();
      }
    } catch (err) {
      console.error("Gagal mengunggah foto dokumentasi:", err);
      setErrorMessage("Gagal mengunggah beberapa foto dokumentasi.");
    } finally {
      setIsUploading(false);
    }
  };

  const setFormValue = (updates: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setErrorMessage("Judul event wajib diisi.");
      return;
    }

    const payload = new FormData();
    if (formData.thumbnail_url instanceof File) {
      payload.append("thumbnail_url", formData.thumbnail_url);
    } else if (typeof formData.thumbnail_url === "string" && formData.thumbnail_url.trim()) {
      payload.append("thumbnail_url", formData.thumbnail_url.trim());
    }

    payload.append("title", formData.title);
    payload.append("description", formData.description || "");
    if (formData.event_date) {
      payload.append("event_date", formData.event_date);
    }
    payload.append("event_type", formData.event_type || "workshop");
    payload.append("target_role", formData.target_role || "all");
    payload.append("is_active", String(formData.is_active));
    payload.append(
      "documentation_urls",
      JSON.stringify(formData.documentation_urls || [])
    );

    setIsUploading(true);
    try {
      const response = await skyshareApi.post("/admin/events", payload);
      const eventId = response.data?.data?.id;
      logActivity(`Menambahkan event baru "${formData.title}"${eventId ? ` (ID: ${eventId})` : ""}`);
      setIsSaveModalOpen(true);
    } catch (err: unknown) {
      console.error("Error creating event:", err);
      setErrorMessage("Gagal menambahkan event baru.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    state: {
      formData,
      imagePreviewUrl,
      urlValue,
      isUploading,
      isSaveModalOpen,
      isCancelModalOpen,
      errorMessage,
      mediaImages,
      isMediaLoading,
    },
    actions: {
      setFormValue,
      handleFileChange,
      handleUrlChange,
      addDocumentationUrls,
      removeDocumentationUrl,
      uploadDocumentationFiles,
      handleSubmit,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setErrorMessage,
      navigate,
    },
  };
}
