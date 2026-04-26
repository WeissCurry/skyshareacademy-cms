import MascotSuccess from "@images/mascot-icons/pose=8.webp";
import Checklist from "@images/mascot-icons/Tick Square.png";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const SuccessModal = ({ isOpen, onClose, title = "Success!", message }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-4">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center shadow-2xl border-4 border-black max-w-sm w-full animate-in zoom-in duration-300">
        <div className="mb-6">
          <img 
            className="w-40 h-auto drop-shadow-xl" 
            src={MascotSuccess} 
            alt="Success Mascot" 
          />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <img className="w-8 h-8" src={Checklist} alt="Check" />
            <h3 className="text-2xl font-black text-gray-900">{title}</h3>
          </div>
          {message && <p className="text-gray-500 font-medium">{message}</p>}
          <button
            onClick={onClose}
            className="mt-4 w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
          >
            Great!
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
