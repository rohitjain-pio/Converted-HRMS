import {
  Box,
  CircularProgress,
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

const enableDocumentDownload = false;

interface FilePreviewProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string; // <-- updated prop
  fileName: string;
  fileOriginalName?: string;
  type?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  open,
  onClose,
  fileUrl,
  fileName,
  fileOriginalName,
}) => {
  const [fileType, setFileType] = useState<
    "pdf" | "png" | "jpg" | "jpeg" | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { type } = getMimeType(fileName);
    setFileType(type);
  }, [fileName]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileOriginalName || fileName;
    link.click();
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
        },
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
          position: "relative",
        }}
      >
        {/* Loading state */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
              zIndex: 1,
            }}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography sx={{ mt: 3, mb: 2 }}>Loading document...</Typography>
          </Box>
        )}

        {fileUrl && fileType ? (
          fileType === "pdf" ? (
            <iframe
              src={`${fileUrl}#toolbar=0&view=FitH`}
              height="100%"
              width="100%"
              style={{
                border: "none",
                flex: 1,
                display: loading ? "none" : "block",
              }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          ) : (
            <img
              src={fileUrl}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: loading ? "none" : "block",
                margin: "auto",
              }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
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
