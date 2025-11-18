import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import {
  downloadPolicyDocument,
  DownloadPolicyDocumentArgs,
  DownloadPolicyDocumentResponse,
} from "@/services/CompanyPolicies";
import methods from "@/utils";
import FilePreview from "@/pages/CompanyPolicy/components/FilePreview";
import { useState } from "react";
import { useUserStore } from "@/store";
import { IconButton, Tooltip } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { No_Permission_To_View_Attachment, View_Attachment } from "@/utils/messages";

interface ViewDocumentProps {
  companyPolicyId: number | string;
  fileName: string;
  fileOriginalName?: string;
  hasPermission?: boolean;
}

const ViewDocument = ({
  companyPolicyId,
  fileName,
  fileOriginalName,
  hasPermission = false,
}: ViewDocumentProps) => {
  const { userData } = useUserStore();
  const [byteArray, setByteArray] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const {
    execute: previewPolicyDocument,
    isLoading: previewDocument,
  } = useAsync<DownloadPolicyDocumentResponse, DownloadPolicyDocumentArgs>({
    requestFn: async (args: DownloadPolicyDocumentArgs): Promise<DownloadPolicyDocumentResponse> => {
      return await downloadPolicyDocument(args);
    },
    onSuccess: (response) => {
      const { fileContent } = response.data.result;
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
      toast.error("File name is not avaialble");
      return;
    }
    if (fileName) {
      const fileExt = fileName?.split(".").pop();
      if (!fileExt) {
        toast.error("Invalid file");
        return;
      }
    }
    await previewPolicyDocument({
      companyPolicyId,
      employeeId: Number(userData.userId),
      fileName,
    });
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
          fileOriginalName={fileOriginalName}
          type="Company_Policy"
        />
      )}
    </>
  );
};

export default ViewDocument;
