import { useEffect, useState } from "react";
import skyshareApi from "@utilities/skyshareApi";
import { Link } from "react-router-dom";
import Edit1 from "@images/mascot-icons/Edit Square.png";
import Delete from "@images/mascot-icons/Delete.png";
import Add from "@images/mascot-icons/Plus.png";
import CmsNavCard from "@components/cms/CmsNavCard";
import LoadingModal from "@components/cms/LoadingModal";
import ConfirmModal from "@components/cms/ConfirmModal";

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
      setPagination(response.data.meta);
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
      <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4">
        <div><CmsNavCard /></div>
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="headline-1">Articles Management</h1>
            <Link to="/cms/article/add" className="bg-primary-1 hover:bg-primary-2 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-1/20 transition-all active:scale-95">
              <img className="w-5" src={Add} alt="" /> Add New Article
            </Link>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-black">
                  <th className="px-6 py-4 text-left font-bold text-sm tracking-wider">No.</th>
                  <th className="px-6 py-4 text-left font-bold text-sm tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left font-bold text-sm tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left font-bold text-sm tracking-wider">Date</th>
                  <th className="px-6 py-4 text-center font-bold text-sm tracking-wider">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataArticles.length > 0 ? (
                  dataArticles.map((article, index) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 max-w-[250px] truncate" title={article.title}>{article.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: article.category_color || '#000' }}>
                          {article.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <Link 
                            to={`/cms/article/edit/${article.id}`} 
                            className="bg-primary-1 hover:bg-primary-2 h-10 w-10 rounded-xl flex justify-center items-center transition-all shadow-sm active:scale-90"
                            title="Edit"
                          >
                            <img className="w-5 h-5" src={Edit1} alt="Edit" />
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
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">No articles found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t-2 border-black flex items-center justify-between">
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
