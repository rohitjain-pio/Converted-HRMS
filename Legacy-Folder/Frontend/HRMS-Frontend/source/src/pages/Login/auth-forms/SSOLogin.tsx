/* eslint-disable @typescript-eslint/no-explicit-any */
import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from "react-router-dom";

// assets
import { Box, CircularProgress } from "@mui/material";
import apis from "@/api";
import Microsoft from "@/assets/images/icons/microsoft365.svg";
import useAPIMethod from "@/hooks/useAPIMethod";
import { useUserStore } from "@/store";
import methods from "@/utils";
import { loginRequest } from "@/utils/authConfig";
import useModulePermissionsStore from "@/store/useModulePermissionsStore";
import { useLayoutEffect } from "react";
import { cleanLocalStorage, isBuildVersionError } from "@/utils/helpers";
import {
  BUILD_VERSION_STORAGE_KEY,
  FEATURE_FLAG_STORAGE_KEY,
} from "@/utils/constants";

export default function SSOLogin() {
  const { callApi: login, isLoading } = useAPIMethod();

  const { throwApiError } = methods;

  const downSM = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const { instance, inProgress } = useMsal();

  const navigate = useNavigate();
  const { setMsalToken, setUserData, isLoggedIn } = useUserStore();
  const { setModulePermissions } = useModulePermissionsStore();

  useLayoutEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn]);

  const microsoftHandle = async () => {
    if (inProgress === InteractionStatus.None) {
      try {
        const userData = await instance.loginPopup(loginRequest);

        const { result } = await login(() =>
          apis.auth.login({
            msAuthToken: userData.accessToken,
          })
        );
        if (result) {
          setMsalToken({
            idToken: userData.idToken,
            accessToken: userData.accessToken,
          });
          setUserData(result, true, false);
          if (result.modulePermissions.modules) {
            setModulePermissions(result.modulePermissions.modules);
          }
          navigate("/dashboard");
        } else {
          await instance.logoutPopup({
            mainWindowRedirectUri: window.location.href,
          });
          setMsalToken({
            idToken: "",
            accessToken: "",
          });
          cleanLocalStorage([
            BUILD_VERSION_STORAGE_KEY,
            FEATURE_FLAG_STORAGE_KEY,
          ]);
          throwApiError(null, "User not found");
        }
      } catch (err: any) {
        

        if (!isBuildVersionError(err)) {
          throwApiError(err);
          cleanLocalStorage([
            BUILD_VERSION_STORAGE_KEY,
            FEATURE_FLAG_STORAGE_KEY,
          ]);
          await instance.logoutPopup({
            mainWindowRedirectUri: window.location.href,
          });
          
        }
      }
    }
  };

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 2 }}
      justifyContent={{ xs: "space-around", sm: "space-between" }}
      sx={{
        "& .MuiButton-startIcon": {
          mr: { xs: 0, sm: 1 },
          ml: { xs: 0, sm: -0.5 },
        },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          m: 1,
          position: "relative",
        }}
      >
        <Button
          className="login-button"
          variant="outlined"
          color="secondary"
          fullWidth={!downSM}
          startIcon={
            <img
              src={Microsoft}
              className="login-button-image"
              alt="Microsoft"
              height={30}
            />
          }
          style={{
            paddingRight: "50px",
            paddingLeft: "50px",
          }}
          disabled={isLoading}
          onClick={microsoftHandle}
        >
          <b>Sign In with Microsoft</b>
        </Button>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-12px",
              marginLeft: "-12px",
            }}
          />
        )}
      </Box>
    </Stack>
  );
}
