import MascotWarning from "@shared/assets/images/mascot-icons/pose=1.webp";
import Info from "@shared/assets/images/mascot-icons/Info Square.png";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning";
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-4">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center shadow-2xl border-4 border-black max-w-sm w-full animate-in zoom-in duration-300">
        <div className="mb-6">
          <img 
            className="w-40 h-auto drop-shadow-xl" 
            src={MascotWarning} 
            alt="Warning Mascot" 
          />
        </div>
        <div className="flex flex-col items-center gap-3 text-center w-full">
          <div className="flex items-center gap-2">
            <img className="w-8 h-8" src={Info} alt="Info" />
            <h3 className="text-2xl font-black text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-500 font-medium">{message}</p>
          
          <div className="flex gap-3 w-full mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg ${
                type === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-black hover:bg-gray-800"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
