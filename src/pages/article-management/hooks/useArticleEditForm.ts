import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";

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
  category_id: string;
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
  const [articleForm, setArticleForm] = useState<ArticleForm>({
    title: "",
    content: "",
    link: "",
    category_id: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  
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
        const [articleRes, categoriesRes] = await Promise.all([
          skyshareApi.get(`/article/${id}`),
          skyshareApi.get("/category")
        ]);
        
        const article = articleRes.data.data;
        setArticleForm({
          title: article.title,
          content: article.content,
          link: article.link,
          category_id: article.category_id,
          image_heading: article.image_heading
        });
        setImagePreviewUrl(article.image_heading || "");
        setCategories(categoriesRes.data.data);
        
        const cat = categoriesRes.data.data.find((c: Category) => c.id === article.category_id);
        if (cat) {
          setSelectedCategory(cat);
          setIsCategorySelected(true);
        }
        await fetchMedia();
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleArticleUpdate = async function () {
    const formData = new FormData();
    if (articleForm.image_heading instanceof File) {
      formData.append("image_heading", articleForm.image_heading);
    }
    formData.append("title", articleForm.title);
    formData.append("content", articleForm.content);
    formData.append("link", articleForm.link);
    formData.append("category_id", articleForm.category_id);
    
    setLoadingMessage("Saving changes...");
    setIsUploading(true);
    try {
      await skyshareApi.put(`/article/${id}`, formData);
      setIsSaveModalOpen(true);
    } catch (error: unknown) {
      const err = error as Error;
      console.log(err.message);
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
      await skyshareApi.delete(`/category/delete/${categoryId}`);
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
      articleForm,
      imagePreviewUrl,
      urlValue,
      isUploading,
      loadingMessage,
      selectedCategory,
      mediaImages,
      isMediaLoading,
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
      setFormValue,
      handleFileChange,
      handleUrlChange,
      handleArticleUpdate,
      deleteCategory,
      navigate,
    }
  };
}
