import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import { convertToWebP } from "@shared/utils/imageUtils";

export interface BaseAcademyForm {
  file_booklet?: File | string | null;
  gambar_alur_acara?: File | string | null;
  gambar_timeline?: File | string | null;
  link_cta?: string;
  link_join_program?: string;
  [key: string]: File | string | boolean | number | null | undefined | (string | number)[];
}

interface UseAcademyFormOptions<T> {
  endpoint: string;
  initialState: T;
  successMessage?: string;
}

export function useAcademyForm<T extends BaseAcademyForm>({ 
  endpoint, 
  initialState,
  successMessage = "Konten telah diperbarui."
}: UseAcademyFormOptions<T>) {
  const [form, setForm] = useState<T>(initialState);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoadingMessage("Mengambil data...");
    setIsUploading(true);
    try {
      const response = await skyshareApi.get(endpoint);
      const data = response.data.data;
      setForm(prev => ({ ...prev, ...data }));
      
      // Auto-set previews for common image fields
      const newPreviews: Record<string, string> = {};
      if (data.gambar_alur_acara) newPreviews.alur = data.gambar_alur_acara;
      if (data.gambar_timeline) newPreviews.timeline = data.gambar_timeline;
      if (data.event_image_url) newPreviews.event = data.event_image_url;
      setPreviews(newPreviews);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const updateField = (updates: Partial<T>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (field: keyof T, previewKey: string, urlField?: keyof T) => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoadingMessage("Memproses gambar...");
      setIsUploading(true);
      try {
        const webpFile = await convertToWebP(file);
        const updates = { [field]: webpFile } as unknown as Partial<T>;
        if (urlField) (updates as Record<string, unknown>)[urlField as string] = "";
        updateField(updates);
        setPreviews(prev => ({ ...prev, [previewKey]: URL.createObjectURL(webpFile) }));
      } catch {
        const updates = { [field]: file } as unknown as Partial<T>;
        if (urlField) (updates as Record<string, unknown>)[urlField as string] = "";
        updateField(updates);
        setPreviews(prev => ({ ...prev, [previewKey]: URL.createObjectURL(file) }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlChange = (field: keyof T, previewKey: string, urlField?: keyof T) => (val: string) => {
    const trimmed = val.trim();
    const updates = { [field]: trimmed } as unknown as Partial<T>;
    if (urlField) (updates as Record<string, unknown>)[urlField as string] = trimmed;
    updateField(updates);
    setPreviews(prev => ({ ...prev, [previewKey]: trimmed }));
  };

  const handleSave = async (extraFields?: (fd: FormData) => void) => {
    const formData = new FormData();
    
    Object.entries(form).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "string") {
        formData.append(key, value.trim());
      } else if (typeof value === "boolean") {
        formData.append(key, String(value));
      } else if (value !== null && value !== undefined) {
        // Handle arrays or objects (like school_ids)
        formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
      }
    });

    if (extraFields) extraFields(formData);

    setLoadingMessage("Menyimpan perubahan...");
    setIsUploading(true);
    try {
      await skyshareApi.put(endpoint, formData);
      setIsSaveModalOpen(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrorMessage(err.message || "Gagal menyimpan data.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    state: {
      form,
      previews,
      isUploading,
      isSaveModalOpen,
      isCancelModalOpen,
      loadingMessage,
      errorMessage,
      successMessage
    },
    actions: {
      setForm,
      updateField,
      handleFileChange,
      handleUrlChange,
      handleSave,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setErrorMessage,
      setLoadingMessage
    }
  };
}
