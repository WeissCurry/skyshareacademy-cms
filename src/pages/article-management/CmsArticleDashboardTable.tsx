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
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

function CmsArticleDashboardTable() {
  const [dataArticles, setDataarticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | number | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredArticleId, setHoveredArticleId] = useState<string | number | null>(null);

  const getDataArticles = async function (page: number, search = "", categoryId = "") {
    setIsDeleting(true);
    try {
      const response = await skyshareApi.get(
        `/article?page=${page}&limit=10&search=${encodeURIComponent(search)}&category_id=${categoryId}`
      );
      setDataarticles(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.log(error);
      setDataarticles([]);
      setPagination(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await skyshareApi.get("/category");
        setCategories(response.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch articles when query, category, or page changes (with debouncing for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      getDataArticles(currentPage, searchQuery, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, selectedCategory]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

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
      getDataArticles(currentPage, searchQuery, selectedCategory);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col pt-12 items-center self-stretch">
      <div className="content-1 flex gap-4 w-full max-w-[1100px]">
        <div className="self-start"><Sidebar /></div>
        <div className="w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="headline-1">Articles Management</h1>
              <p className="paragraph mt-2">Kelola konten Article Anda di sini.</p>
            </div>
          </div>

          <div className="bg-neutral-white mt-10 border-2 border-black rounded-2xl p-5 w-full">
            <div className="bg-background flex justify-between items-center rounded-xl py-3 px-4 mb-6">
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

            {/* Search and Category Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search Bar */}
              <div className="md:col-span-2 relative">
                <input
                  type="text"
                  placeholder="🔍 Cari berdasarkan judul artikel..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 border-2 border-black rounded-xl outline-none focus:bg-gray-50 transition-colors font-bold text-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-black rounded-xl outline-none focus:bg-gray-50 transition-colors font-bold text-sm cursor-pointer appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    backgroundSize: "16px"
                  }}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                        <td className="pr-4 py-6 text-sm text-black">{new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td 
                          className="pr-20 py-6 text-sm text-black relative cursor-help"
                          onMouseEnter={() => setHoveredArticleId(article.id)}
                          onMouseLeave={() => setHoveredArticleId(null)}
                        >
                          <div className="max-w-[250px] truncate">
                            <span className="hover:underline decoration-2 decoration-orange-400">{article.title}</span>
                          </div>
                          
                          {/* Premium Custom Neobrutalist Tooltip with Dynamic Positioning */}
                          {hoveredArticleId === article.id && (
                            <div className={`absolute left-0 bg-white border-2 border-black rounded-lg p-3 z-50 min-w-[280px] max-w-[380px] whitespace-normal pointer-events-none transition-all duration-150 shadow-[4px_4px_0_#000] ${
                              index < 5 ? "top-full mt-1" : "bottom-full mb-2"
                            }`}>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Full Article Title</p>
                              <p className="text-xs font-bold text-black leading-relaxed">{article.title}</p>
                            </div>
                          )}
                        </td>
                        <td className="pr-4 py-6">
                          <div className="flex justify-center">
                            <span className="px-4 py-1.5 rounded-full text-white text-[11px] font-bold whitespace-nowrap tracking-wide border border-black shadow-[1.5px_1.5px_0_#000]" style={{ backgroundColor: article.category_color || '#000' }}>
                              {article.category_name}
                            </span>
                          </div>
                        </td>
                        <td className="pl-4 py-6">
                          <div className="flex justify-center gap-3">
                            <Link 
                              to={`/cms/article/edit/${article.id}`} 
                              className="bg-primary-1 hover:bg-primary-2 h-10 w-10 rounded-xl flex justify-center items-center border border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000] transition-all"
                              title="Edit"
                            >
                              <img className="w-5 h-5" src={EditSquare} alt="Edit" />
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(article.id)} 
                              className="bg-red-500 hover:bg-red-600 h-10 w-10 rounded-xl flex justify-center items-center border border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000] transition-all"
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
                      <td colSpan={5} className="text-center py-12 text-gray-500 font-bold">
                        😔 Tidak ada artikel yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 mt-6 bg-gray-50 border-2 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0_#000]">
                <p className="text-sm text-gray-500 font-bold">
                  Showing <span className="font-extrabold">{(currentPage - 1) * pagination.limit + 1}</span> to <span className="font-extrabold">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of <span className="font-extrabold">{pagination.total}</span> results
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all shadow-[1.5px_1.5px_0_#000]"
                  >
                    Prev
                  </button>
                  <div className="flex items-center px-4 font-bold">
                    {currentPage} / {pagination.totalPages}
                  </div>
                  <button 
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all shadow-[1.5px_1.5px_0_#000]"
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
