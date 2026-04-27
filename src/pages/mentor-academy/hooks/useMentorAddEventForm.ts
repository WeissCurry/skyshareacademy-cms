import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";

export interface EventForm {
    nama_event: string;
    deskripsi_event: string;
    total_peserta: string;
    kategori: string;
    poster_event: File | null;
}

export function useMentorAddEventForm() {
    const [eventForm, setEventForm] = useState<EventForm>({
        nama_event: "",
        deskripsi_event: "",
        total_peserta: "",
        kategori: "online",
        poster_event: null,
    });

    const [isErrorModal, setIsErrorModal] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const navigate = useNavigate();

    const handleAddEvent = async () => {
        if (!eventForm.poster_event || !eventForm.nama_event || !eventForm.deskripsi_event || !eventForm.total_peserta) {
            alert("Harap isi semua field yang wajib diisi (*)");
            return;
        }
        
        const formData = new FormData();
        formData.append("poster_event", eventForm.poster_event);
        formData.append("nama_event", eventForm.nama_event);
        formData.append("deskripsi_event", eventForm.deskripsi_event);
        formData.append("total_peserta", eventForm.total_peserta);
        formData.append("kategori", eventForm.kategori);

        setIsUploading(true);
        try {
            const responseFromServer = await skyshareApi({
                url: "/event/add",
                method: "POST",
                data: formData,
            });
            
            if (responseFromServer.data.status === "success") {
                setIsSaveModalOpen(true);
            } else {
                setIsErrorModal(true);
            }
        } catch (error) {
            console.log(error);
            setIsErrorModal(true);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEventForm(prev => ({ ...prev, poster_event: file }));
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const updateFormValue = (updates: Partial<EventForm>) => {
        setEventForm(prev => ({ ...prev, ...updates }));
    };

    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
        navigate("/cms/talentacademy");
    };

    const closeCancelModal = () => {
        setIsCancelModalOpen(false);
        navigate("/cms/talentacademy");
    };

    return {
        state: {
            eventForm,
            isErrorModal,
            isSaveModalOpen,
            isCancelModalOpen,
            imagePreviewUrl,
            isUploading,
        },
        actions: {
            setIsErrorModal,
            setIsSaveModalOpen,
            setIsCancelModalOpen,
            handleAddEvent,
            handleFileChange,
            updateFormValue,
            closeSaveModal,
            closeCancelModal,
            navigate,
        }
    };
}
