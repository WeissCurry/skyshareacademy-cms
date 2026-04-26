import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";

interface EventForm {
    nama_event: string;
    deskripsi_event: string;
    total_peserta: string;
    kategori: string;
    poster_event: File | null | string;
}

interface MentorEventFormProps {
    eventForm: EventForm;
    setEventForm: (form: EventForm) => void;
    imagePreviewUrl: string;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MentorEventForm = ({ eventForm, setEventForm, imagePreviewUrl, handleFileChange }: MentorEventFormProps) => {
    return (
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
                                <img className="w-6 -rotate-90" src={ArrowLeft} alt="" />
                            </div>
                        </div>
                        <div className="flex justify-center mb-1 text-center">
                            <h4 className="text-sm">Ukuran Ideal <span className="font-bold">(1080 x 1350)</span></h4>
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:col-span-2">
                <div className="event-form-fields mt-6">
                    <div className="bg-neutral-white gap-4 flex items-center">
                        <form className="w-full space-y-4">
                            <div>
                                <label className="block font-bold mb-1" htmlFor="nama_event">
                                    Nama Event <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nama_event"
                                    type="text"
                                    value={eventForm.nama_event}
                                    onChange={(e) => setEventForm({ ...eventForm, nama_event: e.target.value })}
                                    className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1" htmlFor="deskripsi_event">
                                    Deskripsi Event <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="deskripsi_event"
                                    value={eventForm.deskripsi_event}
                                    onChange={(e) => setEventForm({ ...eventForm, deskripsi_event: e.target.value })}
                                    className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                    rows={4}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block font-bold mb-1" htmlFor="total_peserta">
                                    Total Peserta <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="total_peserta"
                                    type="number"
                                    value={eventForm.total_peserta}
                                    onChange={(e) => setEventForm({ ...eventForm, total_peserta: e.target.value })}
                                    className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1" htmlFor="kategori">
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="kategori"
                                    value={eventForm.kategori}
                                    onChange={(e) => setEventForm({ ...eventForm, kategori: e.target.value })}
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
    );
};

export default MentorEventForm;
