/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import skyshareApi from "@shared/api/skyshareApi";

export interface AdminData {
  id?: number;
  name: string;
  role: string;
  email?: string;
  [key: string]: unknown;
}

interface AdminContextType {
  dataAdmin: AdminData | null;
  loading: boolean;
  refetchAdmin: () => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataAdmin, setDataAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = useCallback(async () => {
    const token = localStorage.getItem("authorization");
    if (!token) {
      setDataAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const response = await skyshareApi.get("/admin/info");
      setDataAdmin(response.data.data);
    } catch (error) {
      console.error("Failed to load admin profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      const token = localStorage.getItem("authorization");
      if (!token) {
        if (active) {
          setDataAdmin(null);
          setLoading(false);
        }
        return;
      }
      try {
        const response = await skyshareApi.get("/admin/info");
        if (active) {
          setDataAdmin(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load admin profile:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authorization");
    delete skyshareApi.defaults.headers.common["authorization"];
    setDataAdmin(null);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        dataAdmin,
        loading,
        refetchAdmin: fetchAdmin,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
