import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import type { EventFormData, CmsEvent } from "../types/event";
import type { MediaImage } from "./useEventAddForm";

export function useEventEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
      if (!id) return;
      setIsLoading(true);
      try {
        await fetchMedia();

        const response = await skyshareApi.get(`/admin/events/${id}`);
        const event: CmsEvent = response.data.data;
        if (event) {
          // Format date for date-only input (YYYY-MM-DD)
          let formattedDate = "";
          if (event.event_date) {
            const d = new Date(event.event_date);
            const pad = (n: number) => String(n).padStart(2, "0");
            formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          }

          let docUrls: string[] = [];
          if (Array.isArray(event.documentation_urls)) {
            docUrls = event.documentation_urls;
          } else if (typeof event.documentation_urls === "string") {
            try {
              docUrls = JSON.parse(event.documentation_urls);
            } catch {
              docUrls = [];
            }
          }

          setFormData({
            title: event.title || "",
            description: event.description || "",
            event_date: formattedDate,
            event_type: event.event_type || "workshop",
            thumbnail_url: event.thumbnail_url || null,
            documentation_urls: Array.isArray(docUrls) ? docUrls : [],
            target_role: event.target_role || "all",
            is_active: event.is_active ?? true,
          });

          if (event.thumbnail_url) {
            setImagePreviewUrl(event.thumbnail_url);
            setUrlValue(event.thumbnail_url);
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching event details:", err);
        setErrorMessage("Gagal mengambil data event.");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [id]);

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
    } else if (typeof formData.thumbnail_url === "string") {
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
      await skyshareApi.put(`/admin/events/${id}`, payload);
      logActivity(`Memperbarui event "${formData.title}" (ID: ${id})`);
      setIsSaveModalOpen(true);
    } catch (err: unknown) {
      console.error("Error updating event:", err);
      setErrorMessage("Gagal memperbarui event.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    state: {
      id,
      formData,
      imagePreviewUrl,
      urlValue,
      isLoading,
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
