export interface MenuItem {
  id: number;
  name: string;
  path: string | null;
  icon: string | null;
  has_access: boolean;
  sub_menus: MenuItem[];
}

export interface MenuResponse {
  status_code: number;
  message: string;
  data: MenuItem[];
  is_success: boolean;
}
