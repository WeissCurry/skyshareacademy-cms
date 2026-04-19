import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";
import Modal from "@components/modals/modals";
import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";
import Mascot from "@images/mascot-icons/pose=2.webp";
import Mascot2 from "@images/mascot-icons/pose=1.webp";
import Mascot1 from "@images/mascot-icons/pose=8.webp";
import Coution from "@images/mascot-icons/Info Square.png";
import Ceklist from "@images/mascot-icons/Tick Square.png";
import Add from "@images/mascot-icons/Plus.png";
import Group from "@images/mascot-icons/3 User.png";
import Delete from "@images/mascot-icons/Delete.png";
import {
    MdOutlineKeyboardArrowDown,
    MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

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

const DUMMY_PARTICIPANTS = [
    {
        id: 1,
        nama: "Saiful Bahri",
        asal: "Pontianak, Kalimantan Barat",
        email: "saiful.bahri@email.com",
        telepon: "081234567890",
        instansi: "Universitas Harapan Bangsa",
        episodes: COURSE_STRUCTURE.map((episode) => ({
            id: episode.id,
            isCompleted: true,
            tasks: episode.tasks.map((taskName) => ({
                name: taskName,
                isCompleted: true,
            })),
        })),
    },
    {
        id: 2,
        nama: "Ayu Lestari",
        asal: "Bandung, Jawa Barat",
        email: "ayu.lestari88@email.com",
        telepon: "085712345678",
        instansi: "Institut Teknologi Kreatif",
        episodes: COURSE_STRUCTURE.map((episode, index) => ({
            id: episode.id,
            isCompleted: index < 1,
            tasks: episode.tasks.map((taskName) => ({
                name: taskName,
                isCompleted: index < 1,
            })),
        })),
    },
    {
        id: 3,
        nama: "Dewi Anggraini",
        asal: "Surabaya, Jawa Timur",
        email: "dewi.anggraini@corp.com",
        telepon: "089876543210",
        instansi: "PT. Maju Jaya",
        episodes: COURSE_STRUCTURE.map((episode, index) => ({
            id: episode.id,
            isCompleted: index < 2,
            tasks: episode.tasks.map((taskName, taskIndex) => ({
                name: taskName,
                isCompleted: index < 2 || (index === 2 && taskIndex < 1),
            })),
        })),
    },
    {
        id: 4,
        nama: "Rizky Pratama",
        asal: "Medan, Sumatera Utara",
        email: "rizky.pratama@email.com",
        telepon: "082198765432",
        instansi: "Universitas Negeri Medan",
        episodes: COURSE_STRUCTURE.map((episode) => ({
            id: episode.id,
            isCompleted: false,
            tasks: episode.tasks.map((taskName) => ({
                name: taskName,
                isCompleted: false,
            })),
        })),
    },
    {
        id: 5,
        nama: "Eka Wijayanti",
        asal: "Makassar, Sulawesi Selatan",
        email: "eka.wijayanti@email.co.id",
        telepon: "087711223344",
        instansi: "Politeknik Negeri Ujung Pandang",
        episodes: COURSE_STRUCTURE.map((episode) => ({
            id: episode.id,
            // DIUBAH: Membandingkan id episode dengan angka
            isCompleted: episode.id === 1 || episode.id === 3,
            tasks: episode.tasks.map((taskName) => ({
                name: taskName,
                isCompleted: episode.id === 1 || episode.id === 3,
            })),
        })),
    },
    {
        id: 6,
        nama: "Agus Santoso",
        asal: "Yogyakarta, DIY",
        email: "agus.s@startup.id",
        telepon: "081322334455",
        instansi: "Startup Cipta Karya",
        episodes: COURSE_STRUCTURE.map((episode, index) => ({
            id: episode.id,
            isCompleted: index === 0,
            tasks: episode.tasks.map((taskName, taskIndex) => ({
                name: taskName,
                isCompleted: index === 0 || (index === 1 && taskIndex === 0),
            })),
        })),
    },
    {
        id: 7,
        nama: "Siti Nurhaliza",
        asal: "Denpasar, Bali",
        email: "siti.nurhaliza@email.com",
        telepon: "085299887766",
        instansi: "Universitas Udayana",
        episodes: COURSE_STRUCTURE.map((episode) => ({
            id: episode.id,
            isCompleted: true,
            tasks: episode.tasks.map((taskName) => ({
                name: taskName,
                isCompleted: true,
            })),
        })),
    },
];

const episodeColors: Record<string, string> = {
    lulus: "bg-secondary-1",
    "belum lulus": "bg-red-500",
};

function CmsMentorEditEventForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    // === State untuk Form Event ===
    const [eventForm, setEventForm] = useState<EventForm>({
        nama_event: "",
        deskripsi_event: "",
        total_peserta: "",
        kategori: "online",
        poster_event: null,
    });

    // === State untuk Tabel Peserta ===
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [courseStructure] = useState(COURSE_STRUCTURE);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    // === State untuk UI (Modals, Loading, dll) ===
    const [isErrorModal, setIsErrorModal] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingParticipantId, setDeletingParticipantId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Mengambil data event yang sudah ada saat komponen dimuat
    useEffect(() => {
        const getEventData = async () => {
            try {
                const response = await skyshareApi.get(`/event/${id}`);
                const eventData = response.data.data;
                setEventForm(eventData);
                setImagePreviewUrl(eventData.poster_event || "");
            } catch (error) {
                console.error("Gagal mengambil data event:", error);
                setErrorMessage("Gagal memuat data event.");
                setIsErrorModal(true);
            }
        };
        getEventData();
    }, [id]);

    // Mengambil data peserta untuk event ini
    useEffect(() => {
        const getParticipantsData = async () => {
            try {
                const initialParticipants = DUMMY_PARTICIPANTS.map((p) => ({
                    ...p,
                    episodes: p.episodes.map((e) => ({
                        ...e,
                        isCompleted: e.tasks.every((t) => t.isCompleted),
                    })),
                    status: "belum lulus",
                }));
                setParticipants(initialParticipants);
            } catch (error) {
                console.log("Error fetching participants data:", error);
            }
        };
        getParticipantsData();
    }, [id]);

    // === Handlers untuk Form Event ===
    const handleEditEvent = async (e: React.MouseEvent | React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nama_event", eventForm.nama_event);
        formData.append("deskripsi_event", eventForm.deskripsi_event);
        formData.append("total_peserta", eventForm.total_peserta);
        formData.append("kategori", eventForm.kategori);
        if (eventForm.poster_event instanceof File) {
            formData.append("poster_event", eventForm.poster_event);
        }
        setIsUploading(true);
        try {
            const response = await skyshareApi.post(`/event/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                params: { _method: "PUT" },
            });
            if (response.data.status === "success") {
                setIsSaveModalOpen(true);
            } else {
                setErrorMessage(response.data.message || "Terjadi kesalahan.");
                setIsErrorModal(true);
            }
        } catch (error) {
            console.error("Gagal menyimpan perubahan event:", error);
            setErrorMessage("Gagal menyimpan perubahan. Coba lagi nanti.");
            setIsErrorModal(true);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEventForm({ ...eventForm, poster_event: file });
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    // === Handlers untuk Tabel Peserta ===
    const toggleRow = (participantId: number) => {
        setExpandedRows((prev) =>
            prev.includes(participantId)
                ? prev.filter((rowId) => rowId !== participantId)
                : [...prev, participantId]
        );
    };

    const handleTaskChange = (participantId: number, episodeId: number, taskName: string) => {
        setParticipants((prevParticipants) => {
            return prevParticipants.map((participant) => {
                if (participant.id === participantId) {
                    const updatedEpisodes = participant.episodes.map((episode) => {
                        if (episode.id === episodeId) {
                            const updatedTasks = episode.tasks.map((task) => {
                                if (task.name === taskName) {
                                    return { ...task, isCompleted: !task.isCompleted };
                                }
                                return task;
                            });
                            const isEpisodeCompleted = updatedTasks.every(
                                (task) => task.isCompleted
                            );
                            return {
                                ...episode,
                                isCompleted: isEpisodeCompleted,
                                tasks: updatedTasks,
                            };
                        }
                        return episode;
                    });
                    const isAllEpisodesCompleted = updatedEpisodes.every(
                        (episode) => episode.isCompleted
                    );
                    const newStatus = isAllEpisodesCompleted ? "lulus" : "belum lulus";
                    return {
                        ...participant,
                        episodes: updatedEpisodes,
                        status: newStatus,
                    };
                }
                return participant;
            });
        });
    };

    const handleEpisodeManualCheck = (participantId: number, episodeId: number) => {
        setParticipants((prevParticipants) => {
            return prevParticipants.map((participant) => {
                if (participant.id === participantId) {
                    const updatedEpisodes = participant.episodes.map((episode) => {
                        if (episode.id === episodeId) {
                            const newIsCompleted = !episode.isCompleted;
                            const updatedTasks = episode.tasks.map((task) => ({
                                ...task,
                                isCompleted: newIsCompleted,
                            }));
                            return {
                                ...episode,
                                isCompleted: newIsCompleted,
                                tasks: updatedTasks,
                            };
                        }
                        return episode;
                    });
                    const isAllEpisodesCompleted = updatedEpisodes.every(
                        (episode) => episode.isCompleted
                    );
                    const newStatus = isAllEpisodesCompleted ? "lulus" : "belum lulus";
                    return {
                        ...participant,
                        episodes: updatedEpisodes,
                        status: newStatus,
                    };
                }
                return participant;
            });
        });
    };

    // --- Fungsi Baru untuk Delete Peserta ---
    const handleDeleteParticipant = (id: number) => {
        setDeletingParticipantId(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingParticipantId(null);
    };

    const confirmDeleteParticipant = async () => {
        if (!deletingParticipantId) return;
        setIsDeleting(true);
        closeDeleteModal();
        try {
            // Simulasi pemanggilan API
            // await skyshareApi.delete(`/event/${id}/participant/${deletingParticipantId}`);
            // Update state secara lokal
            setParticipants(
                participants.filter((p) => p.id !== deletingParticipantId)
            );
        } catch (error) {
            console.error("Gagal menghapus peserta:", error);
            setErrorMessage("Gagal menghapus peserta.");
            setIsErrorModal(true);
        } finally {
            setIsDeleting(false);
        }
    };

    // === Handlers untuk Modals ===
    const closeErrorModal = () => setIsErrorModal(false);
    const handleCancel = () => setIsCancelModalOpen(true);
    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
        navigate("/cms/mentoracademy");
    };
    const closeCancelModal = () => setIsCancelModalOpen(false);
    const confirmCancel = () => {
        setIsCancelModalOpen(false);
        navigate("/cms/mentoracademy");
    };

    return (
        <>
            <div className="bg-background flex flex-col pt-12 items-center self-stretch">
                <div className="content-1 flex gap-4">
                    <div>
                        <CmsNavCard />
                    </div>
                    <div className="w-[848px] overflow-hidden">
                        <div>
                            <h1 className="headline-1">Edit Event</h1>
                            <p className="paragraph">
                                Perbarui data event dan kelola peserta pada field yang tertera
                            </p>
                        </div>
                        <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <div className="poster-event mt-6">
                                        <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4 h-[417px]">
                                            <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-auto aspect-[4/5] w-full mx-auto">
                                                {imagePreviewUrl && (
                                                    <img
                                                        src={imagePreviewUrl}
                                                        alt="Preview"
                                                        className="rounded-xl object-cover w-full h-full"
                                                    />
                                                )}
                                            </div>
                                            <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative">
                                                <input
                                                    type="file"
                                                    id="image_heading"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="flex gap-2 items-center py-3 px-5 pointer-events-none">
                                                    <p className="text-white font-bold">Ubah</p>
                                                    <img
                                                        className="w-6 -rotate-90"
                                                        src={ArrowLeft}
                                                        alt=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-center mb-1">
                                                <h4 className="text-base">
                                                    {" "}
                                                    Ukuran Ideal{" "}
                                                    <span className="font-bold">(1080 x 1350)</span>{" "}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="event-form-fields mt-6">
                                        <div className="bg-neutral-white gap-4 flex items-center h-[]">
                                            <form className="w-full space-y-4">
                                                {/* Form inputs */}
                                                <div>
                                                    <label
                                                        className="block font-bold mb-1"
                                                        htmlFor="nama_event"
                                                    >
                                                        {" "}
                                                        Nama Event <span className="text-red-500">
                                                            *
                                                        </span>{" "}
                                                    </label>
                                                    <input
                                                        id="nama_event"
                                                        type="text"
                                                        value={eventForm.nama_event}
                                                        onChange={(e) =>
                                                            setEventForm({
                                                                ...eventForm,
                                                                nama_event: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        className="block font-bold mb-1"
                                                        htmlFor="deskripsi_event"
                                                    >
                                                        {" "}
                                                        Deskripsi Event{" "}
                                                        <span className="text-red-500">*</span>{" "}
                                                    </label>
                                                    <textarea
                                                        id="deskripsi_event"
                                                        value={eventForm.deskripsi_event}
                                                        onChange={(e) =>
                                                            setEventForm({
                                                                ...eventForm,
                                                                deskripsi_event: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                        rows={4}
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label
                                                        className="block font-bold mb-1"
                                                        htmlFor="total_peserta"
                                                    >
                                                        {" "}
                                                        Total Peserta{" "}
                                                        <span className="text-red-500">*</span>{" "}
                                                    </label>
                                                    <input
                                                        id="total_peserta"
                                                        type="number"
                                                        value={eventForm.total_peserta}
                                                        onChange={(e) =>
                                                            setEventForm({
                                                                ...eventForm,
                                                                total_peserta: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        className="block font-bold mb-1"
                                                        htmlFor="kategori"
                                                    >
                                                        {" "}
                                                        Kategori <span className="text-red-500">
                                                            *
                                                        </span>{" "}
                                                    </label>
                                                    <select
                                                        id="kategori"
                                                        value={eventForm.kategori}
                                                        onChange={(e) =>
                                                            setEventForm({
                                                                ...eventForm,
                                                                kategori: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none bg-white"
                                                    >
                                                        <option value="online">Online</option>
                                                        <option value="offline">Offline</option>
                                                        <option value="hybrid">Hybrid</option>
                                                    </select>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="daftar-peserta mt-10">
                                <div className="bg-background flex justify-between items-center rounded-xl mt-5 py-3 px-3">
                                    <div className="flex items-center gap-5">
                                        <img className="w-6" src={Group} alt="Participants Icon" />
                                        <h4 className="headline-4">Daftar Peserta</h4>
                                    </div>
                                    <div className="bg-primary-1 flex items-center rounded-md px-2 py-2">
                                        <Link
                                            to={`/cms/mentor/editevent/${id}/participants/add`}
                                            className="bg-primary-1 hover:bg-primary-2"
                                        >
                                            <img className="w-6" src={Add} alt="Tambah Peserta" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="table-content mt-5 overflow-x-auto">
                                    <table className="min-w-full table-auto border-collapse">
                                        <thead className="sticky top-0 bg-neutral-white z-10">
                                            <tr>
                                                <th className="pr-4 pl-2 py-3">No.</th>
                                                <th className="pr-4 py-3 text-left">Nama</th>
                                                <th className="pr-4 py-3 text-left">Asal</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                {courseStructure.map((episode) => (
                                                    <th
                                                        key={episode.id}
                                                        className="px-4 py-3 text-center min-w-[100px]"
                                                    >
                                                        {episode.name}
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-center">Manage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participants.map((participant, index) => (
                                                <React.Fragment key={participant.id}>
                                                    <tr className="border-b border-gray-200">
                                                        <td className="pl-3 py-4 text-left font-semibold">
                                                            <button
                                                                onClick={() => toggleRow(participant.id)}
                                                                className="mr-2"
                                                            >
                                                                {expandedRows.includes(participant.id) ? (
                                                                    <MdOutlineKeyboardArrowUp />
                                                                ) : (
                                                                    <MdOutlineKeyboardArrowDown />
                                                                )}
                                                            </button>
                                                            {index + 1}
                                                        </td>
                                                        <td className="pr-4 py-4 text-left">
                                                            {participant.nama}
                                                        </td>
                                                        <td className="pr-4 py-4 text-left">
                                                            {participant.asal}
                                                        </td>
                                                        <td className="px-4 py-4 text-left min-w-[140px]">
                                                            <p
                                                                className={`py-1 text-center font-bold text-white rounded-full ${episodeColors[
                                                                    participant.status.toLowerCase()
                                                                    ]
                                                                    }`}
                                                            >
                                                                {participant.status}
                                                            </p>
                                                        </td>
                                                        {participant.episodes.map((episode) => (
                                                            <td
                                                                key={episode.id}
                                                                className="px-4 py-4 text-center"
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        handleEpisodeManualCheck(
                                                                            participant.id,
                                                                            episode.id
                                                                        )
                                                                    }
                                                                    className="flex items-center justify-center gap-1 mx-auto"
                                                                >
                                                                    {episode.isCompleted ? (
                                                                        <FaCheckCircle className="text-green-500" />
                                                                    ) : (
                                                                        <FaTimesCircle className="text-red-500" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        ))}
                                                        <td className="px-4 py-4 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteParticipant(participant.id)
                                                                }
                                                                className="bg-red-500 hover:bg-red-400 p-2 rounded-lg"
                                                            >
                                                                <img
                                                                    className="w-5"
                                                                    src={Delete}
                                                                    alt="Delete"
                                                                />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedRows.includes(participant.id) && (
                                                        <tr>
                                                            <td
                                                                colSpan={5 + courseStructure.length}
                                                                className="p-4 bg-gray-50"
                                                            >
                                                                <h5 className="font-bold text-lg mb-2">
                                                                    Progress Tugas
                                                                </h5>
                                                                <div
                                                                    className={`grid gap-4`}
                                                                    style={{
                                                                        gridTemplateColumns: `repeat(${courseStructure.length}, minmax(0, 1fr))`,
                                                                    }}
                                                                >
                                                                    {participant.episodes.map((episode) => (
                                                                        <div
                                                                            key={episode.id}
                                                                            className="bg-white p-4 rounded-lg shadow-inner"
                                                                        >
                                                                            <h5 className="font-bold">
                                                                                {
                                                                                    courseStructure.find(
                                                                                        (e) => e.id === episode.id
                                                                                    )?.name
                                                                                }
                                                                            </h5>
                                                                            <div className="flex flex-col gap-2 mt-2">
                                                                                {episode.tasks.map(
                                                                                    (task, taskIndex) => (
                                                                                        <div
                                                                                            key={taskIndex}
                                                                                            className="flex items-center gap-2"
                                                                                        >
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                id={`task-${participant.id}-${episode.id}-${taskIndex}`}
                                                                                                checked={task.isCompleted}
                                                                                                onChange={() =>
                                                                                                    handleTaskChange(
                                                                                                        participant.id,
                                                                                                        episode.id,
                                                                                                        task.name
                                                                                                    )
                                                                                                }
                                                                                                className="form-checkbox text-blue-600"
                                                                                            />
                                                                                            <label
                                                                                                htmlFor={`task-${participant.id}-${episode.id}-${taskIndex}`}
                                                                                            >
                                                                                                {task.name}
                                                                                            </label>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm pt-4">
                                                                    <p>
                                                                        <span className="font-semibold">
                                                                            Email:
                                                                        </span>{" "}
                                                                        {participant.email}
                                                                    </p>
                                                                    <p>
                                                                        <span className="font-semibold">
                                                                            No. Telepon:
                                                                        </span>{" "}
                                                                        {participant.telepon}
                                                                    </p>
                                                                    <p>
                                                                        <span className="font-semibold">
                                                                            Asal Instansi:
                                                                        </span>{" "}
                                                                        {participant.instansi}
                                                                    </p>
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

                            {/* Tombol Aksi Utama */}
                            <div className="flex gap-5 justify-end  pt-5">
                                <div className="w-56 py-2 flex">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="bg-gray-300 w-full py-2 rounded-md hover:bg-gray-200 text-black font-bold"
                                    >
                                        Batal
                                    </button>
                                </div>
                                <div className="w-56 py-2 flex">
                                    <button
                                        onClick={handleEditEvent}
                                        type="submit"
                                        className="bg-primary-1 w-full py-2 rounded-md hover:bg-primary-2 text-white font-bold"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal}>
                <div className="flex justify-center">
                    <img className="w-40" src={Mascot1} alt="Success Mascot" />
                </div>
                <div className="flex gap-1 mt-5 items-center justify-center">
                    <img className="w-6 h-6" src={Ceklist} alt="Checklist" />
                    <h3 className="headline-3">Saved Successfully</h3>
                </div>
            </Modal>
            <Modal isOpen={isErrorModal} onClose={closeErrorModal}>
                <div className="flex justify-center">
                    <img className="w-40" src={Mascot2} alt="Error Mascot" />
                </div>
                <div className="flex gap-1 mt-5 items-center justify-center">
                    <img className="w-6 h-6" src={Coution} alt="Caution" />
                    <h3 className="headline-3">Upload Failed</h3>
                </div>
                {errorMessage && <p className="text-center mt-2">{errorMessage}</p>}
            </Modal>
            <Modal isOpen={isCancelModalOpen} onClose={closeCancelModal}>
                <div className="flex justify-center">
                    <img className="w-40" src={Mascot2} alt="Cancel Mascot" />
                </div>
                <h3 className="mb-5 mt-5 headline-3 text-center">
                    Yakin untuk batal? Progress tidak akan tersimpan
                </h3>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={closeCancelModal}
                        className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg"
                    >
                        Tidak
                    </button>
                    <button
                        onClick={confirmCancel}
                        className="bg-red-500 w-1/2 hover:bg-red-400 text-white px-4 py-2 rounded-lg"
                    >
                        Ya, Batal
                    </button>
                </div>
            </Modal>
            <Modal isOpen={isUploading} onClose={() => { }} showCloseButton={false}>
                <div className="flex flex-col items-center justify-center p-5">
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
                    <p className="text-primary-1">Uploading...</p>
                </div>
            </Modal>
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                <div className="flex justify-center">
                    <img className="w-40" src={Mascot} alt="Delete Confirmation" />
                </div>
                <h3 className="mb-5 mt-5 headline-3 text-center">
                    Yakin untuk menghapus peserta ini?
                </h3>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={closeDeleteModal}
                        className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg"
                    >
                        Batal
                    </button>
                    <button
                        onClick={confirmDeleteParticipant}
                        className="bg-red-500 w-1/2 hover:bg-red-400 text-white px-4 py-2 rounded-lg"
                    >
                        Hapus
                    </button>
                </div>
            </Modal>
            <Modal isOpen={isDeleting} onClose={() => { }} showCloseButton={false}>
                <div className="flex flex-col items-center justify-center p-5">
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
                    <p className="text-primary-1">Deleting...</p>
                </div>
            </Modal>
        </>
    );
}

export default CmsMentorEditEventForm;
