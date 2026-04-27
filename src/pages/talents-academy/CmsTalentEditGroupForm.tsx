import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import Sidebar from "@widgets/Sidebar";
import Ceklist from "@shared/assets/images/mascot-icons/Tick Square.png";
import Xbutton from "@shared/assets/images/mascot-icons/Fill 300.png";
import Mascot1 from "@shared/assets/images/mascot-icons/pose=8.webp";
import Mascot2 from "@shared/assets/images/mascot-icons/pose=1.webp";
import Mascot from "@shared/assets/images/mascot-icons/pose=2.webp";
import Coution from "@shared/assets/images/mascot-icons/Info Square.png";
import Chain from "@shared/assets/images/mascot-icons/Link.png";

interface School {
  id: string | number;
  nama_sekolah: string;
  alamat: string;
}

interface GroupData {
  id: string | number;
  name: string;
  link: string;
  school_id: string | number | null;
}

function CmsTalentEditGroupForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [schoolId, setSchoolId] = useState<string | number | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [dataGroups, setDataGroups] = useState<GroupData | null>(null);
  const [deleteMessage] = useState("Yakin untuk menghapus grup?");
  const { id } = useParams();

  const Navigate = useNavigate();

  const handleEditGroups = async () => {
    const inputData = {
      name: groupName,
      link: groupLink,
      school_id: schoolId,
    };
    setIsUploading(true);
    try {
      const response = await skyshareApi({
        url: `/group/${id}`,
        method: "PUT",
        data: inputData,
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

  useEffect(() => {
    const getDataGroup = async () => {
      try {
        const response = await skyshareApi.get(`/group/${id}`);
        const groupData = response.data.data;
        setDataGroups(groupData);
        setGroupName(groupData.name);
        setGroupLink(groupData.link);
        setSchoolId(groupData.school_id);
      } catch (error) {
        console.log(error);
      }
    };
    getDataGroup();
  }, [id]);

  useEffect(() => {
    const getSchool = async function () {
      try {
        const response = await skyshareApi.get("/school");
        setSchools(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getSchool();
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
    setIsSaveModalOpen(false);
    Navigate(`/cms/talentacademy`);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    Navigate(`/cms/talentacademy`);
  };

  return (
    <>
      <div className="bg-background flex pb-56 flex-col pt-12 items-center self-stretch">
        <div className="content-1 flex gap-4">
          <div>
            <Sidebar />
          </div>
          <div className="w-full">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="headline-1">Edit Group</h1>
              </div>
              <p className="paragraph">Masukkan data pada field yang tertera</p>
            </div>
            <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
              <div className="join-button mt-6">
                <div className="bg-neutral-white p-4 gap-4 flex items-center">
                  <div className="w-full">
                    <label className="block font-bold mb-1" htmlFor="cta">
                      Nama Grup <span className="text-red-500">*</span>
                    </label>
                    <input
                      defaultValue={dataGroups?.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
                      placeholder="Masukkan nama grup"
                      type="text"
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                      required
                    />
                    <label className="block font-bold mt-4 mb-1" htmlFor="cta">
                      <div className="flex gap-1">
                        <img className="w-6 h-6" src={Chain} alt="" />
                        Link Instagram Grup{" "}
                        <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      defaultValue={dataGroups?.link}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupLink(e.target.value)}
                      placeholder="https://"
                      type="text"
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                      required
                    />

                    <div className=" mt-4 border-2 border-gray-300 rounded-md">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className=" pr-8 pl-2 py-3">Add</th>
                            <th className=" pr-20 pl-2 py-3">No.</th>
                            <th className="pr-24  w-48 py-3">Nama Sekolah</th>
                            <th className="pl-28 py-3 text-center">Alamat</th>
                            <th className="pl-44 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {schools.map((school, index) => {
                            return (
                              <tr key={school.id}>
                                <td className="pl-4">
                                  <input
                                    name="pilihan"
                                    value={school.id}
                                    checked={schoolId === school.id}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                      setSchoolId(e.target.value)
                                    }
                                    type="radio"
                                  />
                                </td>
                                <td className="pr-14 py-3 pl-3 text-center">{index + 1}</td>
                                <td className="pr-14 py-3 pl-3">
                                  {school.nama_sekolah}
                                </td>
                                <td className="py-3 pl-28 text-center">
                                  {school.alamat.substring(0, 20)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex gap-5 justify-end">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-300 w-56 py-2 rounded-md hover:bg-gray-200 text-black font-bold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditGroups();
                        }}
                        type="button"
                        className="bg-primary-1 w-56 py-2 rounded-md hover:bg-primary-2 text-white font-bold"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-2/5 h-80 rounded-3xl p-6">
            <div className="flex justify-center">
              <img className=" w-40" src={Mascot} alt="" />
            </div>
            <h3 className="mb-5 mt-5 headline-3 text-center">
              {deleteMessage}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {}}
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
              <h3 className="headline-3 ">Edit Failed</h3>
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
            <p className="text-primary-1">Uploading article...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default CmsTalentEditGroupForm;
