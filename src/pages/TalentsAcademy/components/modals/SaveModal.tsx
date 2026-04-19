import Xbutton from "@images/mascot-icons/Fill 300.png";
import Mascot1 from "@images/mascot-icons/pose=8.webp";
import Ceklist from "@images/mascot-icons/Tick Square.png";

interface SaveModalProps {
  onClose: () => void;
}

export default function SaveModal({ onClose }: SaveModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 z-10 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-3xl p-6 relative">
        <button onClick={onClose} className="absolute top-6 right-6">
          <img className="w-5" src={Xbutton} alt="" />
        </button>
        <div className="flex justify-center">
          <img className="w-40" src={Mascot1} alt="" />
        </div>
        <div className="flex gap-1 mt-5 items-center">
          <img className="w-6 h-6" src={Ceklist} alt="" />
          <h3 className="headline-3">Saved Successfully</h3>
        </div>
      </div>
    </div>
  );
}
