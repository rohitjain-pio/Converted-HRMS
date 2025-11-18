import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  AddCertificateArgs,
  AddCertificateResponse,
  DeleteCertificateArgs,
  DeleteCertificateDetailApiResponse,
  DownloadCertificateDocumentResponse,
  GetCertificateByIdResponse,
  GetCertificateListArgs,
  GetCertificateListResponse,
  UpdateCertificateArgs,
} from "@/services/Certificates/types";

const baseRoute = "/UserProfile";

export const getCertificateList = async (payload: GetCertificateListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetEmployeeCerificateList`,
    payload
  ) as Promise<GetCertificateListResponse>;
};

export const addCertificate = async (args: AddCertificateArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/UploadEmployeeCertificate`,
    formData
  ) as Promise<AddCertificateResponse>;
};

export const getCertificateById = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GetUserCertificateById/${id}`
  ) as Promise<GetCertificateByIdResponse>;
};

export const updateCertificate = async (args: UpdateCertificateArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/UpdateUploadEmployeeCertificate`,
    formData
  ) as Promise<AddCertificateResponse>;
};

export const downloadCertificateDocument = async (fileName: string) => {
  return httpInstance.get(
    `${baseRoute}/DownloadCertificateDocument?fileName=${fileName}`
  ) as Promise<DownloadCertificateDocumentResponse>;
};

export const deleteCertificateDetail = async (payload: DeleteCertificateArgs) => {
  const config = {
    data: payload
  }
  return httpInstance.delete(
    `${baseRoute}/ArchiveUnarchiveUserCertificates`, config
  ) as Promise<DeleteCertificateDetailApiResponse>;
};