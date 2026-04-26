import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CmsNavCard from "@components/cms/CmsNavCard";
import BookletSection from "./components/BookletSection";
import AlurPendaftaranSection from "./components/AlurPendaftaranSection";
import TimelineProgramSection from "./components/TimelineProgramSection";
import SchoolTable from "./components/SchoolTable";
import JoinButtonSection from "./components/JoinButtonSection";
import DeleteModal from "./components/modals/DeleteModal";
import SaveModal from "./components/modals/SaveModal";
import CancelModal from "./components/modals/CancelModal";
import ErrorModal from "./components/modals/ErrorModal";
import LoadingModal from "./components/modals/LoadingModal";
import GroupListModal from "./components/modals/GroupListModal";
import { useTalentForm } from "./hooks/useTalentForm";

function CmsTalentForm() {
  const navigate = useNavigate();
  const {
    talentForm,
    schools,
    // dataTalent,
    dataGroups,
    imagePreviewUrl,
    imagePreviewUrlTimeline,
    isUploading,
    isDeleting,
    handleBookletChange,
    handleFileChange,
    handleUrlChange,
    handleFileChangeTimeline,
    handleUrlChangeTimeline,
    handleCtaChange,
    handleJoinProgramChange,
    handleSubmit,
    handleDeleteSchool,
    fetchGroupsBySchoolId,
    resetForm,
    setDataGroups,
  } = useTalentForm();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [deleteSchoolById, setDeleteSchoolById] = useState<string | number | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isGroupListModalOpen, setIsGroupListModalOpen] = useState(false);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");

  const handleEditSchool = (id: string | number) => {
    navigate(`/cms/talent/editschool/${id}`);
  };

  const handleViewGroups = async (id: string | number, name: string) => {
    setSelectedSchoolName(name);
    await fetchGroupsBySchoolId(id);
    setIsGroupListModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupListModalOpen(false);
    setDataGroups([]);
  };

  const openDeleteModal = (schoolId: string | number) => {
    setDeleteSchoolById(schoolId);
    setDeleteMessage("Yakin untuk menghapus sekolah?");
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsModalOpen(false);
    if (!deleteSchoolById) return;
    await handleDeleteSchool(deleteSchoolById);
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      setIsSaveModalOpen(true);
    } else {
      setIsErrorModal(true);
    }
  };

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const closeSaveModal = () => {
    resetForm();
    setIsSaveModalOpen(false);
  };

  return (
    <>
      <div className="bg-background flex flex-col pt-12 items-center self-stretch">
        <div className="content-1 flex gap-4 w-full max-w-[1100px]">
          <div>
            <CmsNavCard />
          </div>
          <div className="w-full">
            <div>
              <h1 className="headline-1">Talent Academy</h1>
              <p className="paragraph">Kelola konten Talent Academy Anda di sini.</p>
            </div>

            <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
              <BookletSection
                fileBooklet={talentForm.file_booklet}
                onBookletChange={handleBookletChange}
              />
              <AlurPendaftaranSection
                imagePreviewUrl={imagePreviewUrl}
                urlValue={talentForm.url_alur || ""}
                onFileChange={handleFileChange}
                onUrlChange={handleUrlChange}
              />
              <TimelineProgramSection
                imagePreviewUrlTimeline={imagePreviewUrlTimeline}
                urlValue={talentForm.url_timeline || ""}
                onFileChange={handleFileChangeTimeline}
                onUrlChange={handleUrlChangeTimeline}
              />
              <SchoolTable
                schools={schools}
                onEdit={handleEditSchool}
                onDelete={openDeleteModal}
                onViewGroups={handleViewGroups}
              />
              <JoinButtonSection
                linkCta={talentForm.link_cta}
                linkJoinProgram={talentForm.link_join_program}
                onCtaChange={handleCtaChange}
                onJoinProgramChange={handleJoinProgramChange}
                onCancel={handleCancel}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <DeleteModal
          message={deleteMessage}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
      {isSaveModalOpen && <SaveModal onClose={closeSaveModal} />}
      {isCancelModalOpen && <CancelModal onClose={() => setIsCancelModalOpen(false)} />}
      {isErrorModal && <ErrorModal onClose={() => setIsErrorModal(false)} />}
      {isUploading && <LoadingModal message="Uploading..." />}
      {isDeleting && <LoadingModal message="Processing..." />}
      <GroupListModal
        isOpen={isGroupListModalOpen}
        schoolName={selectedSchoolName}
        groups={dataGroups}
        onClose={closeGroupModal}
      />
    </>
  );
}

export default CmsTalentForm;
