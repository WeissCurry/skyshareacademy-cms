import type { ChangeEvent } from "react";
import Show from "@shared/assets/images/mascot-icons/Show.png";
import Chain from "@shared/assets/images/mascot-icons/Link.png";
import MediaLibraryMini from "@features/media-library/MediaLibraryMini";

interface EventHighlightSectionProps {
  isActive: boolean;
  onToggle: () => void;
  imageUrl: string;
  urlValue: string;
  ctaLink: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (value: string) => void;
  onCtaChange: (value: string) => void;
}

export default function EventHighlightSection({
  isActive,
  onToggle,
  imageUrl,
  urlValue,
  ctaLink,
  onFileChange,
  onUrlChange,
  onCtaChange,
}: EventHighlightSectionProps) {
  return (
    <div className="event-highlight mt-4">
      <div className="bg-background p-4 flex justify-between items-center rounded-xl border border-gray-200">
        <div className="flex items-center gap-4">
          <div>
            <h4 className="headline-4">Status Popup Event</h4>
            <p className="text-xs text-neutral-500">
              {isActive ? "Popup saat ini aktif dan muncul di website." : "Popup saat ini dinonaktifkan."}
            </p>
          </div>
        </div>
        <div
          onClick={onToggle}
          className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${isActive ? "bg-primary-1" : "bg-gray-300"
            }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${isActive ? "right-1" : "left-1"
              }`}
          />
        </div>
      </div>

      {isActive && (
        <div className="mt-6 p-6 bg-white border-2 border-gray-200 rounded-xl space-y-6">
          <div>
            <label className="block font-bold mb-2">Banner / Poster Event</label>
            <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex justify-center items-center bg-gray-50 overflow-hidden">
              {imageUrl ? (
                <div className="flex justify-center h-full p-2 w-full">
                  <img src={imageUrl} alt="Event Preview" className="w-full h-full object-contain" />
                </div>
              ) : (
                <span className="text-gray-400 font-medium italic">Belum ada gambar yang dipilih</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative h-[52px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
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
                  onChange={(e) => onUrlChange(e.target.value)}
                  className="w-full h-[52px] pl-12 pr-4 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center mt-3">
              <h4 className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                Pilih salah satu: Upload file atau tempel link dari Media Library
              </h4>
            </div>

            <div className="mt-4">
              <MediaLibraryMini onSelect={onUrlChange} buttonLabel="Pilih Banner dari Media Library" />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Event CTA Link (Tujuan Saat Banner Diklik)</label>
            <input
              placeholder="https://wa.me/... atau https://forms..."
              type="text"
              value={ctaLink || ""}
              onChange={(e) => onCtaChange(e.target.value)}
              className="w-full px-4 py-3 border-gray-300 border-2 rounded-lg outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
