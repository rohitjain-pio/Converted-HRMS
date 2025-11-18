import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import { FallbackRender } from "@/components";
import ScrollTop from "@/components/ScrollTop";
import "@/index.css";
import CustomRoute from "@/routes";

// scroll bar
import "simplebar-react/dist/simplebar.min.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import "react-toastify/dist/ReactToastify.css";
import ThemeCustomization from "@/themes";
import { msalConfig } from "@/utils/authConfig";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagProvider";
// import { FeatureFlagProvider } from "./contexts/FeatureFlagProvider";

// const theme = createTheme({});

export const pca = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackRender={FallbackRender}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        draggable={false}
        closeOnClick
        pauseOnHover
      />
      <ThemeCustomization>
        <MsalProvider instance={pca}>
          <ScrollTop>
            <FeatureFlagProvider>
              <CustomRoute />
            </FeatureFlagProvider>
          </ScrollTop>
        </MsalProvider>
      </ThemeCustomization>
    </ErrorBoundary>
  </React.StrictMode>
);
