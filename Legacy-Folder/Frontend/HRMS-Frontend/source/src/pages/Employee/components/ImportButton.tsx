import { Box, IconButton, styled, Tooltip } from "@mui/material";
import { ChangeEvent, useRef, useState } from "react";
// import { LoadingButton } from "./LoadingButton";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import useAsync from "@/hooks/useAsync";
import {
  importEmployeesData,
  ImportEmployeesDataResponse,
} from "@/services/Employees";
import { toast } from "react-toastify";
import methods from "@/utils";
import ImportConfirmationDialog, {
  ValidationResult,
} from "@/pages/Employee/components/ImportConfirmationDialog";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

type ImportButtonProps = {
  setGlobalLoading: (loading: boolean) => void;
  onImportSuccess: () => void;
};

export const ImportButton = (props: ImportButtonProps) => {
  const { setGlobalLoading, onImportSuccess } = props;
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const resetInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files?.[0] || null;
    if (!file) {
      return;
    }

    importData({ file, isImportConfirmed: false });
  };

  const { execute: importData, isLoading: isImporting } = useAsync<
    ImportEmployeesDataResponse,
    { file: File; isImportConfirmed: boolean }
  >({
    requestFn: async (args: {
      file: File;
      isImportConfirmed: boolean;
    }): Promise<ImportEmployeesDataResponse> => {
      const { file, isImportConfirmed } = args;
      setGlobalLoading(true);
      return await importEmployeesData(file, isImportConfirmed);
    },
    onSuccess: (response, params) => {
      if (!params) {
        return;
      }
      const { isImportConfirmed } = params;

      if (!isImportConfirmed) {
        const data = response.data.message;
        setGlobalLoading(false);
        setOpenConfirmationDialog(true);
        const parsedData = JSON.parse(data);
        setValidationResult(parsedData);
        return;
      }

      toast.success(response.data.message);
      resetInputValue();
      onImportSuccess();
      setOpenConfirmationDialog(false);
      setValidationResult(null);
    },
    onError: (err) => {
      methods.throwApiError(err);
      resetInputValue();
      setGlobalLoading(false);
      setOpenConfirmationDialog(false);
    },
  });

  return (
    <Box>
      <VisuallyHiddenInput
        ref={fileInputRef}
        type="file"
        accept=".xls, .xlsx"
        onChange={handleFileChange}
      />
      <Tooltip title="Import">
        <IconButton loading={isImporting} onClick={handleFileClick}>
          <FileUploadIcon />
        </IconButton>
      </Tooltip>
      {/* <LoadingButton
        loading={isImporting}
        startIcon={<FileUploadIcon />}
        onClick={handleFileClick}
      >
        {!isImporting ? "Import" : "Uploading..."}
      </LoadingButton> */}
      {validationResult && (
        <ImportConfirmationDialog
          data={validationResult}
          open={openConfirmationDialog}
          onClose={() => {
            resetInputValue();
            setOpenConfirmationDialog(false);
            setValidationResult(null);
          }}
          onConfirm={() => {
            const files = fileInputRef.current?.files;
            const file = files?.[0] || null;
            if (!file) {
              return;
            }

            importData({ file: file, isImportConfirmed: true });
          }}
        />
      )}
    </Box>
  );
};
