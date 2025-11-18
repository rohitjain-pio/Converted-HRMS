import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AuthWrapper from "@/pages/Login/AuthWrapper";
import { Divider } from "@mui/material";
import pioLogo from "@/assets/images/icons/pio-logo.svg";
import loginLeftImg from "@/assets/images/icons/login-left-img.jpg";
import { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
  title: string;
  spacing: number;
}

const LoginLayout: React.FC<WrapperProps> = ({ children, title, spacing }) => {
  return (
    <AuthWrapper>
      <Grid
        className="login-main-container-card"
        container
        rowSpacing={4.5}
        columnSpacing={2.75}
        padding={"20px"}
      >
        <Grid
          className="login-sidebar-image"
          item
          xs={12}
          sm={4}
          md={4}
          lg={4}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <img
            src={loginLeftImg}
            height={"50px"}
            width={"228px"}
            className="side-image"
          />
        </Grid>
        <Grid
          className="login-divider"
          item
          xs={12}
          sm={1}
          md={1}
          lg={1}
          justifyContent="center"
          display="flex"
        >
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            style={{ height: "100%", paddingLeft: "30px" }}
            sx={{ borderRightWidth: "2px" }}
          />
        </Grid>
        <Grid item xs={12} sm={7} md={7} lg={7}>
          <div className="login-center-icon-container">
            <div className="login-center-icon">
              <img
                src={pioLogo}
                className="login-button-image"
                alt="Microsoft"
                height={40}
              />
            </div>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ borderRightWidth: "2px" }}
            />
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="baseline"
              sx={{ mb: { xs: -0.5, sm: 0.5 } }}
            >
              <Typography className="dark-color font-width-700" variant="h3">
                HRMS
              </Typography>
            </Stack>
          </div>
          <Grid container spacing={spacing} marginTop={"10px"}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="baseline"
                sx={{ mb: { xs: -0.5, sm: 0.5 } }}
              >
                <Typography className="blueColor font-width-700" variant="h3">
                  {title}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              {children}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default LoginLayout;
