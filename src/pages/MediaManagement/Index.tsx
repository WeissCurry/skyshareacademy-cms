import { useState, useEffect, useCallback } from "react";
import skyshareApi from "@utilities/skyshareApi";
import { FaCopy, FaExternalLinkAlt } from "react-icons/fa";

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
      const response = await skyshareApi.get("/cloudinary"); // Assuming /cloudinary is the endpoint
      setImages(response.data);
    } catch (error) {
      console.error("Gagal mengambil gambar", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const startFetching = async () => {
      await fetchImages();
    };
    startFetching();
  }, [fetchImages]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL Gambar berhasil disalin!");
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Media Library</h1>
      
      {loading ? (
        <div className="text-center">Loading images...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.asset_id} className="bg-white p-2 rounded shadow hover:shadow-lg transition">
              <div className="h-40 overflow-hidden rounded mb-2 bg-gray-200 flex items-center justify-center">
                <img 
                  src={img.secure_url} 
                  alt={img.public_id} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-gray-500 truncate mb-2">
                {img.public_id}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(img.secure_url)}
                  className="flex-1 bg-blue-500 text-white py-1 px-2 rounded text-xs flex items-center justify-center gap-1 hover:bg-blue-600"
                >
                  <FaCopy /> Copy URL
                </button>
                <a
                  href={img.secure_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-200 text-gray-700 py-1 px-2 rounded text-xs hover:bg-gray-300"
                >
                  <FaExternalLinkAlt />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CmsMedia;