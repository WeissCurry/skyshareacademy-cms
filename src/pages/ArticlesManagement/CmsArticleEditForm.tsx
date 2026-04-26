import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";
import Arrow from "@images/mascot-icons/Arrow-down.png";
import Del from "@images/mascot-icons/Delete-0.png";

import LoadingModal from "@components/cms/LoadingModal";
import SuccessModal from "@components/cms/SuccessModal";
import ConfirmModal from "@components/cms/ConfirmModal";
import RichTextEditor from "@components/cms/RichTextEditor";
import MediaLibraryMini from "@components/cms/MediaLibraryMini";

import Show from "@images/mascot-icons/Show.png";
import Chain from "@images/mascot-icons/Link.png";
import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";

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
  const [urlValue, setUrlValue] = useState("");
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

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch h-auto pb-44">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        <div><CmsNavCard /></div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-4">
            <button onClick={() => Navigate("/cms/article")} className="hover:scale-110 transition-transform mt-1">
              <img className="w-10 rotate-90 invert" src={ArrowLeft} alt="Back" />
            </button>
            <div>
              <h1 className="headline-1">Edit Article</h1>
              <p className="text-sm font-medium text-black mt-1">Masukkan data pada field yang tertera</p>
            </div>
          </div>
          
          <div className="bg-neutral-white mt-8 border-2 border-black rounded-xl p-8 w-full overflow-hidden space-y-8 shadow-sm">
            
            {/* Heading Image */}
            <div>
              <label className="font-bold block mb-2 text-sm">Upload gambar heading <span className="text-orange-500">*</span></label>
              <div className="border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white min-h-[160px] relative group overflow-hidden">
                {imagePreviewUrl ? (
                  <div className="flex justify-center h-full p-2 w-full">
                    <img src={imagePreviewUrl} alt="Preview" className="w-full max-w-[400px] h-auto object-contain rounded-lg border border-gray-200" />
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">No image preview available</p>
                )}
              </div>
              <div className="flex justify-center mt-2 mb-4">
                <p className="text-xs text-gray-500 font-bold">Minimal Ukuran (956 x 350px)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative h-[52px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer z-10 opacity-0 w-full h-full absolute"
                  />
                  <div className="flex gap-2 items-center">
                    <p className="text-white font-bold">Upload File Baru</p>
                    <img className="w-6 -rotate-90" src={Show} alt="" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <img src={Chain} className="w-5" alt="" />
                  </div>
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar di sini..."
                    value={urlValue}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-4 border-2 border-gray-400 rounded-xl outline-none focus:border-black transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pilih salah satu: Upload file atau tempel link dari Media Library</h4>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="font-bold block mb-2 text-sm">Judul <span className="text-orange-500">*</span></label>
              <input
                value={articleForm.title}
                onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                placeholder="Masukkan judul artikel"
              />
            </div>
            
            {/* CTA Link */}
            <div>
              <label className="font-bold block mb-2 text-sm">CTA Link</label>
              <input
                value={articleForm.link}
                onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                placeholder="https://..."
              />
            </div>

            {/* Category */}
            <div className="relative">
              <label className="font-bold block mb-2 text-sm">Kategori <span className="text-orange-500">*</span></label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl flex justify-between items-center cursor-pointer hover:border-black transition-colors"
              >
                {isCategorySelected ? (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: selectedCategory?.color }}>
                      {selectedCategory?.name}
                    </div>
                  </div>
                ) : <span className="text-gray-400">Pilih Kategori</span>}
                <img className={`w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} src={Arrow} alt="" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto p-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer group mb-1" onClick={() => {
                        setSelectedCategory(cat);
                        setArticleForm({ ...articleForm, category_id: cat.id });
                        setIsCategorySelected(true);
                        setIsDropdownOpen(false);
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: cat.color }}>
                            {cat.name}
                          </div>
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

            {/* Content */}
            <div className="min-w-0">
              <label className="font-bold block mb-2 text-sm">Berikan isi <span className="text-orange-500">*</span></label>
              <MediaLibraryMini images={mediaImages} isLoading={isMediaLoading} />
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden mt-2">
                <RichTextEditor 
                  value={articleForm.content} 
                  onChange={(content) => setArticleForm({ ...articleForm, content })} 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-4">
              <button onClick={() => setIsCancelModalOpen(true)} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors text-sm">Batal</button>
              <button onClick={handleArticleUpdate} className="px-10 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-bold transition-all active:scale-95 text-sm shadow-md">Simpan</button>
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
