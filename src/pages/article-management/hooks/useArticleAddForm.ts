import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";

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
  category_id: string;
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
  const [categoryName, setCategoryName] = useState("");
  const [articleForm, setArticleForm] = useState<ArticleForm>({
    image_heading: null,
    title: "",
    content: "",
    link: "",
    category_id: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  
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
    const init = async () => {
      await Promise.all([getCategory(), fetchMedia()]);
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
    const formData = new FormData();
    if (articleForm.image_heading) {
      formData.append("image_heading", articleForm.image_heading);
    }
    formData.append("title", articleForm.title);
    formData.append("content", articleForm.content);
    formData.append("link", articleForm.link);
    formData.append("category_id", articleForm.category_id);

    setIsUploading(true);
    try {
      await skyshareApi.post("/article/add", formData);
      setIsSaveModalOpen(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArticleForm({ ...articleForm, image_heading: file });
      setImagePreviewUrl(URL.createObjectURL(file));
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
      isDropdownAddOpen,
      colorInput,
      isModalOpen,
      isSaveModalOpen,
      isCancelModalOpen,
      isCategorySelected,
      deleteMessage,
      categoryId,
      categories,
      categoryName,
      articleForm,
      imagePreviewUrl,
      urlValue,
      isUploading,
      selectedCategory,
      mediaImages,
      isMediaLoading,
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
