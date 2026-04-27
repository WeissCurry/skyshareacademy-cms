import { useState } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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
        navigate("/cms/kelolaakun");
      } else {
        navigate("/cms/talentacademy");
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

  return {
    state: {
      email,
      password,
      isErrorModalOpen,
      isLoading,
      errorMessage,
    },
    actions: {
      setEmail,
      setPassword,
      setIsErrorModalOpen,
      setIsLoading,
      setErrorMessage,
      handleLogin,
      closeErrorModal,
      navigate,
    }
  };
}
