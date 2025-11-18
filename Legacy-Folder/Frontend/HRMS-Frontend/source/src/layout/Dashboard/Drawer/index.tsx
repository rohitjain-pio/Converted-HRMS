/* eslint-disable @typescript-eslint/no-explicit-any */
import PropTypes from "prop-types";
import { useMemo, useState } from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";

// project import
import DrawerHeader from "@/layout/Dashboard/Drawer/DrawerHeader";
import DrawerContent from "@/layout/Dashboard/Drawer/DrawerContent";
import MiniDrawerStyled from "@/layout/Dashboard/Drawer/MiniDrawerStyled";

import { drawerWidth } from "@/config";
import { handlerDrawerOpen, useGetMenuMaster } from "@/api/menu";

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

export default function MainDrawer({ window }: any) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;
  const [hovered, setHovered] = useState(false);
  const matchDownMD = useMediaQuery((theme: any) =>
    theme.breakpoints.down("lg")
  );
  const downLG = useMediaQuery((theme) => theme.breakpoints.down("lg"));

  // responsive drawer container
  const container =
    window !== undefined ? () => window().document.body : undefined;

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);
  const drawerHeader = useMemo(
    () => <DrawerHeader open={!!drawerOpen} />,
    [drawerOpen]
  );

  const handleMouseEnter = () => {
    if (!drawerOpen && !downLG && !hovered) {
      handlerDrawerOpen(true);
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (drawerOpen && !downLG && hovered) {
      handlerDrawerOpen(false);
      setHovered(false);
    }
  };

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, zIndex: 1200 }}
      aria-label="mailbox folders"
    >
      {!matchDownMD ? (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          {drawerHeader}
          <Box
            sx={{ overflow: "hidden", flex: 1 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {drawerContent}
          </Box>
        </MiniDrawerStyled>
      ) : (
        <Drawer
          container={container}
          variant="temporary"
          open={drawerOpen}
          onClose={() => handlerDrawerOpen(!drawerOpen)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderRightColor: "divider",
              backgroundImage: "none",
              boxShadow: "inherit",
            },
          }}
        >
          {drawerHeader}
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}

MainDrawer.propTypes = { window: PropTypes.func };
