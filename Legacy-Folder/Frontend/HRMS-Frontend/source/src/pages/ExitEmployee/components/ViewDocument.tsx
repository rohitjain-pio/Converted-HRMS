import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import methods from "@/utils";
import { DownloadDocumentApiResponse, getDocumnentUrl } from "@/services/User";
import useAsync from "@/hooks/useAsync";
import { toast } from "react-toastify";
import {
  No_Permission_To_View_Attachment,
  View_Attachment,
} from "@/utils/messages";
import FilePreview from "@/components/FilePreview";

type ViewDocumentProps = {
  containerType: number;
  filename: string;
  hasPreviewPermission?: boolean;
};

const ViewDocument: React.FC<ViewDocumentProps> = ({
  containerType,
  filename,
  hasPreviewPermission = true,
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { execute: previewDocument } = useAsync<DownloadDocumentApiResponse>({
    requestFn: async () => {
      return await getDocumnentUrl(containerType, filename);
    },
    onSuccess: ({ data }) => {
      if (data.result) {
        setDocumentUrl(data.result);
        setPreviewOpen(true);
      } else {
        toast.error("Document URL not found");
      }
    },
    onError: (error) => {
      methods.throwApiError(error);
    },
    autoExecute: false,
  });

  const handlePreviewDocument = async () => {
    if (!filename) {
      toast.error("File name is not available");
      return;
    }

    const fileExt = filename.split(".").pop();
    if (!fileExt) {
      toast.error("Invalid file");
      return;
    }

    await previewDocument();
  };

  return (
    <>
      <Tooltip
        title={
          !hasPreviewPermission
            ? No_Permission_To_View_Attachment
            : View_Attachment
        }
        arrow
      >
        <span>
          <IconButton color="primary" onClick={handlePreviewDocument}>
            {!hasPreviewPermission ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </span>
      </Tooltip>

      {documentUrl && previewOpen && (
        <FilePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileName={filename}
          fileUrl={documentUrl}
        />
      )}
    </>
  );
};

export default ViewDocument;
