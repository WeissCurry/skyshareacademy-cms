import Xbutton from "@shared/assets/images/mascot-icons/Fill 300.png";
import Mascot2 from "@shared/assets/images/mascot-icons/pose=1.webp";
import Coution from "@shared/assets/images/mascot-icons/Info Square.png";

interface ErrorModalProps {
  onClose: () => void;
}

export default function ErrorModal({ onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 z-10 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-3xl p-6 w-80 relative">
        <button onClick={onClose} className="absolute top-6 right-6">
          <img className="w-5" src={Xbutton} alt="" />
        </button>
        <div className="flex justify-center">
          <img className="w-40" src={Mascot2} alt="" />
        </div>
        <div className="flex gap-1 mt-5 items-center justify-center">
          <img className="w-6 h-6" src={Coution} alt="" />
          <h3 className="headline-3 text-center">Action Failed</h3>
        </div>
      </div>
    </div>
  );
}
