import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import skyshareApi from "@utilities/skyshareApi";
import { useNavigate } from "react-router-dom";
import Caution from "@images/mascot-icons/Info Square.png";
import Xbutton from "@images/mascot-icons/Fill 300.png";
import Ceklist from "@images/mascot-icons/Tick Square.png";
import Danger from "@images/mascot-icons/Danger Triangle.png";
import Mascot1 from "@images/mascot-icons/pose=9.webp";
import Mascot2 from "@images/mascot-icons/pose=8.webp";
import Coution from "@images/mascot-icons/Info Square.png";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

function CmsAddAdminForm() {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageIcon, setImageIcon] = useState("");
  const [imageMascot, setImageMascot] = useState("");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleData = async function () {
    const inputAdmin = {
      name: name,
      email: email,
      password: password,
    };
    setIsLoading(true);
    try {
      await skyshareApi({
        method: "post",
        url: "/admin/register",
        data: inputAdmin,
      });
      setErrorMessage("Saved Successfully");
      setImageIcon(Ceklist);
      setImageMascot(Mascot2);
      setIsSaveModalOpen(true);
    } catch (error) {
      console.log(error);
      setErrorMessage("Error Empty Field");
      setImageIcon(Danger);
      setImageMascot(Mascot1);
      setIsSaveModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors: FormErrors = {};

    if (!name) fieldErrors.name = "Name is required";
    if (!email) fieldErrors.email = "Email is required";
    if (!password) fieldErrors.password = "Password is required";
    else if (password.length < 8)
      fieldErrors.password = "Password must be at least 8 characters long";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setErrorMessage("Error Empty Field");
      setImageIcon(Danger);
      setImageMascot(Mascot1);
      setIsSaveModalOpen(true);
    } else {
      handleData();
    }
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    if (errorMessage === "Saved Successfully") {
      navigate("/cms/kelolaakun");
    }
  };

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    navigate("/cms/kelolaakun");
  };

  return (
    <>
      <div className="bg-background flex flex-col pb-44 pt-12 items-center self-stretch h-auto">
        <div className="content flex gap-4">
          <div className=" w-96"></div>
          <div className="w-full">
            <div>
              <h1 className="headline-1">Add Admin</h1>
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setName(e.target.value);
                    }}
                    value={name}
                    name="name"
                    placeholder="Masukkan Name"
                    type="text"
                    className={`w-full  px-4 py-2 border-2 rounded-lg outline-none ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 mb-6 text-sm">{errors.name}</p>
                  )}
                  <label htmlFor="username" className="font-bold block mb-2">
                    Email <span className="text-primary-1 font-bold">*</span>
                  </label>
                  <input
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setEmail(e.target.value);
                    }}
                    value={email}
                    name="username"
                    placeholder="Masukkan Email"
                    type="text"
                    className={`w-full px-4 py-2 border-2 rounded-lg outline-none ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                  <label
                    htmlFor="password"
                    className="font-bold block mb-2 mt-5"
                  >
                    Password <span className="text-primary-1 font-bold">*</span>
                  </label>
                  <input
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                    }}
                    value={password}
                    name="password"
                    placeholder="Masukkan Password"
                    type="password"
                    className={`w-full px-4 py-2 border-2 rounded-lg outline-none ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
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
                  <div className="w-full mt-10 flex justify-end gap-5">
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
              <img className="w-40" src={imageMascot} alt="Mascot" />
            </div>
            <div className="flex gap-1 mt-5 items-center">
              <img className="w-6 h-6" src={imageIcon} alt="Icon" />
              <h3 className="headline-3">{errorMessage}</h3>
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
            <p className="text-primary-1">Uploading article...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default CmsAddAdminForm;
