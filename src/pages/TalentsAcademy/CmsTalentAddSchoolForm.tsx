import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";
import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";
import Xbutton from "@images/mascot-icons/Fill 300.png";
import Mascot2 from "@images/mascot-icons/pose=1.webp";
import Mascot from "@images/mascot-icons/pose=2.webp";
import Mascot1 from "@images/mascot-icons/pose=8.webp";
import Coution from "@images/mascot-icons/Info Square.png";
import Ceklist from "@images/mascot-icons/Tick Square.png";

interface SchoolForm {
  gambar_logo_sekolah: File | string;
  nama_sekolah: string;
  alamat: string;
  embed_map: string;
}

interface Group {
  id: string | number;
  name: string;
  school_id: string | number;
}

function CmsTalentAddSchoolForm() {
  const [schoolForm, setSchoolForm] = useState<Partial<SchoolForm>>({});
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [dataGroups, setDataGroups] = useState<Group[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [groupById] = useState<string | number | null>(null);
  const Navigate = useNavigate();

  const handleAddSchool = async function () {
    const formData = new FormData();
    if (schoolForm.gambar_logo_sekolah) formData.append("gambar_logo_sekolah", schoolForm.gambar_logo_sekolah);
    if (schoolForm.nama_sekolah) formData.append("nama_sekolah", schoolForm.nama_sekolah);
    if (schoolForm.alamat) formData.append("alamat", schoolForm.alamat);
    if (schoolForm.embed_map) formData.append("embed_map", schoolForm.embed_map);

    setIsUploading(true);
    try {
      const response = await skyshareApi({
        url: "/school/add",
        method: "POST",
        data: formData,
      });
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

  const deleteGroup = async function () {
    if (!groupById) return;
    setIsModalOpen(false);
    setIsDeleting(true);
    try {
      await skyshareApi.delete(`/group/${groupById}`);
      setDataGroups(dataGroups.filter((group) => group.id !== groupById));
    } catch (error) {
      console.log(error);
      setIsErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const getDataGroups = async function () {
      try {
        const response = await skyshareApi.get("/group");
        setDataGroups(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    getDataGroups();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeErrorModal = () => {
    setIsErrorModal(false);
  };

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const closeSaveModal = () => {
    setSchoolForm({});
    setImagePreviewUrl("");
    setIsSaveModalOpen(false);
    Navigate("/cms/talentacademy");
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    Navigate("/cms/talentacademy");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSchoolForm({
        ...schoolForm,
        gambar_logo_sekolah: file,
      });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };


  return (
    <>
      <div className="bg-background flex flex-col pt-12 items-center self-stretch">
        <div className="content-1 flex gap-4">
          <div>
            <CmsNavCard />
          </div>
          <div className="w-full">
            <div>
              <h1 className="headline-1">Add School</h1>
              <p className="paragraph">Masukkan data pada field yang tertera</p>
            </div>
            <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
              <div className=" logo-sekolah mt-6">
                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                  <h4 className=" font-bold text-base">
                    Upload Logo Sekolah{" "}
                    <span className=" text-base font-bold text-orange-300">
                      *
                    </span>
                  </h4>
                </div>
                <div className="bg-neutral-white rounded-xl border-2 border-gray-400 px-6 pt-7 pb-4">
                  <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-60">
                    <div className="">
                      {imagePreviewUrl && (
                        <div className="flex justify-center  ">
                          <img
                            src={imagePreviewUrl}
                            alt="Image Preview"
                            className="rounded-xl border-2 border-gray-400"
                            style={{ maxWidth: "100%", maxHeight: "220px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center">
                    <input
                      type="file"
                      id="school_logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer z-10 opacity-0 ml-80 rounded-xl flex justify-center gap-2 py-4"
                    />
                    <div className="absolute cursor-pointer flex gap-2 items-center ">
                      <p className=" cursor-pointer text-white font-bold">
                        Upload File
                      </p>
                      <img
                        className=" cursor-pointer w-6 -rotate-90"
                        src={ArrowLeft}
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="flex justify-center pb-3">
                    <h4 className=" text-base">
                      Minimal Ukuran{" "}
                      <span className=" font-bold">(956 x 350px)</span>
                    </h4>
                  </div>
                </div>
              </div>

              <div className=" join-button mt-6">
                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                  <form className="w-full" action="">
                    <label className="block font-bold mb-1" htmlFor="school_name">
                      Nama Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="school_name"
                      placeholder="Masukkan nama sekolah"
                      type="text"
                      onChange={(e) =>
                        setSchoolForm({
                          ...schoolForm,
                          nama_sekolah: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                    <label className="block font-bold mt-4 mb-1" htmlFor="address">
                      <div className="flex gap-1">
                        Alamat Sekolah <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      id="address"
                      placeholder="Masukkan alamat sekolah"
                      type="text"
                      onChange={(e) =>
                        setSchoolForm({
                          ...schoolForm,
                          alamat: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                    <label className="block font-bold mt-4 mb-1" htmlFor="embed_map">
                      <div className="flex gap-1">
                        Masukkan Embed Google Maps (HTML){" "}
                        <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      id="embed_map"
                      placeholder="Example : https://www.google.com/maps/embed?..."
                      type="text"
                      onChange={(e) =>
                        setSchoolForm({
                          ...schoolForm,
                          embed_map: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                  </form>
                </div>
                <div className=" mt-4 flex gap-5 justify-end">
                  <div className=" w-56 py-2 flex">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-300 w-full py-3 rounded-md hover:bg-gray-200 text-black font-bold"
                    >
                      Batal
                    </button>
                  </div>
                  <div className=" w-56 py-2 flex">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); 
                        handleAddSchool();
                      }}
                      type="submit"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-2/5 h-80 rounded-3xl p-6">
            <div className="flex justify-center">
              <img className=" w-40" src={Mascot} alt="" />
            </div>
            <h3 className="mb-5 mt-5 headline-3 text-center">
              Yakin untuk menghapus Group?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={deleteGroup}
                className="bg-red-500 w-1/2 hover:bg-red-400 text-white px-4 py-2 rounded-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
              <h3 className="headline-3 ">Action Failed</h3>
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
            <p className="text-primary-1">Uploading school...</p>
          </div>
        </div>
      )}

      {isDeleting && (
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
            <p className="text-primary-1">Deleting Group...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default CmsTalentAddSchoolForm;
