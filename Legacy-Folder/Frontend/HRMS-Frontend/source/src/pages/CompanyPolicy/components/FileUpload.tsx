import React, { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Box,
  Button,
  FormHelperText,
  IconButton,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import {
  Attachment,
  CloudUploadOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import { useFieldError } from "@/hooks/useFieldError";

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

interface FileUploadProps {
  name?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ name = "fileContent" }) => {
  const { control, watch, resetField } = useFormContext();
  const error = useFieldError(name);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedFile = watch(name) as File | undefined;

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange =
    (onChange: (file: File | null) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      const file = files?.[0] || null;
      onChange(file);
    };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    resetField(name);
  };

  return (
    <>
      <Button
        component="label"
        role=""
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadOutlined />}
        onClick={handleFileClick}
      >
        Upload file
      </Button>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange } }) => (
          <>
            <VisuallyHiddenInput
              ref={fileInputRef}
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={handleFileChange(onChange)}
            />
            {error.isError && (
              <FormHelperText error sx={{ marginLeft: 0 }}>
                {error.message}
              </FormHelperText>
            )}
          </>
        )}
      />
      {selectedFile && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={1}
          gap={1}
          width={"100%"}
          borderRadius={0.5}
          sx={{
            "&:hover": {
              backgroundColor: "rgba(0 0 0 / 0.04)",
            },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            overflow="hidden"
            flexGrow={1}
          >
            <Attachment
              sx={{
                transform: "rotate(135deg)",
                fontSize: "16px",
                color: "rgba(0 0 0 / 0.45)",
              }}
            />
            <Tooltip title={selectedFile.name}>
              <Typography
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                flexGrow={1}
                mr={2}
                color={"rgba(0 0 0 / 0.88)"}
              >
                {selectedFile.name}
              </Typography>
            </Tooltip>
          </Box>
          <Tooltip title="Remove File">
            <IconButton
              onClick={removeFile}
              color="error"
              disableRipple
              sx={{ height: "16px", width: "24px", padding: "0" }}
            >
              <DeleteOutline sx={{ fontSize: "16px" }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </>
  );
};

export default FileUpload;
