import { useState, useEffect, useCallback, type ChangeEvent, type DragEvent } from "react";
import skyshareApi from "@shared/api/skyshareApi";

export interface ImagesCloudinary {
  asset_id: string;
  secure_url: string;
  public_id: string;
}

export function useMediaPage() {
  const [images, setImages] = useState<ImagesCloudinary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletePublicId, setDeletePublicId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  // Selection & Pagination
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);

  const fetchImages = useCallback(async (cursor: string | null = null) => {
    try {
      setLoading(true);
      const url = cursor ? `/media?next_cursor=${cursor}&limit=50` : "/media?limit=50";
      const response = await skyshareApi.get(url);
      setImages(response.data.data);
      setNextCursor(response.data.next_cursor || null);
    } catch (error) {
      console.error("Gagal mengambil gambar", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchImages();
    };
    init();
  }, [fetchImages]);

  const handleNextPage = () => {
    if (nextCursor) {
      const newHistory = [...cursorHistory, nextCursor];
      setCursorHistory(newHistory);
      setCurrentPage(prev => prev + 1);
      fetchImages(nextCursor);
      setSelectedIds([]); // Clear selection on page change
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevCursor = cursorHistory[currentPage - 2];
      const newHistory = cursorHistory.slice(0, -1);
      setCursorHistory(newHistory);
      setCurrentPage(prev => prev - 1);
      fetchImages(prevCursor);
      setSelectedIds([]);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    setIsUploading(true);
    try {
      // Handle multiple files
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        
        const formData = new FormData();
        formData.append("file", file);
        await skyshareApi.post("/media", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      fetchImages(); // Refresh to first page
      setCurrentPage(1);
      setCursorHistory([null]);
    } catch (error) {
      console.error("Gagal upload gambar", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    uploadFiles(e.target.files);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async () => {
    try {
      setIsUploading(true);
      await skyshareApi.delete(`/media/${deletePublicId}`);
      setIsDeleteModalOpen(false);
      fetchImages(cursorHistory[currentPage - 1]);
    } catch (error) {
      console.error("Gagal menghapus gambar", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsUploading(true);
      await skyshareApi.post("/media/delete-bulk", { public_ids: selectedIds });
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      setIsSelectMode(false);
      fetchImages(cursorHistory[currentPage - 1]);
    } catch (error) {
      console.error("Gagal menghapus gambar secara massal", error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSelectImage = (publicId: string) => {
    setSelectedIds(prev => 
      prev.includes(publicId) 
        ? prev.filter(id => id !== publicId) 
        : [...prev, publicId]
    );
  };

  const selectAllOnPage = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map(img => img.public_id));
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        alert("URL Gambar berhasil disalin!");
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert("URL Gambar berhasil disalin!");
      } catch (copyErr) {
        console.error("Fallback copy failed: ", copyErr);
        alert("Gagal menyalin URL.");
      }
      document.body.removeChild(textArea);
    }
  };

  return {
    state: {
      images,
      loading,
      isUploading,
      isSuccessModalOpen,
      isDeleteModalOpen,
      isBulkDeleteModalOpen,
      deletePublicId,
      isDragging,
      isSelectMode,
      selectedIds,
      nextCursor,
      currentPage,
    },
    actions: {
      setImages,
      setLoading,
      setIsUploading,
      setIsSuccessModalOpen,
      setIsDeleteModalOpen,
      setIsBulkDeleteModalOpen,
      setDeletePublicId,
      setIsDragging,
      setIsSelectMode,
      setSelectedIds,
      fetchImages,
      handleNextPage,
      handlePrevPage,
      handleUpload,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDelete,
      handleBulkDelete,
      toggleSelectImage,
      selectAllOnPage,
      copyToClipboard,
    }
  };
}
