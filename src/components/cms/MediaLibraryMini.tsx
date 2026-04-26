import { FaCopy } from "react-icons/fa";

interface MediaImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

interface MediaLibraryMiniProps {
  images: MediaImage[];
  isLoading: boolean;
}

const MediaLibraryMini = ({ images, isLoading }: MediaLibraryMiniProps) => {
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied!");
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="font-bold text-sm">Media Library (Quick Access)</label>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide bg-gray-50 p-3 rounded-xl border-2 border-dashed border-gray-200">
        {isLoading ? (
          <div className="flex gap-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 px-2">No recent uploads found.</p>
        ) : (
          images.map((img) => (
            <div 
              key={img.public_id} 
              className="relative w-20 h-20 rounded-lg overflow-hidden group shrink-0 border border-gray-200 hover:border-black transition-all"
            >
              <img src={img.secure_url} className="w-full h-full object-cover" alt="" />
              <button 
                onClick={() => copyToClipboard(img.secure_url)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <FaCopy className="text-white" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaLibraryMini;
