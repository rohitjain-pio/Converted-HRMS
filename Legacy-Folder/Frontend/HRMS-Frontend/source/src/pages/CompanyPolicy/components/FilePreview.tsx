import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { onCloseHandler } from "@/utils/dialog";

function base64ToBlob(
  base64: string,
  contentType = "application/octet-stream"
) {
  const byteChars = atob(base64);
  const len = byteChars.length;
  const byteArr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    byteArr[i] = byteChars.charCodeAt(i);
  }
  return new Blob([byteArr], { type: contentType });
}

function getMimeType(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return { mimeType: "application/pdf", type: ext };
    case "png":
      return { mimeType: "image/png", type: ext };
    case "jpg":
    case "jpeg":
      return { mimeType: "image/jpeg", type: ext };
    default:
      return { mimeType: "", type: null };
  }
}

// Download button hidden per current requirement.
// Remove or update this when download functionality is reinstated.
const enableDocumentDownload = false;

interface FilePreviewProps {
  open: boolean;
  onClose: () => void;
  byteArray: string;
  fileName: string;
  fileOriginalName?: string;
  type?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  open,
  onClose,
  byteArray,
  fileName,
  fileOriginalName,
  type = "Document",
}) => {
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [fileType, setFileType] = useState<
    "pdf" | "png" | "jpg" | "jpeg" | null
  >(null);

  useEffect(() => {
    const { mimeType, type } = getMimeType(fileName);
    setFileType(type);
    if (!mimeType) {
      return;
    }

    const blob = base64ToBlob(byteArray, mimeType);
    const url = URL.createObjectURL(blob);
    setFileSrc(url);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [byteArray, fileName]);

  const handleDownload = () => {
    const fileExt = fileName.split(".").pop();
    const link = document.createElement("a");
    if (fileSrc) {
      link.href = fileSrc;
      link.download = fileOriginalName || `${type}.${fileExt}`;
      link.click();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => onCloseHandler(reason, onClose)}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            height: "80%",
            display: "flex",
            flexDirection: "column",
          },
        }
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Typography
          sx={{ alignSelf: "center", color: "#273A50", flex: 1 }}
          variant="h4"
        >
          File Preview
        </Typography>
        <Stack direction="row" gap={1.5} mr={-1}>
          {enableDocumentDownload && (
            <IconButton color="primary" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
          flex: 1,
          display: "flex",
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {fileSrc && fileType ? (
          fileType === "pdf" ? (
            <iframe
              src={`${fileSrc}#toolbar=0&view=FitH`}
              height="100%"
              width="100%"
              style={{ border: "none", flex: 1 }}
            />
          ) : (
            <img
              src={fileSrc}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
                margin: "auto",
              }}
            />
          )
        ) : (
          <Typography align="center">Loading...</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
