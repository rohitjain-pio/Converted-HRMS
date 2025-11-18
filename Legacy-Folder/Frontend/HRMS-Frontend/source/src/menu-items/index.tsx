// project import
import dashboard from "@/menu-items/dashboard";

// ==============================|| MENU ITEMS ||============================== //

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconType = any;

export type MenuItemConfig = {
  id: string;
  title: string;
  type: "item";
  url: string;
  icon?: IconType;
  breadcrumbs?: boolean;
  target?: string;
  disabled?: boolean;
  children?: never;
  roles?: string[];
};

export type SubMenuConfig = {
  id: string;
  title: string;
  type: "submenu";
  icon?: IconType;
  breadcrumbs?: boolean;
  url: string;
  children: MenuItemConfig[];
  roles?: string[];
};

export type MenuGroupConfig = {
  id: string;
  type: "group";
  title?: string;
  children: (SubMenuConfig | MenuItemConfig)[];
};

export type MainMenuConfig = { items: MenuGroupConfig[] };

const mainMenuConfig: MainMenuConfig = {
  items: [dashboard],
};

export default mainMenuConfig;
