import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  addUserDocument,
  AddUserDocumentArgs,
  AddUserDocumentResponse,
  UserDocumentType,
  getUserDocumentById,
  GetUserDocumentByIdResponse,
  UpdateUserDocumentArgs,
  updateUserDocument,
  GovtDocumentType,
} from "@/services/Documents";
import useAsync from "@/hooks/useAsync";
import { toast } from "react-toastify";
import methods from "@/utils";
import { useUserStore } from "@/store";
import moment from "moment";
import { onCloseHandler } from "@/utils/dialog";
import { useSearchParams } from "react-router-dom";
import AddUserDocumentForm from "./AddUserDocumentForm";
import {
  AddUserDocumentFormData,
  getValidationSchema,
} from "./validationSchema";

interface AddUserDocumentPopupProps {
  open: boolean;
  onClose: () => void;
  userDocumentId: number;
  existingDocTypes: string[];
  currentDocType: string;
}

const AddUserDocumentPopup = ({
  open,
  onClose,
  userDocumentId,
  existingDocTypes,
  currentDocType,
}: AddUserDocumentPopupProps) => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [userDocumentData, setUserDocumentData] = useState<UserDocumentType>();
  const [documentTypes, setDocumentTypes] = useState<GovtDocumentType[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<GovtDocumentType>();
  const validationSchema = getValidationSchema(
    userDocumentId && userDocumentData?.location ? false : true,
    documentTypes,
    existingDocTypes,
    currentDocType
  );
  const method = useForm<AddUserDocumentFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      documentTypeId: "",
      documentNumber: "",
      documentExpiry: undefined,
      file: null,
    },
  });
  const { reset, setValue, watch } = method;

  const selectedType = watch("documentTypeId");
  const selectedExpiry = watch("documentExpiry");

  useEffect(() => {
    const selected = documentTypes.find(
      (type) => type.id === parseInt(selectedType)
    );
    setSelectedDocumentType(selected);
    if (selected) {
      setValue(
        "documentExpiry",
        selected.isExpiryDateRequired ? selectedExpiry : undefined
      );
    }
  }, [selectedType, setValue, documentTypes, selectedExpiry]);

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { execute: create, isLoading: isSaving } = useAsync<
    AddUserDocumentResponse,
    AddUserDocumentArgs
  >({
    requestFn: async (
      args: AddUserDocumentArgs
    ): Promise<AddUserDocumentResponse> => {
      return await addUserDocument(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { isLoading } = useAsync<GetUserDocumentByIdResponse, number>({
    requestFn: async (id: number): Promise<GetUserDocumentByIdResponse> => {
      return await getUserDocumentById(id);
    },
    onSuccess: (response) => {
      const { documentTypeId, documentNumber, documentExpiry } = response?.data
        .result as UserDocumentType;
      setUserDocumentData(response?.data.result);
      setValue("documentTypeId", documentTypeId || "");
      setValue("documentNumber", documentNumber);
      setValue(
        "documentExpiry",
        documentExpiry ? moment(documentExpiry, "YYYY-MM-DD") : undefined
      );
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: userDocumentId as number | undefined,
    autoExecute: userDocumentId ? true : false,
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    AddUserDocumentResponse,
    UpdateUserDocumentArgs
  >({
    requestFn: async (
      args: UpdateUserDocumentArgs
    ): Promise<AddUserDocumentResponse> => {
      return await updateUserDocument(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (data: AddUserDocumentFormData) => {
    if (userDocumentId) {
      update({
        Id: Number(userDocumentId),
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        DocumentTypeId: +data.documentTypeId,
        DocumentNumber: data.documentNumber,
        DocumentExpiry: data.documentExpiry
          ? moment(data.documentExpiry).format("YYYY-MM-DD")
          : "",
        File: data.file || "",
      });
    } else {
      create({
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        DocumentTypeId: +data.documentTypeId,
        DocumentNumber: data.documentNumber,
        DocumentExpiry: data.documentExpiry
          ? moment(data.documentExpiry).format("YYYY-MM-DD")
          : "",
        File: data.file,
      });
    }
  };

  const handleResetForm = () => {
    if (userDocumentId) {
      const { documentTypeId, documentNumber, documentExpiry } =
        userDocumentData as UserDocumentType;
      setValue("documentTypeId", documentTypeId || "");
      setValue("documentNumber", documentNumber);
      setValue(
        "documentExpiry",
        documentExpiry ? moment(documentExpiry, "YYYY-MM-DD") : undefined
      );
    } else {
      reset();
    }
  };

  const handleApiResponse = (response: GovtDocumentType[]) => {
    setDocumentTypes(response);
  };

  return (
    <AddUserDocumentForm
      open={open}
      onClose={onClose}
      onCloseHandler={onCloseHandler}
      userDocumentId={userDocumentId}
      method={method}
      onSubmit={onSubmit}
      handleResetForm={handleResetForm}
      isLoading={isLoading}
      isSaving={isSaving}
      isUpdating={isUpdating}
      selectedDocumentType={selectedDocumentType}
      userDocumentData={userDocumentData}
      handleApiResponse={handleApiResponse}
    />
  );
};

export default AddUserDocumentPopup;
