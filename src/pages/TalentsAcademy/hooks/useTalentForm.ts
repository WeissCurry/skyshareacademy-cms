import { useState, useEffect, type ChangeEvent } from "react";
import skyshareApi from "@utilities/skyshareApi";

interface Group {
  id: string | number;
  name: string;
  link?: string;
  school_id?: string | number;
}

interface School {
  id: string | number;
  nama_sekolah: string;
  embed_map: string;
  address?: string;
}

interface TalentFormData {
  file_booklet?: File | string | null;
  gambar_alur_acara?: File | string | null;
  gambar_timeline?: File | string | null;
  link_cta: string;
  link_join_program: string;
  school_ids: (string | number)[];
  school_id?: string | number;
}

interface TalentData {
  file_booklet?: string;
  gambar_alur_acara?: string;
  gambar_timeline?: string;
  link_cta: string;
  link_join_program: string;
  school_id?: string | number;
}

export function useTalentForm() {
  const [talentForm, setTalentForm] = useState<TalentFormData>({
    school_ids: [],
    link_cta: "",
    link_join_program: "",
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [dataTalent, setDataTalent] = useState<TalentData | null>(null);
  const [dataGroups, setDataGroups] = useState<Group[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imagePreviewUrlTimeline, setImagePreviewUrlTimeline] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch talent data on mount
  useEffect(() => {
    const fetchTalentData = async () => {
      setIsUploading(true);
      try {
        const response = await skyshareApi.get("/talent");
        const talent = response.data.data;
        setDataTalent(talent);
        setTalentForm((prev) => ({
          ...prev,
          file_booklet: talent.file_booklet,
          link_cta: talent.link_cta,
          link_join_program: talent.link_join_program,
          school_id: talent.school_id,
        }));
        setImagePreviewUrl(talent.gambar_alur_acara || "");
        setImagePreviewUrlTimeline(talent.gambar_timeline || "");
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };
    fetchTalentData();
  }, []);

  // Fetch schools on mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await skyshareApi.get("/school");
        setSchools(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSchools();
  }, []);

  const handleBookletChange = (value: string) => {
    setTalentForm((prev) => ({ ...prev, file_booklet: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTalentForm((prev) => ({ ...prev, gambar_alur_acara: file }));
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFileChangeTimeline = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTalentForm((prev) => ({ ...prev, gambar_timeline: file }));
      setImagePreviewUrlTimeline(URL.createObjectURL(file));
    }
  };

  const handleCtaChange = (value: string) => {
    setTalentForm((prev) => ({ ...prev, link_cta: value }));
  };

  const handleJoinProgramChange = (value: string) => {
    setTalentForm((prev) => ({ ...prev, link_join_program: value }));
  };

  const handleSubmit = async (): Promise<boolean> => {
    const formData = new FormData();
    if (talentForm.file_booklet instanceof File || typeof talentForm.file_booklet === "string") {
      formData.append("file_booklet", talentForm.file_booklet);
    }
    if (talentForm.gambar_alur_acara instanceof File || typeof talentForm.gambar_alur_acara === "string") {
      formData.append("gambar_alur_acara", talentForm.gambar_alur_acara);
    }
    if (talentForm.gambar_timeline instanceof File || typeof talentForm.gambar_timeline === "string") {
      formData.append("gambar_timeline", talentForm.gambar_timeline);
    }
    formData.append("link_cta", talentForm.link_cta);
    formData.append("school_id", JSON.stringify(talentForm.school_ids));
    formData.append("link_join_program", talentForm.link_join_program);

    setIsUploading(true);
    try {
      const response = await skyshareApi({
        url: "/talent",
        method: "PUT",
        data: formData,
      });
      return response.data.status === "success";
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string | number): Promise<void> => {
    setIsDeleting(true);
    try {
      await skyshareApi.delete(`/school/${schoolId}`);
      setSchools((prev) => prev.filter((school) => school.id !== schoolId));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchGroupsBySchoolId = async (schoolId: string | number): Promise<Group[]> => {
    try {
      const response = await skyshareApi.get("/group");
      const schoolGroups = response.data.data.filter(
        (group: Group) => group.school_id === schoolId
      );
      setDataGroups(schoolGroups);
      return schoolGroups;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const resetForm = () => {
    setTalentForm({ school_ids: [], link_cta: "", link_join_program: "" });
    setImagePreviewUrl("");
    setImagePreviewUrlTimeline("");
    setDataTalent(null);
  };

  return {
    talentForm,
    schools,
    dataTalent,
    dataGroups,
    imagePreviewUrl,
    imagePreviewUrlTimeline,
    isUploading,
    isDeleting,
    handleBookletChange,
    handleFileChange,
    handleFileChangeTimeline,
    handleCtaChange,
    handleJoinProgramChange,
    handleSubmit,
    handleDeleteSchool,
    fetchGroupsBySchoolId,
    resetForm,
    setTalentForm,
    setDataGroups,
    setSchools,
  };
}
