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
  } = state;

  const {
    setSearchQuery,
    setSelectedDate,
    setSelectedRole,
    confirmDelete,
    cancelDelete,
    executeDelete,
    toggleEventStatus,
    setErrorMessage,
    setCurrentPage,
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

          {/* Controls Container: Search, Filter, and Pagination */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#000] flex flex-col lg:flex-row flex-wrap gap-4 items-center justify-between">

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1 items-center">
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari event..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors font-medium placeholder:font-normal placeholder:text-gray-400"
                />
              </div>
              <div className="relative w-full sm:w-44">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors cursor-pointer appearance-none font-bold"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "16px"
                  }}
                >
                  <option value="all">Semua Program</option>
                  <option value="talent">Talents Academy</option>
                  <option value="mentor">Mentor Academy</option>
                  <option value="parent">Parents Academy</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap">
                Total: {totalItems} Event
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1.5 bg-white border-2 border-black rounded-lg font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all shadow-[1.5px_1.5px_0_#000] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[0.5px_0.5px_0_#000]"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-bold w-12 text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-3 py-1.5 bg-white border-2 border-black rounded-lg font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all shadow-[1.5px_1.5px_0_#000] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[0.5px_0.5px_0_#000]"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Events List Table */}
          <EventListTable
            events={paginatedEvents}
            startIndex={(currentPage - 1) * itemsPerPage}
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
