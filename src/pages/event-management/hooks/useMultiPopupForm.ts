import { useState, useEffect, useCallback } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import { ensureHttps } from "@shared/utils/urlUtils";
import { type PopupItem, type PopupConfigData } from "../types/popup";

export function useMultiPopupForm() {
  const [config, setConfig] = useState<PopupConfigData>({
    is_active: false,
    randomize: true,
    popups: [],
  });
  const [initialConfig, setInitialConfig] = useState<PopupConfigData | null>(null);
  const [isUploading, setIsUploading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Mengambil data popup...");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const response = await skyshareApi.get("/popup-config");
      const data = response.data?.data;
      if (data) {
        const loadedPopups: PopupItem[] = Array.isArray(data.popups)
          ? data.popups
          : [];

        // Fallback: If no popups configured yet, check if there was an old single popup in /mentor
        if (loadedPopups.length === 0) {
          try {
            const mentorRes = await skyshareApi.get("/mentor");
            const mentorData = mentorRes.data?.data;
            if (mentorData?.event_image_url) {
              loadedPopups.push({
                id: `popup-${Date.now()}`,
                title: "Event Utama",
                image_url: mentorData.event_image_url,
                cta_link: mentorData.event_cta_link || "",
                cta_text: "Pelajari Lebih Lanjut",
                is_active: Boolean(mentorData.is_event_active),
              });
            }
          } catch {
            // Ignore mentor fallback error
          }
        }

        const loadedConfig: PopupConfigData = {
          id: data.id,
          is_active: Boolean(data.is_active),
          randomize: Boolean(data.randomize),
          popups: loadedPopups,
        };

        setConfig(loadedConfig);
        setInitialConfig(loadedConfig);
      }
    } catch (error) {
      console.error("Gagal mengambil konfigurasi popup:", error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!ignore) {
        await fetchConfig();
      }
    };
    void init();
    return () => {
      ignore = true;
    };
  }, [fetchConfig]);

  const toggleGlobalActive = () => {
    setConfig((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const toggleRandomize = () => {
    setConfig((prev) => ({ ...prev, randomize: !prev.randomize }));
  };

  const addPopup = (imageUrl: string = "") => {
    const newPopup: PopupItem = {
      id: `popup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `Popup ${config.popups.length + 1}`,
      image_url: imageUrl,
      cta_link: "",
      cta_text: "Kunjungi Halaman",
      is_active: true,
    };
    setConfig((prev) => ({
      ...prev,
      popups: [...prev.popups, newPopup],
    }));
  };

  const addPopupsFromMedia = (urls: string[]) => {
    setConfig((prev) => {
      // Find URLs not already in popups
      const existingUrls = new Set(prev.popups.map((p) => p.image_url));
      const newItems: PopupItem[] = urls
        .filter((url) => !existingUrls.has(url))
        .map((url, idx) => ({
          id: `popup-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          title: `Popup ${prev.popups.length + idx + 1}`,
          image_url: url,
          cta_link: "",
          cta_text: "Kunjungi Halaman",
          is_active: true,
        }));

      // Also filter out any popups that were deselected
      const keptItems = prev.popups.filter(
        (p) => !p.image_url || urls.includes(p.image_url)
      );

      return {
        ...prev,
        popups: [...keptItems, ...newItems],
      };
    });
  };

  const updatePopup = (id: string, updates: Partial<PopupItem>) => {
    setConfig((prev) => ({
      ...prev,
      popups: prev.popups.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removePopup = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      popups: prev.popups.filter((item) => item.id !== id),
    }));
  };

  const handleSave = async () => {
    // Validate: each popup must have image_url
    const invalid = config.popups.find((p) => !p.image_url || !p.image_url.trim());
    if (invalid) {
      setErrorMessage("Semua popup yang dibuat wajib memiliki URL gambar.");
      return;
    }

    setLoadingMessage("Menyimpan konfigurasi popup...");
    setIsUploading(true);
    try {
      const sanitizedPopups = config.popups.map((p) => ({
        ...p,
        image_url: ensureHttps(p.image_url),
        cta_link: p.cta_link ? ensureHttps(p.cta_link) : "",
      }));

      await skyshareApi.put("/popup-config", {
        is_active: config.is_active,
        randomize: config.randomize,
        popups: sanitizedPopups,
      });

      try {
        await logActivity(
          `Memperbarui konfigurasi popup (${config.popups.length} popup, Randomize: ${config.randomize ? "Aktif" : "Nonaktif"})`
        );
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }

      setInitialConfig(config);
      setIsSaveModalOpen(true);
    } catch (error: unknown) {
      console.error("Gagal menyimpan konfigurasi popup:", error);
      let msg = "Gagal menyimpan data ke server. Pastikan format URL valid.";
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const responseData = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data;
        if (responseData?.message) {
          msg = responseData.message;
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
    setIsCancelModalOpen(false);
  };

  return {
    state: {
      config,
      isUploading,
      loadingMessage,
      isSaveModalOpen,
      isCancelModalOpen,
      errorMessage,
    },
    actions: {
      toggleGlobalActive,
      toggleRandomize,
      addPopup,
      addPopupsFromMedia,
      updatePopup,
      removePopup,
      handleSave,
      handleCancel,
      setIsSaveModalOpen,
      setIsCancelModalOpen,
      setErrorMessage,
    },
  };
}
