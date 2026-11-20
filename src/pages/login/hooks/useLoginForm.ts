import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import { extractRetryAfter, formatRateLimitMessage } from "@shared/utils/rateLimit";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleLogin = async () => {
    if (lockoutSeconds > 0 || isLoading) return;

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
      
      // Fire-and-forget login activity log
      logActivity("Admin login ke CMS Dashboard", dataFromServer.data.data.name || email);

      if (dataFromServer.data.data.role === "superadmin") {
        navigate("/cms/kelolaakun");
      } else {
        navigate("/cms/talentacademy");
      }
    } catch (error: unknown) {
      console.log(error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const status = err.response?.status;

      if (status === 429) {
        const retry = extractRetryAfter(error);
        const cooldown = retry || 60;
        setLockoutSeconds(cooldown);
        const msg = formatRateLimitMessage(error, retry);
        setErrorMessage(msg);
        setIsErrorModalOpen(true);
      } else {
        const serverMsg = err.response?.data?.message;
        setErrorMessage(serverMsg || "Email or Password is incorrect. Please try again.");
        setIsErrorModalOpen(true);
      }
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
      lockoutSeconds,
    },
    actions: {
      setEmail,
      setPassword,
      setIsErrorModalOpen,
      setIsLoading,
      setErrorMessage,
      setLockoutSeconds,
      handleLogin,
      closeErrorModal,
      navigate,
    }
  };
}
