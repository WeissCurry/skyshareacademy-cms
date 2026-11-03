import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  image_heading?: File | string | null;
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

export function useArticleEditForm() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [articleForm, setArticleForm] = useState<ArticleForm>({
    title: "",
    content: "",
    link: "",
    cta_label: "",
    category_id: "",
    is_exclusive: false,
    program_id: null,
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { id } = useParams();
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
    const fetchData = async () => {
      setLoadingMessage("Fetching article...");
      setIsUploading(true);
      try {
        let articleRes;
        try {
          articleRes = await skyshareApi.get(`/admin/articles/${id}`);
        } catch {
          articleRes = await skyshareApi.get(`/article/${id}`);
        }

        const [categoriesRes] = await Promise.all([
          skyshareApi.get("/category")
        ]);
        
        const article = articleRes.data.data;
        setArticleForm({
          title: article.title,
          content: article.content,
          link: article.link || "",
          cta_label: article.cta_label || "",
          category_id: article.category_id,
          image_heading: article.image_heading,
          is_exclusive: Boolean(article.is_exclusive),
          program_id: article.program_id || null,
        });
        setImagePreviewUrl(article.image_heading || "");
        setCategories(categoriesRes.data.data);
        
        const cat = categoriesRes.data.data.find((c: Category) => c.id === article.category_id);
        if (cat) {
          setSelectedCategory(cat);
          setIsCategorySelected(true);
        }
        await Promise.all([getProgramsList(), fetchMedia()]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleArticleUpdate = async function () {
    if (articleForm.is_exclusive && !articleForm.program_id) {
      setErrorMessage("Artikel eksklusif wajib memilih program pengikat.");
      return;
    }

    const formData = new FormData();
    if (articleForm.image_heading instanceof File || typeof articleForm.image_heading === "string") {
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
    
    setLoadingMessage("Saving changes...");
    setIsUploading(true);
    setErrorMessage("");
    try {
      await skyshareApi.put(`/admin/articles/${id}`, formData);
      logActivity(`Mengedit artikel (ID: ${id})`);
      setIsSaveModalOpen(true);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Gagal mengedit artikel:", err);
      setErrorMessage(err.message || "Gagal memperbarui artikel.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArticleForm({ ...articleForm, image_heading: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
      setUrlValue("");
    }
  };

  const handleUrlChange = (value: string) => {
    setUrlValue(value);
    setArticleForm({ ...articleForm, image_heading: value });
    setImagePreviewUrl(value);
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
      isModalOpen,
      isSaveModalOpen,
      isCancelModalOpen,
      isCategorySelected,
      deleteMessage,
      categoryId,
      categories,
      programs,
      articleForm,
      imagePreviewUrl,
      urlValue,
      isUploading,
      loadingMessage,
      selectedCategory,
      mediaImages,
      isMediaLoading,
      errorMessage,
    },
    actions: {
      setIsDropdownOpen,
      setIsModalOpen,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setIsCategorySelected,
      setDeleteMessage,
      setSelectedCategory,
      setCategoryId,
      setErrorMessage,
      setFormValue,
      handleFileChange,
      handleUrlChange,
      handleArticleUpdate,
      deleteCategory,
      navigate,
    }
  };
}
