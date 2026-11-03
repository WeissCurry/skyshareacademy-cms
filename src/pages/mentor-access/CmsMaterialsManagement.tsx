import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiFileText,
  FiPlus,
  FiLink,
  FiTrash2,
  FiEdit3,
  FiExternalLink,
  FiUploadCloud,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiDownload,
} from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import type { ProgramItem, ProgramMaterialItem, MaterialType } from "@features/mentor-access/types";
import {
  fetchPrograms,
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "@features/mentor-access/api";
import { resolveAssetUrl, ensureHttps } from "@shared/utils/urlUtils";
import { useModalA11y } from "@shared/hooks/useModalA11y";
import ConfirmModal from "@shared/ui/ConfirmModal";
import SuccessModal from "@shared/ui/SuccessModal";
import FormField from "@shared/ui/FormField";
import FormInput from "@shared/ui/FormInput";
import Button from "@shared/ui/Button";
import Skeleton from "@shared/ui/Skeleton";

export default function CmsMaterialsManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProgramId = searchParams.get("program_id");

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    initialProgramId ? parseInt(initialProgramId, 10) : null
  );

  const [materials, setMaterials] = useState<ProgramMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProgramMaterialItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MaterialType>("pdf");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [externalUrl, setExternalUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<ProgramMaterialItem | null>(null);

  // Success Notification
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({
    isOpen: isFormOpen,
    onClose: () => setIsFormOpen(false),
    containerRef: formModalRef,
  });

  // Load programs on mount
  useEffect(() => {
    const loadProgs = async () => {
      try {
        const data = await fetchPrograms();
        setPrograms(data);
        if (data.length > 0 && !selectedProgramId) {
          setSelectedProgramId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProgs();
  }, [selectedProgramId]);

  // Load materials for selected program
  const loadMaterials = useCallback(async (progId: number) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchMaterials(progId);
      // Sort by order_index
      setMaterials([...data].sort((a, b) => a.order_index - b.order_index));
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat materi program.");
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (selectedProgramId) {
      setSearchParams({ program_id: String(selectedProgramId) });
      const fetchInit = async () => {
        try {
          const data = await fetchMaterials(selectedProgramId);
          if (active) {
            setMaterials([...data].sort((a, b) => a.order_index - b.order_index));
            setIsLoading(false);
          }
        } catch (err) {
          if (active) {
            setErrorMessage((err as Error).message || "Gagal memuat materi program.");
            setMaterials([]);
            setIsLoading(false);
          }
        }
      };
      fetchInit();
    }
    return () => {
      active = false;
    };
  }, [selectedProgramId, setSearchParams]);

  const currentProgram = useMemo(() => {
    return programs.find((p) => p.id === selectedProgramId);
  }, [programs, selectedProgramId]);

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setTitle("");
    setDescription("");
    setType("pdf");
    setOrderIndex(materials.length + 1);
    setIsActive(true);
    setExternalUrl("");
    setPdfFile(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ProgramMaterialItem) => {
    setEditingMaterial(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setType(item.type);
    setOrderIndex(item.order_index);
    setIsActive(item.is_active);
    setExternalUrl(item.external_url || "");
    setPdfFile(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) return;

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Judul materi wajib diisi.";

    if (type === "link") {
      if (!externalUrl.trim()) {
        errors.externalUrl = "URL tautan eksternal wajib diisi.";
      } else if (!/^https?:\/\//i.test(externalUrl.trim())) {
        errors.externalUrl = "URL harus diawali dengan http:// atau https://";
      }
    } else if (type === "pdf") {
      if (!editingMaterial && !pdfFile) {
        errors.pdfFile = "Berkas modul PDF wajib diunggah.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (type === "pdf" && pdfFile) {
        // Multipart upload
        const fd = new FormData();
        fd.append("title", title.trim());
        fd.append("description", description.trim());
        fd.append("type", "pdf");
        fd.append("order_index", String(orderIndex));
        fd.append("is_active", String(isActive));
        fd.append("file", pdfFile);

        if (editingMaterial) {
          await updateMaterial(editingMaterial.id, fd);
          setSuccessMessage("Modul PDF berhasil diperbarui!");
        } else {
          await createMaterial(selectedProgramId, fd);
          setSuccessMessage("Modul PDF berhasil ditambahkan ke program!");
        }
      } else {
        // JSON payload
        const payload: Record<string, unknown> = {
          title: title.trim(),
          description: description.trim(),
          type,
          order_index: orderIndex,
          is_active: isActive,
          external_url: type === "link" ? externalUrl.trim() : null,
        };

        if (editingMaterial) {
          await updateMaterial(editingMaterial.id, payload);
          setSuccessMessage("Materi berhasil diperbarui!");
        } else {
          await createMaterial(selectedProgramId, payload);
          setSuccessMessage("Materi berhasil ditambahkan ke program!");
        }
      }

      setIsFormOpen(false);
      loadMaterials(selectedProgramId);
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal menyimpan materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete || !selectedProgramId) return;
    setIsSubmitting(true);
    try {
      await deleteMaterial(materialToDelete.id);
      setIsDeleteModalOpen(false);
      setMaterialToDelete(null);
      setSuccessMessage("Materi berhasil dihapus.");
      loadMaterials(selectedProgramId);
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal menghapus materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActiveQuick = async (item: ProgramMaterialItem) => {
    if (!selectedProgramId) return;
    try {
      await updateMaterial(item.id, { is_active: !item.is_active });
      loadMaterials(selectedProgramId);
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal mengubah status materi.");
    }
  };

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
              <h1 className="headline-1">Materi</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Unggah modul (storage terenkripsi) atau tambahkan tautan modul eksternal per program.
              </p>
            </div>

            <button
              type="button"
              disabled={!selectedProgramId}
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-1 hover:bg-primary-2 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            >
              <FiPlus className="w-5 h-5" />
              <span>Tambah Materi</span>
            </button>
          </div>

          {/* Program Selector Toolbar */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-auto flex items-center gap-3">
              <label htmlFor="program-selector" className="text-xs font-bold uppercase tracking-wider text-gray-700 shrink-0">
                Pilih Program:
              </label>
              <select
                id="program-selector"
                value={selectedProgramId || ""}
                onChange={(e) => setSelectedProgramId(parseInt(e.target.value, 10))}
                className="w-full sm:w-80 px-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm font-bold focus:bg-white outline-none cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  backgroundSize: "16px",
                }}
              >
                {!selectedProgramId && (
                  <option value="" disabled>
                    Pilih program mentor
                  </option>
                )}
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.is_active ? "" : "(Nonaktif)"}
                  </option>
                ))}
              </select>
            </div>

            {currentProgram && (
              <div className="text-sm text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap shrink-0">
                {materials.length} Modul &bull; {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentProgram.price)}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div role="alert" className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold">
              {errorMessage}
            </div>
          )}

          {/* Materials Table */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat materi program...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Urutan</th>
                      <th className="py-3.5 px-4">Judul Modul Materi</th>
                      <th className="py-3.5 px-4">Tipe Berkas</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-8 rounded-md" />
                        </td>
                        <td className="py-3.5 px-4 space-y-1.5">
                          <Skeleton className="h-4 w-52" />
                          <Skeleton className="h-3 w-72" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
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
            ) : materials.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                  <FiFileText className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Belum Ada Materi</h3>
                <p className="text-xs text-gray-500 font-medium">
                  Program ini belum memiliki modul belajar. Klik tombol di bawah untuk mengunggah materi pertama.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-1 hover:bg-primary-2 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Tambah Modul Belajar</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4 w-16 text-center">Urutan</th>
                      <th className="py-3.5 px-4">Judul Modul</th>
                      <th className="py-3.5 px-4">Tipe & Sumber</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono font-black text-gray-900">
                          #{item.order_index}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {item.type === "pdf" ? (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                PDF PRIVAT
                              </span>
                              {item.download_url || item.file_url || item.file_path ? (
                                <a
                                  href={resolveAssetUrl(item.download_url || item.file_url || item.file_path)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary-1 hover:underline text-xs font-bold inline-flex items-center gap-1"
                                >
                                  <FiDownload className="w-3 h-3" />
                                  <span>Unduh</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-gray-400 font-medium italic">Tersimpan</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                TAUTAN LINK
                              </span>
                              {item.external_url && (
                                <a
                                  href={ensureHttps(item.external_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-secondary-1 hover:underline text-xs font-bold inline-flex items-center gap-1 truncate max-w-[180px]"
                                >
                                  <FiExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{item.external_url}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActiveQuick(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${item.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                          >
                            {item.is_active ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                            <span>{item.is_active ? "Aktif" : "Draft"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Materi"
                              aria-label={`Edit ${item.title}`}
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMaterialToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Materi"
                              aria-label={`Hapus ${item.title}`}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Material Modal */}
      {isFormOpen && (
        <div
          ref={formModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingMaterial ? "Edit Modul Materi" : "Tambah Modul Materi"}
                </h3>
                <p className="text-xs font-semibold text-gray-500">{currentProgram?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg border border-black hover:bg-gray-100"
                aria-label="Tutup modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type Switcher (XOR: PDF vs Link) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Tipe Sumber Materi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("pdf")}
                    className={`py-2.5 px-3 rounded-xl border-2 border-black font-bold text-xs flex items-center justify-center gap-2 transition-all ${type === "pdf"
                        ? "bg-primary-1 text-white shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <FiUploadCloud className="w-4 h-4" />
                    <span>File PDF Privat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("link")}
                    className={`py-2.5 px-3 rounded-xl border-2 border-black font-bold text-xs flex items-center justify-center gap-2 transition-all ${type === "link"
                        ? "bg-primary-1 text-white shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <FiLink className="w-4 h-4" />
                    <span>Tautan Eksternal</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <FormField label="Judul Modul Materi" required error={formErrors.title}>
                <FormInput
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Modul 01: Arsitektur Cloud Native"
                  error={Boolean(formErrors.title)}
                />
              </FormField>

              {/* Order Index */}
              <FormField label="Urutan Penomoran Modul">
                <FormInput
                  type="number"
                  min={1}
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 1)}
                  placeholder="Contoh: 1"
                  className="w-32 font-mono font-bold"
                />
              </FormField>

              {/* Description */}
              <FormField label="Deskripsi / Petunjuk Baca" optional>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembahasan mendalam konsep cloud computing dan petunjuk praktikum..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm outline-none font-medium resize-none focus:border-black transition-colors placeholder:text-gray-400"
                />
              </FormField>

              {/* XOR Inputs */}
              {type === "pdf" ? (
                <FormField label="Unggah Berkas PDF (Maks. 50MB)" required error={formErrors.pdfFile}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPdfFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-gray-300 file:text-xs file:font-bold file:bg-gray-100 hover:file:bg-gray-200 file:cursor-pointer cursor-pointer border-2 border-gray-300 rounded-xl p-2 bg-gray-50"
                  />
                  {editingMaterial && !pdfFile && (
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      Berkas saat ini: <span className="font-bold text-black">{editingMaterial.file_path || "Tersimpan"}</span>. Kosongkan jika tidak ingin mengganti file.
                    </p>
                  )}
                </FormField>
              ) : (
                <FormField label="URL Tautan Eksternal" required error={formErrors.externalUrl}>
                  <FormInput
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="Contoh: https://drive.google.com/file/d/... atau https://youtube.com/..."
                    error={Boolean(formErrors.externalUrl)}
                    className="font-mono text-xs"
                  />
                </FormField>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="material-active-toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-black text-primary-1 focus:ring-primary-1 cursor-pointer"
                />
                <label htmlFor="material-active-toggle" className="text-sm font-bold text-gray-900 cursor-pointer">
                  Status Aktif (Dapat diakses oleh mentor yang telah terdaftar)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t-2 border-gray-100">
                <Button
                  variant="secondary"
                  onClick={() => setIsFormOpen(false)}
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
                  {editingMaterial ? "Simpan Perubahan" : "Tambahkan Materi"}
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
        title="Hapus Materi?"
        message={`Apakah Anda yakin ingin menghapus materi "${materialToDelete?.title}"? Berkas PDF privat terkait juga akan dihapus dari sistem.`}
        confirmText="Ya, Hapus"
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
