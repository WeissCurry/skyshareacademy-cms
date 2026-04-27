import ChainAsset from "@shared/assets/images/mascot-icons/Link.png";

interface ActionButtonsSectionProps {
  linkCta?: string;
  linkJoinProgram?: string;
  onCtaChange: (value: string) => void;
  onJoinProgramChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ActionButtonsSection({
  linkCta,
  linkJoinProgram,
  onCtaChange,
  onJoinProgramChange,
  onSave,
  onCancel
}: ActionButtonsSectionProps) {
  return (
    <div className="actions mt-10 space-y-6">
      <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
        <img className="w-6" src={ChainAsset} alt="" />
        <h4 className="headline-4">Link & Action Buttons</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
        <div>
          <label className="block font-bold mb-1">Link CTA (Hubungi Kami) <span className="text-red-500">*</span></label>
          <input
            placeholder="https://"
            type="text"
            value={linkCta || ""}
            onChange={(e) => onCtaChange(e.target.value)}
            className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none focus:border-black transition-colors"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Link Join Program <span className="text-red-500">*</span></label>
          <input
            placeholder="https://"
            type="text"
            value={linkJoinProgram || ""}
            onChange={(e) => onJoinProgramChange(e.target.value)}
            className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-8 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all"
        >
          Batal
        </button>
        <button
          onClick={onSave}
          className="px-10 py-3 bg-primary-1 text-white rounded-xl font-bold hover:bg-primary-2 shadow-lg shadow-primary-1/20 transition-all active:scale-95"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
