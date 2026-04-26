import type { ChangeEvent } from "react";
import Show from "@images/mascot-icons/Show.png";

interface EventHighlightSectionProps {
  isActive: boolean;
  onToggle: () => void;
  imageUrl: string;
  ctaLink: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCtaChange: (value: string) => void;
}

export default function EventHighlightSection({
  isActive,
  onToggle,
  imageUrl,
  ctaLink,
  onFileChange,
  onCtaChange
}: EventHighlightSectionProps) {
  return (
    <div className="event-highlight mt-6">
      <div className="bg-background p-4 flex justify-between items-center rounded-xl">
        <div className="flex items-center gap-4">
           <span className="text-xl">📢</span>
           <h4 className="headline-4">Event Highlight Landing Page</h4>
        </div>
        <div 
          onClick={onToggle}
          className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${isActive ? "bg-primary-1" : "bg-gray-300"}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${isActive ? "right-1" : "left-1"}`} />
        </div>
      </div>

      {isActive && (
        <div className="mt-4 p-6 bg-white border-2 border-gray-400 rounded-xl space-y-6">
          <div>
            <label className="block font-bold mb-2">Event Banner</label>
            <div className="h-48 border-2 border-dashed border-gray-400 rounded-xl flex justify-center items-center bg-gray-50 overflow-hidden">
               {imageUrl ? (
                 <img src={imageUrl} alt="Event Preview" className="w-full h-full object-contain" />
               ) : (
                 <span className="text-gray-400 font-medium italic">No image selected</span>
               )}
            </div>
            <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="cursor-pointer z-10 opacity-0 w-full h-full absolute py-3"
              />
              <div className="flex gap-2 items-center py-3">
                <p className="text-white font-bold">Ubah Gambar</p>
                <img className="w-6 -rotate-90" src={Show} alt="" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Event CTA Link</label>
            <input
              placeholder="https://"
              type="text"
              value={ctaLink || ""}
              onChange={(e) => onCtaChange(e.target.value)}
              className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
