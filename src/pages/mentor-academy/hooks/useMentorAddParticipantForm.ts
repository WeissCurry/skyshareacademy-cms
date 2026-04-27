import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";

export function useMentorAddParticipantForm() {
    const navigate = useNavigate();

    // State untuk field form
    const [namaLengkap, setNamaLengkap] = useState("");
    const [asalDaerah, setAsalDaerah] = useState("");
    const [instansi, setInstansi] = useState("");
    const [email, setEmail] = useState("");
    const [nomorTelepon, setNomorTelepon] = useState("");

    // State untuk modals dan UI
    const [isErrorModal, setIsErrorModal] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleAddParticipant = async (e: FormEvent) => {
        e.preventDefault();
        const inputData = {
            nama_lengkap: namaLengkap,
            asal_daerah: asalDaerah,
            instansi: instansi,
            email: email,
            nomor_telepon: nomorTelepon,
        };

        setIsUploading(true);
        try {
            const response = await skyshareApi.post("/participant/add", inputData);
            if (response.data.status === "success") {
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

    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
        navigate(-1);
    };

    const confirmCancel = () => {
        setIsCancelModalOpen(false);
        navigate(-1);
    };

    return {
        state: {
            namaLengkap,
            asalDaerah,
            instansi,
            email,
            nomorTelepon,
            isErrorModal,
            isSaveModalOpen,
            isCancelModalOpen,
            isUploading,
        },
        actions: {
            setNamaLengkap,
            setAsalDaerah,
            setInstansi,
            setEmail,
            setNomorTelepon,
            setIsErrorModal,
            setIsSaveModalOpen,
            setIsCancelModalOpen,
            setIsUploading,
            handleAddParticipant,
            closeSaveModal,
            confirmCancel,
            navigate,
        }
    };
}
