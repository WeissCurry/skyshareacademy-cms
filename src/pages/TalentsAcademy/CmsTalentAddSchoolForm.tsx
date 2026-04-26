import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import skyshareApi from "@utilities/skyshareApi";
import CmsNavCard from "@components/cms/CmsNavCard";

import LoadingModal from "@components/cms/LoadingModal";
import SuccessModal from "@components/cms/SuccessModal";
import ConfirmModal from "@components/cms/ConfirmModal";

import ArrowLeft from "@images/mascot-icons/Arrow - Down 3.png";
import Show from "@images/mascot-icons/Show.png";
import Chain from "@images/mascot-icons/Link.png";

interface SchoolForm {
  gambar_logo_sekolah: File | string | null;
  nama_sekolah: string;
}

function CmsTalentAddSchoolForm() {
  const [schoolForm, setSchoolForm] = useState<SchoolForm>({
    gambar_logo_sekolah: null,
    nama_sekolah: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleAddSchool = async () => {
    const formData = new FormData();
    if (schoolForm.gambar_logo_sekolah) {
      formData.append("gambar_logo_sekolah", schoolForm.gambar_logo_sekolah);
    }
    formData.append("nama_sekolah", schoolForm.nama_sekolah);

    setIsUploading(true);
    try {
      await skyshareApi.post("/school/add", formData);
      setIsSaveModalOpen(true);
    } catch (error: unknown) {
      const err = error as Error;
      setErrorMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSchoolForm({ ...schoolForm, gambar_logo_sekolah: file });
      setImagePreviewUrl(URL.createObjectURL(file));
      setUrlValue("");
    }
  };

  const handleUrlChange = (value: string) => {
    setUrlValue(value);
    setSchoolForm({ ...schoolForm, gambar_logo_sekolah: value });
    setImagePreviewUrl(value);
  };

  return (
    <div className="bg-background flex flex-col pt-12 items-center self-stretch pb-20">
      <div className="content-1 flex gap-4 w-full max-w-[1100px] px-4">
        <div><CmsNavCard /></div>
        <div className="w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/cms/talentacademy")} className="hover:scale-110 transition-transform">
              <img className="w-10 rotate-90" src={ArrowLeft} alt="Back" />
            </button>
            <h1 className="headline-1">Add School</h1>
          </div>

          <div className="shadow-md bg-neutral-white mt-10 border-2 border-black rounded-2xl p-10 max-w-2xl mx-auto">
            <div className="space-y-8">
              <div>
                <label className="font-bold block mb-4">Logo Sekolah</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 h-64 relative group overflow-hidden">
                  {imagePreviewUrl ? (
                    <div className="flex justify-center h-full p-2 w-full">
                      <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 font-medium">No image preview available</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-2 mb-4">
                  <p className="text-xs text-gray-500 font-bold">(PNG/JPG max 2MB)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-primary-1 cursor-pointer hover:bg-primary-2 flex justify-center rounded-xl items-center relative h-[52px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer z-10 opacity-0 w-full h-full absolute"
                    />
                    <div className="flex gap-2 items-center">
                      <p className="text-white font-bold">Upload File Baru</p>
                      <img className="w-6 -rotate-90" src={Show} alt="" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <img src={Chain} className="w-5" alt="" />
                    </div>
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar di sini..."
                      value={urlValue}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full h-[52px] pl-12 pr-4 border-2 border-gray-400 rounded-xl outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pilih salah satu: Upload file atau tempel link dari Media Library</h4>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-2">Nama Sekolah</label>
                <input
                  value={schoolForm.nama_sekolah}
                  onChange={(e) => setSchoolForm({ ...schoolForm, nama_sekolah: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-black transition-colors"
                  placeholder="Masukkan nama sekolah..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsCancelModalOpen(true)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">Batal</button>
                <button onClick={handleAddSchool} className="flex-1 py-3 bg-primary-1 text-white rounded-xl font-bold hover:bg-primary-2 shadow-lg shadow-primary-1/20 transition-all active:scale-95">Tambah Sekolah</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal isOpen={isSaveModalOpen} onClose={() => navigate("/cms/talentacademy")} title="Sekolah Berhasil Ditambah" />
      <ConfirmModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={() => navigate("/cms/talentacademy")} title="Batalkan?" message="Data tidak akan tersimpan." />
      <LoadingModal isLoading={isUploading} message="Menyimpan data..." />
      {errorMessage && <ConfirmModal isOpen={!!errorMessage} onClose={() => setErrorMessage("")} onConfirm={() => setErrorMessage("")} title="Terjadi Kesalahan" message={errorMessage} confirmText="Mengerti" />}
    </div>
  );
}

export default CmsTalentAddSchoolForm;
