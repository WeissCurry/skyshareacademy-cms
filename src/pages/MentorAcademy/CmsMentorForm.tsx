import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";

import Modal from "@components/modals/modals";

import Book from "@images/mascot-icons/Document.png";
import Work from "@images/mascot-icons/Work.png";
import Time from "@images/mascot-icons/Time Circle.png";
import Ceklist from "@images/mascot-icons/Tick Square.png";
import Chain from "@images/mascot-icons/Link.png";
import Mascot1 from "@images/mascot-icons/pose=8.webp";
import Mascot2 from "@images/mascot-icons/pose=1.webp";
import Mascot from "@images/mascot-icons/pose=2.webp";
import Coution from "@images/mascot-icons/Info Square.png";
import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";
import Edit1 from "@images/mascot-icons/Edit Square.png";
import Delete from "@images/mascot-icons/Delete.png";
import Add from "@images/mascot-icons/Plus.png";

interface MentorForm {
  file_booklet?: File | string;
  gambar_alur_acara?: File | string;
  gambar_timeline?: File | string;
  link_cta?: string;
  link_join_program?: string;
}

interface Event {
  id: number;
  nama_event: string;
  total_peserta: number;
  kategori: string;
}

function CmsMentorForm() {
  const [mentorForm, setMentorForm] = useState<MentorForm>({});
  const [events, setEvents] = useState([
    { id: 1, nama_event: 'Mentor Academy Nusantara Season 1', total_peserta: 100, kategori: 'hybrid' },
    { id: 2, nama_event: 'Graduation Mentor Academy Nusantara Season 1', total_peserta: 20, kategori: 'offline' },
    { id: 3, nama_event: 'Mentor Academy Nusantara Season 2', total_peserta: 250, kategori: 'hybrid' },
    { id: 4, nama_event: 'Mentor Academy Nusantara Intermediate', total_peserta: 500, kategori: 'online' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteEventById, setDeleteEventById] = useState<number | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imagePreviewUrlTimeline, setImagePreviewUrlTimeline] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [dataMentor, setDataMentor] = useState<MentorForm>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const Navigate = useNavigate();

  useEffect(() => {
    const getDataMentor = async () => {
      setIsUploading(true);
      try {
        const getDataFromServer = await skyshareApi.get(`/mentor`);
        const mentor = getDataFromServer.data.data;
        setDataMentor(mentor);
        setMentorForm({
          ...mentorForm,
          file_booklet: mentor.file_booklet,
          link_cta: mentor.link_cta,
          link_join_program: mentor.link_join_program,
        });
        setImagePreviewUrl(mentor.gambar_alur_acara || "");
        setImagePreviewUrlTimeline(mentor.gambar_timeline || "");
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };
    getDataMentor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleAddTalentAcademy = async function () {
    const formData = new FormData();
    if (mentorForm.file_booklet) formData.append("file_booklet", mentorForm.file_booklet);
    if (mentorForm.gambar_alur_acara) formData.append("gambar_alur_acara", mentorForm.gambar_alur_acara);
    if (mentorForm.gambar_timeline) formData.append("gambar_timeline", mentorForm.gambar_timeline);
    if (mentorForm.link_cta) formData.append("link_cta", mentorForm.link_cta);
    if (mentorForm.link_join_program) formData.append("link_join_program", mentorForm.link_join_program);

    setIsUploading(true);
    try {
      const responseFromServer = await skyshareApi({
        url: "/mentor",
        method: "PUT",
        data: formData,
      });
      const status = responseFromServer.data.status;
      if (status === "success") {
        setIsSaveModalOpen(true);
      } else {
        setIsErrorModal(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
    console.log(formData, "data");
  };

  const getCategoryStyle = (category: string) => {
    const baseStyle = 'px-3 py-1 text-sm font-semibold rounded-full text-center';
    switch (category) {
      case 'online': return `${baseStyle} bg-primary-1 text-white`;
      case 'offline': return `${baseStyle} bg-secondary-1 text-white`;
      case 'hybrid': return `${baseStyle} bg-gradient-to-r from-secondary-1 to-primary-1 text-white`;
      default: return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  const closeModal = () => setIsModalOpen(false);
  const closeErrorModal = () => {
    setMentorForm({});
    setImagePreviewUrl("");
    setImagePreviewUrlTimeline("");
    setIsErrorModal(false);
  };
  const handleCancel = () => setIsCancelModalOpen(true);
  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setImagePreviewUrl("");
    setImagePreviewUrlTimeline("");
    setDataMentor({});
  };
  const closeCancelModal = () => setIsCancelModalOpen(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMentorForm({ ...mentorForm, gambar_alur_acara: file });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFileChangeTimeline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMentorForm({ ...mentorForm, gambar_timeline: file });
      setImagePreviewUrlTimeline(URL.createObjectURL(file));
    }
  };

  const handleDeleteEvent = (id: number) => {
    setDeleteEventById(id);
    setDeleteMessage("Yakin untuk menghapus event ini?");
    setIsModalOpen(true);
  };

  async function confirmDelete() {
    setIsModalOpen(false);
    if (!deleteEventById) return;
    setIsDeleting(true);
    try {
      // Ganti dengan endpoint API hapus event jika ada
      // await skyshareApi.delete(`/event/${deleteEventById}`);
      setEvents(events.filter((event) => event.id !== deleteEventById));
      console.log(`Event with id ${deleteEventById} deleted.`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
      setDeleteEventById(null);
    }
  }

  function handleNavigate(id: number) {
    Navigate(`/cms/mentor/editevent/${id}`);
  }

  return (
    <>
      <div className="bg-background flex flex-col pt-12 items-center self-stretch">
        <div className="content-1 flex gap-4">
          <div>
            <CmsNavCard />
          </div>
          <div className="w-full">
            <div>
              <h1 className="headline-1">Mentor Academy</h1>
              <p className="paragraph">Kelola secara dinamis page Mentor Academy disini.</p>
            </div>

            <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
              {/* Booklet Section */}
              <div className="booklet mt-6">
                <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
                  <img className="w-6" src={Book} alt="" />
                  <h4 className="headline-4">Booklet</h4>
                </div>
                <div className="bg-neutral-white gap-4 flex items-center">
                  <form className="w-full" action="">
                    <label className="block font-bold mt-4 mb-1" htmlFor="cta">
                      <div className="flex gap-1">
                        <img className="w-6" src={Chain} alt="" />
                        Link Booklet <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      placeholder="https://"
                      type="text"
                      defaultValue={typeof dataMentor.file_booklet === 'string' ? dataMentor.file_booklet : ''}
                      onChange={(e) => setMentorForm({ ...mentorForm, file_booklet: e.target.value })}
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                  </form>
                </div>
              </div>

              {/* Alur Acara Section */}
              <div className="alur-acara mt-6">
                <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
                  <img className="w-6" src={Work} alt="" />
                  <h4 className="headline-4">Alur Acara</h4>
                </div>
                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                  <h4 className="font-bold text-base">
                    Upload gambar “Alur Acara” <span className="text-base font-bold text-orange-300">*</span>
                  </h4>
                </div>
                <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4">
                  <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-60">
                    {imagePreviewUrl && (
                      <div className="flex justify-center">
                        <img
                          src={imagePreviewUrl}
                          alt="Image Preview"
                          className="rounded-xl border-2 border-gray-400"
                          style={{ maxWidth: "100%", maxHeight: "220px" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center">
                    <input
                      type="file"
                      id="image_heading_alur"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer z-10 opacity-0 ml-80 rounded-xl flex justify-center gap-2 py-4"
                    />
                    <div className="absolute cursor-pointer flex gap-2 items-center">
                      <p className="cursor-pointer text-white font-bold">Upload File</p>
                      <img className="cursor-pointer w-6 -rotate-90" src={ArrowLeft} alt="" />
                    </div>
                  </div>
                  <div className="flex justify-center pb-3">
                    <h4 className="text-base">Minimal Ukuran <span className="font-bold">(956 x 350px)</span></h4>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="timeline mt-6">
                <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
                  <img className="w-6" src={Time} alt="" />
                  <h4 className="headline-4">Timeline</h4>
                </div>
                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                  <h4 className="font-bold text-base">
                    Upload gambar “Timeline” <span className="text-base font-bold text-orange-300">*</span>
                  </h4>
                </div>
                <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4">
                  <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-60">
                    {imagePreviewUrlTimeline && (
                      <div className="flex justify-center">
                        <img
                          src={imagePreviewUrlTimeline}
                          alt="Image Preview"
                          className="rounded-xl border-2 border-gray-400"
                          style={{ maxWidth: "100%", maxHeight: "220px" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center">
                    <input
                      type="file"
                      id="image_heading_timeline"
                      accept="image/*"
                      onChange={handleFileChangeTimeline}
                      className="cursor-pointer z-10 opacity-0 ml-80 rounded-xl flex justify-center gap-2 py-4"
                    />
                    <div className="absolute cursor-pointer flex gap-2 items-center">
                      <p className="cursor-pointer text-white font-bold">Upload File</p>
                      <img className="cursor-pointer w-6 -rotate-90" src={ArrowLeft} alt="" />
                    </div>
                  </div>
                  <div className="flex justify-center pb-3">
                    <h4 className="text-base">Minimal Ukuran <span className="font-bold">(956 x 350px)</span></h4>
                  </div>
                </div>
              </div>

              {/* Daftar Event Section */}
              <div className="daftar-event mt-6">
                <div className="bg-background flex justify-between rounded-xl mt-5 py-3 px-3">
                  <div className="flex items-center gap-5">
                    <img className="w-6" src={Work} alt="" />
                    <h4 className="headline-4">Daftar Event</h4>
                  </div>
                  <Link to="/cms/mentor/addevent" className="bg-primary-1 hover:bg-primary-2 flex items-center rounded-md h-12 w-12 justify-center">
                    <img className="w-7 h-7" src={Add} alt="" />
                  </Link>
                </div>
                <div className="bg-neutral-white p-4 w-full overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="p-3 text-left font-bold">No.</th>
                        <th className="p-3 text-left font-bold w-2/5">Nama Event</th>
                        <th className="p-3 text-left font-bold">Total Peserta</th>
                        <th className="p-3 text-left font-bold">Kategori</th>
                        <th className="p-3 text-center font-bold">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event, index) => (
                        <tr key={event.id} className="border-gray-100">
                          <td className="p-3 text-left font-semibold text-sm">{index + 1}</td>
                          <td className="p-3 text-left text-sm">{event.nama_event}</td>
                          <td className="p-3 text-center text-sm">{event.total_peserta}</td>
                          <td className="p-3 text-center text-sm">
                            <span className={getCategoryStyle(event.kategori)}>
                              {event.kategori.charAt(0).toUpperCase() + event.kategori.slice(1)}
                            </span>
                          </td>
                          <td className="p-3 text-left flex gap-4 justify-center">
                            <button
                              onClick={() => handleNavigate(event.id)}
                              className="bg-primary-1 hover:bg-primary-2 h-12 w-12 rounded-xl flex justify-center items-center"
                            >
                              <img className="w-7 h-7" src={Edit1} alt="Edit" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-red-500 hover:bg-red-400 h-12 w-12 rounded-xl flex justify-center items-center"
                            >
                              <img className="w-7 h-7" src={Delete} alt="Delete" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Join Button Section */}
              <div className="join-button mt-6">
                <div className="bg-background p-4 gap-4 flex items-center rounded-xl">
                  <img className="w-6" src={Chain} alt="" />
                  <h4 className="headline-4">Join Button</h4>
                </div>
                <div className="bg-neutral-white py-4 gap-4 flex items-center">
                  <form className="w-full" action="">
                    <label className="block font-bold mb-1" htmlFor="cta">
                      Call To Action <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Example: Join Talent Academy Season 6"
                      defaultValue={dataMentor.link_cta}
                      onChange={(e) => setMentorForm({ ...mentorForm, link_cta: e.target.value })}
                      type="text"
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                    <label className="block font-bold mt-4 mb-1" htmlFor="cta">
                      <div className="flex gap-1">
                        <img className="w-6" src={Chain} alt="" />
                        Link Join Program <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      placeholder="https://"
                      type="text"
                      defaultValue={dataMentor.link_join_program}
                      onChange={(e) => setMentorForm({ ...mentorForm, link_join_program: e.target.value })}
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                  </form>
                </div>
                <div className="mt-4 flex gap-5 justify-end">
                  <div className="w-56 py-2 flex">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-300 w-full py-3 rounded-md hover:bg-gray-200 text-black font-bold"
                    >
                      Batal
                    </button>
                  </div>
                  <div className="w-56 py-2 flex">
                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddTalentAcademy();
                      }}
                      className="bg-primary-1 w-full py-3 rounded-md hover:bg-primary-2 text-white font-bold"
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
      
      {/* Modal Konfirmasi Hapus */}
      <Modal isOpen={isModalOpen} onClose={closeModal} showCloseButton={false}>
        <div className="flex justify-center">
          <img className="w-40" src={Mascot} alt="Mascot" />
        </div>
        <h3 className="mb-5 mt-5 headline-3 text-center">{deleteMessage}</h3>
        <div className="flex justify-center gap-4">
          <button onClick={closeModal} className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg">
            Batal
          </button>
          <button onClick={confirmDelete} className="bg-red-500 w-1/2 hover:bg-red-400 text-white px-4 py-2 rounded-lg">
            Hapus
          </button>
        </div>
      </Modal>

      {/* Modal Simpan Berhasil */}
      <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal}>
        <div className="flex justify-center">
          <img className="w-40" src={Mascot1} alt="Success Mascot" />
        </div>
        <div className="flex gap-1 mt-5 items-center justify-center">
          <img className="w-6 h-6" src={Ceklist} alt="Checklist" />
          <h3 className="headline-3">Saved Successfully</h3>
        </div>
      </Modal>

      {/* Modal Error */}
      <Modal isOpen={isErrorModal} onClose={closeErrorModal}>
        <div className="flex justify-center">
          <img className="w-40" src={Mascot2} alt="Error Mascot" />
        </div>
        <div className="flex gap-1 mt-5 items-center justify-center">
          <img className="w-6 h-6" src={Coution} alt="Caution" />
          <h3 className="headline-3">Upload Failed</h3>
        </div>
      </Modal>

      {/* Modal Batal */}
      <Modal isOpen={isCancelModalOpen} onClose={closeCancelModal}>
        <div className="flex justify-center">
          <img className="w-40" src={Mascot2} alt="Cancel Mascot" />
        </div>
        <div className="flex gap-1 mt-5 items-center justify-center">
          <img className="w-6 h-6" src={Coution} alt="Caution" />
          <h3 className="headline-3">Progress is not saved</h3>
        </div>
      </Modal>

      {/* Modal Loading Upload */}
      <Modal isOpen={isUploading} onClose={() => {}} showCloseButton={false}>
        <div className="flex flex-col items-center justify-center p-5">
          <svg className="animate-spin h-8 w-8 text-primary-1 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-primary-1">Uploading...</p>
        </div>
      </Modal>

      {/* Modal Loading Hapus */}
      <Modal isOpen={isDeleting} onClose={() => {}} showCloseButton={false}>
        <div className="flex flex-col items-center justify-center p-5">
          <svg className="animate-spin h-8 w-8 text-primary-1 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-primary-1">Deleting...</p>
        </div>
      </Modal>
    </>
  );
}

export default CmsMentorForm;