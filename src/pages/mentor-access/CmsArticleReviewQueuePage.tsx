import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "@widgets/Sidebar";
import {
  FiFileText,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiUser,
  FiTag,
  FiX,
  FiCheck,
} from "react-icons/fi";
import type { ContributorArticleItem } from "@features/mentor-access/types";
import {
  fetchContributorArticlesQueue,
  reviewContributorArticle,
} from "@features/mentor-access/api";
import { UserRoleBadge } from "@shared/ui/UserRoleBadge";
import ConfirmModal from "@shared/ui/ConfirmModal";
import SuccessModal from "@shared/ui/SuccessModal";
import RejectReasonModal from "./components/RejectReasonModal";
import Button from "@shared/ui/Button";
import Skeleton from "@shared/ui/Skeleton";
import { useModalA11y } from "@shared/hooks/useModalA11y";

export default function CmsArticleReviewQueuePage() {
  const [articles, setArticles] = useState<ContributorArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Preview Modal state
  const [previewArticle, setPreviewArticle] = useState<ContributorArticleItem | null>(null);

  // Publish Confirm Modal state
  const [publishTarget, setPublishTarget] = useState<ContributorArticleItem | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Reject Modal state
  const [rejectTarget, setRejectTarget] = useState<ContributorArticleItem | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Success Notification
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({
    isOpen: !!previewArticle,
    onClose: () => setPreviewArticle(null),
    containerRef: previewModalRef,
  });

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchContributorArticlesQueue();
      setArticles(data);
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message || "Gagal memuat antrean artikel kontributor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchContributorArticlesQueue(controller.signal)
      .then((data) => {
        setArticles(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setErrorMessage((err as Error).message || "Gagal memuat antrean artikel kontributor.");
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.author_name && a.author_name.toLowerCase().includes(q)) ||
        (a.author_email && a.author_email.toLowerCase().includes(q)) ||
        (a.category_name && a.category_name.toLowerCase().includes(q))
    );
  }, [articles, searchQuery]);

  // Handle Publish
  const handleConfirmPublish = async () => {
    if (!publishTarget) return;
    setIsPublishing(true);
    try {
      await reviewContributorArticle(publishTarget.id, {
        status: "PUBLISHED",
      });
      setPublishTarget(null);
      setSuccessMessage(`Artikel "${publishTarget.title}" berhasil dipublikasikan.`);
      loadQueue();
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal memublikasikan artikel.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Reject
  const handleConfirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    try {
      await reviewContributorArticle(rejectTarget.id, {
        status: "REJECTED",
        reject_reason: reason,
      });
      setRejectTarget(null);
      setSuccessMessage(`Artikel "${rejectTarget.title}" telah ditolak dengan catatan.`);
      loadQueue();
    } catch (err) {
      setErrorMessage((err as Error).message || "Gagal menolak draf artikel.");
    } finally {
      setIsRejecting(false);
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
              <h1 className="headline-1">Review Artikel Kontributor</h1>
              <p className="text-sm text-neutral-3 mt-1">
                Tinjau draf artikel yang diajukan oleh mentor kontributor sebelum diterbitkan ke publik.
              </p>
            </div>
          </div>

          {/* Controls: Search */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul artikel atau nama penulis..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm focus:bg-white outline-none transition-colors font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="text-xs text-gray-600 font-bold px-3 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg whitespace-nowrap shrink-0">
              {filteredArticles.length} Draf Menunggu Review
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-800 text-sm font-bold flex items-center justify-between"
            >
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={loadQueue}
                className="underline text-xs hover:text-red-950 font-bold"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Queue Table Container */}
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div role="status" aria-busy="true" className="overflow-x-auto">
                <span className="sr-only">Memuat antrean artikel...</span>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Artikel</th>
                      <th className="py-3.5 px-4">Penulis</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-3.5 px-4 space-y-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-28" />
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex gap-2 justify-center">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                  <FiFileText className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Antrean Bersih</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {searchQuery
                    ? "Tidak ada artikel yang sesuai dengan kueri pencarian."
                    : "Tidak ada draf artikel kontributor yang sedang menunggu peninjauan admin."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">Artikel</th>
                      <th className="py-3.5 px-4">Penulis & Role</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        {/* Title & Created At */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900 line-clamp-1">{article.title}</p>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                            <FiCalendar className="w-3 h-3 text-gray-400" />
                            <span>
                              Diajukan:{" "}
                              {article.created_at
                                ? new Date(article.created_at).toLocaleDateString("id-ID")
                                : "-"}
                            </span>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{article.author_name || "Mentor"}</p>
                          <p className="text-xs text-gray-500">{article.author_email}</p>
                          <div className="mt-1">
                            <UserRoleBadge roles={article.author_roles} />
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            <FiTag className="w-3 h-3" />
                            <span>{article.category_name || "Umum"}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <span>Menunggu Review</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => setPreviewArticle(article)}
                              className="p-2 text-primary-1 hover:bg-primary-1/10 rounded-lg transition-colors"
                              title="Pratinjau Artikel"
                              aria-label={`Pratinjau ${article.title}`}
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPublishTarget(article)}
                              className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                              title="Publikasikan Artikel"
                              aria-label={`Publikasikan ${article.title}`}
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectTarget(article)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Tolak Artikel"
                              aria-label={`Tolak ${article.title}`}
                            >
                              <FiXCircle className="w-4 h-4" />
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

      {/* Article Preview Modal */}
      {previewArticle && (
        <div
          ref={previewModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-black shadow-xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="text-xs font-black uppercase tracking-wider text-primary-1">
                Pratinjau Draf Kontributor
              </span>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="p-1 rounded-lg border border-black hover:bg-gray-100 transition-colors"
                aria-label="Tutup pratinjau"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Author bar */}
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-gray-500" />
                <span className="font-bold text-gray-900">
                  {previewArticle.author_name}
                </span>
                <span className="text-gray-500">({previewArticle.author_email})</span>
              </div>
              <UserRoleBadge roles={previewArticle.author_roles} />
            </div>

            {/* Heading image if present */}
            {previewArticle.image_heading && (
              <div className="rounded-xl overflow-hidden border-2 border-black max-h-60 bg-gray-100">
                <img
                  src={previewArticle.image_heading}
                  alt={previewArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Title */}
            <h2 className="text-2xl font-black text-gray-900 leading-snug">
              {previewArticle.title}
            </h2>

            {/* Content Body */}
            <div className="prose prose-sm max-w-none border-t border-gray-200 pt-3 text-gray-800 leading-relaxed font-sans whitespace-pre-line">
              {previewArticle.content}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setPreviewArticle(null)}
                className="text-xs font-bold"
              >
                Tutup Pratinjau
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const target = previewArticle;
                  setPreviewArticle(null);
                  setRejectTarget(target);
                }}
                className="text-xs font-bold"
              >
                <FiX className="w-3.5 h-3.5 mr-1" />
                Tolak Draf
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const target = previewArticle;
                  setPreviewArticle(null);
                  setPublishTarget(target);
                }}
                className="text-xs font-bold"
              >
                <FiCheck className="w-3.5 h-3.5 mr-1" />
                Setujui & Publikasikan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirm Modal */}
      <ConfirmModal
        isOpen={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        onConfirm={handleConfirmPublish}
        title="Publikasikan Artikel Kontributor"
        message={`Apakah Anda yakin ingin menyetujui dan memublikasikan artikel "${publishTarget?.title}" karya ${publishTarget?.author_name}? Artikel ini akan langsung tayang pada halaman artikel SkyShare.`}
        confirmText={isPublishing ? "Memublikasikan..." : "Ya, Publikasikan Sekarang"}
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
        title="Tolak Draf Artikel"
        description={`Masukkan alasan penolakan draf artikel "${rejectTarget?.title}". Alasan ini akan dapat dibaca oleh penulis untuk proses revisi.`}
        placeholder="Contoh: Format penulisan perlu disesuaikan dengan panduan gaya, atau materi perlu referensi tambahan..."
        isLoading={isRejecting}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Berhasil"
        message={successMessage || ""}
      />
    </div>
  );
}
