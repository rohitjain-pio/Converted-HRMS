/* eslint-disable @typescript-eslint/no-explicit-any */
// material-ui
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project import
import NavGroup from "@/layout/Dashboard/Drawer/DrawerContent/Navigation/NavGroup";
import menuItem, {
  MenuGroupConfig,
  MenuItemConfig,
  SubMenuConfig,
} from "@/menu-items";
import { useUserStore } from "@/store";
import {
  FeatureFlagMap,
  useFeatureFlagStore,
} from "@/store/featureFlagStore";
import { FEATURE_FLAG_TO_MENU_ID } from "@/utils/constants";

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { userData } = useUserStore();
  const menus = userData?.menus || [];
  const userRole = userData.roleName;
  const { flags } = useFeatureFlagStore();

  const filteredChildren = filterMenusBasedOnPermission(
    menuItem.items[0].children,
    menus,
    userRole
  );

  const filteredMenusByFeatureFlags = filterMenusByFeatureFlags(
    filteredChildren,
    flags
  );

  const updatedItems: MenuGroupConfig[] = menuItem.items.map((item) => ({
    ...item,
    children: filteredMenusByFeatureFlags,
  }));

  const navGroups = updatedItems.map((item) => {
    switch (item.type) {
      case "group":
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}

type PermittedMenu = {
  mainMenu: string;
  mainMenuApiEndPoint: string;
  subMenus: PermittedSubMenu[];
};

type PermittedSubMenu = {
  subMenu: string;
  subMenuApiEndPoint: string;
};

function filterMenusBasedOnPermission(
  dashboardMenuConfig: (MenuItemConfig | SubMenuConfig)[],
  permittedMenus: PermittedMenu[],
  userRole: string
) {
  return dashboardMenuConfig.reduce<(MenuItemConfig | SubMenuConfig)[]>(
    (userMenu, menuItem) => {
      if (Array.isArray(menuItem.roles) && !menuItem.roles.includes(userRole)) {
        return userMenu;
      }

      if (menuItem.type === "item") {
        const isPermitted = permittedMenus.some(
          (permittedMenu) => permittedMenu.mainMenu === menuItem.title
        );
        if (isPermitted) {
          userMenu.push(menuItem);
        }
      } else if (menuItem.type === "submenu") {
        const permissionForParent = permittedMenus.find(
          (permittedMenu) => permittedMenu.mainMenu === menuItem.title
        );

        if (permissionForParent) {
          if (!menuItem.children.length) {
            throw new Error(
              `Parent menu item (id: ${menuItem.id}) in dashboard menu config has empty 'children' array.`
            );
          }

          const filteredChildren = menuItem.children.filter((childItem) => {
            const isPermitted = permissionForParent.subMenus.some(
              (permittedChild) => permittedChild.subMenu === childItem.title
            );

            if (
              isPermitted &&
              Array.isArray(childItem.roles) &&
              !childItem.roles.includes(userRole)
            ) {
              return false;
            }
            return isPermitted;
          });

          if (filteredChildren.length > 0) {
            userMenu.push({
              ...menuItem,
              children: filteredChildren,
            });
          }
        }
      }
      return userMenu;
    },
    []
  );
}

function filterMenusByFeatureFlags(
  dashboardMenuConfig: (MenuItemConfig | SubMenuConfig)[],
  flags: FeatureFlagMap
): (MenuItemConfig | SubMenuConfig)[] {
  const menuIdToFlag = Object.entries(FEATURE_FLAG_TO_MENU_ID).reduce<
    Record<string, string>
  >((acc, [flagKey, menuIds]) => {
    menuIds.forEach((id) => {
      acc[id] = flagKey;
    });

    return acc;
  }, {});

  function filterItem(item: MenuItemConfig) {
    const flagKey = menuIdToFlag[item.id];
    if (flagKey) {
      return flags[flagKey] ? item : null;
    }

    return item;
  }

  function filterSubmenu(submenu: SubMenuConfig) {
    const submenuFlag = menuIdToFlag[submenu.id];
    if (submenuFlag && !flags[submenuFlag]) {
      return null;
    }

    const filteredChildren = submenu.children.filter((child) => {
      const childFlag = menuIdToFlag[child.id];
      return childFlag ? flags[childFlag] : true;
    });

    if (filteredChildren.length === 0) {
      return null;
    }

    return { ...submenu, children: filteredChildren };
  }

  const filterGroup = (group: (SubMenuConfig | MenuItemConfig)[]) => {
    const filteredChildren = group
      .map((menuItem) => {
        if (menuItem.type === "item") {
          return filterItem(menuItem);
        } else {
          return filterSubmenu(menuItem);
        }
      })
      .filter((e) => e !== null);

    return filteredChildren;
  };

  return filterGroup(dashboardMenuConfig);
}
