import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import * as Yup from "yup";
import { regex } from "@/utils/regexPattern";
import { fileValidation } from "@/utils/fileSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import useAsync from "@/hooks/useAsync";
import {
  submitGrievance,
  SubmitGrievancePayload,
  SubmitGrievanceResponse,
} from "@/services/Grievances";
import methods from "@/utils";
import { useUserStore } from "@/store";
import GrievanceTypeSelect from "./components/GrievanceTypeSelect";
import FormTextField from "@/components/FormTextField";
import LabelValue from "@/components/LabelValue";
import FormRichTextEditor from "@/components/RichTextEditor/FormRichTextEditor";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import { editorConfig } from "./editorConfig";
import { useState } from "react";
import GrievanceSubmissionSuccessDialog from "./components/GrievanceSubmissionSuccessDialog";
import FileUpload from "../CompanyPolicy/components/FileUpload";

const { nameMaxLength_100 } = regex;

const formSchema = Yup.object().shape({
  grievanceTypeId: Yup.string().required("Grievance type is required"),
  title: Yup.string()
    .trim()
    .max(nameMaxLength_100.number, nameMaxLength_100.message)
    .required("Title is required"),
  description: Yup.string().trim().required("Description is required"),
  attachment: Yup.mixed<File>()
    .nullable()
    .defined()
    .test("fileValidation", fileValidation),
});

type FormValues = Yup.InferType<typeof formSchema>;

const AddGrievancePage = () => {
  const { userData } = useUserStore();

  const [createdGrievanceDialog, setCreatedGrievanceDialog] = useState<{
    grievanceId: number;
    ticketNo: string;
  } | null>(null);

  const method = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      grievanceTypeId: "",
      title: "",
      description: "",
      attachment: null,
    },
  });

  const { handleSubmit, reset } = method;

  const handleReset = () => {
    reset();
  };

  const { execute: addGrievance, isLoading: isSubmitting } = useAsync<
    SubmitGrievanceResponse,
    SubmitGrievancePayload
  >({
    requestFn: async (
      payload: SubmitGrievancePayload
    ): Promise<SubmitGrievanceResponse> => {
      return await submitGrievance(payload);
    },
    onSuccess: ({ data }) => {
      handleReset();
      setCreatedGrievanceDialog({
        grievanceId: data.result.id,
        ticketNo: data.result.ticketNo,
      });
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    addGrievance({
      employeeId: +userData.userId,
      grievanceTypeId: +values.grievanceTypeId,
      title: values.title,
      description: values.description,
      attachment: values.attachment ?? "",
    });
  };

  return (
    <Box>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="Add Grievance" />
        <FormProvider<FormValues> {...method}>
          <Stack
            component="form"
            autoComplete="off"
            padding="30px"
            gap="30px"
            useFlexGap
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <GrievanceTypeSelect
                  label="Grievance Type"
                  name="grievanceTypeId"
                  isEditable
                  required
                />
              </Grid>
              <Grid size={12}>
                <FormTextField label="Title" name="title" required />
              </Grid>
              <Grid size={12}>
                <Box mb={1}>
                  <LabelValue label="Description" value={undefined} />
                </Box>
                <FormRichTextEditor
                  name="description"
                  editorConfig={editorConfig}
                />
              </Grid>
              <Grid size={12}>
                <FileUpload name="attachment" />
              </Grid>
              <Grid size={12} sx={{ pt: 2 }}>
                <Stack
                  direction="row"
                  sx={{ gap: 2, justifyContent: "center" }}
                >
                  <SubmitButton loading={isSubmitting} />
                  <ResetButton onClick={handleReset} />
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </FormProvider>
      </Paper>
      {!!createdGrievanceDialog && (
        <GrievanceSubmissionSuccessDialog
          open={!!createdGrievanceDialog}
          data={createdGrievanceDialog}
        />
      )}
    </Box>
  );
};

export default AddGrievancePage;
