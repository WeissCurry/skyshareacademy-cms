import type { ChangeEvent } from "react";
import Work from "@shared/assets/images/mascot-icons/Work.png";
import Show from "@shared/assets/images/mascot-icons/Show.png";
import Chain from "@shared/assets/images/mascot-icons/Link.png";

interface AlurPendaftaranSectionProps {
  imagePreviewUrl: string;
  urlValue: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (value: string) => void;
}

export default function AlurPendaftaranSection({ imagePreviewUrl, urlValue, onFileChange, onUrlChange }: AlurPendaftaranSectionProps) {
  return (
    <div className="alur-pendaftaran mt-6">
      <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
        <img className="w-6" src={Work} alt="" />
        <h4 className="headline-4">Alur Pendaftaran</h4>
      </div>
      
      <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4 mt-4">
        <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-60 bg-gray-50">
          {imagePreviewUrl ? (
            <div className="flex justify-center h-full p-2">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="rounded-xl object-contain w-full h-full"
              />
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">No image preview available</p>
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
              className="w-full h-[52px] pl-12 pr-4 border-2 border-gray-400 rounded-xl outline-none focus:border-black transition-colors text-sm"
            />
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pilih salah satu: Upload file atau tempel link dari Media Library</h4>
        </div>
      </div>
    </div>
  );
}
