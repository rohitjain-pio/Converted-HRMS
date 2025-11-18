import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useAsync from "@/hooks/useAsync/useAsync";
import {
  CompanyPolicyType,
  CreateCompanyPolicyArgs,
  CreateCompanyPolicyResponse,
  GetCompanyPolicyListByIdResponse,
  UpdateCompanyPolicyArgs,
  createCompanyPolicy,
  getCompanyPolicyById,
  updateCompanyPolicy,
} from "@/services/CompanyPolicies";
import methods from "@/utils";
import { useEffect, useState } from "react";
import { hasPermission } from "@/utils/hasPermission";
import { CompanyPolicyStatus, permissionValue } from "@/utils/constants";
import NotFoundPage from "@/pages/NotFoundPage";
import {
  CompanyPolicyFormData,
  getValidationSchema,
} from "./validationSchema";
import PolicyDocumentForm from "./CompanyPolicyForm";

export const EditCompanyPolicy = () => {
  const navigate = useNavigate();
  const { READ } = permissionValue.COMPANY_POLICY;
  const [companyPolicyData, setCompanyPolicyData] =
    useState<CompanyPolicyType>();
  const { id } = useParams<{ id: string }>();

  const isEditForm = Boolean(id);

  const [openConfirmEmailDialog, setOpenConfirmEmailDialog] = useState(false);

  const wouldSendEmail = (values: CompanyPolicyFormData) => {
    const active = Number(values.statusId) === CompanyPolicyStatus.Active;
    if (!values.emailRequest || !active) return false;
    return isEditForm ? formState.isDirty : true;
  };

  const { execute: create, isLoading: isSaving } = useAsync<
    CreateCompanyPolicyResponse,
    CreateCompanyPolicyArgs
  >({
    requestFn: async (
      args: CreateCompanyPolicyArgs
    ): Promise<CreateCompanyPolicyResponse> => {
      return await createCompanyPolicy(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      navigate("/company-policy");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const validationSchema = getValidationSchema(
    companyPolicyData?.fileName ? false : true
  );

  const { execute: update, isLoading: isUpdating } = useAsync<
    CreateCompanyPolicyResponse,
    UpdateCompanyPolicyArgs
  >({
    requestFn: async (
      args: UpdateCompanyPolicyArgs
    ): Promise<CreateCompanyPolicyResponse> => {
      return await updateCompanyPolicy(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      navigate("/company-policy");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const method = useForm<CompanyPolicyFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      documentCategoryId: "",
      statusId: "",
      description: "",
      accessibility: false,
      emailRequest: false,
      fileContent: null,
    },
    shouldUnregister: false,
  });

  const { control, handleSubmit, reset, formState, resetField, getValues } =
    method;

  const statusId = useWatch({ control, name: "statusId" });

  const isStatusActive = Number(statusId) === CompanyPolicyStatus.Active;

  const isStatusSelected = statusId !== "";

  const disableSendEmailRequest =
    (isEditForm && !formState.isDirty) || (isStatusSelected && !isStatusActive);

  useEffect(() => {
    if (disableSendEmailRequest && getValues("emailRequest")) {
      resetField("emailRequest", {
        defaultValue: false,
        keepDirty: false,
        keepTouched: false,
      });
    }
  }, [disableSendEmailRequest, getValues]);

  const { isLoading } = useAsync<GetCompanyPolicyListByIdResponse, number>({
    requestFn: async (
      id: number
    ): Promise<GetCompanyPolicyListByIdResponse> => {
      return await getCompanyPolicyById(id);
    },
    onSuccess: (response) => {
      setCompanyPolicyData(response?.data?.result);
      reset({
        name: response?.data?.result?.name || "",
        documentCategoryId:
          response?.data?.result?.documentCategoryId?.toString() || "",
        statusId: response?.data?.result?.statusId?.toString() || "",
        description: response?.data?.result?.description || "",
        accessibility: response?.data?.result?.accessibility || false,
        emailRequest: false,
      });
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: id as number | undefined,
    autoExecute: id && hasPermission(READ) ? true : false,
  });

  const onSubmit = (formValues: CompanyPolicyFormData) => {
    if (id) {
      update({
        Id: Number(id),
        Name: formValues.name,
        DocumentCategoryId: Number(formValues.documentCategoryId),
        StatusId: Number(formValues.statusId),
        Description: formValues.description,
        Accessibility: formValues.accessibility ?? false,
        FileContent: formValues.fileContent ?? "",
        EmailRequest: formValues.emailRequest ?? false,
      });
    } else {
      create({
        Name: formValues.name,
        DocumentCategoryId: Number(formValues.documentCategoryId),
        StatusId: Number(formValues.statusId),
        Description: formValues.description,
        Accessibility: formValues.accessibility ?? false,
        FileContent: formValues.fileContent ?? "",
        EmailRequest: formValues.emailRequest ?? false,
      });
    }
  };

  const onSubmitIntercept: SubmitHandler<CompanyPolicyFormData> = (
    formValues
  ) => {
    if (wouldSendEmail(formValues)) {
      setOpenConfirmEmailDialog(true);
      return;
    }

    onSubmit(formValues);
  };

  const handleCancelSendEmail = () => {
    setOpenConfirmEmailDialog(false);
  };

  const handleConfirmSendEmail = () => {
    setOpenConfirmEmailDialog(false);
    handleSubmit(onSubmit)();
  };

  const handleResetForm = () => {
    if (id) {
      const { name, documentCategoryId, statusId, description, accessibility } =
        companyPolicyData as CompanyPolicyType;
      reset({
        name: name || "",
        documentCategoryId: documentCategoryId || "",
        statusId: statusId || "",
        description: description || "",
        accessibility: accessibility || false,
        fileContent: null,
        emailRequest: false,
      });
    } else {
      reset();
    }
  };

  if (!hasPermission(READ)) {
    return <NotFoundPage />;
  }
  return (
    <PolicyDocumentForm
      id={id}
      method={method}
      isLoading={isLoading}
      isSaving={isSaving}
      isUpdating={isUpdating}
      disableSendEmailRequest={disableSendEmailRequest}
      companyPolicyData={companyPolicyData}
      onSubmitIntercept={onSubmitIntercept}
      handleResetForm={handleResetForm}
      openConfirmEmailDialog={openConfirmEmailDialog}
      handleCancelSendEmail={handleCancelSendEmail}
      handleConfirmSendEmail={handleConfirmSendEmail}
    />
  );
};
