export interface CmsEvent {
  id: number;
  title: string;
  description?: string | null;
  event_date?: string | null;
  event_type: string;
  thumbnail_url?: string | null;
  documentation_urls?: string[] | null;
  cta_link?: string | null;
  cta_label?: string | null;
  target_role: "all" | "mentor" | "parent" | "talent";
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  thumbnail_url: File | string | null;
  documentation_urls: string[];
  cta_link?: string;
  cta_label?: string;
  target_role: "all" | "mentor" | "parent" | "talent";
  is_active: boolean;
}

export interface TargetProgramOption {
  id: "all" | "mentor" | "parent" | "talent";
  label: string;
  color: string;
}

export const TARGET_PROGRAMS: TargetProgramOption[] = [
  { id: "all", label: "Umum", color: "#001125" },
  { id: "talent", label: "Talents Academy", color: "#FEA02F" },
  { id: "mentor", label: "Mentor Academy", color: "#34BCEE" },
  { id: "parent", label: "Parents Academy", color: "#BF35DF" },
];

