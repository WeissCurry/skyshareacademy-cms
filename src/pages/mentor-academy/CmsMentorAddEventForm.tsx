import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import Sidebar from "@widgets/Sidebar";
import ArrowLeft from "@shared/assets/images/mascot-icons/Arrow - Down 3.png";
import Xbutton from "@shared/assets/images/mascot-icons/Fill 300.png";
import Mascot2 from "@shared/assets/images/mascot-icons/pose=1.webp";
import Mascot1 from "@shared/assets/images/mascot-icons/pose=8.webp";
import Coution from "@shared/assets/images/mascot-icons/Info Square.png";
import Ceklist from "@shared/assets/images/mascot-icons/Tick Square.png";

interface EventForm {
    nama_event: string;
    deskripsi_event: string;
    total_peserta: string;
    kategori: string;
    poster_event: File | null;
}

function CmsMentorAddEventForm() {
    // State untuk menampung data dari form event
    const [eventForm, setEventForm] = useState<EventForm>({
        nama_event: "",
        deskripsi_event: "",
        total_peserta: "",
        kategori: "online", // Nilai default untuk kategori
        poster_event: null,
    });

    // State untuk modals dan UI
    const [isErrorModal, setIsErrorModal] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const Navigate = useNavigate();

    // Fungsi untuk mengirim data event baru ke server
    const handleAddEvent = async function () {
        // Validasi sederhana
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
            // Ganti URL endpoint sesuai dengan API untuk menambah event
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

    // Handler untuk file upload
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEventForm({ ...eventForm, poster_event: file });
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    // Fungsi untuk menutup modal
    const closeErrorModal = () => setIsErrorModal(false);
    const handleCancel = () => setIsCancelModalOpen(true);
    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
        // Arahkan kembali ke halaman daftar event setelah berhasil menyimpan
        Navigate("/cms/talentacademy");
    };
    const closeCancelModal = () => {
        setIsCancelModalOpen(false);
        // Arahkan kembali ke halaman daftar event jika batal
        Navigate("/cms/talentacademy");
    };

    return (
        <>
            <div className="bg-background flex flex-col pt-12 items-center self-stretch">
                <div className="content-1 flex gap-4">
                    <div>
                        <Sidebar />
                    </div>
                    <div className="w-full">
                        <div>
                            <h1 className="headline-1">Add Event</h1>
                            <p className="paragraph">
                                Masukkan data event baru pada field yang tertera
                            </p>
                        </div>
                        <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
                            {/* Bagian Upload Poster */}
                            <div className=" poster-event mt-6">
                                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                                    <h4 className=" font-bold text-base">
                                        Upload Poster Event
                                        <span className=" text-base font-bold text-orange-300"> * </span>
                                    </h4>
                                </div>
                                <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4">
                                    <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-[312.5px] w-[250px] mx-auto">
                                        <div>
                                            {imagePreviewUrl && (
                                                <div className="flex justify-center">
                                                    <img
                                                        src={imagePreviewUrl}
                                                        alt="Image Preview"
                                                        className="rounded-xl border-2 border-gray-400"
                                                        style={{ maxWidth: "100%", maxHeight: "312.5px" }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative">
                                        <input
                                            type="file"
                                            id="image_heading"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex gap-2 items-center py-3 px-5 pointer-events-none h-[62px]">
                                            <p className="text-white font-bold">
                                                Upload File
                                            </p>
                                            <img
                                                className="w-6 -rotate-90"
                                                src={ArrowLeft}
                                                alt=""
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-center pb-3">
                                        <h4 className=" text-base">
                                            Minimal Ukuran
                                            <span className=" font-bold">(1080 x 1350)</span>
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            {/* Bagian Form Input */}
                            <div className=" event-form-fields mt-6">
                                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                                    <div className="w-full space-y-4">
                                        {/* Nama Event */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="nama_event"
                                            >
                                                Nama Event <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="nama_event"
                                                placeholder="Masukkan nama event"
                                                type="text"
                                                value={eventForm.nama_event}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    setEventForm({ ...eventForm, nama_event: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                            />
                                        </div>
                                        {/* Deskripsi Event */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="deskripsi_event"
                                            >
                                                Deskripsi Event <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="deskripsi_event"
                                                placeholder="Jelaskan tentang event ini"
                                                value={eventForm.deskripsi_event}
                                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                                    setEventForm({
                                                        ...eventForm,
                                                        deskripsi_event: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                                rows={4}
                                            ></textarea>
                                        </div>
                                        {/* Total Peserta */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="total_peserta"
                                            >
                                                Total Peserta <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="total_peserta"
                                                placeholder="Contoh: 150"
                                                type="number"
                                                value={eventForm.total_peserta}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    setEventForm({
                                                        ...eventForm,
                                                        total_peserta: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                            />
                                        </div>
                                        {/* Kategori Event */}
                                        <div>
                                            <label
                                                className="block font-bold mb-1"
                                                htmlFor="kategori"
                                            >
                                                Kategori <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="kategori"
                                                value={eventForm.kategori}
                                                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                                    setEventForm({ ...eventForm, kategori: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none bg-white"
                                            >
                                                <option value="online">Online</option>
                                                <option value="offline">Offline</option>
                                                <option value="hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {/* Tombol Aksi */}
                                <div className=" mt-4 flex gap-5 justify-end">
                                    <div className=" w-56 py-2 flex">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="bg-gray-300 w-full py-2 rounded-md hover:bg-gray-200 text-black font-bold"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                    <div className=" w-56 py-2 flex">
                                        <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleAddEvent();
                                            }}
                                            type="submit"
                                            className="bg-primary-1 w-full py-2 rounded-md hover:bg-primary-2 text-white font-bold"
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-gray-600 z-10 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-3xl p-6 relative">
                        <button onClick={closeSaveModal} className="absolute top-6 right-6">
                            <img className="w-5" src={Xbutton} alt="" />
                        </button>
                        <div className="flex justify-center">
                            <img className="w-40" src={Mascot1} alt="" />
                        </div>
                        <div className="flex gap-1 mt-5 items-center">
                            <img className="w-6 h-6" src={Ceklist} alt="" />
                            <h3 className="headline-3 ">Saved Successfully</h3>
                        </div>
                    </div>
                </div>
            )}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-10 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-3xl p-6 relative">
                        <button
                            onClick={closeCancelModal}
                            className="absolute top-6 right-6"
                        >
                            <img className="w-5" src={Xbutton} alt="" />
                        </button>
                        <div className="flex justify-center">
                            <img className="w-40" src={Mascot2} alt="" />
                        </div>
                        <div className="flex gap-1 mt-5 items-center">
                            <img className="w-6 h-6" src={Coution} alt="" />
                            <h3 className="headline-3 ">Progress is not saved</h3>
                        </div>
                    </div>
                </div>
            )}
            {isErrorModal && (
                <div className="fixed inset-0 bg-gray-600 z-10 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-3xl p-6 relative">
                        <button
                            onClick={closeErrorModal}
                            className="absolute top-6 right-6"
                        >
                            <img className="w-5" src={Xbutton} alt="" />
                        </button>
                        <div className="flex justify-center">
                            <img className="w-40" src={Mascot2} alt="" />
                        </div>
                        <div className="flex gap-1 mt-5 items-center">
                            <img className="w-6 h-6" src={Coution} alt="" />
                            <h3 className="headline-3 ">Upload Failed</h3>
                        </div>
                    </div>
                </div>
            )}
            {isUploading && (
                <div className="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="flex flex-col items-center bg-white p-5 rounded-xl">
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
                        <p className="text-primary-1">Uploading event...</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default CmsMentorAddEventForm;