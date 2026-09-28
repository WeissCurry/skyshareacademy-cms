import React from "react";
import { FiTrash2, FiExternalLink, FiEye, FiEyeOff } from "react-icons/fi";
import { type PopupItem } from "../types/popup";
import MediaLibraryMini from "@features/media-library/MediaLibraryMini";

interface PopupItemCardProps {
  item: PopupItem;
  index: number;
  onUpdate: (id: string, updates: Partial<PopupItem>) => void;
  onRemove: (id: string) => void;
}

export default function PopupItemCard({
  item,
  index,
  onUpdate,
  onRemove,
}: PopupItemCardProps) {
  return (
    <div
      className={`border-2 rounded-2xl p-4 sm:p-5 transition-all ${
        item.is_active
          ? "border-black bg-white shadow-[2px_2px_0px_#000]"
          : "border-gray-200 bg-gray-50/60 opacity-80"
      }`}
    >
      {/* Top Header of Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 mb-4">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            value={item.title || ""}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            placeholder={`Judul / Label Popup ${index + 1}`}
            className="font-bold text-sm bg-transparent border-b border-dashed border-gray-300 focus:border-black focus:outline-none px-1 py-0.5 flex-1 sm:flex-none min-w-0"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Individual Active Toggle */}
          <button
            type="button"
            onClick={() => onUpdate(item.id, { is_active: !item.is_active })}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
              item.is_active
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-gray-200 text-gray-600 border-gray-300"
            }`}
          >
            {item.is_active ? (
              <>
                <FiEye className="w-3.5 h-3.5" />
                <span>Aktif</span>
              </>
            ) : (
              <>
                <FiEyeOff className="w-3.5 h-3.5" />
                <span>Nonaktif</span>
              </>
            )}
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
            title="Hapus popup ini"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Preview & Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left: Image Preview */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-black bg-neutral-100 relative group flex items-center justify-center">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title || "Popup Preview"}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs font-bold text-gray-400 p-2 text-center">
                Belum ada gambar terpilih
              </span>
            )}
          </div>
        </div>

        {/* Right: Inputs (Image URL, CTA Link, CTA Text) */}
        <div className="md:col-span-2 flex flex-col gap-3 justify-center">
          {/* Image URL Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              URL Gambar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={item.image_url}
              onChange={(e) => onUpdate(item.id, { image_url: e.target.value })}
              placeholder="https://res.cloudinary.com/..."
              className="w-full text-xs font-bold px-3 py-2 border-2 border-black rounded-xl bg-background focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CTA Link */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Link CTA
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={item.cta_link || ""}
                  onChange={(e) =>
                    onUpdate(item.id, { cta_link: e.target.value })
                  }
                  placeholder="https://wa.me/... atau /program"
                  className="w-full text-xs font-bold pl-3 pr-8 py-2 border-2 border-black rounded-xl bg-background focus:bg-white focus:outline-none"
                />
                {item.cta_link && (
                  <a
                    href={item.cta_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* CTA Text */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Teks Tombol CTA
              </label>
              <input
                type="text"
                value={item.cta_text || ""}
                onChange={(e) =>
                  onUpdate(item.id, { cta_text: e.target.value })
                }
                placeholder="Contoh: Daftar Sekarang"
                className="w-full text-xs font-bold px-3 py-2 border-2 border-black rounded-xl bg-background focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Select from Media Library for this specific popup item */}
          <div className="pt-1">
            <MediaLibraryMini
              onSelect={(url) => onUpdate(item.id, { image_url: url })}
              buttonLabel="Pilih dari Media Library"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
