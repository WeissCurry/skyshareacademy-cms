import { FaCopy } from "react-icons/fa";

interface MediaImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

interface MediaLibraryMiniProps {
  images: MediaImage[];
  isLoading: boolean;
  onSelect?: (url: string) => void;
}

const MediaLibraryMini = ({ images, isLoading, onSelect }: MediaLibraryMiniProps) => {
  const copyToClipboard = async (url: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        alert("URL berhasil disalin!");
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert("URL berhasil disalin!");
      } catch (copyErr) {
        console.error("Fallback copy failed: ", copyErr);
        alert("Gagal menyalin URL.");
      }
      document.body.removeChild(textArea);
    }
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
              className="relative w-20 h-20 rounded-lg overflow-hidden group shrink-0 border border-gray-200 hover:border-black transition-all cursor-pointer"
              onClick={() => onSelect && onSelect(img.secure_url)}
            >
              <img src={img.secure_url} className="w-full h-full object-cover" alt="" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-1">
                {onSelect ? (
                  <span className="text-[10px] text-white font-bold bg-black/50 px-2 py-0.5 rounded">SELECT</span>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(img.secure_url);
                    }}
                    className="p-2 hover:scale-110 transition-transform"
                  >
                    <FaCopy className="text-white" />
                  </button>
                )}
                {onSelect && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(img.secure_url);
                    }}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copy URL"
                  >
                    <FaCopy className="text-white text-xs" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaLibraryMini;
