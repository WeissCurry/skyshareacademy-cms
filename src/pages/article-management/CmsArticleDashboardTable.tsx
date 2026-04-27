import { useEffect, useState } from "react";
import skyshareApi from "@shared/api/skyshareApi";
import { Link } from "react-router-dom";
import EditIcon from "@shared/assets/images/mascot-icons/Edit.png";
import EditSquare from "@shared/assets/images/mascot-icons/Edit Square.png";
import Delete from "@shared/assets/images/mascot-icons/Delete.png";
import Add from "@shared/assets/images/mascot-icons/Plus.png";
import Sidebar from "@widgets/Sidebar";
import LoadingModal from "@shared/ui/LoadingModal";
import ConfirmModal from "@shared/ui/ConfirmModal";

interface Article {
  id: string | number;
  title: string;
  createdAt: string;
  category_name: string;
  category_color: string;
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

function CmsArticleDashboardTable() {
  const [dataArticles, setDataarticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | number | null>(null);

  const getDataArticles = async function (page: number) {
    setIsDeleting(true);
    try {
      const response = await skyshareApi.get(`/article?page=${page}&limit=10`);
      setDataarticles(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getDataArticles(currentPage);
    };
    fetchData();
  }, [currentPage]);

  const handleDeleteClick = (id: string | number) => {
    setSelectedArticleId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticleId) return;
    setIsDeleting(true);
    try {
      await skyshareApi.delete(`/article/delete/${selectedArticleId}`);
      setIsConfirmOpen(false);
      getDataArticles(currentPage);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col pt-12 items-center self-stretch">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        <div><Sidebar /></div>
        <div className="w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="headline-1">Articles Management</h1>
              <p className="paragraph mt-2">Kelola konten Article Anda di sini.</p>
            </div>
          </div>

          <div className="bg-neutral-white mt-10 border-2 border-black rounded-2xl p-5 w-full">
            <div className="bg-background flex justify-between items-center rounded-xl py-3 px-4 mb-4">
              <div className="flex items-center gap-4">
                <img className="w-6" src={EditIcon} alt="" />
                <h4 className="headline-4">Daftar Article</h4>
              </div>
              <div className="flex items-center">
                <Link to="/cms/article/add" className="bg-primary-1 hover:bg-primary-2 flex items-center rounded-md h-12 w-12 justify-center">
                  <img className="w-7 h-7" src={Add} alt="" />
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pr-4 py-4 text-left font-bold text-sm">No.</th>
                    <th className="pr-4 py-4 text-left font-bold text-sm">Tanggal</th>
                    <th className="pr-20 py-4 text-left font-bold text-sm">Title</th>
                    <th className="pr-4 py-4 text-center font-bold text-sm">Category</th>
                    <th className="pl-4 py-4 text-center font-bold text-sm">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataArticles.length > 0 ? (
                    dataArticles.map((article, index) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        <td className="pr-4 py-6 text-sm font-bold text-black">{(currentPage - 1) * 10 + index + 1}</td>
                        <td className="pr-4 py-6 text-sm text-black">{new Date(article.createdAt).toLocaleDateString()}</td>
                        <td className="pr-20 py-6 text-sm text-black max-w-[250px] truncate" title={article.title}>{article.title}</td>
                        <td className="pr-4 py-6">
                          <div className="flex justify-center">
                            <span className="px-4 py-1.5 rounded-full text-white text-[11px] font-bold whitespace-nowrap tracking-wide" style={{ backgroundColor: article.category_color || '#000' }}>
                              {article.category_name}
                            </span>
                          </div>
                        </td>
                        <td className="pl-4 py-6">
                          <div className="flex justify-center gap-3">
                            <Link 
                              to={`/cms/article/edit/${article.id}`} 
                              className="bg-primary-1 hover:bg-primary-2 h-10 w-10 rounded-xl flex justify-center items-center transition-all shadow-sm active:scale-90"
                              title="Edit"
                            >
                              <img className="w-5 h-5" src={EditSquare} alt="Edit" />
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(article.id)} 
                              className="bg-red-500 hover:bg-red-600 h-10 w-10 rounded-xl flex justify-center items-center transition-all shadow-sm active:scale-90"
                              title="Delete"
                            >
                              <img className="w-5 h-5" src={Delete} alt="Delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No articles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 mt-4 bg-gray-50 border-2 border-black rounded-xl flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-bold">{(currentPage - 1) * pagination.limit + 1}</span> to <span className="font-bold">{Math.min(currentPage * pagination.limit, pagination.totalItems)}</span> of <span className="font-bold">{pagination.totalItems}</span> results
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
                  >
                    Prev
                  </button>
                  <div className="flex items-center px-4 font-bold">
                    {currentPage} / {pagination.totalPages}
                  </div>
                  <button 
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete Article?" 
        message="This action cannot be undone. The article will be permanently removed."
        type="danger"
        confirmText="Delete"
      />
      <LoadingModal isLoading={isDeleting} message="Processing..." />
    </div>
  );
}

export default CmsArticleDashboardTable;
