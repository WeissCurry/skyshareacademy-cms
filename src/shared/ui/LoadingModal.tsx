import Mascot from "@shared/assets/images/mascot-icons/pose=2.webp";

interface LoadingModalProps {
  isLoading: boolean;
  message?: string;
}

const LoadingModal = ({ isLoading, message = "Loading..." }: LoadingModalProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center shadow-2xl border-4 border-black animate-in zoom-in duration-300">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary-1/20 rounded-full animate-ping scale-150"></div>
          <img 
            className="w-28 h-28 relative z-10 animate-bounce" 
            src={Mascot} 
            alt="Loading Mascot" 
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xl font-bold text-gray-900">{message}</p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary-1 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary-1 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary-1 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
