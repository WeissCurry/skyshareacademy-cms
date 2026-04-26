import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CmsNavCard from "@components/cms/CmsNavCard";

import LoadingModal from "@components/cms/LoadingModal";
import SuccessModal from "@components/cms/SuccessModal";
import ConfirmModal from "@components/cms/ConfirmModal";
import MentorEventForm from "@components/cms/MentorEventForm";
import MentorParticipantTable from "@components/cms/MentorParticipantTable";

import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";

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

interface EventForm {
    nama_event: string;
    deskripsi_event: string;
    total_peserta: string;
    kategori: string;
    poster_event: File | null | string;
}

const COURSE_STRUCTURE = [
    { id: 1, name: "Episode 1", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 2, name: "Episode 2", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 3, name: "Episode 3", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 4, name: "Episode 4", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 5, name: "Episode 5", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 6, name: "Episode 6", tasks: ["Tugas Rangkuman", "Tugas Video"] },
];

const EPISODE_COLORS: { [key: string]: string } = {
    "episode 1": "bg-blue-500",
    "episode 2": "bg-green-500",
    "episode 3": "bg-yellow-500",
    "episode 4": "bg-purple-500",
    "episode 5": "bg-pink-500",
    "episode 6": "bg-orange-500",
    "completed": "bg-primary-1",
};

function CmsMentorEditEventForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [eventForm, setEventForm] = useState<EventForm>({
        nama_event: "",
        deskripsi_event: "",
        total_peserta: "",
        kategori: "online",
        poster_event: null,
    });
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteParticipantId, setDeleteParticipantId] = useState<number | null>(null);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchEventData = async () => {
            setIsUploading(true);
            try {
                // Fetch event data (Using dummy for now as in original)
                setEventForm({
                    nama_event: "Mentor Academy #1",
                    deskripsi_event: "Belajar jadi mentor profesional",
                    total_peserta: "50",
                    kategori: "online",
                    poster_event: null,
                });
                
                // Fetch participants (Using original dummy logic)
                const dummyParticipants: Participant[] = [
                    {
                        id: 1,
                        nama: "Saiful Bahri",
                        asal: "Pontianak, Kalimantan Barat",
                        email: "saiful.bahri@email.com",
                        telepon: "081234567890",
                        instansi: "Universitas Harapan Bangsa",
                        status: "episode 6",
                        episodes: COURSE_STRUCTURE.map((episode) => ({
                            id: episode.id,
                            isCompleted: true,
                            tasks: episode.tasks.map((taskName) => ({
                                name: taskName,
                                isCompleted: true,
                            })),
                        })),
                    }
                ];
                setParticipants(dummyParticipants);
            } catch (error) {
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        };
        fetchEventData();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEventForm({ ...eventForm, poster_event: file });
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleEditEvent = async () => {
        setIsUploading(true);
        try {
            // API call would go here
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSaveModalOpen(true);
        } catch (error: unknown) {
            const err = error as Error;
            setErrorMessage(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const toggleRow = (participantId: number) => {
        setExpandedRows(prev => prev.includes(participantId) 
            ? prev.filter(id => id !== participantId) 
            : [...prev, participantId]
        );
    };

    const handleEpisodeManualCheck = (participantId: number, episodeId: number) => {
        setParticipants(prev => prev.map(p => {
            if (p.id !== participantId) return p;
            return {
                ...p,
                episodes: p.episodes.map(e => {
                    if (e.id !== episodeId) return e;
                    const newStatus = !e.isCompleted;
                    return {
                        ...e,
                        isCompleted: newStatus,
                        tasks: e.tasks.map(t => ({ ...t, isCompleted: newStatus }))
                    };
                })
            };
        }));
    };

    const handleTaskChange = (participantId: number, episodeId: number, taskName: string) => {
        setParticipants(prev => prev.map(p => {
            if (p.id !== participantId) return p;
            return {
                ...p,
                episodes: p.episodes.map(e => {
                    if (e.id !== episodeId) return e;
                    const updatedTasks = e.tasks.map(t => 
                        t.name === taskName ? { ...t, isCompleted: !t.isCompleted } : t
                    );
                    return {
                        ...e,
                        tasks: updatedTasks,
                        isCompleted: updatedTasks.every(t => t.isCompleted)
                    };
                })
            };
        }));
    };

    const handleDeleteParticipant = (participantId: number) => {
        setDeleteParticipantId(participantId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteParticipant = () => {
        if (deleteParticipantId) {
            setParticipants(prev => prev.filter(p => p.id !== deleteParticipantId));
            setIsDeleteModalOpen(false);
            setDeleteParticipantId(null);
        }
    };

    return (
        <div className="bg-background flex flex-col pt-12 items-center self-stretch pb-20">
            <div className="content-1 flex gap-4 w-full max-w-[1100px]">
                <div><CmsNavCard /></div>
                <div className="w-full">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/cms/mentoracademy")} className="hover:scale-110 transition-transform">
                            <img className="w-10 rotate-90" src={ArrowLeft} alt="Back" />
                        </button>
                        <div>
                            <h1 className="headline-1">Edit Event</h1>
                            <p className="paragraph text-gray-500">Perbarui data event dan kelola peserta</p>
                        </div>
                    </div>

                    <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-2xl pb-10 px-8 w-full">
                        <MentorEventForm 
                            eventForm={eventForm}
                            setEventForm={setEventForm}
                            imagePreviewUrl={imagePreviewUrl}
                            handleFileChange={handleFileChange}
                        />

                        <MentorParticipantTable 
                            participants={participants}
                            courseStructure={COURSE_STRUCTURE}
                            expandedRows={expandedRows}
                            toggleRow={toggleRow}
                            handleEpisodeManualCheck={handleEpisodeManualCheck}
                            handleTaskChange={handleTaskChange}
                            handleDeleteParticipant={handleDeleteParticipant}
                            episodeColors={EPISODE_COLORS}
                            eventId={id}
                        />

                        <div className="flex gap-5 justify-end mt-10 border-t pt-8">
                            <button onClick={() => setIsCancelModalOpen(true)} className="px-10 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all">Batal</button>
                            <button onClick={handleEditEvent} className="px-12 py-3 bg-primary-1 hover:bg-primary-2 text-white rounded-xl font-bold shadow-lg shadow-primary-1/20 transition-all active:scale-95">Simpan Perubahan</button>
                        </div>
                    </div>
                </div>
            </div>

            <SuccessModal isOpen={isSaveModalOpen} onClose={() => navigate("/cms/mentoracademy")} title="Event Berhasil Diperbarui" />
            <ConfirmModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={() => navigate("/cms/mentoracademy")} title="Batalkan Perubahan?" message="Data yang belum disimpan akan hilang." />
            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteParticipant} title="Hapus Peserta?" message="Peserta akan dihapus permanen dari event ini." type="danger" confirmText="Hapus" />
            <LoadingModal isLoading={isUploading} message="Sedang memproses..." />
            {errorMessage && <ConfirmModal isOpen={!!errorMessage} onClose={() => setErrorMessage("")} onConfirm={() => setErrorMessage("")} title="Terjadi Kesalahan" message={errorMessage} confirmText="Mengerti" />}
        </div>
    );
}

export default CmsMentorEditEventForm;
