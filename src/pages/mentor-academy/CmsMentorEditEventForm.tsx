import { useParams } from "react-router-dom";
import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import SuccessModal from "@shared/ui/SuccessModal";
import ConfirmModal from "@shared/ui/ConfirmModal";
import MentorEventForm from "@shared/ui/MentorEventForm";
import MentorParticipantTable from "@shared/ui/MentorParticipantTable";
import ArrowLeft from "@shared/assets/images/mascot-icons/Arrow - Down 3.png";
import { useMentorEditEventForm, COURSE_STRUCTURE } from "./hooks/useMentorEditEventForm";

function CmsMentorEditEventForm() {
    const { id } = useParams();
    const { state, actions } = useMentorEditEventForm(id);
    
    const {
        eventForm,
        participants,
        imagePreviewUrl,
        isUploading,
        isSaveModalOpen,
        isCancelModalOpen,
        isDeleteModalOpen,
        expandedRows,
        errorMessage,
    } = state;

    const {
        setEventForm,
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
    } = actions;

    return (
        <div className="bg-background flex flex-col pt-12 items-center self-stretch pb-20">
            <div className="content-1 flex gap-4 w-full max-w-[1100px]">
                <div><Sidebar /></div>
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
