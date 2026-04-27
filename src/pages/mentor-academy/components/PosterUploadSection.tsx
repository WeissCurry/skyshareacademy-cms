import { type ChangeEvent } from "react";
import ArrowLeft from "@shared/assets/images/mascot-icons/Arrow - Down 3.png";

interface PosterUploadSectionProps {
    imagePreviewUrl: string;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function PosterUploadSection({ imagePreviewUrl, onFileChange }: PosterUploadSectionProps) {
    return (
        <div className="poster-event mt-6">
            <div className="bg-neutral-white p-4 gap-4 flex items-center">
                <h4 className=" font-bold text-base">
                    Upload Poster Event
                    <span className=" text-base font-bold text-orange-300"> * </span>
                </h4>
            </div>
            <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4">
                <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-[312.5px] w-[250px] mx-auto">
                    <div>
                        {imagePreviewUrl && (
                            <div className="flex justify-center">
                                <img
                                    src={imagePreviewUrl}
                                    alt="Image Preview"
                                    className="rounded-xl border-2 border-gray-400"
                                    style={{ maxWidth: "100%", maxHeight: "312.5px" }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative">
                    <input
                        type="file"
                        id="image_heading"
                        accept="image/*"
                        onChange={onFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex gap-2 items-center py-3 px-5 pointer-events-none h-[62px]">
                        <p className="text-white font-bold">
                            Upload File
                        </p>
                        <img
                            className="w-6 -rotate-90"
                            src={ArrowLeft}
                            alt=""
                        />
                    </div>
                </div>

                <div className="flex justify-center pb-3">
                    <h4 className=" text-base">
                        Minimal Ukuran
                        <span className=" font-bold">(1080 x 1350)</span>
                    </h4>
                </div>
            </div>
        </div>
    );
}
