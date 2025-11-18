import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { FeedBackDialog } from "./SupportDialog";
import useAsync from "@/hooks/useAsync";
import {
  AddFeedBackRequestArgs,
  AddFeedBackResponse,
} from "@/services/Support/types";
import { addFeedBack } from "@/services/Support/supportService";
import { toast } from "react-toastify";
import methods from "@/utils";
const SubmitFeedBackPage = () => {
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };
  const { execute: add, isLoading } = useAsync<
    AddFeedBackResponse,
    AddFeedBackRequestArgs
  >({
    requestFn: async (args: AddFeedBackRequestArgs) => {
      return await addFeedBack(args);
    },
    onSuccess: () => {
      toast.success("FeedBack Added Successfully");
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  return (
    <>
    <Tooltip title="Send Support Query">
      <IconButton onClick={() => setOpen(true)}>
        <SupportAgentIcon fontSize="large" />
      </IconButton></Tooltip>
      {open && (
        <FeedBackDialog
          onClose={onClose}
          open={open}
          add={add}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
export default SubmitFeedBackPage;
