import React from "react";
import { FiPlus, FiShuffle, FiCheckCircle } from "react-icons/fi";
import { type PopupConfigData, type PopupItem } from "../types/popup";
import PopupItemCard from "./PopupItemCard";
import MediaLibraryMini from "@features/media-library/MediaLibraryMini";

interface PopupListEditorProps {
  config: PopupConfigData;
  onToggleGlobalActive: () => void;
  onToggleRandomize: () => void;
  onAddPopup: (imageUrl?: string) => void;
  onAddPopupsFromMedia: (urls: string[]) => void;
  onUpdatePopup: (id: string, updates: Partial<PopupItem>) => void;
  onRemovePopup: (id: string) => void;
}

export default function PopupListEditor({
  config,
  onToggleGlobalActive,
  onToggleRandomize,
  onAddPopup,
  onAddPopupsFromMedia,
  onUpdatePopup,
  onRemovePopup,
}: PopupListEditorProps) {
  const activeCount = config.popups.filter((p) => p.is_active).length;
  const selectedMediaUrls = config.popups
    .map((p) => p.image_url)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {/* Control Banner: Master Active & Randomize Setting */}
      <div className="bg-background border-2 border-black rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Master Toggle */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleGlobalActive}
            className={`w-14 h-8 rounded-full border-2 border-black p-0.5 transition-colors relative ${
              config.is_active ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white border-2 border-black transition-transform ${
                config.is_active ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-black">
                Status Popup Global
              </h3>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                  config.is_active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {config.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Randomize Toggle */}
        <div className="flex items-center gap-3 bg-white border-2 border-black rounded-xl p-2.5 self-stretch md:self-auto justify-between">
          <div className="flex items-center gap-2">
            <FiShuffle
              className={`w-4 h-4 ${
                config.randomize ? "text-primary-1" : "text-gray-400"
              }`}
            />
            <div>
              <span className="text-xs font-black block">Mode Acak (Random)</span>
              <span className="text-[10px] text-gray-500 font-bold block">
                {config.randomize ? "Pilih acak tiap reload" : "Urutan pertama"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleRandomize}
            className={`w-12 h-6 rounded-full border-2 border-black p-0.5 transition-colors relative ${
              config.randomize ? "bg-primary-1" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white border-2 border-black transition-transform ${
                config.randomize ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Quick Select from Media Library (Multi-Select) */}
      <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-sm">
        <div className="mb-3">
          <h4 className="font-black text-sm text-black flex items-center gap-2">
            <FiCheckCircle className="text-primary-1 w-4 h-4" />
            Pilih Gambar dari Media Library
          </h4>
        </div>

        <MediaLibraryMini
          multiSelect={true}
          selectedUrls={selectedMediaUrls}
          onMultiSelect={onAddPopupsFromMedia}
          buttonLabel="Buka Pilihan Multi-Gambar Media Library"
        />
      </div>

      {/* Popups List Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="headline-4">Daftar Popup</h3>
          <span className="text-xs font-black bg-black text-white px-2.5 py-0.5 rounded-full">
            {config.popups.length} Total ({activeCount} Aktif)
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddPopup()}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-primary-1 hover:bg-primary-2 text-white font-black text-xs rounded-xl border-2 border-black transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <FiPlus className="w-4 h-4" />
          <span>Tambah Popup Baru</span>
        </button>
      </div>

      {/* Render All Popup Cards */}
      {config.popups.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50/50">
          <p className="font-bold text-gray-500 text-sm">
            Belum ada popup yang ditambahkan.
          </p>
          <p className="text-xs text-gray-400 mt-1 font-semibold">
            Klik tombol "Tambah Popup Baru" di atas atau pilih langsung dari Media
            Library.
          </p>
          <button
            type="button"
            onClick={() => onAddPopup()}
            className="mt-4 px-4 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Tambah Popup Pertama</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {config.popups.map((popup, idx) => (
            <PopupItemCard
              key={popup.id}
              item={popup}
              index={idx}
              onUpdate={onUpdatePopup}
              onRemove={onRemovePopup}
            />
          ))}
        </div>
      )}
    </div>
  );
}
