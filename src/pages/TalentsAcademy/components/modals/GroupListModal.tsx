import Xbutton from "@images/mascot-icons/Fill 300.png";
import Mascot from "@images/mascot-icons/pose=3.webp";

interface Group {
    id: string | number;
    name: string;
    link?: string;
    school_id?: string | number;
}

interface GroupListModalProps {
    isOpen: boolean;
    schoolName: string;
    groups: Group[];
    onClose: () => void;
}

export default function GroupListModal({ isOpen, schoolName, groups, onClose }: GroupListModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 hover:scale-110 transition-transform"
                >
                    <img className="w-6" src={Xbutton} alt="Close" />
                </button>
                <div className="flex justify-center mb-6">
                    <img className="w-32" src={Mascot} alt="Mascot" />
                </div>
                <div className="text-center mb-6">
                    <h3 className="headline-3 mb-2">Daftar Grup</h3>
                    <p className="text-gray-500 font-medium">{schoolName}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 max-h-64 overflow-y-auto border-2 border-gray-100">
                    {groups && groups.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {groups.map((group, index) => (
                                <div
                                    key={group?.id}
                                    className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100"
                                >
                                    <span className="flex items-center justify-center w-8 h-8 bg-primary-1 text-white rounded-full text-sm font-bold shadow-md">
                                        {index + 1}
                                    </span>
                                    <p className="font-bold text-gray-800">{group?.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-red-500 font-bold">Tidak Ada Group Terdaftar</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="mt-8 w-full bg-primary-1 hover:bg-primary-2 text-white font-bold py-3 rounded-xl shadow-lg transition-colors"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
}
