import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiX,
  FiExternalLink,
  FiFilter,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import type {
  ProgramItem,
  ProgramFormData,
  ProgramCategory,
  ProgramLevel,
  ProgramTargetRole,
} from "@features/mentor-access/types";
import {
  fetchPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  ApiRestrictError,
} from "@features/mentor-access/api";
import { useModalA11y } from "@shared/hooks/useModalA11y";
import ConfirmModal from "@shared/ui/ConfirmModal";
import SuccessModal from "@shared/ui/SuccessModal";
import FormField from "@shared/ui/FormField";
import FormInput from "@shared/ui/FormInput";
import Button from "@shared/ui/Button";
import Skeleton from "@shared/ui/Skeleton";

export default function CmsProgramManagement() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");

  // Modal form states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [formData, setFormData] = useState<ProgramFormData>({
    title: "",
    slug: "",
    description: "",
    price: 1500000,
    category: "MAN",
    level: "BASIC",
    target_role: "mentor",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<ProgramItem | null>(null);
  const [restrictError, setRestrictError] = useState<string | null>(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({
    isOpen: isFormModalOpen,
    onClose: () => setIsFormModalOpen(false),
    containerRef: formModalRef,
  });

  const loadPrograms = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchPrograms();
      setPrograms(data);
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat daftar program.");
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      try {
        const data = await fetchPrograms();
        if (active) {
          setPrograms(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          setErrorMessage((err as Error).message || "Gagal memuat daftar program.");
          setPrograms([]);
          setIsLoading(false);
        }
      }
    };
    fetchInit();
    return () => {
      active = false;
    };
  }, []);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return programs.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCat =
        filterCategory === "ALL" || p.category === filterCategory;

      const matchesLvl =
        filterLevel === "ALL" || (p.level && p.level === filterLevel);

      return matchesSearch && matchesCat && matchesLvl;
    });
  }, [programs, searchQuery, filterCategory, filterLevel]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingProgram(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      price: 1500000,
      category: "MAN",
      level: "BASIC",
      target_role: "mentor",
      is_active: true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (program: ProgramItem) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      slug: program.slug,
      description: program.description || "",
      price: program.price || 0,
      category: program.category || "MAN",
      level: program.level || (program.category === "MAN" ? "BASIC" : null),
      target_role: program.target_role || "mentor",
      is_active: program.is_active,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Judul program wajib diisi.";

    const isFree =
      formData.category === "TEACHME_SERIES" ||
      formData.category === "PARENT_ACADEMY";

    if (formData.category === "MAN") {
      if (!formData.level) {
        errors.level = "Jenjang MAN wajib dipilih (Basic, Intermediate, atau Advance).";
      }
      if (formData.price < 0) {
        errors.price = "Harga tidak boleh negatif.";
      } else if (formData.price === 0) {
        errors.price = "Program MAN berbayar, harga wajib lebih dari Rp 0.";
      } else if (formData.price % 1000 !== 0) {
        errors.price = "Harga program wajib kelipatan Rp 1.000 sesuai aturan kode unik.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: ProgramFormData = {
      ...formData,
      price: isFree ? 0 : formData.price,
      level: formData.category === "MAN" ? formData.level : null,
    };

    setIsSubmitting(true);
    try {
      if (editingProgram) {
        await updateProgram(editingProgram.id, payload);
        setSuccessMessage("Program berhasil diperbarui!");
      } else {
        await createProgram(payload);
        setSuccessMessage("Program baru berhasil ditambahkan!");
      }
      setIsFormModalOpen(false);
      loadPrograms();
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal menyimpan program.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete action
  const handleConfirmDelete = async () => {
    if (!programToDelete) return;
    setIsSubmitting(true);
    setRestrictError(null);
    try {
      await deleteProgram(programToDelete.id);
      setIsDeleteModalOpen(false);
      setProgramToDelete(null);
      setSuccessMessage("Program berhasil dinonaktifkan/dihapus.");
      loadPrograms();
    } catch (err) {
      setIsDeleteModalOpen(false);
      if (
        err instanceof ApiRestrictError ||
        (err as Error).message.toLowerCase().includes("restrict")
      ) {
        setRestrictError(
          `Program "${programToDelete.title}" tidak dapat dihapus permanen karena memiliki relasi pesanan atau konten terkait. Sistem mempertahankan integritas riwayat program.`
        );
      } else {
        setErrorMessage((err as Error).message || "Gagal menghapus program.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActiveQuick = async (program: ProgramItem) => {
    try {
      await updateProgram(program.id, { is_active: !program.is_active });
      loadPrograms();
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal mengubah status program.");
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const renderCategoryBadge = (cat?: ProgramCategory) => {
    switch (cat) {
      case "MAN":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
            MAN
          </span>
        );
      case "TEACHME_SERIES":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            TeachMe Series
          </span>
        );
      case "PARENT_ACADEMY":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
            Parent Academy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            {cat || "MAN"}
          </span>
        );
    }
  };

  const renderLevelBadge = (level?: ProgramLevel | null) => {
    if (!level) return null;
    switch (level) {
      case "BASIC":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            Basic
          </span>
        );
      case "INTERMEDIATE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
            Intermediate
          </span>
        );
      case "ADVANCE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
            Advance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            {level}
          </span>
        );
    }
  };

  const isFreeCategory =
    formData.category === "TEACHME_SERIES" ||
    formData.category === "PARENT_ACADEMY";

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
              <h1 className="headline-1">Program</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Kelola master program pelatihan, klasifikasi kategori, jenjang MAN, harga rupiah, dan status aktif.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-1 hover:bg-primary-2 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow self-start sm:self-auto"
            >
              <FiPlus className="w-5 h-5" />
              <span>Tambah Program</span>
            </button>
          </div>

          {/* Controls: Search & Filters */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari program (contoh: Basic Season 3, TeachMe, Parent)..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700">
                <FiFilter className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline text-gray-500">Kategori:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer font-bold text-black"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="MAN">MAN</option>
                  <option value="TEACHME_SERIES">TeachMe Series</option>
                  <option value="PARENT_ACADEMY">Parent Academy</option>
                </select>
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700">
                <span className="text-gray-500">Jenjang:</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer font-bold text-black"
                >
                  <option value="ALL">Semua Jenjang</option>
                  <option value="BASIC">Basic</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCE">Advance</option>
                </select>
              </div>

              <div className="text-xs text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap shrink-0">
                {filteredPrograms.length} Program
              </div>
            </div>
          </div>

          {/* RESTRICT Error Banner */}
          {restrictError && (
            <div
              role="alert"
              className="p-4 bg-amber-50 border-2 border-amber-500 rounded-xl text-amber-900 text-sm font-semibold flex items-start gap-3"
            >
              <FiAlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-950">Penghapusan Dibatasi (Foreign Key Restrict)</p>
                <p className="text-xs mt-1 leading-relaxed">{restrictError}</p>
              </div>
              <button
                type="button"
                onClick={() => setRestrictError(null)}
                className="text-amber-800 hover:text-black font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          )}

          {/* General Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold flex items-center justify-between"
            >
              <span>{errorMessage}</span>
              <button type="button" onClick={loadPrograms} className="underline text-xs">
                Coba lagi
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat data program...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Judul & Klasifikasi</th>
                      <th className="py-3.5 px-4">Sasaran Role</th>
                      <th className="py-3.5 px-4">Biaya</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Kelola Konten</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 space-y-1.5">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-28" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4 space-y-1.5">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-24" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex gap-2 justify-center">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                  <FiBookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Belum Ada Program</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {searchQuery || filterCategory !== "ALL" || filterLevel !== "ALL"
                    ? "Tidak ditemukan program yang sesuai dengan filter atau kata kunci."
                    : "Mulai dengan membuat program pelatihan mentor pertama Anda."}
                </p>
                {!searchQuery && filterCategory === "ALL" && filterLevel === "ALL" && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-1 hover:bg-primary-2 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Buat Program Baru</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Judul & Klasifikasi</th>
                      <th className="py-3.5 px-4">Sasaran Role</th>
                      <th className="py-3.5 px-4">Biaya</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Kelola Konten</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPrograms.map((prog) => {
                      const isFree =
                        prog.category === "TEACHME_SERIES" ||
                        prog.category === "PARENT_ACADEMY" ||
                        prog.price === 0;

                      return (
                        <tr key={prog.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {renderCategoryBadge(prog.category)}
                              {renderLevelBadge(prog.level)}
                            </div>
                            <p className="font-bold text-gray-900 text-sm">{prog.title}</p>
                            <p className="font-mono text-xs text-gray-400 mt-0.5">/{prog.slug}</p>
                            {prog.description && (
                              <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                                {prog.description}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300 capitalize">
                              {prog.target_role || "all"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {isFree ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Gratis (Rp 0)
                                </span>
                                <p className="text-[10px] text-gray-500 mt-0.5">Cukup KYC</p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-mono font-bold text-gray-900 text-sm">
                                  {formatRupiah(prog.price)}
                                </p>
                                <span className="text-[10px] text-gray-500 font-medium">
                                  Order + QRIS
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleActiveQuick(prog)}
                              title="Klik untuk mengubah status aktif"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                                prog.is_active
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                            >
                              {prog.is_active ? (
                                <FiCheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <FiXCircle className="w-3.5 h-3.5" />
                              )}
                              <span>{prog.is_active ? "Aktif" : "Nonaktif"}</span>
                            </button>
                          </td>

                          {/* Direct links to Gated Content (Materi, Tugas, Asesmen) */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 text-xs">
                              <Link
                                to={`/cms/materials?program_id=${prog.id}`}
                                className="font-bold text-primary-1 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Materi</span>
                                <FiExternalLink className="w-3 h-3" />
                              </Link>
                              <Link
                                to={`/cms/assignments?program_id=${prog.id}`}
                                className="font-bold text-secondary-1 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Tugas</span>
                                <FiExternalLink className="w-3 h-3" />
                              </Link>
                              {prog.category === "MAN" && (
                                <Link
                                  to={`/cms/assessments?program_id=${prog.id}`}
                                  className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Kelulusan</span>
                                  <FiExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(prog)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Program"
                                aria-label={`Edit ${prog.title}`}
                              >
                                <FiEdit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProgramToDelete(prog);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Program"
                                aria-label={`Hapus ${prog.title}`}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Add / Edit Modal */}
      {isFormModalOpen && (
        <div
          ref={formModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h3 className="text-xl font-black text-gray-900">
                {editingProgram ? "Edit Program" : "Tambah Program Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg border border-black hover:bg-gray-100"
                aria-label="Tutup modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Category */}
              <FormField label="Kategori Program" required>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value as ProgramCategory;
                    setFormData((prev) => ({
                      ...prev,
                      category: cat,
                      level: cat === "MAN" ? (prev.level || "BASIC") : null,
                      price: cat === "MAN" ? (prev.price || 1500000) : 0,
                    }));
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm font-bold outline-none focus:border-black transition-colors"
                >
                  <option value="MAN">MAN (Mentor Academy Nusantara) - Berbayar</option>
                  <option value="TEACHME_SERIES">TeachMe Series - Gratis (Rp 0)</option>
                  <option value="PARENT_ACADEMY">Parent Academy - Gratis (Rp 0)</option>
                </select>
              </FormField>

              {/* Level (Only for MAN) */}
              {formData.category === "MAN" && (
                <FormField
                  label="Jenjang MAN"
                  required
                  error={formErrors.level}
                >
                  <select
                    value={formData.level || "BASIC"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        level: e.target.value as ProgramLevel,
                      }))
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm font-bold outline-none focus:border-black transition-colors"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCE">Advance</option>
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Jenjang MAN sekuensial: Basic &rarr; Intermediate &rarr; Advance
                  </p>
                </FormField>
              )}

              {/* Target Role */}
              <FormField label="Sasaran Role Peserta" required>
                <select
                  value={formData.target_role || "all"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      target_role: e.target.value as ProgramTargetRole,
                    }))
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm font-bold outline-none focus:border-black transition-colors"
                >
                  <option value="all">Semua Role (all)</option>
                  <option value="mentor">Mentor</option>
                  <option value="parent">Parent</option>
                  <option value="talent">Talent</option>
                </select>
              </FormField>

              {/* Title */}
              <FormField label="Judul Program" required error={formErrors.title}>
                <FormInput
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: editingProgram
                        ? prev.slug
                        : newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    }));
                  }}
                  placeholder="Contoh: Kelas Basic Season 3"
                  error={Boolean(formErrors.title)}
                />
              </FormField>

              {/* Slug */}
              <FormField label="URL Slug" optional optionalNote="(Otomatis terisi)">
                <FormInput
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="Contoh: kelas-basic-season-3"
                  className="font-mono text-xs"
                />
              </FormField>

              {/* Price */}
              {isFreeCategory ? (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                  <p className="text-xs font-bold text-emerald-900">
                    Program Gratis (Rp 0)
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Peserta yang telah terverifikasi identitas (KYC APPROVED) dapat langsung mendaftar secara mandiri tanpa verifikasi pembayaran.
                  </p>
                </div>
              ) : (
                <FormField
                  label="Harga Program (Integer Rupiah)"
                  required
                  error={formErrors.price}
                >
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      step={1000}
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      placeholder="Contoh: 1500000"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors text-sm font-mono font-bold placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">
                    Pratinjau:{" "}
                    <span className="font-bold text-black">
                      {formatRupiah(formData.price)}
                    </span>{" "}
                    (Wajib kelipatan Rp 1.000)
                  </p>
                </FormField>
              )}

              {/* Description */}
              <FormField label="Deskripsi Program" optional>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Program intensif mentoring 4 minggu untuk persiapan sertifikasi profesional..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm outline-none font-medium resize-none focus:border-black transition-colors placeholder:text-gray-400"
                />
              </FormField>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="program-active-toggle"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-2 border-black text-primary-1 focus:ring-primary-1 cursor-pointer"
                />
                <label
                  htmlFor="program-active-toggle"
                  className="text-sm font-bold text-gray-900 cursor-pointer"
                >
                  Status Aktif (Tersedia untuk pendaftaran peserta)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3 border-t-2 border-gray-100">
                <Button
                  variant="secondary"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  {editingProgram ? "Simpan Perubahan" : "Tambahkan Program"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Nonaktifkan / Hapus Program"
        message={`Apakah Anda yakin ingin menonaktifkan atau menghapus program "${programToDelete?.title}"? Program akan dinonaktifkan secara aman sehingga histori transaksi dan materi peserta tetap terjaga.`}
        confirmText="Ya, Nonaktifkan"
        type="danger"
      />

      {/* Success Notification */}
      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Berhasil"
        message={successMessage || ""}
      />
    </div>
  );
}
