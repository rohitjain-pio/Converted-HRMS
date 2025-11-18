import PageHeader from "@/components/PageHeader/PageHeader";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import CategorySelect from "@/pages/CompanyPolicy/components/CategorySelect";
import {
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  useForm,
  FormProvider,
  Controller,
  useWatch,
  SubmitHandler,
} from "react-hook-form";
import ResetButton from "@/components/ResetButton/ResetButton";
import { useNavigate, useParams } from "react-router-dom";
import StatusSelect from "@/pages/CompanyPolicy/components/StatusSelect";
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
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import { useEffect, useState } from "react";
import ViewDocument from "@/pages/CompanyPolicy/components/ViewDocument";
import { hasPermission } from "@/utils/hasPermission";
import { CompanyPolicyStatus, permissionValue } from "@/utils/constants";
import NotFoundPage from "@/pages/NotFoundPage";
import BreadCrumbs from "@/components/@extended/Router";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { regex } from "@/utils/regexPattern";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { fileValidation } from "@/utils/fileSchema";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const {
  notOnlyNumbers,
  nameMaxLength_50,
  nameMaxLength_250,
  minCharactersExist,
} = regex;

const getValidationSchema = (isFileRequired: boolean) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
        if (!value) return true;
        return notOnlyNumbers.pattern.test(value);
      })
      .test(minCharactersExist.key, minCharactersExist.message, (value) => {
        if (!value) return true;
        return (value.match(minCharactersExist.pattern) || []).length >= 2;
      })
      .max(nameMaxLength_50.number, nameMaxLength_50.message)
      .required("Name is required"),
    documentCategoryId: Yup.string().required("Category is required"),
    statusId: Yup.string().required("Status is required"),
    description: Yup.string()
      .max(nameMaxLength_250.number, nameMaxLength_250.message)
      .required("Description is required"),
    accessibility: Yup.boolean(),
    emailRequest: Yup.boolean().defined(),
    fileContent: isFileRequired
      ? Yup.mixed<File>()
          .required("File is required")
          .test("fileValidation", fileValidation)
      : Yup.mixed<File>().notRequired().test("fileValidation", fileValidation),
  });

type CompanyPolicyFormData = Yup.InferType<
  ReturnType<typeof getValidationSchema>
>;

export const EditCompanyPolicy = () => {
  const navigate = useNavigate();
  const { VIEW, READ } = permissionValue.COMPANY_POLICY;
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
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          title={`${id ? "Edit" : "Add"} Policy Documents`}
          goBack={true}
        />
        {!isLoading ? (
          <Box paddingX="20px">
            <FormProvider<CompanyPolicyFormData> {...method}>
              <form
                autoComplete="off"
                onSubmit={handleSubmit(onSubmitIntercept)}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    paddingY: "20px",
                    gap: "20px",
                  }}
                >
                  <Grid container spacing={"20px"}>
                    <Grid item sm={6} xs={12}>
                      <FormTextField name="name" label="Name" required />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <CategorySelect required={true} />
                    </Grid>
                  </Grid>
                  <Box>
                    <StatusSelect required={true} />
                  </Box>
                  <Box>
                    <FormTextField
                      name="description"
                      label="Description"
                      multiline
                      maxLength={600}
                      rows={5}
                      required
                    />
                  </Box>
                  <Box maxWidth="500px">
                    <Controller
                      name="accessibility"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                              }}
                            />
                          }
                          label="Accessibility"
                        />
                      )}
                    />
                  </Box>
                  <Box maxWidth="500px">
                    <Controller
                      name="emailRequest"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                              }}
                              disabled={disableSendEmailRequest}
                            />
                          }
                          label="Notify via Email"
                        />
                      )}
                    />
                  </Box>
                  <Grid display="flex" flexDirection="row" gap="5px">
                    <Box maxWidth="500px">
                      <FileUpload />
                    </Box>
                    {id && (
                      <Box maxWidth="500px" sx={{ ml: 1 }}>
                        <ViewDocument
                          companyPolicyId={id}
                          fileName={companyPolicyData?.fileName as string}
                          fileOriginalName={
                            companyPolicyData?.fileOriginalName as string
                          }
                          hasPermission={hasPermission(VIEW)}
                        />
                      </Box>
                    )}
                  </Grid>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    paddingBottom: "20px",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <SubmitButton loading={isSaving || isUpdating}>
                    {isSaving
                      ? "Saving"
                      : isUpdating
                        ? "Updating"
                        : id
                          ? "Update"
                          : "Save"}
                  </SubmitButton>
                  <ResetButton onClick={handleResetForm} />
                </Box>
              </form>
            </FormProvider>
          </Box>
        ) : (
          <Box
            height={"calc(100vh - 80px)"}
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
      <ConfirmationDialog
        open={openConfirmEmailDialog}
        onClose={handleCancelSendEmail}
        onConfirm={handleConfirmSendEmail}
        title="Send Email Notification?"
        content="You are about to send an email notification to affected users when you save these changes. This may notify a large audience. Are you sure you want to proceed?"
        confirmBtnColor="primary"
      />
      <GlobalLoader loading={isSaving || isUpdating} />
    </>
  );
};
