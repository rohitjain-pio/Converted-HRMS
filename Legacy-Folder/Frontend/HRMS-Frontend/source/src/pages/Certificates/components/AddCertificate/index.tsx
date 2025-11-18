import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useUserStore } from "@/store";
import {
  addCertificate,
  AddCertificateArgs,
  AddCertificateResponse,
  CertificateType,
  getCertificateById,
  GetCertificateByIdResponse,
  updateCertificate,
  UpdateCertificateArgs,
} from "@/services/Certificates";
import moment from "moment";
import { onCloseHandler } from "@/utils/dialog";
import { useSearchParams } from "react-router-dom";
import { CertificateFormData, getValidationSchema } from "./validationSchema";
import CertificateDialog from "./CertificateDialog";
interface AddCertificateProps {
  open: boolean;
  onClose: () => void;
  certificateId: number;
  existingCertificates: string[];
  currentCertificate: string;
}

const AddCertificate = ({
  open,
  onClose,
  certificateId,
  existingCertificates,
  currentCertificate,
}: AddCertificateProps) => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [certificateData, setCertificateData] = useState<CertificateType>();
  const validationSchema = getValidationSchema(
    certificateId && certificateData?.fileName ? false : true,
    existingCertificates,
    currentCertificate
  );
  const method = useForm<CertificateFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      certificateName: "",
      certificateExpiry: null,
      file: null,
    },
  });
  const {  reset, setValue } = method;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { isLoading } = useAsync<GetCertificateByIdResponse, number>({
    requestFn: async (id: number): Promise<GetCertificateByIdResponse> => {
      return await getCertificateById(id);
    },
    onSuccess: (response) => {
      const { certificateName, certificateExpiry } = response?.data
        ?.result as CertificateType;
      setCertificateData(response?.data?.result);
      setValue("certificateName", certificateName);
      setValue(
        "certificateExpiry",
        certificateExpiry ? moment(certificateExpiry, "YYYY-MM-DD") : null
      );
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: certificateId as number | undefined,
    autoExecute: certificateId ? true : false,
  });

  const { execute: create, isLoading: isSaving } = useAsync<
    AddCertificateResponse,
    AddCertificateArgs
  >({
    requestFn: async (
      args: AddCertificateArgs
    ): Promise<AddCertificateResponse> => {
      return await addCertificate(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    AddCertificateResponse,
    UpdateCertificateArgs
  >({
    requestFn: async (
      args: UpdateCertificateArgs
    ): Promise<AddCertificateResponse> => {
      return await updateCertificate(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (data: CertificateFormData) => {
    if (certificateId) {
      update({
        Id: +certificateId,
        EmployeeId: employeeId ? +employeeId : +userData.userId,
        CertificateName: data.certificateName,
        CertificateExpiry: data.certificateExpiry
          ? moment(data.certificateExpiry).format("YYYY-MM-DD")
          : "",
        File: data.file || "",
      });
    } else {
      create({
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        CertificateName: data.certificateName,
        CertificateExpiry: data.certificateExpiry
          ? moment(data.certificateExpiry).format("YYYY-MM-DD")
          : "",
        File: data.file,
      });
    }
  };

  const handleResetForm = () => {
    if (certificateId) {
      const { certificateName, certificateExpiry } =
        certificateData as CertificateType;
      setValue("certificateName", certificateName);
      setValue(
        "certificateExpiry",
        certificateExpiry ? moment(certificateExpiry, "YYYY-MM-DD") : null
      );
    } else {
      reset();
    }
  };

  return (
    <CertificateDialog
      open={open}
      onClose={onClose}
      onCloseHandler={onCloseHandler}
      method={method}
      onSubmit={onSubmit}
      handleResetForm={handleResetForm}
      certificateId={certificateId}
      certificateData={certificateData}
      isLoading={isLoading}
      isSaving={isSaving}
      isUpdating={isUpdating}
    />
  );
};
export default AddCertificate;
