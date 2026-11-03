import { useEffect, useState, useCallback, useRef } from "react";
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiRefreshCw,
  FiExternalLink,
  FiInstagram,
  FiFacebook,
  FiCreditCard,
  FiUser,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import type { ReviewQueueItem, MentorKycDetail } from "@features/mentor-access/types";
import {
  fetchKycDetail,
  reviewUnifiedAction,
  reviewKycAction,
  reviewOrderAction,
  ApiConflictError,
} from "@features/mentor-access/api";
import { resolveAssetUrl } from "@shared/utils/urlUtils";
import { useModalA11y } from "@shared/hooks/useModalA11y";
import ConfirmModal from "@shared/ui/ConfirmModal";
import RejectReasonModal from "./RejectReasonModal";
import Skeleton from "@shared/ui/Skeleton";
import { UserRoleBadge } from "@shared/ui/UserRoleBadge";

interface KycOrderDetailModalProps {
  queueItem: ReviewQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: (message: string) => void;
  onConflictRefresh: () => void;
}

export default function KycOrderDetailModal({
  queueItem,
  isOpen,
  onClose,
  onActionComplete,
  onConflictRefresh,
}: KycOrderDetailModalProps) {
  const [kycDetail, setKycDetail] = useState<MentorKycDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [isConfirmUnifiedOpen, setIsConfirmUnifiedOpen] = useState(false);
  const [isConfirmKycApproveOpen, setIsConfirmKycApproveOpen] = useState(false);
  const [isConfirmOrderApproveOpen, setIsConfirmOrderApproveOpen] = useState(false);

  const [isRejectKycOpen, setIsRejectKycOpen] = useState(false);
  const [isRejectOrderOpen, setIsRejectOrderOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    containerRef: modalRef,
  });

  const loadKycDetail = useCallback(async (kycId: number) => {
    setIsLoadingDetail(true);
    setDetailError("");
    setConflictMessage(null);
    setActionError(null);
    try {
      const data = await fetchKycDetail(kycId);
      setKycDetail(data);
    } catch (err) {
      console.error(err);
      setDetailError("Gagal memuat detail KYC lengkap. Silakan coba lagi.");
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !queueItem?.kyc?.id) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoadingDetail(true);
      setDetailError("");
      setConflictMessage(null);
      setActionError(null);
    }, 0);

    fetchKycDetail(queueItem.kyc.id, controller.signal)
      .then((data) => {
        clearTimeout(timer);
        setKycDetail(data);
        setIsLoadingDetail(false);
      })
      .catch((err) => {
        clearTimeout(timer);
        if (controller.signal.aborted) return;
        console.error(err);
        setDetailError("Gagal memuat detail KYC lengkap. Silakan coba lagi.");
        setIsLoadingDetail(false);
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, queueItem]);

  if (!isOpen || !queueItem) return null;

  const { kyc, order } = queueItem;
  const activeKycDetail = kycDetail?.id === kyc?.id ? kycDetail : null;
  const studentName =
    activeKycDetail?.student_name || kyc?.student_name || order?.student_name || `Mentor #${queueItem.student_id || ""}`;
  const hasBoth = Boolean(kyc?.id && order?.id);

  // Formatting helpers
  const formatRupiah = (val?: number | null) => {
    if (val === undefined || val === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleConflict = (err: unknown) => {
    if (
      err instanceof ApiConflictError ||
      (err instanceof Error && err.message.toLowerCase().includes("telah berubah"))
    ) {
      setConflictMessage(
        "Status entitas telah berubah atau telah diproses oleh admin lain. Data sedang diperbarui..."
      );
      setTimeout(() => {
        onConflictRefresh();
      }, 1500);
    } else {
      setActionError((err as Error).message || "Terjadi galat pada server saat memproses aksi.");
    }
  };

  // Actions
  const handleApproveUnified = async () => {
    if (!kyc?.id || !order?.id) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await reviewUnifiedAction(kyc.id, order.id, "APPROVED", "ACTIVE");
      setIsConfirmUnifiedOpen(false);
      onActionComplete("KYC dan Pesanan berhasil disetujui bersamaan!");
    } catch (err) {
      setIsConfirmUnifiedOpen(false);
      handleConflict(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveKycOnly = async () => {
    if (!kyc?.id) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await reviewKycAction(kyc.id, "APPROVED");
      setIsConfirmKycApproveOpen(false);
      onActionComplete("KYC Mentor berhasil disetujui!");
    } catch (err) {
      setIsConfirmKycApproveOpen(false);
      handleConflict(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectKyc = async (reason: string) => {
    if (!kyc?.id) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await reviewKycAction(kyc.id, "REJECTED", reason);
      setIsRejectKycOpen(false);
      onActionComplete("KYC Mentor telah ditolak dengan catatan.");
    } catch (err) {
      setIsRejectKycOpen(false);
      handleConflict(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveOrderOnly = async () => {
    if (!order?.id) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await reviewOrderAction(order.id, "ACTIVE");
      setIsConfirmOrderApproveOpen(false);
      onActionComplete("Pembayaran pesanan berhasil divalidasi & diaktifkan!");
    } catch (err) {
      setIsConfirmOrderApproveOpen(false);
      handleConflict(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOrder = async (reason: string) => {
    if (!order?.id) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await reviewOrderAction(order.id, "PAYMENT_REJECTED", reason);
      setIsRejectOrderOpen(false);
      onActionComplete("Pembayaran pesanan telah ditolak dengan catatan.");
    } catch (err) {
      setIsRejectOrderOpen(false);
      handleConflict(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolved Asset URLs
  const rawKtpUrl = activeKycDetail?.ktp_url || kyc?.ktp_url;
  const ktpImageUrl = rawKtpUrl ? resolveAssetUrl(rawKtpUrl) : null;

  const rawProofUrl = order?.payment_proof_url || order?.proof_url;
  const proofImageUrl = rawProofUrl ? resolveAssetUrl(rawProofUrl) : null;

  return (
    <>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-detail-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto"
      >
        <div className="bg-white rounded-2xl border-2 border-black shadow-2xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 md:p-5 border-b-2 border-black bg-gray-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-1 border-2 border-black flex items-center justify-center font-black text-white text-lg">
                ✓
              </div>
              <div>
                <h2 id="review-detail-title" className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                  Verifikasi Terpadu: {studentName}
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  {order ? (
                    <>
                      Order Code: <span className="font-bold text-black">{order.order_code}</span> &bull; Program:{" "}
                      <span className="font-bold text-black">{order.program_title}</span>
                    </>
                  ) : (
                    <span>Hanya Pengajuan KYC (Belum ada pesanan terdaftar)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {kyc?.id && (
                <button
                  type="button"
                  onClick={() => loadKycDetail(kyc.id)}
                  disabled={isLoadingDetail}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                  title="Refresh Signed URLs & Data"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingDetail ? "animate-spin" : ""}`} />
                  <span>Refetch URL</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl border-2 border-black bg-white hover:bg-rose-50 hover:text-rose-600 transition-colors"
                aria-label="Tutup"
              >
                <FiX className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          {/* 409 Conflict Banner */}
          {conflictMessage && (
            <div
              role="alert"
              className="bg-amber-100 border-b-2 border-amber-500 p-3 text-amber-900 text-sm font-bold flex items-center gap-2 shrink-0 animate-pulse"
            >
              <FiAlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>{conflictMessage}</span>
            </div>
          )}

          {/* Action Error Banner */}
          {actionError && (
            <div
              role="alert"
              className="bg-red-100 border-b-2 border-red-500 p-3 text-red-900 text-sm font-bold flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-red-800 hover:text-red-950 font-black text-xs uppercase px-2 py-1 bg-red-200 rounded"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Top Unified Action Bar (Only when both KYC & Order exist) */}
            {hasBoth && (
              <div className="p-4 rounded-xl border-2 border-black bg-background flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary-1 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <FiCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Aksi Cepat: Verifikasi Bersamaan</h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Setujui identitas KYC mentor dan aktifkan pesanan program dalam 1 langkah.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfirmUnifiedOpen(true)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary-1 hover:bg-primary-2 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow inline-flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Approve Keduanya</span>
                </button>
              </div>
            )}

            {/* Split Screen Grid: Left KYC vs Right Order & Payment Proof */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN: KYC Details & KTP */}
              <div className="border-2 border-black rounded-xl p-4 md:p-5 bg-white shadow-sm flex flex-col justify-between">
                {kyc ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b-2 border-gray-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-primary-1" />
                          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                            Identitas Legal (KYC)
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserRoleBadge roles={kycDetail?.student_roles || queueItem?.student_roles} />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            {kyc.status}
                          </span>
                        </div>
                      </div>

                      {isLoadingDetail ? (
                        <div role="status" aria-busy="true" className="space-y-3">
                          <span className="sr-only">Memuat data identitas unmasked...</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1.5">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1.5">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2 space-y-1.5">
                              <Skeleton className="h-3 w-28" />
                              <Skeleton className="h-4 w-48 font-mono" />
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2 space-y-1.5">
                              <Skeleton className="h-3 w-36" />
                              <Skeleton className="h-4 w-60" />
                            </div>
                          </div>
                        </div>
                      ) : detailError ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-semibold">
                          {detailError}
                        </div>
                      ) : (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                            <dt className="text-gray-500 font-medium">Nama Lengkap</dt>
                            <dd className="font-bold text-gray-900 mt-0.5">{activeKycDetail?.student_name || kyc.student_name}</dd>
                          </div>

                          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                            <dt className="text-gray-500 font-medium">Email Akun</dt>
                            <dd className="font-bold text-gray-900 mt-0.5 truncate">{activeKycDetail?.student_email || kyc.student_email}</dd>
                          </div>

                          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2">
                            <dt className="text-gray-500 font-medium">NIK (16 Digit Lengkap)</dt>
                            <dd className="font-mono text-sm font-bold text-gray-900 mt-0.5 tracking-wider">
                              {activeKycDetail?.nik || kyc.nik}
                            </dd>
                          </div>

                          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2">
                            <dt className="text-gray-500 font-medium">Informasi Rekening Bank</dt>
                            <dd className="font-bold text-gray-900 mt-0.5 flex flex-wrap items-center gap-1">
                              <FiCreditCard className="w-3.5 h-3.5 text-gray-500" />
                              <span>{activeKycDetail?.bank_name || kyc.bank_name}</span> &bull;{" "}
                              <span className="font-mono">{activeKycDetail?.bank_account_number || kyc.bank_account_number}</span> &bull;{" "}
                              <span className="text-gray-700">a.n {activeKycDetail?.bank_account_holder || kyc.bank_account_holder}</span>
                            </dd>
                          </div>

                          {/* Social handles */}
                          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2 flex flex-wrap gap-4">
                            <div className="flex items-center gap-1.5">
                              <FiInstagram className="w-3.5 h-3.5 text-pink-600" />
                              <span className="font-semibold text-gray-800">
                                {activeKycDetail?.instagram_handle || "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FiFacebook className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-semibold text-gray-800">
                                {activeKycDetail?.facebook_handle || "-"}
                              </span>
                            </div>
                          </div>
                        </dl>
                      )}

                      {/* KTP Image Preview via Signed URL */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700">Foto KTP (Signed URL TTL 5 Menit)</span>
                          {ktpImageUrl && (
                            <a
                              href={ktpImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-1 hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <span>Buka Asli</span>
                              <FiExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="w-full h-52 bg-gray-100 rounded-xl border-2 border-black overflow-hidden relative group flex items-center justify-center">
                          {isLoadingDetail ? (
                            <Skeleton className="w-full h-full rounded-none" />
                          ) : ktpImageUrl ? (
                            <img
                              src={ktpImageUrl}
                              alt="Foto KTP Mentor"
                              className="w-full h-full object-contain bg-neutral-900/5 group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs font-medium">Foto KTP belum tersedia</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* KYC Individual Action Buttons */}
                    <div className="pt-4 border-t-2 border-gray-100 mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRejectKycOpen(true)}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 px-3 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm hover:shadow"
                      >
                        Tolak KYC Saja
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmKycApproveOpen(true)}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 px-3 text-xs font-bold bg-primary-1 hover:bg-primary-2 text-white rounded-xl transition-all shadow-sm hover:shadow"
                      >
                        Approve KYC Saja
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center space-y-2">
                    <FiAlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="font-bold text-gray-800 text-sm">Data KYC Belum Diunggah</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Mentor ini belum mengajukan identitas legal KYC.
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Order & Struk Bukti Transfer */}
              <div className="border-2 border-black rounded-xl p-4 md:p-5 bg-white shadow-sm flex flex-col justify-between">
                {order ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b-2 border-gray-100">
                        <div className="flex items-center gap-2">
                          <FiLayers className="w-4 h-4 text-primary-1" />
                          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                            Pesanan & Struk Transfer
                          </h3>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          {order.status}
                        </span>
                      </div>

                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                          <dt className="text-gray-500 font-medium">Program Dipilih</dt>
                          <dd className="font-bold text-gray-900 mt-0.5">{order.program_title}</dd>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                          <dt className="text-gray-500 font-medium">Kode Pesanan</dt>
                          <dd className="font-mono font-bold text-gray-900 mt-0.5">{order.order_code}</dd>
                        </div>

                        {/* Total Amount with Unique Code Highlighted */}
                        <div className="bg-amber-50/80 p-3 rounded-lg border-2 border-amber-300 sm:col-span-2">
                          <dt className="text-gray-600 font-semibold flex items-center justify-between">
                            <span>Nominal Total Transfer</span>
                            <span className="text-[11px] bg-primary-1 text-white px-2 py-0.5 rounded font-black tracking-wide">
                              KODE UNIK: {order.unique_code}
                            </span>
                          </dt>
                          <dd className="mt-1 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-black text-gray-900 tracking-tight">
                              {formatRupiah(order.total_amount)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              (Rp {order.base_amount.toLocaleString("id-ID")} + {order.unique_code})
                            </span>
                          </dd>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                          <dt className="text-gray-500 font-medium flex items-center gap-1">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <span>Batas Kedaluwarsa</span>
                          </dt>
                          <dd className="font-semibold text-gray-800 mt-0.5">{formatDate(order.expires_at)}</dd>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                          <dt className="text-gray-500 font-medium flex items-center gap-1">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <span>Diunggah Pada</span>
                          </dt>
                          <dd className="font-semibold text-gray-800 mt-0.5">{formatDate(order.proof_uploaded_at)}</dd>
                        </div>
                      </dl>

                      {/* Payment Proof Preview via Signed URL */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700">Bukti Transfer Struk (Signed URL TTL 5 Menit)</span>
                          {proofImageUrl && (
                            <a
                              href={proofImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-1 hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <span>Buka Asli</span>
                              <FiExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="w-full h-52 bg-gray-100 rounded-xl border-2 border-black overflow-hidden relative group flex items-center justify-center">
                          {proofImageUrl ? (
                            <img
                              src={proofImageUrl}
                              alt="Struk Bukti Pembayaran"
                              className="w-full h-full object-contain bg-neutral-900/5 group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <p className="text-amber-700 text-xs font-bold">Struk bukti pembayaran belum tersedia</p>
                              <p className="text-gray-400 text-[11px] mt-0.5">Mentor belum mengunggah file bukti transfer</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Individual Action Buttons */}
                    <div className="pt-4 border-t-2 border-gray-100 mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRejectOrderOpen(true)}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 px-3 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm hover:shadow"
                      >
                        Tolak Bayar Saja
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmOrderApproveOpen(true)}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 px-3 text-xs font-bold bg-primary-1 hover:bg-primary-2 text-white rounded-xl transition-all shadow-sm hover:shadow"
                      >
                        Approve Bayar Saja
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center space-y-2">
                    <FiAlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="font-bold text-gray-800 text-sm">Belum Ada Pesanan Aktif</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Mentor ini belum memilih program atau belum melakukan pemesanan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {hasBoth && kyc && order && (
        <ConfirmModal
          isOpen={isConfirmUnifiedOpen}
          onClose={() => setIsConfirmUnifiedOpen(false)}
          onConfirm={handleApproveUnified}
          title="Approve Keduanya?"
          message={`Apakah Anda yakin memvalidasi identitas legal mentor ${studentName} dan mengaktifkan pesanan program ${order.program_title}?`}
          confirmText="Ya, Setujui Keduanya"
        />
      )}

      {kyc && (
        <>
          <ConfirmModal
            isOpen={isConfirmKycApproveOpen}
            onClose={() => setIsConfirmKycApproveOpen(false)}
            onConfirm={handleApproveKycOnly}
            title="Approve KYC Mentor?"
            message={`Apakah KTP dan data legal milik ${studentName} telah terverifikasi valid?`}
            confirmText="Ya, Setujui KYC"
          />

          <RejectReasonModal
            isOpen={isRejectKycOpen}
            onClose={() => setIsRejectKycOpen(false)}
            onConfirm={handleRejectKyc}
            title="Tolak Verifikasi KYC"
            description={`Kirimkan alasan penolakan kepada ${studentName} agar dapat memperbaiki berkas KTP.`}
            placeholder="Contoh: Foto KTP buram, NIK tidak terbaca jelas, silakan foto ulang dengan pencahayaan cukup."
            isLoading={isSubmitting}
          />
        </>
      )}

      {order && (
        <>
          <ConfirmModal
            isOpen={isConfirmOrderApproveOpen}
            onClose={() => setIsConfirmOrderApproveOpen(false)}
            onConfirm={handleApproveOrderOnly}
            title="Approve Pembayaran?"
            message={`Pastikan mutasi rekening sebesar ${formatRupiah(order.total_amount)} (Kode unik: ${order.unique_code}) telah masuk ke rekening SkyShare.`}
            confirmText="Ya, Dana Masuk"
          />

          <RejectReasonModal
            isOpen={isRejectOrderOpen}
            onClose={() => setIsRejectOrderOpen(false)}
            onConfirm={handleRejectOrder}
            title="Tolak Struk Pembayaran"
            description={`Tolak struk bukti transfer pesanan ${order.order_code}. Mentor dapat mengunggah bukti baru.`}
            placeholder="Contoh: Nominal transfer tidak sesuai dengan kode unik, atau struk terpotong."
            isLoading={isSubmitting}
          />
        </>
      )}
    </>
  );
}
