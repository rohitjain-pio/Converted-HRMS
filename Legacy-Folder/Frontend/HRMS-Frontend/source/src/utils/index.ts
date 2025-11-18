/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { isBuildVersionError } from "@/utils/helpers";

export const apiMsgs = {
  Errors: {
    common: "Something went wrong! Please try again.",
    gettingData: (page: string) =>
      `Something went wrong while fetching ${page}.`,
    savingData: (page: string) => `Something went wrong while saving ${page}.`,
    updatingData: (page: string) =>
      `Something went wrong while updating ${page}.`,
    failed: (action: string) => `${action} failed!`,
    authenticate: (action: string) => `Failed to authenticate ${action}`,
    notExist: (item: string) => `${item} not exists!`,
    notVerified: (item: string, msg: string) =>
      `Could not verify your ${item}! Please try again with correct ${msg}`,
    invalid: (action?: string) =>
      `Invalid ${action || "Credentials"}! Please try again.`,
    notCorrect: (action: string) =>
      `${action} not correct. Please check your ${action}.`,
  },
  Success: {
    savingData: (page: string) => `${page} saved successfully.`,
    create: (page: string) => `${page} created successfully.`,
    updatingData: (page: string) => `${page} updated successfully.`,
    delete: (item: string) => `${item} removed successfully.`,
  },
};

const throwApiError = (error: any, message?: string) => {
  if (isBuildVersionError(error)) {
    return;
  }
  if (error?.response?.data?.message)
    return toast.error(error?.response?.data?.message);
  if (message) return toast.error(message);
  return toast.error(apiMsgs.Errors.common);
};

const methods = {
  throwApiError,
};

export default methods;
