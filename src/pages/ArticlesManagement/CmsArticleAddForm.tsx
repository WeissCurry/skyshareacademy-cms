import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";
import Arrow from "@images/mascot-icons/Arrow-down.png";
import Plus from "@images/mascot-icons/Plus-0.png";
import Del from "@images/mascot-icons/Delete-0.png";

import Mascot from "@images/mascot-icons/pose=2.webp";
import Mascot1 from "@images/mascot-icons/pose=8.webp";
import Mascot2 from "@images/mascot-icons/pose=1.webp";

import Add from "@images/mascot-icons/Plus.png";
import Xbutton from "@images/mascot-icons/Fill 300.png";
import Ceklist from "@images/mascot-icons/Tick Square.png";
import Coution from "@images/mascot-icons/Info Square.png";
import Close from "@images/mascot-icons/Close Square.svg";
import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";
import "react-quill/dist/quill.snow.css";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ArticleForm {
  image_heading?: File | string | null;
  title: string;
  content: string;
  link: string;
  category_id: string;
}

interface BlobInfo {
  id: () => string;
  name: () => string;
  filename: () => string;
  blob: () => Blob;
  base64: () => string;
  blobUri: () => string;
  uri: () => string | undefined;
}

function CmsArticleAddForm() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownAddOpen, setIsDropdownAddOpen] = useState(false);
  const [colorInput, setColorInput] = useState("#FFFFFF");
  const [ishidenCategori, setIsHidenCategory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [isCategoryNoSelected, setIsCategoryNoSelected] = useState(true);
  const [isDeleteFailed, setIsDeleteFailed] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [articleForm, setArticleForm] = useState<ArticleForm>({
    title: "",
    content: "",
    link: "",
    category_id: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const Navigate = useNavigate();

  const handleArticleData = async function () {
    const formData = new FormData();
    if (articleForm.image_heading) {
      formData.append("image_heading", articleForm.image_heading);
    }
    formData.append("title", articleForm.title);
    formData.append("content", articleForm.content);
    formData.append("link", articleForm.link);
    formData.append("category_id", articleForm.category_id);
    setIsDeleting(true);
    try {
      const responseFromServer = await skyshareApi({
        url: "/article/add",
        method: "post",
        data: formData,
      });
      if (responseFromServer.data.status === "success") {
        setIsSaveModalOpen(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryByid = async function (id: string) {
    try {
      const response = await skyshareApi.get(`category/${id}`);
      setSelectedCategory(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let ignore = false;
    const startFetching = async () => {
      try {
        const response = await skyshareApi.get("/category");
        if (!ignore) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCategoryAdd = async function () {
    const inputDataCategory = {
      name: categoryName,
      color: colorInput,
    };

    try {
      const response = await skyshareApi({
        url: "/category/add",
        method: "POST",
        data: inputDataCategory,
      });
      const newCategory = response.data.data;
      setCategories([...categories, newCategory]);
      setCategoryName("");
      setColorInput("#FFFFFF");
      setIsDropdownAddOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleHideCategory = () => {
    setIsHidenCategory(!ishidenCategori);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isDropdownAddOpen) setIsDropdownAddOpen(false);
  };

  const handleDropDownAddOpen = () => {
    setIsDropdownAddOpen(!isDropdownAddOpen);
    if (!isDropdownAddOpen) setIsDropdownOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsSaveModalOpen(true);
  };

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  async function deleteCategory() {
    setIsModalOpen(false);
    if (!categoryId) return;

    const updatedCategories = categories.filter(
      (category) => category.id !== categoryId
    );
    // Optimistic update
    const previousCategories = categories;
    setCategories(updatedCategories);

    setIsDeleting(true);
    try {
      await skyshareApi.delete(`/category/${categoryId}`);
    } catch (error) {
      setIsDeleteFailed(true);
      setCategories(previousCategories);
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    Navigate("/cms/article");
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    Navigate("/cms/article");
  };

  const handleDeleteCategory = () => {
    setIsModalOpen(true);
    setDeleteMessage("Yakin untuk menghapus category?");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArticleForm({
        ...articleForm,
        image_heading: file,
      });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const closeDeleteFailedModal = () => {
    setIsDeleteFailed(false);
  };

  return (
    <>
      <div className="bg-background flex flex-col pt-12 items-center self-stretch">
        <div className="content-1 flex gap-4">
          <div>
            <CmsNavCard />
          </div>
          <div className="w-full">
            <div>
              <h1 className="headline-1">Add Article</h1>
              <p className="paragraph">Masukkan data pada field yang tertera</p>
            </div>
            <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-xl pb-5 px-3 w-full">
              <h4 className=" font-bold text-base mt-6">
                Upload gambar heading{" "}
                <span className=" text-base font-bold text-orange-300">*</span>
              </h4>
              <div className="bg-neutral-white rounded-xl border-2 mt-4 border-gray-400 px-6 pt-7 pb-4">
                <div className="border-2 border-dashed flex justify-center items-center border-gray-400 rounded-xl h-60">
                  <div className="">
                    {imagePreviewUrl && (
                      <div className="flex justify-center  ">
                        <img
                          src={imagePreviewUrl}
                          alt="Image Preview"
                          className="rounded-xl border-2 border-gray-400"
                          style={{ maxWidth: "100%", maxHeight: "220px" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="my-4 bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative">
                  <input
                    type="file"
                    id="image_heading"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer z-10 opacity-0 w-full h-full absolute top-0 left-0"
                  />
                  <div className="flex gap-2 items-center py-4">
                    <p className=" cursor-pointer text-white font-bold">
                      Upload File
                    </p>
                    <img
                      className=" cursor-pointer w-6 -rotate-90"
                      src={ArrowLeft}
                      alt=""
                    />
                  </div>
                </div>
                <div className="flex justify-center pb-3">
                  <h4 className="text-base">
                    Minimal Ukuran{" "}
                    <span className="font-bold">(956 x 350px)</span>
                  </h4>
                </div>
              </div>
              <div className="add-content">
                <div className="bg-neutral-white py-4 gap-4 flex items-center">
                  <form className="w-full" onSubmit={handleSave}>
                    <label className="block font-bold mb-1" htmlFor="cta">
                      Judul <span className="text-orange-400">*</span>
                    </label>
                    <input
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setArticleForm({
                          ...articleForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="Bagaimana Mentorship Membakar Inovasi"
                      type="text"
                      className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                    />
                    <label className="block font-bold mt-4 mb-1" htmlFor="cta">
                      <div className="flex gap-1">
                        Kategori <span className="text-orange-400">*</span>
                      </div>
                    </label>
                    <div
                      className={`w-full px-4 duration-500 origin-top overflow-hidden ${
                        isDropdownAddOpen
                          ? "h-96"
                          : isDropdownOpen
                          ? "h-64"
                          : "h-14"
                      } border-gray-300 border-2 rounded-lg outline-none`}
                    >
                      <div className="mt-3.5 flex justify-between">
                        <div className="flex items-center justify-center">
                          {isCategorySelected && selectedCategory && (
                            <div
                              style={{
                                backgroundColor: `${selectedCategory.color}`,
                              }}
                              className=" -mt-1 px-3 py-1 rounded-full"
                            >
                              <p className="font-bold text-white">
                                {selectedCategory.name}
                              </p>
                            </div>
                          )}
                          {isCategoryNoSelected && (
                            <p className="text-gray-400">--Pilih kategory--</p>
                          )}
                        </div>
                        <div className="flex">
                          <button type="button" onClick={handleDropdownToggle}>
                            <img
                              className={`w-6 duration-500 ${
                                isDropdownOpen ? "rotate-180" : "rotate-0"
                              }`}
                              src={Arrow}
                              alt=""
                            />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`mt-2 gap-4 flex-wrap pb-10 bg-neutral-white ${
                          isDropdownOpen && ishidenCategori ? "flex" : "hidden"
                        }`}
                      >
                        {categories?.map((category) => {
                          return (
                            <button
                              key={category.id}
                              onClick={() => {
                                setCategoryId(category.id);
                                handleDeleteCategory();
                              }}
                              type="button"
                              style={{ backgroundColor: category.color }}
                              className={`px-3 flex items-center gap-2 py-1  text-white font-bold rounded-full`}
                            >
                              {category.name}
                              <img className=" w-6" src={Close} alt="" />
                            </button>
                          );
                        })}
                      </div>
                      <div
                        className={`mt-2 flex gap-4 flex-wrap ${
                          !isDropdownOpen ? "opacity-0" : "opacity-1"
                        }`}
                      >
                        {categories?.map((category) => {
                          return (
                            <button
                              key={category.id}
                              value={category.id}
                              onClick={() => {
                                setArticleForm({
                                  ...articleForm,
                                  category_id: category.id,
                                });
                                setCategoryId(category.id);
                                getCategoryByid(category.id);
                                setIsCategorySelected(true);
                                setIsCategoryNoSelected(false);
                                setIsDropdownOpen(false);
                              }}
                              type="button"
                              style={{
                                backgroundColor:
                                  categoryId === category.id
                                    ? "#fff"
                                    : category.color,
                                border:
                                  categoryId === category.id
                                    ? "2px solid red"
                                    : "none",
                                color:
                                  categoryId === category.id ? "#000" : "#FFF",
                              }}
                              className="px-3 py-1 text-white font-bold rounded-full"
                            >
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                      <div
                        className={`${
                          !isDropdownOpen
                            ? "opacity-0 invisible"
                            : "opacity-1 transition-opacity duration-500"
                        } mt-10 justify-between flex`}
                      >
                        <button
                          type="button"
                          onClick={handleDropDownAddOpen}
                          className="flex px-2 py-1 rounded-full bg-neutral-white shadow shadow-slate-400 gap-1 items-center"
                        >
                          <img className="w-5" src={Plus} alt="" />
                          <p className="text-slate-700">Tambah Kategori</p>
                        </button>
                        <button
                          onClick={handleHideCategory}
                          type="button"
                          className="flex px-2 py-1 rounded-full bg-neutral-white shadow shadow-slate-400 gap-1 items-center"
                        >
                          <img className="w-5" src={Del} alt="" />
                          <p className="text-slate-700">Hapus Kategori</p>
                        </button>
                      </div>
                      {isDropdownAddOpen && (
                        <div className="mt-4 duration-1000 bg-background py-2 gap-3 flex px-3 rounded-2xl">
                          <div className="block w-2/4">
                            <label
                              className="block font-bold mb-1"
                              htmlFor="cta"
                            >
                              Kategori Baru{" "}
                              <span className="text-orange-400">*</span>
                            </label>
                            <input
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                              placeholder="Masukkan nama kategori"
                              type="text"
                              className="w-full px-4 py-2 border-gray-300 border-2 rounded-lg outline-none"
                              required
                            />
                          </div>
                          <div className="block w-80">
                            <label
                              className="block font-bold mb-1"
                              htmlFor="cta"
                            >
                              Warna(Hex Code){" "}
                              <span className="text-orange-400">*</span>
                            </label>
                            <div className="w-full h-11 bg-neutral-white px-4 py-2 border-gray-300 border-2 rounded-lg outline-none flex gap-2">
                              <input
                                value={colorInput}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  setColorInput(e.target.value)
                                }
                                className="w-6 h-6 inline-block rounded-full p-0 cursor-pointer"
                                type="color"
                              />
                              <input
                                value={colorInput}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  setColorInput(e.target.value)
                                }
                                placeholder="#FFFFFF"
                                className=" outline-none w-full"
                                type="text"
                                required
                              />
                            </div>
                          </div>
                          <div className=" flex justify-center items-center w-10">
                            <div className="bg-primary-1 flex mt-7 items-center rounded-md px-2 py-2">
                              <button
                                onClick={handleCategoryAdd}
                                type="button"
                                className="bg-primary-1 hover:bg-primary-2"
                              >
                                <img className=" w-6" src={Add} alt="" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className=" mt-4">
                      <label className="block font-bold mb-1">
                        Berikan Isi <span className="text-orange-400">*</span>
                      </label>
                    </div>
                  </form>
                </div>
                <div className="z-0 relative">
                  <Editor
                    value={articleForm.content}
                    onEditorChange={(content) =>
                      setArticleForm({ ...articleForm, content })
                    }
                    apiKey="6tl5tifchc48dqu40vcan97ogm0iavsuezuoygext3jeifqu"
                    init={{
                      menubar: false,
                      resize: false,
                      height: 400,
                      plugins:
                        "anchor autolink charmap emoticons image link lists media searchreplace table visualblocks wordcount code",
                      toolbar:
                        "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | code",
                      tinycomments_mode: "embedded",
                      extended_valid_elements: 'script[src|async|defer|type|charset]',
                      tinycomments_author: "Author name",
                      paste_data_images: true,
                      images_upload_handler: (blobInfo: BlobInfo) =>
                        new Promise((resolve, reject) => {
                          const formData = new FormData();
                          formData.append(
                            "file",
                            blobInfo.blob(),
                            blobInfo.filename()
                          );

                          skyshareApi
                            .post("/media/tinymce", formData, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            })
                            .then((res) => {
                              resolve(res.data.location);
                            })
                            .catch((err) => {
                              reject("HTTP Error: " + err.message);
                            });
                        }),
                      mergetags_list: [
                        { value: "First.Name", title: "First Name" },
                        { value: "Email", title: "Email" },
                      ],
                      ai_request: (_request: unknown, respondWith: { string: (cb: () => Promise<string>) => void }) =>
                        respondWith.string(() =>
                          Promise.reject("See docs to implement AI Assistant")
                        ),
                    }}
                  />
                </div>
                <div className="mt-4 flex gap-5 justify-end">
                  <div className="w-56 py-2 flex">
                    <button
                      onClick={handleCancel}
                      type="button"
                      className="bg-gray-300 w-full py-3 rounded-md hover:bg-gray-200 text-black font-bold"
                    >
                      Batal
                    </button>
                  </div>
                  <div className="w-56 py-2 flex">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleArticleData();
                      }}
                      type="submit"
                      className="bg-primary-1 w-full py-3 rounded-md hover:bg-primary-2 text-white font-bold"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-10 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-2/5 h-80 rounded-3xl p-6">
            <div className="flex justify-center">
              <img className=" w-40" src={Mascot} alt="" />
            </div>
            <h3 className="mb-5 mt-5 headline-3 text-center">
              {deleteMessage}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 px-4 py-2 w-1/2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={deleteCategory}
                className="bg-red-500 w-1/2 hover:bg-red-400 text-white px-4 py-2 rounded-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-gray-600 z-10 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-3xl p-6 relative">
            <button onClick={closeSaveModal} className="absolute top-6 right-6">
              <img className="w-5" src={Xbutton} alt="" />
            </button>
            <div className="flex justify-center">
              <img className="w-40" src={Mascot1} alt="" />
            </div>
            <div className="flex gap-1 mt-5 items-center">
              <img className="w-6 h-6" src={Ceklist} alt="" />
              <h3 className="headline-3 ">Saved Successfully</h3>
            </div>
          </div>
        </div>
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 z-10 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-3xl p-6 relative">
            <button
              onClick={closeCancelModal}
              className="absolute top-6 right-6"
            >
              <img className="w-5" src={Xbutton} alt="" />
            </button>
            <div className="flex justify-center">
              <img className="w-40" src={Mascot2} alt="" />
            </div>
            <div className="flex gap-1 mt-5 items-center">
              <img className="w-6 h-6" src={Coution} alt="" />
              <h3 className="headline-3 ">Progress is not saved</h3>
            </div>
          </div>
        </div>
      )}

      {isDeleteFailed && (
        <div className="fixed inset-0 z-10 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-3xl p-6 relative">
            <button
              onClick={closeDeleteFailedModal}
              className="absolute top-6 right-6"
            >
              <img className="w-5" src={Xbutton} alt="" />
            </button>
            <div className="flex justify-center">
              <img className="w-40" src={Mascot2} alt="" />
            </div>
            <div className="flex gap-1 mt-5 items-center">
              <img className="w-6 h-6" src={Coution} alt="" />
              <h3 className="headline-3 ">Delete Failed, Category Used</h3>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
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
            <p className="text-primary-1">Processing...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default CmsArticleAddForm;
