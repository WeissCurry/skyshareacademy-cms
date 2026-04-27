import { Link } from "react-router-dom";
import Location from "@shared/assets/images/mascot-icons/Location.png";
import Show from "@shared/assets/images/mascot-icons/Show.png";
import Edit1 from "@shared/assets/images/mascot-icons/Edit Square.png";
import Delete from "@shared/assets/images/mascot-icons/Delete.png";
import Add from "@shared/assets/images/mascot-icons/Plus.png";

interface School {
    id: string | number;
    nama_sekolah: string;
    embed_map: string;
    alamat?: string;
}

interface SchoolTableProps {
    schools: School[];
    onEdit: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onViewGroups: (id: string | number, name: string) => void;
}

export default function SchoolTable({ schools, onEdit, onDelete, onViewGroups }: SchoolTableProps) {
    return (
        <div className="sekolah-grup mt-6">
            <div className="bg-background flex justify-between rounded-xl mt-5 py-3 px-3">
                <div className="flex items-center gap-5">
                    <img className="w-6" src={Location} alt="" />
                    <h4 className="headline-4">Sekolah & Grup</h4>
                </div>
                <Link
                    to="/cms/talent/addschool"
                    className="bg-primary-1 hover:bg-primary-2 flex items-center rounded-md h-12 w-12 justify-center"
                >
                    <img className="w-7 h-7" src={Add} alt="" />
                </Link>
            </div>
            <div className="bg-neutral-white p-4 w-full overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="p-3 text-left font-bold text-sm">No.</th>
                            <th className="p-3 text-left font-bold text-sm w-2/5">Nama Sekolah</th>
                            <th className="p-3 text-left font-bold text-sm">Alamat</th>
                            <th className="p-3 text-center font-bold text-sm">Grup</th>
                            <th className="p-3 text-center font-bold text-sm">Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schools.map((school, index) => (
                            <tr key={school.id} className="border-gray-100 border-b last:border-b-0">
                                <td className="p-3 text-left font-semibold text-sm">{index + 1}</td>
                                <td className="p-3 text-left text-sm">{school.nama_sekolah}</td>
                                <td className="p-3 text-left text-sm flex items-center gap-2">
                                    <img className="w-5 h-5 flex-shrink-0" src={Location} alt="" />
                                    <span className="truncate max-w-[200px]">
                                        {school.embed_map.substring(0, 20)}...
                                    </span>
                                </td>
                                <td className="p-3 text-center relative">
                                    {/* Tombol Grup Diperbarui di Sini */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onViewGroups(school.id, school.nama_sekolah);
                                        }}
                                        className="border border-gray-300 rounded-lg px-4 py-2 flex gap-2 items-center justify-center mx-auto hover:bg-gray-100 transition-colors"
                                    >
                                        <img className="w-5 h-5" src={Show} alt="Lihat" />
                                        <span className="text-sm font-medium text-gray-700">Lihat</span>
                                    </button>
                                </td>
                                <td className="p-3 text-center flex gap-3 justify-center">
                                    <button
                                        onClick={() => onEdit(school.id)}
                                        className="bg-primary-1 hover:bg-primary-2 h-10 w-10 rounded-xl flex justify-center items-center transition-colors"
                                    >
                                        <img className="w-5 h-5" src={Edit1} alt="Edit" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(school.id)}
                                        className="bg-red-500 hover:bg-red-600 h-10 w-10 rounded-xl flex justify-center items-center transition-colors"
                                    >
                                        <img className="w-5 h-5" src={Delete} alt="Delete" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}