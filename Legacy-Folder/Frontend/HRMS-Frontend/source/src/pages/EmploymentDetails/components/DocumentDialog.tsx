import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
} from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import { Close } from "@mui/icons-material";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import { EmployerDocumentTypeMap } from "@/utils/constants";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import { uploadPreviousEmployerDocument } from "@/services/EmploymentDetails/employmentDetailsService";
import { UploadPreviousEmployerDocumentApiResponse } from "@/services/EmploymentDetails";
import EmployerDocumentTypeSelect from "@/pages/EmploymentDetails/components/EmployerDocumentTypeSelect";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import { onCloseHandler } from "@/utils/dialog";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { fileValidation } from "@/utils/fileSchema";

const getValidationSchema = (existingDocuments: string[]) =>
  Yup.object().shape({
    employerDocumentTypeId: Yup.string()
      .required("Document type is required")
      .test(
        "unique-document-type",
        "This document type already exists",
        (value) => {
          if (!value) return false;
          return !existingDocuments.includes(value);
        }
      ),
    file: Yup.mixed<File>()
      .required("File is required")
      .test("fileValidation", fileValidation),
  });

type FormDataType = Yup.InferType<ReturnType<typeof getValidationSchema>>;

type DocumentDialogProps = {
  open: boolean;
  onClose: () => void;
  previousEmployerId: number;
  existingDocuments: string[];
};

const DocumentDialog = (props: DocumentDialogProps) => {
  const { open, onClose, previousEmployerId, existingDocuments } = props;
  const validationSchema = getValidationSchema(existingDocuments);
  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      employerDocumentTypeId: "",
      file: undefined,
    },
  });

  const { handleSubmit, reset } = method;

  const { execute: create, isLoading: isSaving } = useAsync<
    UploadPreviousEmployerDocumentApiResponse,
    FormData
  >({
    requestFn: async (
      args: FormData
    ): Promise<UploadPreviousEmployerDocumentApiResponse> => {
      return await uploadPreviousEmployerDocument(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      reset();
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (data: FormDataType) => {
    const formData = new FormData();
    formData.append("previousEmployerId", previousEmployerId.toString());

    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }
    create(formData);
  };

  const handleResetForm = () => {
    reset();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => onCloseHandler(reason, onClose)}
        maxWidth="sm"
        fullWidth
      >
        <PageHeader variant="h4" title="Add Previous Employer Document" />
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => {
            reset();
            onClose();
          }}
          aria-label="close"
          style={{ position: "absolute", right: 20, top: 8 }}
        >
          <Close />
        </IconButton>
        <FormProvider<FormDataType> {...method}>
          <DialogContent>
            <Box
              component="form"
              paddingY="30px"
              gap="30px"
              display="flex"
              flexDirection="column"
              onSubmit={handleSubmit(onSubmit)}
            >
              <FormInputGroup>
                <FormInputContainer md={6}>
                  <EmployerDocumentTypeSelect
                    documentFor={EmployerDocumentTypeMap.PREVIOUS}
                    required
                  />
                </FormInputContainer>
                <FormInputContainer>
                  <Grid display="flex" flexDirection="row" gap="5px">
                    <Box maxWidth="500px">
                      <FileUpload name="file" />
                    </Box>
                  </Grid>
                </FormInputContainer>
              </FormInputGroup>
              <Box display="flex" gap="15px" justifyContent="center">
                <DialogActions>
                  <SubmitButton loading={isSaving}>
                    {isSaving ? "Saving" : "Save"}
                  </SubmitButton>
                  <ResetButton onClick={handleResetForm} />
                </DialogActions>
              </Box>
            </Box>
          </DialogContent>
        </FormProvider>
      </Dialog>
      <GlobalLoader loading={isSaving} />
    </>
  );
};

export default DocumentDialog;
