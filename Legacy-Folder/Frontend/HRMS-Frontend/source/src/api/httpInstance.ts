/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/api/config";
import { getRefreshToken } from "@/services/RefreshToken";
import { useUserStore } from "@/store";
import useModulePermissionsStore from "@/store/useModulePermissionsStore";
import { logoutUser } from "@/api/utils";
import { useAppUpdateStore } from "@/store/useAppUpdateStore";
import { BUILD_VERSION_STORAGE_KEY } from "@/utils/constants";
import { isBuildVersionError } from "@/utils/helpers";

const getBuildVersion = () => {
  const rawStr = localStorage.getItem(BUILD_VERSION_STORAGE_KEY);

  if (!rawStr) {
    return "";
  }

  const parsed = JSON.parse(rawStr);
  return parsed;
};

export const httpInstance = axios.create({
  baseURL: API_BASE_URL,
});

httpInstance.interceptors.request.use(function (
  config: AxiosRequestConfig & any
) {
  const token =
    localStorage.getItem("paramToken") ||
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("userToken") as any)?.state?.userData
      ?.authToken;

  const buildVersion = getBuildVersion();

  if (config) {
    if (config["headers"]) {
      config["headers"]["Authorization"] = "Bearer " + token;
      config["headers"]["Build-Version"] = buildVersion;
    }
  }

  return config;
});

let failedRequestQueue: {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}[] = [];

let isRefreshing = false;

const processQueue = (error: any, token: string | null = null) => {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedRequestQueue = [];
};

httpInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (isBuildVersionError(error)) {
      const data = error.response?.data;

      if (
        typeof data === "object" &&
        data &&
        "buildVersion" in data &&
        typeof data.buildVersion === "string"
      ) {
        const newVersion = data.buildVersion;

        const { setNewVersion, showUpdateDialog } =
          useAppUpdateStore.getState();

        if (!showUpdateDialog) {
          setNewVersion(newVersion);
        }
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = "Bearer " + token;
            }

            return httpInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { userData, setUserData, isInternalUser } = useUserStore.getState();
      const { setModulePermissions } = useModulePermissionsStore.getState();

      try {
        const { data } = await getRefreshToken({
          accessToken: userData?.authToken,
          refreshToken: userData?.refreshToken || "",
        });

        const { result } = data;

        setUserData(result, true, isInternalUser);

        if (result.modulePermissions.modules) {
          setModulePermissions(result.modulePermissions.modules);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = "Bearer " + result.authToken;
        }

        processQueue(null, result.authToken);

        return httpInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logoutUser();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// NOTE : if response is 401 then Zustand to remove all data and logout user.
export const setupInterceptors = (signOutUser: () => void) => {
  httpInstance.interceptors.response.use(
    (res) => {
      return res;
    },
    async (error) => {
      const isUnauthorized =
        error.response.status === 401 || error.response.status === 0;

      if (isUnauthorized) {
        signOutUser();
      }
      return Promise.reject(error);
    }
  );
};
