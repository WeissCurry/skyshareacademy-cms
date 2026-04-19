import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";
import Modal from "@components/modals/modals"; // Pastikan path ini benar
import Ceklist from "@images/mascot-icons/Tick Square.png";
import Mascot1 from "@images/mascot-icons/pose=8.webp";
import Mascot2 from "@images/mascot-icons/pose=1.webp";
import Mascot from "@images/mascot-icons/pose=2.webp";
import Coution from "@images/mascot-icons/Info Square.png";

function CmsMentorAddParticipantForm() {
    const navigate = useNavigate();

    // State untuk field form
    const [namaLengkap, setNamaLengkap] = useState("");
    const [asalDaerah, setAsalDaerah] = useState("");
    const [instansi, setInstansi] = useState("");
    const [email, setEmail] = useState(""); // State baru
    const [nomorTelepon, setNomorTelepon] = useState(""); // State baru

    // State untuk modals dan UI
    const [isErrorModal, setIsErrorModal] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleAddParticipant = async (e) => {
        e.preventDefault();
        const inputData = {
            nama_lengkap: namaLengkap,
            asal_daerah: asalDaerah,
            instansi: instansi,
            email: email, // Data baru
            nomor_telepon: nomorTelepon, // Data baru
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

    const closeErrorModal = () => setIsErrorModal(false);
    const handleCancel = () => setIsCancelModalOpen(true);
    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
        navigate(-1); // Kembali ke halaman sebelumnya
    };
    const closeCancelModal = () => setIsCancelModalOpen(false);
    const confirmCancel = () => {
        setIsCancelModalOpen(false);
        navigate(-1); // Kembali ke halaman sebelumnya
    };

    return (
        <>
            <div className="bg-background flex pb-56 flex-col pt-12 items-center self-stretch">
                <div className="content-1 flex gap-4">
                    <div>
                        <CmsNavCard />
                    </div>
                    <div className="w-full">
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="headline-1">Add Participant</h1>
                            </div>
                            <p className="paragraph">Masukkan data pada field yang tertera</p>
                        </div>
                        <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
                            <div className="form-container mt-6">
                                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                                    <form
                                        className="w-full space-y-4"
                                        onSubmit={handleAddParticipant}
                                    >
                                        {/* Field Nama Lengkap */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="nama_lengkap"
                                            >
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="nama_lengkap"
                                                value={namaLengkap}
                                                onChange={(e) => setNamaLengkap(e.target.value)}
                                                placeholder="Masukkan nama lengkap"
                                                type="text"
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                required
                                            />
                                        </div>

                                        {/* Field Asal Daerah */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="asal_daerah"
                                            >
                                                Asal Daerah <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="asal_daerah"
                                                value={asalDaerah}
                                                onChange={(e) => setAsalDaerah(e.target.value)}
                                                placeholder="Masukkan asal daerah"
                                                type="text"
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                required
                                            />
                                        </div>

                                        {/* === [PENAMBAHAN] Field Email === */}
                                        <div>
                                            <label className="block font-bold mb-1" htmlFor="email">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Contoh: user@example.com"
                                                type="email"
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                required
                                            />
                                        </div>

                                        {/* === [PENAMBAHAN] Field Nomor Telepon === */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="nomor_telepon"
                                            >
                                                Nomor Telepon <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="nomor_telepon"
                                                value={nomorTelepon}
                                                onChange={(e) => setNomorTelepon(e.target.value)}
                                                placeholder="Contoh: 081234567890"
                                                type="tel"
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                required
                                            />
                                        </div>

                                        {/* Field Instansi */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="instansi"
                                            >
                                                Instansi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="instansi"
                                                value={instansi}
                                                onChange={(e) => setInstansi(e.target.value)}
                                                placeholder="Masukkan nama instansi"
                                                type="text"
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                required
                                            />
                                        </div>

                                        {/* Tombol Aksi */}
                                        <div className="mt-8 pt-4 flex gap-5 justify-end">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="bg-gray-300 w-56 py-2 rounded-md hover:bg-gray-200 text-black font-bold"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-primary-1 w-56 py-2 rounded-md hover:bg-primary-2 text-white font-bold"
                                            >
                                                Simpan
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS MENGGUNAKAN KOMPONEN REUSABLE --- */}
            {/* Modal Sukses */}
            <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal}>
                <div className="flex justify-center">
                    <img className="w-40" src={Mascot1} alt="Success Mascot" />
                </div>
                <div className="flex gap-1 mt-5 items-center justify-center">
                    <img className="w-6 h-6" src={Ceklist} alt="Checklist" />
                    <h3 className="headline-3 ">Saved Successfully</h3>
                </div>
            </Modal>

            {/* Modal Konfirmasi Batal */}
            <Modal
                isOpen={isCancelModalOpen}
                onClose={closeCancelModal}
                showCloseButton={false}
            >
                <div className="flex justify-center">
                    <img className=" w-40" src={Mascot} alt="Cancel Mascot" />
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

            {/* Modal Error */}
            <Modal isOpen={isErrorModal} onClose={closeErrorModal}>
                <div className="flex justify-center">
                    <img className="w-40" src={Mascot2} alt="Error Mascot" />
                </div>
                <div className="flex gap-1 mt-5 items-center justify-center">
                    <img className="w-6 h-6" src={Coution} alt="Caution" />
                    <h3 className="headline-3 ">Upload Failed</h3>
                </div>
            </Modal>

            {/* Modal Loading */}
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
        </>
    );
}

export default CmsMentorAddParticipantForm;