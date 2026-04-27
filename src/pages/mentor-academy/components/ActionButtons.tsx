interface ActionButtonsProps {
    onCancel: () => void;
    onSave: () => void;
}

export default function ActionButtons({ onCancel, onSave }: ActionButtonsProps) {
    return (
        <div className=" mt-4 flex gap-5 justify-end">
            <div className=" w-56 py-2 flex">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-300 w-full py-2 rounded-md hover:bg-gray-200 text-black font-bold"
                >
                    Batal
                </button>
            </div>
            <div className=" w-56 py-2 flex">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onSave();
                    }}
                    type="submit"
                    className="bg-primary-1 w-full py-2 rounded-md hover:bg-primary-2 text-white font-bold"
                >
                    Simpan
                </button>
            </div>
        </div>
    );
}
