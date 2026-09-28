export interface PopupItem {
  id: string;
  title?: string;
  image_url: string;
  cta_link?: string;
  cta_text?: string;
  is_active: boolean;
}

export interface PopupConfigData {
  id?: number;
  is_active: boolean;
  randomize: boolean;
  popups: PopupItem[];
}
