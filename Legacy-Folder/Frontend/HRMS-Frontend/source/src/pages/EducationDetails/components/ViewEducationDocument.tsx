import { toast } from "react-toastify";
import methods from "@/utils";
import { useState } from "react";
import FilePreview from "@/pages/CompanyPolicy/components/FilePreview";
import useAsync from "@/hooks/useAsync";
import { IconButton, Tooltip } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { DownloadEducationalDocumentApiResponse, downloadEducationDetailDocument } from "@/services/EducationDetails";
import { No_Permission_To_View_Attachment, View_Attachment } from "@/utils/messages";

interface ViewDocumentProps {
  fileName: string;
  hasPermission?: boolean;
}

const ViewEducationDocument = ({
  fileName,
  hasPermission = false,
}: ViewDocumentProps) => {
  const [byteArray, setByteArray] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    execute: previewEducationDocument,
    isLoading: previewDocument,
  } = useAsync<DownloadEducationalDocumentApiResponse>({
    requestFn: async (): Promise<DownloadEducationalDocumentApiResponse> => {
      return await downloadEducationDetailDocument(fileName);
    },
    onSuccess: (response) => {
      const fileContent = response.data.result;
      if (fileContent) {
        setByteArray(fileContent);
        setPreviewOpen(true);
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const handlePreviewDocument = async () => {
    if (!fileName) {
      toast.error("File name is not available");
      return;
    }
    if (fileName) {
      const fileExt = fileName?.split(".").pop();
      if (!fileExt) {
        toast.error("Invalid file");
        return;
      }
    }
    await previewEducationDocument();
  };

  return (
    <>
      {
        <Tooltip
          title={
            !hasPermission ? No_Permission_To_View_Attachment : View_Attachment
          }
          arrow
        >
          <span>
            <IconButton
              color="primary"
              onClick={handlePreviewDocument}
              disabled={previewDocument || !hasPermission}
            >
              {!hasPermission ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </span>
        </Tooltip>
      }
      {byteArray && previewOpen && (
        <FilePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          byteArray={byteArray}
          fileName={fileName}
          type="Education_Document"
        />
      )}
    </>
  );
};

export default ViewEducationDocument;
