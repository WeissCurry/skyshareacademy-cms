import { type ChangeEvent } from "react";

interface EventForm {
    nama_event: string;
    deskripsi_event: string;
    total_peserta: string;
    kategori: string;
    poster_event: File | null;
}

interface EventFormFieldsProps {
    eventForm: EventForm;
    updateFormValue: (value: Partial<EventForm>) => void;
}

export default function EventFormFields({ eventForm, updateFormValue }: EventFormFieldsProps) {
    return (
        <div className="event-form-fields mt-6">
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
                                updateFormValue({ nama_event: e.target.value })
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
                                updateFormValue({
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
                                updateFormValue({
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
                                updateFormValue({ kategori: e.target.value })
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
        </div>
    );
}
