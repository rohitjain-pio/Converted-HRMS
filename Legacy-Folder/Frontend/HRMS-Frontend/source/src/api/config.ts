export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Currently unused code. Retained for potential future use or reference.
export const API_CONSTANTS = {
  LOCAL: "http://localhost:5281/api/",
  DEV: "https://localhost:5281/api/",
  QA: "https://localhost:5281/api/",
  STAGE: "https://localhost:5281/api/",
  PRODUCTION: "https://localhost:5281/api/",
};

// Currently unused code. Retained for potential future use or reference.
export const getBuildENV = () => {
  const buildENV = import.meta.env.REACT_APP_API_BUILD_ENV;

  if (buildENV === "QA") {
    return "QA";
  }

  if (buildENV === "DEV") {
    return "DEV";
  }

  if (buildENV === "STAGE") {
    return "STAGE";
  }

  if (buildENV === "PRODUCTION") {
    return "PRODUCTION";
  }

  return "LOCAL";
};
