import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import type { EventFormData, Category } from "../types/event";

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
    category_id: "",
    thumbnail_url: null,
    target_role: "all",
    is_active: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownAddOpen, setIsDropdownAddOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [colorInput, setColorInput] = useState("#34BCEE");
  const [categoryToDeleteId, setCategoryToDeleteId] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [urlValue, setUrlValue] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const response = await skyshareApi.get("/category");
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

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
      await Promise.all([fetchCategories(), fetchMedia()]);
    };
    init();
  }, []);

  const addCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      const response = await skyshareApi.post("/category/add", {
        name: categoryName.trim(),
        color: colorInput,
      });
      const newCat: Category = response.data.data;
      setCategoryName("");
      setIsDropdownAddOpen(false);
      await fetchCategories();
      if (newCat) {
        setSelectedCategory(newCat);
        setFormData((prev) => ({
          ...prev,
          category_id: String(newCat.id),
          event_type: newCat.name,
        }));
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const deleteCategory = async () => {
    if (!categoryToDeleteId) return;
    try {
      await skyshareApi.delete(`/category/${categoryToDeleteId}`);
      if (selectedCategory && String(selectedCategory.id) === String(categoryToDeleteId)) {
        setSelectedCategory(null);
        setFormData((prev) => ({ ...prev, category_id: "" }));
      }
      setIsCategoryModalOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setIsCategoryModalOpen(false);
    }
  };

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
    if (formData.category_id) {
      payload.append("category_id", formData.category_id);
    }
    payload.append("event_type", selectedCategory?.name || formData.event_type || "workshop");
    payload.append("target_role", formData.target_role || "all");
    payload.append("is_active", String(formData.is_active));

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
      categories,
      selectedCategory,
      isDropdownOpen,
      isDropdownAddOpen,
      categoryName,
      colorInput,
      deleteMessage,
      isCategoryModalOpen,
    },
    actions: {
      setFormValue,
      handleFileChange,
      handleUrlChange,
      handleSubmit,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setErrorMessage,
      navigate,
      setSelectedCategory,
      setIsDropdownOpen,
      setIsDropdownAddOpen,
      setCategoryName,
      setColorInput,
      setCategoryToDeleteId,
      setDeleteMessage,
      setIsCategoryModalOpen,
      addCategory,
      deleteCategory,
    },
  };
}
