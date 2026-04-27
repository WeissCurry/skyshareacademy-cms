import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

export interface Task {
    name: string;
    isCompleted: boolean;
}

export interface Episode {
    id: number;
    isCompleted: boolean;
    tasks: Task[];
}

export interface Participant {
    id: number;
    nama: string;
    asal: string;
    email: string;
    telepon: string;
    instansi: string;
    status: string;
    episodes: Episode[];
}

export interface EventForm {
    nama_event: string;
    deskripsi_event: string;
    total_peserta: string;
    kategori: string;
    poster_event: File | null | string;
}

export const COURSE_STRUCTURE = [
    { id: 1, name: "Episode 1", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 2, name: "Episode 2", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 3, name: "Episode 3", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 4, name: "Episode 4", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 5, name: "Episode 5", tasks: ["Tugas Rangkuman", "Tugas Video"] },
    { id: 6, name: "Episode 6", tasks: ["Tugas Rangkuman", "Tugas Video"] },
];

export function useMentorEditEventForm(id: string | undefined) {
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

    const fetchEventData = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchEventData();
        };
        init();
    }, [fetchEventData, id]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEventForm(prev => ({ ...prev, poster_event: file }));
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

    return {
        state: {
            eventForm,
            participants,
            imagePreviewUrl,
            isUploading,
            isSaveModalOpen,
            isCancelModalOpen,
            isDeleteModalOpen,
            expandedRows,
            errorMessage,
        },
        actions: {
            setEventForm,
            setParticipants,
            setIsSaveModalOpen,
            setIsCancelModalOpen,
            setIsDeleteModalOpen,
            setErrorMessage,
            handleFileChange,
            handleEditEvent,
            toggleRow,
            handleEpisodeManualCheck,
            handleTaskChange,
            handleDeleteParticipant,
            confirmDeleteParticipant,
            navigate,
        }
    };
}
