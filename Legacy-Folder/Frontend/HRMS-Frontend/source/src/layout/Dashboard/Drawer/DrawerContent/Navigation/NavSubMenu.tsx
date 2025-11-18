import {
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useMemo, useState } from "react";
import NavItem from "@/layout/Dashboard/Drawer/DrawerContent/Navigation/NavItem";
import { useTheme } from "@mui/material/styles";
import { useGetMenuMaster } from "@/api/menu";
import { SubMenuConfig } from "@/menu-items";
import { matchPath, useLocation } from "react-router-dom";

type Props = { item: SubMenuConfig; level: number };

function NavSubMenu({ item, level }: Props) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  const [open, setOpen] = useState(() =>
    item.children.some((child) =>
      matchPath({ path: child.url, end: false }, pathname)
    )
  );

  const handleToggle = () => {
    if (drawerOpen) {
      setOpen((prev) => !prev);
    }
  };

  const { title, icon: Icon, children } = item;

  const itemIcon = Icon ? (
    <Icon style={{ fontSize: drawerOpen ? "1rem" : "1.25rem" }} />
  ) : null;

  const isSelected = useMemo(
    () => matchPath({ path: item.url, end: false }, pathname),
    [pathname, item.url]
  );

  const textColor = "text.primary";
  const iconSelectedColor = "primary.main";

  return (
    <>
      <ListItemButton
        onClick={handleToggle}
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
                sx={{ color: isSelected ? iconSelectedColor : textColor }}
              >
                {title}
              </Typography>
            }
          />
        )}
        {drawerOpen ? (
          open ? (
            <ExpandLess style={{ fontSize: "1rem" }} />
          ) : (
            <ExpandMore style={{ fontSize: "1rem" }} />
          )
        ) : null}
      </ListItemButton>
      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {children.map((child) => (
            <NavItem key={child.id} item={child} level={2} />
          ))}
        </Collapse>
      )}
    </>
  );
}

export default NavSubMenu;
