import { useState, useEffect, useCallback } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import { logActivity } from "@shared/utils/useActivityLogger";
import type { CmsEvent } from "../types/event";

export function useEventDashboard() {
  const [events, setEvents] = useState<CmsEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const itemsPerPage = 10;

  const handleSearchQuery = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSelectedDate = (val: string | null) => {
    setSelectedDate(val);
    setCurrentPage(1);
  };

  const handleSelectedRole = (val: string) => {
    setSelectedRole(val);
    setCurrentPage(1);
  };
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    eventId: number | null;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: null,
    eventTitle: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      const response = await skyshareApi.get("/admin/events");
      if (response.data && response.data.data) {
        setEvents(response.data.data);
      }
    } catch (err: unknown) {
      console.error("Error fetching events:", err);
      setErrorMessage("Gagal memuat daftar event.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchEvents();
    };
    init();
  }, [fetchEvents]);

  const confirmDelete = (event: CmsEvent) => {
    setDeleteModal({
      isOpen: true,
      eventId: event.id,
      eventTitle: event.title,
    });
  };

  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      eventId: null,
      eventTitle: "",
    });
  };

  const executeDelete = async () => {
    if (!deleteModal.eventId) return;
    try {
      await skyshareApi.delete(`/admin/events/${deleteModal.eventId}`);
      logActivity(`Menghapus event "${deleteModal.eventTitle}" (ID: ${deleteModal.eventId})`);
      cancelDelete();
      fetchEvents();
    } catch (err: unknown) {
      console.error("Error deleting event:", err);
      setErrorMessage("Gagal menghapus event.");
    }
  };

  const toggleEventStatus = async (event: CmsEvent) => {
    try {
      const updatedStatus = !event.is_active;
      await skyshareApi.put(`/admin/events/${event.id}`, {
        is_active: updatedStatus,
      });
      logActivity(
        `${updatedStatus ? "Mengaktifkan" : "Menonaktifkan"} status event "${event.title}"`
      );
      fetchEvents();
    } catch (err: unknown) {
      console.error("Error updating event status:", err);
      setErrorMessage("Gagal memperbarui status event.");
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ev.event_type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedRole !== "all" && ev.target_role !== selectedRole) {
      return false;
    }

    if (selectedDate && ev.event_date) {
      const evDateStr = new Date(ev.event_date).toISOString().slice(0, 10);
      if (evDateStr !== selectedDate) return false;
    }

    return true;
  });

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    state: {
      events,
      filteredEvents,
      isLoading,
      errorMessage,
      searchQuery,
      selectedDate,
      selectedRole,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      deleteModal,
      paginatedEvents,
    },
    actions: {
      fetchEvents,
      setSearchQuery: handleSearchQuery,
      setSelectedDate: handleSelectedDate,
      setSelectedRole: handleSelectedRole,
      setCurrentPage,
      confirmDelete,
      cancelDelete,
      executeDelete,
      toggleEventStatus,
      setErrorMessage,
    },
  };
}
