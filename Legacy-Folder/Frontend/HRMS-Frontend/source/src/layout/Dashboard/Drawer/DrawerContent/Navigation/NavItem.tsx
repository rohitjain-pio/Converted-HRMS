/* eslint-disable @typescript-eslint/no-explicit-any */
import PropTypes from "prop-types";
import { forwardRef, useEffect } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";

// material-ui
import { useTheme } from "@mui/material/styles";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

// project import
import {
  handlerActiveItem,
  handlerDrawerOpen,
  useGetMenuMaster,
} from "@/api/menu";
import { MenuItemConfig } from "@/menu-items";
import { useMediaQuery } from "@mui/material";

export default function NavItem({
  item,
  level,
}: {
  item: MenuItemConfig;
  level: number;
}) {
  const theme = useTheme();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  const downLG = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  let itemTarget = "_self";
  if (item.target) {
    itemTarget = "_blank";
  }
  const listItemProps = {
    component: forwardRef((props, ref) => (
      <Link ref={ref as any} {...props} to={item.url} target={itemTarget} />
    )),
  };
  // NOTE: Use in feature
  // if (item?.external) {
  //   listItemProps = {
  //     component: 'a' as any,
  //     href: item.url as any,
  //     target: itemTarget as any,
  //   };
  // }

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Icon style={{ fontSize: drawerOpen ? "1rem" : "1.25rem" }} />
  ) : (
    false
  );

  const { pathname } = useLocation();
  const isSelected =
    !!matchPath({ path: item.url, end: false }, pathname) ||
    (pathname.split("/")[1] === "employment-details" &&
      item.url === "/employees") ||
    (pathname.split("/")[1] === "event" && item.url === "/events") ||
    (pathname.split("/")[1] === "profile" && item.url === "/dashboard");

  // active menu item on page load
  useEffect(() => {
    if (pathname === item.url) handlerActiveItem(item.id);
    // eslint-disable-next-line
  }, [pathname]);

  const textColor = "text.primary";
  const iconSelectedColor = "primary.main";

  return (
    <ListItemButton
      {...listItemProps}
      disabled={item.disabled}
      onClick={() => {
        if (downLG) {
          handlerDrawerOpen(false);
        }
      }}
      selected={isSelected}
      sx={{
        zIndex: 1201,
        pl: drawerOpen ? `${level * 28}px` : 1.5,
        py: !drawerOpen && level === 1 ? 1.25 : 1,
        ...(drawerOpen && {
          "&:hover": {
            bgcolor: "primary.lighter",
          },
          "&.Mui-selected": {
            bgcolor: "primary.lighter",
            borderRight: `2px solid ${theme.palette.primary.main}`,
            color: iconSelectedColor,
            "&:hover": {
              color: iconSelectedColor,
              bgcolor: "primary.lighter",
            },
          },
        }),
        ...(!drawerOpen && {
          "&:hover": {
            bgcolor: "transparent",
          },
          "&.Mui-selected": {
            "&:hover": {
              bgcolor: "transparent",
            },
            bgcolor: "transparent",
          },
        }),
      }}
    >
      {itemIcon && (
        <ListItemIcon
          sx={{
            minWidth: 28,
            color: isSelected ? iconSelectedColor : textColor,
            ...(!drawerOpen && {
              borderRadius: 1.5,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                bgcolor: "secondary.lighter",
              },
            }),
            ...(!drawerOpen &&
              isSelected && {
                bgcolor: "primary.lighter",
                "&:hover": {
                  bgcolor: "primary.lighter",
                },
              }),
          }}
        >
          {itemIcon}
        </ListItemIcon>
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) && (
        <ListItemText
          primary={
            <Typography
              variant="h6"
              sx={{ color: isSelected ? iconSelectedColor : textColor ,whiteSpace:"normal"}}
            >
              {item.title}
            </Typography>
          }
        />
      )}
    </ListItemButton>
  );
}

NavItem.propTypes = { item: PropTypes.object, level: PropTypes.number };
