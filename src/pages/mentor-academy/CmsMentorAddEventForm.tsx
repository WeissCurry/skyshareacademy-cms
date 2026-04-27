import Sidebar from "@widgets/Sidebar";
import Xbutton from "@shared/assets/images/mascot-icons/Fill 300.png";
import Mascot2 from "@shared/assets/images/mascot-icons/pose=1.webp";
import Mascot1 from "@shared/assets/images/mascot-icons/pose=8.webp";
import Coution from "@shared/assets/images/mascot-icons/Info Square.png";
import Ceklist from "@shared/assets/images/mascot-icons/Tick Square.png";

import { useMentorAddEventForm } from "./hooks/useMentorAddEventForm";
import PosterUploadSection from "./components/PosterUploadSection";
import EventFormFields from "./components/EventFormFields";
import ActionButtons from "./components/ActionButtons";

function CmsMentorAddEventForm() {
    const { state, actions } = useMentorAddEventForm();
    
    const {
        eventForm,
        isErrorModal,
        isSaveModalOpen,
        isCancelModalOpen,
        imagePreviewUrl,
        isUploading,
    } = state;

    const {
        setIsErrorModal,
        setIsCancelModalOpen,
        handleAddEvent,
        handleFileChange,
        updateFormValue,
        closeSaveModal,
        closeCancelModal,
    } = actions;

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
                            <PosterUploadSection 
                                imagePreviewUrl={imagePreviewUrl}
                                onFileChange={handleFileChange}
                            />

                            <EventFormFields 
                                eventForm={eventForm}
                                updateFormValue={updateFormValue}
                            />

                            <ActionButtons 
                                onCancel={() => setIsCancelModalOpen(true)}
                                onSave={handleAddEvent}
                            />
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
                            onClick={() => setIsErrorModal(false)}
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