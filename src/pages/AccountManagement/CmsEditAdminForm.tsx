import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import skyshareApi from "@utilities/skyshareApi";
import { useParams, useNavigate } from "react-router-dom";
import Caution from "@images/mascot-icons/Info Square.png";
import Xbutton from "@images/mascot-icons/Fill 300.png";
import Ceklist from "@images/mascot-icons/Tick Square.png";
import Coution from "@images/mascot-icons/Info Square.png";
import Mascot1 from "@images/mascot-icons/pose=8.webp";
import Mascot2 from "@images/mascot-icons/pose=1.webp";

interface EditAdminInput {
  name: string;
  email: string;
  password?: string;
}

function CmsEditAdminForm() {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const handleData = () => {
    const inputEditAdmin: EditAdminInput = {
      name,
      email,
      password,
    };
    adminEditAkun(inputEditAdmin);
  };

  const adminEditAkun = async (inputEditAdmin: EditAdminInput) => {
    setIsLoading(true);
    try {
      await skyshareApi.put(
        `/admin/admin/${id}`,
        inputEditAdmin
      );
      setIsSaveModalOpen(true);
    } catch (error) {
      setIsErrorModal(true);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getDataAdmin = async () => {
      setIsLoading(true);
      try {
        const getDataAdminById = await skyshareApi.get(`/admin/admin/${id}`);
        const adminData = getDataAdminById.data.data[0];

        setName(adminData.name);
        setEmail(adminData.email);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    getDataAdmin();
  }, [id]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    handleData();
  };

  function closeErrorModal() {
    setIsErrorModal(false);
  }

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    navigate("/cms/kelolaakun");
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    navigate("/cms/kelolaakun");
  };

  return (
    <>
      <div className="bg-background flex flex-col pb-52 pt-12 items-center self-stretch h-auto">
        <div className="content flex gap-4">
          <div className="w-96"></div>
          <div className="w-full">
            <div>
              <h1 className="headline-1">Edit Admin</h1>
              <p className="paragraph">
                Masukkan data pada <span className="font-bold">Field</span> yang
                tertera
              </p>
            </div>
            <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
              <div className="mt-10 ml-2">
                <form onSubmit={handleSave}>
                  <label htmlFor="name" className="font-bold block mb-2">
                    Name <span className="text-primary-1 font-bold">*</span>
                  </label>
                  <input
                    id="name"
                    placeholder="Masukkan Name"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                  />
                  <label htmlFor="email" className="font-bold block mb-2 mt-5">
                    Email <span className="text-primary-1 font-bold">*</span>
                  </label>
                  <input
                    id="email"
                    placeholder="Masukkan Email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                  />
                  <label
                    htmlFor="password"
                    className="font-bold block mb-2 mt-5"
                  >
                    Password <span className="text-primary-1 font-bold">*</span>
                  </label>
                  <input
                    id="password"
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    type="password"
                    className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                  />
                  <div className="flex gap-1">
                    <img className="w-5" src={Caution} alt="Caution" />
                    <p className="text-xs mt-1">Minimal 8 huruf atau angka</p>
                  </div>
                  <label htmlFor="role" className="font-bold block mb-2 mt-5">
                    Role <span className="text-primary-1 font-bold">*</span>
                  </label>
                  <div className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none">
                    Admin
                  </div>
                  <div className="w-full mt-10 flex gap-5 justify-end">
                    <div className="w-56 py-2 flex">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-300 w-20 py-2 rounded-md hover:bg-gray-200 text-black font-bold"
                      >
                        Batal
                      </button>
                    </div>
                    <div className="w-56 py-2 flex">
                      <button
                        type="submit"
                        className="bg-primary-1 w-20 py-2 rounded-md hover:bg-primary-2 text-white font-bold"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-3xl p-6 relative">
            <button onClick={closeSaveModal} className="absolute top-6 right-6">
              <img className="w-5" src={Xbutton} alt="Close" />
            </button>
            <div className="flex justify-center">
              <img className="w-40" src={Mascot1} alt="Mascot" />
            </div>
            <div className="flex gap-1 mt-5 items-center">
              <img className="w-6 h-6" src={Ceklist} alt="Check" />
              <h3 className="headline-3">Saved Successfully</h3>
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
              <h3 className="headline-3 ">Edit Failed Password Is Required</h3>
            </div>
          </div>
        </div>
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-3xl p-6 relative">
            <button
              onClick={closeCancelModal}
              className="absolute top-6 right-6"
            >
              <img className="w-5" src={Xbutton} alt="Close" />
            </button>
            <div className="flex justify-center">
              <img className="w-40" src={Mascot2} alt="Mascot" />
            </div>
            <div className="flex gap-1 mt-5 items-center">
              <img className="w-6 h-6" src={Coution} alt="Caution" />
              <h3 className="headline-3">Progress is not saved</h3>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
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
            <p className="text-primary-1">Loading...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default CmsEditAdminForm;
