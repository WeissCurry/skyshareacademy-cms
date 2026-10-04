import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import type { EventFormData, CmsEvent, Category } from "../types/event";
import type { MediaImage } from "./useEventAddForm";

export function useEventEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState<boolean>(false);

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      const response = await skyshareApi.get("/category");
      const list: Category[] = response.data.data || [];
      setCategories(list);
      return list;
    } catch (err) {
      console.error("Failed to load categories:", err);
      return [];
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
      if (!id) return;
      setIsLoading(true);
      try {
        const [loadedCategories] = await Promise.all([fetchCategories(), fetchMedia()]);

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

          const matchedCat = loadedCategories.find(
            (c) =>
              (event.category_id && String(c.id) === String(event.category_id)) ||
              (event.event_type && c.name.toLowerCase() === event.event_type.toLowerCase())
          );

          if (matchedCat) {
            setSelectedCategory(matchedCat);
          }

          setFormData({
            title: event.title || "",
            description: event.description || "",
            event_date: formattedDate,
            event_type: event.event_type || matchedCat?.name || "workshop",
            category_id: matchedCat ? String(matchedCat.id) : event.category_id ? String(event.category_id) : "",
            thumbnail_url: event.thumbnail_url || null,
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
    } else if (typeof formData.thumbnail_url === "string") {
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
