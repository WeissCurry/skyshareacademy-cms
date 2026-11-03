import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import { ensureHttps } from "@shared/utils/urlUtils";
import { fetchPrograms } from "@features/mentor-access/api";
import type { ProgramItem } from "@features/mentor-access/types";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ArticleForm {
  image_heading: File | string | null;
  title: string;
  content: string;
  link: string;
  cta_label: string;
  category_id: string;
  is_exclusive: boolean;
  program_id: number | null;
}

export interface MediaImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

export function useArticleAddForm() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownAddOpen, setIsDropdownAddOpen] = useState(false);
  const [colorInput, setColorInput] = useState("#FFFFFF");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [articleForm, setArticleForm] = useState<ArticleForm>({
    image_heading: null,
    title: "",
    content: "",
    link: "",
    cta_label: "",
    category_id: "",
    is_exclusive: false,
    program_id: null,
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);
  const [urlValue, setUrlValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();

  const getCategory = async function () {
    try {
      const response = await skyshareApi.get("/category");
      setCategories(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProgramsList = async function () {
    try {
      const progs = await fetchPrograms();
      setPrograms(progs);
    } catch (error) {
      console.error("Gagal mengambil data program untuk artikel:", error);
    }
  };

  const fetchMedia = async () => {
    try {
      setIsMediaLoading(true);
      const response = await skyshareApi.get("/media?limit=10");
      setMediaImages(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMediaLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([getCategory(), getProgramsList(), fetchMedia()]);
    };
    init();
  }, []);

  const addCategory = async function (e: FormEvent) {
    e.preventDefault();
    try {
      await skyshareApi.post("/category/add", {
        name: categoryName,
        color: colorInput,
      });
      setCategoryName("");
      setIsDropdownAddOpen(false);
      getCategory();
    } catch (error) {
      console.log(error);
    }
  };

  const handleArticleAdd = async function () {
    if (articleForm.is_exclusive && !articleForm.program_id) {
      setErrorMessage("Artikel eksklusif wajib memilih program pengikat.");
      return;
    }

    const formData = new FormData();
    if (articleForm.image_heading) {
      formData.append("image_heading", articleForm.image_heading);
    }
    formData.append("title", articleForm.title);
    formData.append("content", articleForm.content);
    formData.append("link", ensureHttps(articleForm.link));
    formData.append("cta_label", articleForm.cta_label || "");
    formData.append("category_id", articleForm.category_id);
    formData.append("is_exclusive", String(articleForm.is_exclusive));
    if (articleForm.is_exclusive && articleForm.program_id) {
      formData.append("program_id", String(articleForm.program_id));
    }

    setIsUploading(true);
    setErrorMessage("");
    try {
      const response = await skyshareApi.post("/admin/articles", formData);
      const articleId = response.data?.data?.id;
      logActivity(`Menerbitkan artikel baru${articleId ? ` (ID: ${articleId})` : ""}`);
      setIsSaveModalOpen(true);
    } catch (error) {
      console.error("Gagal menambahkan artikel:", error);
      setErrorMessage((error as Error).message || "Gagal menyimpan artikel.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArticleForm({ ...articleForm, image_heading: file });
      setImagePreviewUrl((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(file);
      });
      setUrlValue("");
    }
  };

  const handleUrlChange = (value: string) => {
    setImagePreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return value;
    });
    setUrlValue(value);
    setArticleForm({ ...articleForm, image_heading: value });
  };

  const deleteCategory = async function () {
    try {
      await skyshareApi.delete(`/category/${categoryId}`);
      getCategory();
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      setIsModalOpen(false);
    }
  };

  const setFormValue = (updates: Partial<ArticleForm>) => {
    setArticleForm(prev => ({ ...prev, ...updates }));
  };

  return {
    state: {
      isDropdownOpen,
      isDropdownAddOpen,
      colorInput,
      isModalOpen,
      isSaveModalOpen,
      isCancelModalOpen,
      isCategorySelected,
      deleteMessage,
      categoryId,
      categories,
      programs,
      categoryName,
      articleForm,
      imagePreviewUrl,
      urlValue,
      isUploading,
      selectedCategory,
      mediaImages,
      isMediaLoading,
      errorMessage,
    },
    actions: {
      setIsDropdownOpen,
      setIsDropdownAddOpen,
      setColorInput,
      setIsModalOpen,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setIsCategorySelected,
      setDeleteMessage,
      setCategoryId,
      setCategoryName,
      setErrorMessage,
      setFormValue,
      handleFileChange,
      handleUrlChange,
      handleArticleAdd,
      addCategory,
      deleteCategory,
      setSelectedCategory,
      navigate,
    }
  };
}

