import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";
import Arrow from "@images/mascot-icons/Arrow-down.png";
import Del from "@images/mascot-icons/Delete-0.png";

import LoadingModal from "@components/cms/LoadingModal";
import SuccessModal from "@components/cms/SuccessModal";
import ConfirmModal from "@components/cms/ConfirmModal";
import RichTextEditor from "@components/cms/RichTextEditor";
import MediaLibraryMini from "@components/cms/MediaLibraryMini";

import Add from "@images/mascot-icons/Plus.png";
import DocumentIcon from "@images/mascot-icons/Document.png";
import EditIcon from "@images/mascot-icons/Edit Square.png";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ArticleForm {
  image_heading?: File | string | null;
  title: string;
  content: string;
  link: string;
  category_id: string;
}

interface MediaImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

function CmsArticleEditForm() {
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
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const { id } = useParams();
  const Navigate = useNavigate();

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
    }
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

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch h-auto pb-44">
      <div className="content-1 flex gap-4 w-full max-w-[1300px] px-4">
        <div><CmsNavCard /></div>
        <div className="w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => Navigate("/cms/article")} className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-full hover:bg-gray-100 transition-all shadow-sm">
              <FaArrowLeft className="text-black" size={18} />
            </button>
            <h1 className="headline-1">Edit Article</h1>
          </div>
          
          <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-10 px-8 w-full overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 mt-10">
              
              {/* Left Column: Informasi Artikel */}
              <div className="space-y-6">
                <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
                  <img className="w-6" src={DocumentIcon} alt="" />
                  <h4 className="headline-4">Informasi Artikel</h4>
                </div>
                
                <div className="bg-neutral-white rounded-xl border-2 border-gray-400 p-6 space-y-6">
                  <div>
                    <label className="font-bold block mb-2 text-sm">Heading Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 h-56 relative group overflow-hidden">
                    {imagePreviewUrl ? (
                      <>
                        <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label htmlFor="image_heading" className="bg-white text-black px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-gray-200">Change Image</label>
                        </div>
                      </>
                    ) : (
                      <label htmlFor="image_heading" className="flex flex-col items-center cursor-pointer">
                        <div className="bg-primary-1/10 p-4 rounded-full mb-3"><img className="w-10" src={Add} alt="Add" /></div>
                        <p className="text-sm font-medium text-gray-500">Upload heading image</p>
                      </label>
                    )}
                    <input id="image_heading" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-2">Title</label>
                  <input
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-2">CTA Link</label>
                  <input
                    value={articleForm.link}
                    onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="relative">
                  <label className="font-bold block mb-2">Category</label>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl flex justify-between items-center cursor-pointer hover:border-black"
                  >
                    {isCategorySelected ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory?.color }} />
                        <span className="font-bold">{selectedCategory?.name}</span>
                      </div>
                    ) : <span className="text-gray-400">Pilih Kategori</span>}
                    <img className={`w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} src={Arrow} alt="" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer group border-b last:border-b-0" onClick={() => {
                            setSelectedCategory(cat);
                            setArticleForm({ ...articleForm, category_id: cat.id });
                            setIsCategorySelected(true);
                            setIsDropdownOpen(false);
                          }}>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="font-medium">{cat.name}</span>
                            </div>
                            <button onClick={(e) => {
                              e.stopPropagation();
                              setCategoryId(cat.id);
                              setDeleteMessage(`Hapus kategori "${cat.name}"?`);
                              setIsModalOpen(true);
                            }} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all text-red-500">
                              <img className="w-4" src={Del} alt="Delete" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>

              {/* Right Column: Konten Artikel */}
              <div className="space-y-6 min-w-0">
                <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
                  <img className="w-6" src={EditIcon} alt="" />
                  <h4 className="headline-4">Konten Artikel</h4>
                </div>

                <div className="bg-neutral-white rounded-xl border-2 border-gray-400 p-6 space-y-6 min-w-0">
                  <MediaLibraryMini images={mediaImages} isLoading={isMediaLoading} />
                  <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                    <RichTextEditor 
                      value={articleForm.content} 
                      onChange={(content) => setArticleForm({ ...articleForm, content })} 
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-6">
                    <button onClick={() => setIsCancelModalOpen(true)} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold">Batal</button>
                    <button onClick={handleArticleUpdate} className="px-10 py-3 bg-primary-1 hover:bg-primary-2 text-white rounded-xl font-bold shadow-lg shadow-primary-1/20 transition-all active:scale-95">Update Artikel</button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteCategory} title="Hapus Kategori?" message={deleteMessage} type="danger" confirmText="Hapus" />
      <ConfirmModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={() => Navigate("/cms/article")} title="Batalkan Perubahan?" message="Progres yang Anda buat tidak akan tersimpan." confirmText="Ya, Batalkan" cancelText="Lanjutkan Edit" />
      <SuccessModal isOpen={isSaveModalOpen} onClose={() => Navigate("/cms/article")} title="Artikel Berhasil Diupdate" />
      <LoadingModal isLoading={isUploading} message={loadingMessage} />
    </div>
  );
}

export default CmsArticleEditForm;
