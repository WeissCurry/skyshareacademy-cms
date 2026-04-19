import { useEffect, useState } from "react";
import skyshareApi from "@utilities/skyshareApi";
import { Link } from "react-router-dom";
import Mascot from "@images/mascot-icons/pose=2.webp";
import Edit1 from "@images/mascot-icons/Edit Square.png";
import Delete from "@images/mascot-icons/Delete.png";
import Add from "@images/mascot-icons/Plus.png";
import CmsNavCard from "@components/cms/CmsNavCard";
import Edit from "@images/mascot-icons/Edit.png";

interface Article {
  id: string | number;
  title: string;
  createdAt: string;
  category_name: string;
  category_color: string;
}

function CmsArticleDashboardTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataArticles, setDataarticles] = useState<Article[]>([]);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const getDataArticles = async function () {
      setIsDeleting(true);
      try {
        const responseFromServer = await skyshareApi.get("/article");
        setDataarticles(responseFromServer.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsDeleting(false);
      }
    };
    getDataArticles();
  }, []);

  function closeModal() {
    setIsModalOpen(false);
  }

  function deletArticle(article: Article) {
    setDeleteArticle(article);
    setIsModalOpen(true);
  }

  async function confirmDelete() {
    closeModal();
    if (!deleteArticle) return;
    setIsDeleting(true);
    try {
      await skyshareApi.delete(`/article/${deleteArticle.id}`);
      setDataarticles(
        dataArticles.filter((article) => article.id !== deleteArticle.id)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="bg-background flex flex-col pt-12 items-center self-stretch">
        <div className="content-1 flex gap-4 ">
          <div className="">
            <CmsNavCard />
          </div>
          <div className=" w-full">
            <div className=" ">
              <h1 className="headline-1">Article</h1>
              <p className="paragraph">
                Kelola artikel untuk website Skyshare Academy disini.
              </p>
            </div>
             <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
              <div className="bg-background flex justify-between rounded-xl mt-5 py-3 px-3">
                <div className="flex items-center gap-5">
                  <img className="w-6" src={Edit} alt="" />
                  <h4 className="headline-4">Daftar Article</h4>
                </div>
                <Link
                  to="/cms/article/add"
                  className="bg-primary-1 hover:bg-primary-2 flex items-center rounded-md h-12 w-12 justify-center"
                >
                  <img className="w-7 h-7" src={Add} alt="" />
                </Link>
              </div>
                <div className="bg-neutral-white p-4 w-full overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="p-3 text-left font-bold text-sm">No.</th>
                        <th className="p-3 text-left font-bold text-sm">Tanggal</th>
                        <th className="p-3 text-left font-bold text-sm w-2/5">Title</th>
                        <th className="p-3 text-center font-bold text-sm">Category</th>
                        <th className="p-3 text-center font-bold text-sm">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataArticles?.map((article, index) => {
                        return (
                          <tr key={article.id} className="border-gray-100">
                            <td className="p-3 text-left font-semibold text-sm">
                              {index + 1}
                            </td>
                            <td className="p-3 text-left text-sm">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-left text-sm">
                              {article.title.substring(0, 30)}...
                            </td>
                            <td className="p-3 text-center text-sm">
                              <p
                                style={{
                                  backgroundColor: `${article?.category_color}`,
                                }}
                                className={`px-2 py-1 text-center font-bold text-white rounded-full text-xs`}
                              >
                                {article.category_name}
                              </p>
                            </td>
                            <td className="p-3 text-center flex gap-4 justify-center">
                              <Link
                                to={`/cms/article/edit/${article.id}`}
                                className="bg-primary-1 hover:bg-primary-2 h-12 w-12 rounded-xl flex justify-center items-center"
                              >
                                <img className="w-7 h-7" src={Edit1} alt="Edit" />
                              </Link>
                              <button
                                onClick={() => deletArticle(article)}
                                className="bg-red-500 hover:bg-red-400 h-12 w-12 rounded-xl flex justify-center items-center"
                              >
                                <img className="w-7 h-7" src={Delete} alt="Delete" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-2/5 h-80 rounded-3xl p-6">
            <div className="flex justify-center">
              <img className=" w-40" src={Mascot} alt="" />
            </div>
            <h3 className="mb-5 mt-5 headline-3 text-center">
              Yakin untuk menghapus Admin?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 w-1/2 hover:bg-red-400 text-white px-4 py-2 rounded-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="flex flex-col items-center bg-white p-5 rounded-xl">
            <svg
              className="animate-spin h-8 w-8 text-primary-1 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-primary-1">Deleting article...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default CmsArticleDashboardTable;
