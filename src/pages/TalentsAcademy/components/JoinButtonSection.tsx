import ChainAsset from "@images/mascot-icons/Link.png";

interface JoinButtonSectionProps {
  linkCta: string;
  linkJoinProgram: string;
  onCtaChange: (value: string) => void;
  onJoinProgramChange: (value: string) => void;
  onCancel: () => void;
  onSave: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function JoinButtonSection({
  linkCta,
  linkJoinProgram,
  onCtaChange,
  onJoinProgramChange,
  onCancel,
  onSave,
}: JoinButtonSectionProps) {
  return (
    <div className="join-button mt-6">
      <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
        <img className="w-6" src={ChainAsset} alt="" />
        <h4 className="headline-4">Join Button</h4>
      </div>
      <div className="bg-neutral-white p-4 gap-4 flex items-center">
        <form className="w-full" action="">
          <label className="block font-bold mb-1" htmlFor="cta">
            Call To Action <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Example: Join Talent Academy Season 6"
            defaultValue={linkCta}
            onChange={(e) => onCtaChange(e.target.value)}
            type="text"
            className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
          />
          <label className="block font-bold mt-4 mb-1" htmlFor="cta">
            <div className="flex gap-1">
              <img className="w-6" src={ChainAsset} alt="" />
              Link Join Program{" "}
              <span className="text-red-500">*</span>
            </div>
          </label>
          <input
            placeholder="https://"
            type="text"
            defaultValue={linkJoinProgram}
            onChange={(e) => onJoinProgramChange(e.target.value)}
            className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
          />
        </form>
      </div>
      <div className="mt-4 flex gap-5 justify-end">
        <div className="w-56 py-2 flex">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 w-full py-3 rounded-md hover:bg-gray-200 text-black font-bold"
          >
            Batal
          </button>
        </div>
        <div className="w-56 py-2 flex">
          <button
            type="submit"
            onClick={onSave}
            className="bg-primary-1 w-full py-3 rounded-md hover:bg-primary-2 text-white font-bold"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
