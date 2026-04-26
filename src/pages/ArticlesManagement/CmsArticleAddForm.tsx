import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";
import Arrow from "@images/mascot-icons/Arrow-down.png";
import Plus from "@images/mascot-icons/Plus-0.png";
import Del from "@images/mascot-icons/Delete-0.png";

import LoadingModal from "@components/cms/LoadingModal";
import SuccessModal from "@components/cms/SuccessModal";
import ConfirmModal from "@components/cms/ConfirmModal";
import RichTextEditor from "@components/cms/RichTextEditor";
import MediaLibraryMini from "@components/cms/MediaLibraryMini";

import Add from "@images/mascot-icons/Plus.png";
import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ArticleForm {
  image_heading: File | null;
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

function CmsArticleAddForm() {
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
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
            <h1 className="headline-1">Add Article</h1>
          </div>
          
          <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-10 px-8 w-full overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 mt-10">
              <div className="space-y-6">
                <div>
                  <label className="font-bold block mb-2">Heading Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 h-64 relative group overflow-hidden">
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
                    placeholder="Masukkan judul artikel..."
                  />
                </div>

                <div>
                  <label className="font-bold block mb-2">CTA Link</label>
                  <input
                    value={articleForm.link}
                    onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                    placeholder="https://..."
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
                      <button 
                        onClick={() => setIsDropdownAddOpen(true)}
                        className="w-full p-4 bg-gray-50 flex items-center justify-center gap-2 font-bold hover:bg-gray-100 border-t"
                      >
                        <img className="w-4" src={Plus} alt="" /> Tambah Kategori
                      </button>
                    </div>
                  )}

                  {isDropdownAddOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-black">
                        <h3 className="text-xl font-bold mb-4">Tambah Kategori Baru</h3>
                        <form onSubmit={addCategory} className="space-y-4">
                          <div>
                            <label className="text-sm font-bold block mb-1">Nama Kategori</label>
                            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-black" placeholder="Contoh: Event" required />
                          </div>
                          <div>
                            <label className="text-sm font-bold block mb-1">Warna</label>
                            <div className="flex gap-2">
                              <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-200" />
                              <input value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg font-mono uppercase" />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setIsDropdownAddOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold">Batal</button>
                            <button type="submit" className="flex-1 py-2 bg-black text-white rounded-lg font-bold">Simpan</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="font-bold block mb-2">Content</label>
                  <MediaLibraryMini images={mediaImages} isLoading={isMediaLoading} />
                  <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                    <RichTextEditor 
                      value={articleForm.content} 
                      onChange={(content) => setArticleForm({ ...articleForm, content })} 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button onClick={() => setIsCancelModalOpen(true)} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold">Batal</button>
                  <button onClick={handleArticleAdd} className="px-10 py-3 bg-primary-1 hover:bg-primary-2 text-white rounded-xl font-bold shadow-lg shadow-primary-1/20 transition-all active:scale-95">Simpan Artikel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteCategory} title="Hapus Kategori?" message={deleteMessage} type="danger" confirmText="Hapus" />
      <ConfirmModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={() => Navigate("/cms/article")} title="Batalkan?" message="Progres Anda tidak akan tersimpan." />
      <SuccessModal isOpen={isSaveModalOpen} onClose={() => Navigate("/cms/article")} title="Artikel Berhasil Disimpan" />
      <LoadingModal isLoading={isUploading} message="Menyimpan artikel..." />
    </div>
  );
}

export default CmsArticleAddForm;
