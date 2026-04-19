import Mascot from "@images/mascot-icons/pose=2.webp";

interface DeleteModalProps {
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ message, onClose, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white w-2/5 h-80 rounded-3xl p-6">
        <div className="flex justify-center">
          <img className="w-40" src={Mascot} alt="" />
        </div>
        <h3 className="mb-5 mt-5 headline-3 text-center">{message}</h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 w-1/2 hover:bg-red-400 text-white px-4 py-2 rounded-lg"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
