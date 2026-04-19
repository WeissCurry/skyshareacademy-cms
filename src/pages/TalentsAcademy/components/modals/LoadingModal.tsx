interface LoadingModalProps {
  message: string;
}

export default function LoadingModal({ message }: LoadingModalProps) {
  return (
    <div className="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="flex flex-col items-center bg-white p-5 rounded-xl">
        <svg
          className="animate-spin h-8 w-8 text-primary-1 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-primary-1">{message}</p>
      </div>
    </div>
  );
}
