import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

// material-ui
import useMediaQuery from "@mui/material/useMediaQuery";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

// project import
import Drawer from "@/layout/Dashboard/Drawer";
import Header from "@/layout/Dashboard/Header";
import Loader from "@/components/Loader";

import { handlerDrawerOpen, useGetMenuMaster } from "@/api/menu";
import { useUserStore } from "@/store";
import AppUpdateDialog from "@/components/AppUpdateDialog/AppUpdateDialog";

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { isLoggedIn } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  const { menuMasterLoading } = useGetMenuMaster();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const downXL = useMediaQuery((theme: any) => theme.breakpoints.down("xl"));

  useEffect(() => {
    handlerDrawerOpen(!downXL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  useEffect(() => {
    if (location.pathname !== "/" && !isLoggedIn) {
      navigate("/");
    }
    if (location.pathname === "/internal-login" && !isLoggedIn) {
      navigate("/internal-login");
    }
    if (location.pathname === "/" && isLoggedIn) {
      navigate("/dashboard");
    }
  }, []);

  if (menuMasterLoading) return <Loader />;

  return isLoggedIn ? (
    <>
      <Box sx={{ display: "flex", width: "100%" }}>
        <Drawer />
        <AppUpdateDialog />
        <Header />
        <Box
          component="main"
          sx={{
            width: "calc(100% - 260px)",
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
        <web-chatdrawer
          drawerstyle='{
                "position": "fixed",
                "top": "62px",
                "right": 0,
                "zIndex" : 1100
              }'
          height="calc(100% - 62px)"
        ></web-chatdrawer>
      </Box>
    </>
  ) : (
    <Outlet />
  );
}
