import { useState, useEffect, useCallback } from "react";
import skyshareApi from "@utilities/skyshareApi";
import { FaCopy, FaExternalLinkAlt, FaTrash, FaCloudUploadAlt } from "react-icons/fa";
import CmsNavCard from "@components/cms/CmsNavCard";

interface ImagesCloudinary {
  asset_id: string;
  secure_url: string;
  public_id: string;
}

const CmsMedia = () => {
  const [images, setImages] = useState<ImagesCloudinary[]>([]);
  const [loading, setLoading] = useState(true);



  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await skyshareApi.get("/media");
      setImages(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil gambar", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await skyshareApi.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchImages();
    } catch (error) {
      console.error("Gagal upload gambar", error);
      alert("Gagal mengunggah gambar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus gambar ini?")) return;

    try {
      setLoading(true);
      // Backend expects public_id in params or body
      await skyshareApi.delete(`/media/${publicId}`);
      fetchImages();
    } catch (error) {
      console.error("Gagal menghapus gambar", error);
      alert("Gagal menghapus gambar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchImages();
    };
    loadData();
  }, [fetchImages]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL Gambar berhasil disalin!");
  };

  return (
    <div className="bg-background min-h-screen flex flex-col pt-12 items-center self-stretch">
      <div className="content-1 flex gap-4 w-full px-4 md:px-10 lg:px-20">
        <div className="hidden md:block">
          <CmsNavCard />
        </div>
        
        <div className="flex-1">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="headline-1 text-3xl font-bold text-gray-900">Media Library</h1>
              <p className="paragraph text-gray-600 mt-2">Kelola dan salin URL aset gambar Anda di sini.</p>
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                id="media-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleUpload}
              />
              <label 
                htmlFor="media-upload"
                className="bg-primary-1 text-white py-3 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer hover:bg-primary-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
              >
                <FaCloudUploadAlt className="text-xl" /> Upload Gambar Baru
              </label>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
                <p className="mt-4 text-primary-1 font-semibold">Memuat galeri...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Belum ada gambar di library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {images.map((img) => (
                  <div 
                    key={img.asset_id} 
                    className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img 
                        src={img.secure_url} 
                        alt={img.public_id} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                         <a
                          href={img.secure_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white p-2 rounded-lg shadow-lg hover:scale-110 transition-transform"
                          title="Buka Gambar"
                        >
                          <FaExternalLinkAlt className="text-black" />
                        </a>
                        <button
                          onClick={() => handleDelete(img.public_id)}
                          className="bg-red-500 p-2 rounded-lg shadow-lg hover:scale-110 transition-transform"
                          title="Hapus Gambar"
                        >
                          <FaTrash className="text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-mono text-gray-400 truncate mb-2 uppercase tracking-tighter">
                        {img.public_id.split('/').pop()}
                      </p>
                      <button
                        onClick={() => copyToClipboard(img.secure_url)}
                        className="w-full bg-primary-1 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-2 active:translate-y-0.5 transition-all"
                      >
                        <FaCopy /> Salin URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CmsMedia;