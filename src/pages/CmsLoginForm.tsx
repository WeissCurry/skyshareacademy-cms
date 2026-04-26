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
    <div className="bg-background flex flex-col items-center justify-center min-h-screen p-4 overflow-y-auto">
      {/* Mascot Group Container - Restored to exact original structure */}
      <div className="relative w-full max-w-[304px] h-48 mb-10 flex justify-center items-end scale-75 md:scale-100 transition-transform origin-bottom">
        <div className="relative h-36">
          <div className="relative -ml-36">
            <img className="w-36" src={Pose1} alt="" />
            <img className="w-36 -mt-20 ml-20 absolute" src={Pose5} alt="" />
            <img className="w-36 -mt-36 ml-40 absolute" src={Pose4} alt="" />
            <img className="w-36 -mt-4 ml-40 absolute" src={Pose3} alt="" />
            <img className="w-36 -mt-3 ml-1 absolute" src={Pose2} alt="" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md text-center mb-8">
        <h1 className="headline-1 !text-4xl md:!text-5xl">CMS Skyshare Academy</h1>
        <p className="paragraph px-4 text-sm md:text-base">
          Website ini digunakan untuk mengelola konten pada website Skyshare Academy.
        </p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="bg-white border-2 rounded-xl shadow-lg shadow-gray-300 border-black px-6 pb-10 pt-8 w-full max-w-[400px]"
      >
        <h4 className="headline-4 text-center mb-6">Login Admin</h4>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          placeholder="Email"
          className="px-4 py-2 mb-4 rounded-md w-full block border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-1 outline-none"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="px-4 py-2 mb-6 rounded-md w-full block border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-1 outline-none"
        />

        <button
          type="submit"
          className="bg-primary-1 w-full py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <p className="font-bold text-white">Login</p>
          <img className="w-5 -rotate-90" src={ArrowLeft} alt="" />
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
            <p className="text-primary-1">Logging in...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CmsLoginForm;
