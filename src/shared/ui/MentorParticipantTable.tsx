import React from "react";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Delete from "@shared/assets/images/mascot-icons/Delete.png";
import Add from "@shared/assets/images/mascot-icons/Plus.png";
import Group from "@shared/assets/images/mascot-icons/3 User.png";

interface Task {
    name: string;
    isCompleted: boolean;
}

interface Episode {
    id: number;
    isCompleted: boolean;
    tasks: Task[];
}

interface Participant {
    id: number;
    nama: string;
    asal: string;
    email: string;
    telepon: string;
    instansi: string;
    status: string;
    episodes: Episode[];
}

interface MentorParticipantTableProps {
    participants: Participant[];
    courseStructure: { id: number; name: string }[];
    expandedRows: number[];
    toggleRow: (id: number) => void;
    handleEpisodeManualCheck: (participantId: number, episodeId: number) => void;
    handleTaskChange: (participantId: number, episodeId: number, taskName: string) => void;
    handleDeleteParticipant: (id: number) => void;
    eventId: string | undefined;
}

const MentorParticipantTable = ({
    participants,
    courseStructure,
    expandedRows,
    toggleRow,
    handleEpisodeManualCheck,
    handleTaskChange,
    handleDeleteParticipant,
    eventId
}: MentorParticipantTableProps) => {
    return (
        <div className="daftar-peserta mt-10">
            <div className="bg-background flex justify-between items-center rounded-xl mt-5 py-3 px-3">
                <div className="flex items-center gap-5">
                    <img className="w-6" src={Group} alt="Participants Icon" />
                    <h4 className="headline-4">Daftar Peserta</h4>
                </div>
                <div className="bg-primary-1 flex items-center rounded-md px-2 py-2">
                    <Link
                        to={`/cms/mentor/editevent/${eventId}/participants/add`}
                        className="bg-primary-1 hover:bg-primary-2"
                    >
                        <img className="w-6" src={Add} alt="Tambah Peserta" />
                    </Link>
                </div>
            </div>

            <div className="table-content mt-5 overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="sticky top-0 bg-neutral-white z-10">
                        <tr className="bg-gray-100 border-b-2 border-black">
                            <th className="pr-4 pl-2 py-3 text-left">No.</th>
                            <th className="pr-4 py-3 text-left">Nama</th>
                            <th className="pr-4 py-3 text-left">Asal</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            {courseStructure.map((episode) => (
                                <th key={episode.id} className="px-4 py-3 text-center min-w-[100px]">
                                    {episode.name}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center">Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((participant, index) => (
                            <React.Fragment key={participant.id}>
                                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="pl-3 py-4 text-left font-semibold">
                                        <button onClick={() => toggleRow(participant.id)} className="mr-2">
                                            {expandedRows.includes(participant.id) ? (
                                                <MdOutlineKeyboardArrowUp size={20} />
                                            ) : (
                                                <MdOutlineKeyboardArrowDown size={20} />
                                            )}
                                        </button>
                                        {index + 1}
                                    </td>
                                    <td className="pr-4 py-4 text-left font-medium">{participant.nama}</td>
                                    <td className="pr-4 py-4 text-left text-sm text-gray-600">{participant.asal}</td>
                                    <td className="px-4 py-4 text-left min-w-[140px]">
                                        <p className="py-1 text-center font-bold text-white rounded-full text-xs bg-gray-400">
                                            {participant.status}
                                        </p>
                                    </td>
                                    {participant.episodes.map((episode) => (
                                        <td key={episode.id} className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleEpisodeManualCheck(participant.id, episode.id)}
                                                className="flex items-center justify-center gap-1 mx-auto hover:scale-110 transition-transform"
                                            >
                                                {episode.isCompleted ? (
                                                    <FaCheckCircle className="text-green-500" size={18} />
                                                ) : (
                                                    <FaTimesCircle className="text-red-500" size={18} />
                                                )}
                                            </button>
                                        </td>
                                    ))}
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            onClick={() => handleDeleteParticipant(participant.id)}
                                            className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors shadow-sm"
                                        >
                                            <img className="w-5" src={Delete} alt="Delete" />
                                        </button>
                                    </td>
                                </tr>
                                {expandedRows.includes(participant.id) && (
                                    <tr>
                                        <td colSpan={5 + courseStructure.length} className="p-6 bg-gray-50/50">
                                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                                <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                    🎯 Progress Tugas: <span className="text-primary-1">{participant.nama}</span>
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                                    {participant.episodes.map((episode) => (
                                                        <div key={episode.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                            <h5 className="font-bold text-sm mb-3 border-b border-gray-200 pb-2">
                                                                {courseStructure.find((e) => e.id === episode.id)?.name}
                                                            </h5>
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                {episode.tasks.map((task, taskIndex) => (
                                                                    <div key={taskIndex} className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`task-${participant.id}-${episode.id}-${taskIndex}`}
                                                                            checked={task.isCompleted}
                                                                            onChange={() => handleTaskChange(participant.id, episode.id, task.name)}
                                                                            className="form-checkbox h-4 w-4 text-primary-1 rounded cursor-pointer"
                                                                        />
                                                                        <label htmlFor={`task-${participant.id}-${episode.id}-${taskIndex}`} className="text-xs cursor-pointer select-none">
                                                                            {task.name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm pt-6 mt-6 border-t border-gray-100 text-gray-500">
                                                    <p className="flex items-center gap-2"><span className="font-bold text-gray-700">📧 Email:</span> {participant.email}</p>
                                                    <p className="flex items-center gap-2"><span className="font-bold text-gray-700">📞 No. Telepon:</span> {participant.telepon}</p>
                                                    <p className="flex items-center gap-2"><span className="font-bold text-gray-700">🏫 Instansi:</span> {participant.instansi}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MentorParticipantTable;
