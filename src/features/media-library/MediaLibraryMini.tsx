import { useState } from "react";
import { FaCopy, FaImages, FaChevronDown, FaTimes, FaSyncAlt } from "react-icons/fa";
import skyshareApi from "@shared/api/skyshareApi";

export interface MediaImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

export interface MediaLibraryMiniProps {
  images?: MediaImage[];
  isLoading?: boolean;
  onSelect?: (url: string) => void;
  buttonLabel?: string;
  defaultOpen?: boolean;
}

const MediaLibraryMini = ({
  images,
  isLoading,
  onSelect,
  buttonLabel = "Pilih dari Media Library",
  defaultOpen = false,
}: MediaLibraryMiniProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [internalImages, setInternalImages] = useState<MediaImage[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // If parent didn't pass images, fetch internally when mini window is opened
  const fetchInternalMedia = async () => {
    try {
      setInternalLoading(true);
      const res = await skyshareApi.get("/media?limit=30");
      setInternalImages(res.data?.data || []);
      setHasFetched(true);
    } catch (err) {
      console.error("Gagal memuat media dari library:", err);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && images === undefined && !hasFetched) {
      fetchInternalMedia();
    }
  };

  const activeImages = images !== undefined ? images : internalImages;
  const activeLoading = isLoading !== undefined ? isLoading : internalLoading;

  const copyToClipboard = async (url: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleSelectImage = (url: string) => {
    if (onSelect) {
      onSelect(url);
      setIsOpen(false); // Automatically close the mini window on select
    }
  };

  return (
    <div className="w-full my-3">
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
            isOpen
              ? "bg-neutral-900 text-white border-neutral-800"
              : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
          }`}
        >
          <FaImages className={`text-sm ${isOpen ? "text-white" : "text-primary-1"}`} />
          <span>{isOpen ? "Tutup Media Library" : buttonLabel}</span>
          <FaChevronDown
            className={`text-[10px] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={fetchInternalMedia}
            disabled={activeLoading}
            className="text-xs text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors"
            title="Muat ulang media"
          >
            <FaSyncAlt className={`text-[11px] ${activeLoading ? "animate-spin" : ""}`} />
            <span className="text-[11px] font-semibold">Refresh</span>
          </button>
        )}
      </div>

      {/* Mini Window Panel */}
      {isOpen && (
        <div className="mt-3 p-4 bg-gray-50/90 rounded-2xl border-2 border-gray-200 shadow-inner animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
            <div>
              <p className="text-xs font-bold text-gray-800">Media Library (Quick Select)</p>
              <p className="text-[11px] text-gray-400">
                Klik gambar untuk langsung menggunakannya tanpa perlu copy link.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition-all"
              title="Tutup window"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          {/* Image Grid / Scrollable */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            {activeLoading ? (
              <div className="flex gap-3 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="w-24 h-24 bg-gray-200 rounded-xl shrink-0 border border-gray-300"
                  />
                ))}
              </div>
            ) : activeImages.length === 0 ? (
              <div className="py-6 text-center w-full">
                <p className="text-xs text-gray-400 font-medium">
                  Belum ada media yang diupload di Media Library.
                </p>
              </div>
            ) : (
              activeImages.map((img) => {
                const isCopied = copiedUrl === img.secure_url;
                return (
                  <div
                    key={img.public_id}
                    onClick={() => handleSelectImage(img.secure_url)}
                    className="relative w-24 h-24 rounded-xl overflow-hidden group shrink-0 border-2 border-gray-200 hover:border-primary-1 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md"
                  >
                    <img
                      src={img.secure_url}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      alt=""
                      loading="lazy"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-1.5 p-1">
                      <span className="text-[10px] text-white font-bold bg-primary-1 px-2 py-0.5 rounded shadow">
                        PILIH
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(img.secure_url);
                        }}
                        className="p-1 text-[10px] text-white/90 hover:text-white bg-black/40 hover:bg-black/70 rounded transition-colors flex items-center gap-1"
                        title="Copy Link URL"
                      >
                        <FaCopy className="text-[9px]" />
                        <span>{isCopied ? "Tersalin!" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryMini;
