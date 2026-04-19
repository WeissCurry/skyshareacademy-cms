import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import skyshareApi from "@utilities/skyshareApi";

import Pose1 from "@images/mascot-icons/pose=2.webp";
import Pose2 from "@images/mascot-icons/pose=7.webp";
import Pose3 from "@images/mascot-icons/pose=6.webp";
import Pose4 from "@images/mascot-icons/pose=8.webp";
import Pose5 from "@images/mascot-icons/pose=3.webp";
import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";
import Xbutton from "@images/mascot-icons/Fill 300.png";
import Danger from "@images/mascot-icons/Danger Triangle.png";

function CmsLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const Navigate = useNavigate();

  const handleLogin = async () => {
    const inputAdmin = {
      email,
      password,
    };
    setIsLoading(true);

    try {
      const dataFromServer = await skyshareApi({
        method: "post",
        url: "admin/login",
        data: inputAdmin,
      });

      const token = dataFromServer.data.data.token;
      localStorage.setItem("authorization", token);
      skyshareApi.defaults.headers.common["authorization"] = `${token}`;
      if (dataFromServer.data.data.role === "superadmin") {
        Navigate("/cms/kelolaakun");
      } else {
        Navigate("/cms/talentacademy");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Email or Password is incorrect. Please try again.");
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  return (
    <div className="hero bg-background flex flex-col pb-12 pt-24 items-center self-stretch h-screen">
      <div className="w-4/5 text-white flex justify-center">
        <div className="-ml-36">
          <img className="w-36" src={Pose1} alt="" />
          <img className="w-36 -mt-20 ml-20 absolute" src={Pose5} alt="" />
          <img className="w-36 -mt-36 ml-40 absolute" src={Pose4} alt="" />
          <img className="w-36 -mt-4 ml-40 absolute" src={Pose3} alt="" />
          <img className="w-36 -mt-3 ml-1 absolute" src={Pose2} alt="" />
        </div>
      </div>
      <div className="mt-36 w-96">
        <h1 className="headline-1 text-center">CMS Skyshare Academy</h1>
        <p className="paragraph text-center">
          Website ini digunakan untuk mengelola konten pada website Skyshare
          Academy.
        </p>
      </div>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="mt-6 bg-white border-2 rounded-xl shadow-lg shadow-gray-500 border-black px-5 pb-10 pt-5"
      >
        <h4 className="headline-4 text-center">Login Admin</h4>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          placeholder="Email"
          className="px-2 mt-5 py-2 rounded-md w-80 block border border-gray-300 shadow-sm shadow-gray-500"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="px-2 mt-5 py-2 rounded-md w-80 block border border-gray-300 shadow-sm shadow-gray-500"
        />

        <button
          type="submit"
          className="bg-primary-1 w-80 py-2 mt-5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-2"
        >
          <p className="font-bold text-white">Login</p>
          <img className="w-6 -rotate-90" src={ArrowLeft} alt="" />
        </button>
      </form>

      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-3xl p-6 relative">
            <button
              onClick={closeErrorModal}
              className="absolute top-6 right-6"
            >
              <img className="w-5" src={Xbutton} alt="Close" />
            </button>
            <div className="flex justify-center">
              <img className="w-40" src={Danger} alt="Error" />
            </div>
            <div className="flex gap-1 mt-5 items-center">
              <img className="w-6 h-6" src={Danger} alt="Error Icon" />
              <h3 className="headline-3">{errorMessage}</h3>
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
    </div>
  );
}

export default CmsLoginForm;
