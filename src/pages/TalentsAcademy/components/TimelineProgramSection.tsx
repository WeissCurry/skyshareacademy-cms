import type { ChangeEvent } from "react";
import Time from "@images/mascot-icons/Time Circle.png";
import Show from "@images/mascot-icons/Show.png";

interface TimelineProgramSectionProps {
  imagePreviewUrlTimeline: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function TimelineProgramSection({ imagePreviewUrlTimeline, onFileChange }: TimelineProgramSectionProps) {
  return (
    <div className="timeline-program mt-6">
      <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
        <img className="w-6" src={Time} alt="" />
        <h4 className="headline-4">Timeline Program</h4>
      </div>
      <div className="bg-neutral-white p-4 gap-4 flex items-center">
        <h4 className="font-bold text-base">
          Upload gambar "Timeline Program" <span className="text-base font-bold text-orange-300">*</span>
        </h4>
      </div>
      <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4">
        <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-60">
          {imagePreviewUrlTimeline && (
            <div className="flex justify-center">
              <img
                src={imagePreviewUrlTimeline}
                alt="Image Preview"
                className="rounded-xl border-2 border-gray-400"
                style={{ maxWidth: "100%", maxHeight: "220px" }}
              />
            </div>
          )}
        </div>
        <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative">
          <input
            type="file"
            id="image_timeline_program"
            accept="image/*"
            onChange={onFileChange}
            className="cursor-pointer z-10 opacity-0 w-full h-full absolute py-4"
          />
          <div className="flex gap-2 items-center py-4">
            <p className="text-white font-bold">Upload File</p>
            <img className="w-6 -rotate-90" src={Show} alt="" />
          </div>
        </div>
        <div className="flex justify-center pb-3">
          <h4 className="text-base">Ukuran gambar maksimal <span className="font-bold">2MB</span></h4>
        </div>
      </div>
    </div>
  );
}
