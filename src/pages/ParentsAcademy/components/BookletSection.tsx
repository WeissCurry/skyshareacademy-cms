import Book from "@images/mascot-icons/Document.png";
import ChainAsset from "@images/mascot-icons/Link.png";

interface BookletSectionProps {
    value?: string | File | null;
    onChange: (value: string) => void;
}

export default function BookletSection({ value, onChange }: BookletSectionProps) {
    return (
        <div className="booklet mt-6">
            <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
                <img className="w-6" src={Book} alt="" />
                <h4 className="headline-4">Booklet Program</h4>
            </div>
            <div className="bg-neutral-white gap-4 flex items-center">
                <form className="w-full">
                    <label className="block font-bold mt-4 mb-1" htmlFor="booklet">
                        <div className="flex gap-1">
                            <img className="w-6" src={ChainAsset} alt="" />
                            Link Booklet <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <input
                        placeholder="https://"
                        type="text"
                        value={typeof value === "string" ? value : ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                </form>
            </div>
        </div>
    );
}
