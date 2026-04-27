import { useState, useEffect, useCallback } from "react";
import skyshareApi from "@shared/api/skyshareApi";

export interface Admin {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

export function useDashboardAkun() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Admin | null>(null);
  const [dataAdmins, setDataAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDataAdmin = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataAdminFromServer = await skyshareApi.get("/admin/admins");
      setDataAdmins(dataAdminFromServer.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await getDataAdmin();
    };
    init();
  }, [getDataAdmin]);

  const handleDelete = (user: Admin) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await skyshareApi.delete(`/admin/admin/${selectedUser.id}`);
      setDataAdmins(prev => prev.filter((admin) => admin.id !== selectedUser.id));
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return {
    state: {
      isModalOpen,
      selectedUser,
      dataAdmins,
      isLoading,
    },
    actions: {
      handleDelete,
      closeModal,
      confirmDelete,
      getDataAdmin,
    }
  };
}
