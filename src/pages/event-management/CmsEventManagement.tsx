import { Link } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import Sidebar from "@widgets/Sidebar";
import ConfirmModal from "@shared/ui/ConfirmModal";
import EventCalendar from "./components/EventCalendar";
import EventListTable from "./components/EventListTable";
import { useEventDashboard } from "./hooks/useEventDashboard";

export default function CmsEventManagement() {
  const { state, actions } = useEventDashboard();

  const {
    events,
    filteredEvents,
    isLoading,
    errorMessage,
    searchQuery,
    selectedDate,
    deleteModal,
  } = state;

  const {
    setSearchQuery,
    setSelectedDate,
    confirmDelete,
    cancelDelete,
    executeDelete,
    toggleEventStatus,
    setErrorMessage,
  } = actions;

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch min-h-screen pb-24">
      <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4 md:px-0">
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>
        <div className="w-full min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="headline-1">Event Management</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Jadwalkan dan kelola semua agenda kegiatan, webinar, dan workshop
              </p>
            </div>
            <Link
              to="/cms/events/add"
              className="inline-flex items-center justify-center gap-2 bg-primary-1 hover:bg-primary-2 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow"
            >
              <FiPlus className="text-lg" />
              <span>Tambah Event</span>
            </Link>
          </div>

          {/* Interactive Calendar */}
          <EventCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari event, judul, atau topik..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:border-black outline-none transition-colors"
              />
            </div>
            <div className="text-xs text-gray-500 font-semibold self-end sm:self-center">
              Menampilkan {filteredEvents.length} dari {events.length} event
            </div>
          </div>

          {/* Events List Table */}
          <EventListTable
            events={filteredEvents}
            isLoading={isLoading}
            onDelete={confirmDelete}
            onToggleStatus={toggleEventStatus}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={executeDelete}
        title="Hapus Event?"
        message={`Apakah Anda yakin ingin menghapus event "${deleteModal.eventTitle}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
      />

      {/* Error Modal */}
      {errorMessage && (
        <ConfirmModal
          isOpen={!!errorMessage}
          onClose={() => setErrorMessage("")}
          onConfirm={() => setErrorMessage("")}
          title="Terjadi Kesalahan"
          message={errorMessage}
          confirmText="Tutup"
        />
      )}
    </div>
  );
}
