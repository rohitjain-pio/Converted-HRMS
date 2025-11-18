/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, CircularProgress } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormTextField from "@/components/FormTextField";
import apis from "@/api";
import { useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";
import useModulePermissionsStore from "@/store/useModulePermissionsStore";
import methods from "@/utils";
import useAPIMethod from "@/hooks/useAPIMethod";
import { regex } from "@/utils/regexPattern";
import { useLayoutEffect } from "react";
import {
  BUILD_VERSION_STORAGE_KEY,
  FEATURE_FLAG_STORAGE_KEY,
} from "@/utils/constants";
import { cleanLocalStorage, isBuildVersionError } from "@/utils/helpers";

const { email, password } = regex;

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required("Email is required")
    .matches(email.pattern, email.message)
    .min(8, "Email must be at least 8 characters long.")
    .max(50, "Email cannot exceed 50 characters."),
  password: Yup.string()
    .trim()
    .required("Password is required")
    .matches(password.pattern, password.message),
});

type FormData = Yup.InferType<typeof validationSchema>;

export default function UserLogin() {
  const { callApi: login, isLoading } = useAPIMethod();

  const { throwApiError } = methods;

  const downSM = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const { setUserData, isLoggedIn } = useUserStore();
  const { setModulePermissions } = useModulePermissionsStore();

  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { handleSubmit } = method;

  useLayoutEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn]);

  const onSubmit = async (data: FormData) => {
    try {
      const { result } = await login(() => apis.auth.internalUserLogin(data));
      if (result) {
        setUserData(result, true, true);
        if (result.modulePermissions.modules) {
          setModulePermissions(result.modulePermissions.modules);
        }
        navigate("/dashboard");
      } else {
        cleanLocalStorage([
          BUILD_VERSION_STORAGE_KEY,
          FEATURE_FLAG_STORAGE_KEY,
        ]);
        throwApiError(null, "User not found");
      }
    } catch (err: any) {
      if (isBuildVersionError(err)) {
        cleanLocalStorage([
          BUILD_VERSION_STORAGE_KEY,
          FEATURE_FLAG_STORAGE_KEY,
        ]);
        throwApiError(err);
      }
    }
  };

  return (
    <Stack
      direction="column"
      spacing={{ xs: 1, sm: 2 }}
      justifyContent={{ xs: "space-around", sm: "space-between" }}
      sx={{
        "& .MuiButton-startIcon": {
          mr: { xs: 0, sm: 1 },
          ml: { xs: 0, sm: -0.5 },
        },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          m: 1,
          position: "relative",
        }}
      >
        <FormProvider<FormData> {...method}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            paddingY="30px"
            gap="30px"
            display="flex"
            flexDirection="column"
          >
            <FormInputGroup>
              <FormInputContainer md={12}>
                <FormTextField label="Email" name="email" required />
              </FormInputContainer>
              <FormInputContainer md={12}>
                <FormTextField label="Password" name="password" required />
              </FormInputContainer>
            </FormInputGroup>
            <Box display="flex" gap="15px" justifyContent="center">
              <Button
                className="login-button"
                variant="outlined"
                type="submit"
                color="secondary"
                fullWidth={!downSM}
                style={{
                  paddingRight: "50px",
                  paddingLeft: "50px",
                }}
                disabled={isLoading}
              >
                <b>Sign In</b>
              </Button>
            </Box>
          </Box>
        </FormProvider>

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
