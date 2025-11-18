import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useProfileStore } from "@/store/useProfileStore";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { fileValidation } from "@/utils/fileSchema";
import { AddGrievanceRemarksPayload } from "@/services/Grievances";
import { GrievanceLevel, GrievanceStatus } from "@/utils/constants";
import { Card, CardContent, Divider, Typography } from "@mui/material";
import ProfilePicture from "@/pages/Profile/components/ProfilePicture";
import FormRichTextEditor from "@/components/RichTextEditor/FormRichTextEditor";
import { editorConfig } from "@/pages/Grievances/editorConfig";

const schema = Yup.object().shape({
  remarks: Yup.string().trim().required("Remark is required"),
  attachment: Yup.mixed<File>()
    .nullable()
    .defined()
    .test("fileValidation", fileValidation),
});

type FormValues = Yup.InferType<typeof schema>;

type Intent = "escalate" | "resolve";

export function ResponseComposerCard({
  onSubmit,
  level,
}: Readonly<{
  onSubmit: (args: Omit<AddGrievanceRemarksPayload, "ticketId">) => void;
  level: GrievanceLevel;
}>) {
  const { profileData } = useProfileStore();

  const isMaxEscalationLevel = level === GrievanceLevel.L3;

  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      remarks: "",
      attachment: null,
    },
  });

  const {
    formState: { isDirty, isSubmitting },
    reset,
    handleSubmit,
  } = method;

  const onFormSubmitWith: (intent: Intent) => SubmitHandler<FormValues> =
    (intent) => (values) => {
      onSubmit({
        remarks: values.remarks,
        attachment: values.attachment ?? "",
        status:
          intent === "escalate"
            ? GrievanceStatus.Escalated
            : GrievanceStatus.Resolved,
      });
      reset();
    };

  return (
    <Card
      variant="outlined"
      component="section"
      aria-label="Add your response"
      sx={{ mb: 2, borderRadius: 2 }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" useFlexGap>
          <ProfilePicture
            userName={profileData.userName}
            size={40}
            profileImageUrl={profileData.profileImageUrl}
          />
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }} useFlexGap>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.5, sm: 1 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              useFlexGap
            >
              <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                Your Reply
              </Typography>
            </Stack>

            <Divider />

            <Box sx={{ mt: 1 }}>
              <FormProvider {...method}>
                <Stack
                  component="form"
                  autoComplete="off"
                  spacing={3}
                  useFlexGap
                >
                  <FormRichTextEditor
                    name="remarks"
                    editorConfig={editorConfig}
                  />
                  <Box maxWidth="500px">
                    <FileUpload name="attachment" />
                  </Box>
                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1.5}
                    useFlexGap
                  >
                    <Button
                      variant="contained"
                      color="inherit"
                      sx={{
                        minWidth: { xs: "100%", sm: 120 },
                        fontWeight: 500,
                      }}
                      disabled={!isDirty || isSubmitting}
                      onClick={() => reset()}
                    >
                      Clear
                    </Button>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                      spacing={1.5}
                      useFlexGap
                    >
                      {!isMaxEscalationLevel ? (
                        <Button
                          type="button"
                          variant="outlined"
                          color="warning"
                          onClick={handleSubmit(onFormSubmitWith("escalate"))}
                          disabled={!isDirty || isSubmitting}
                          sx={{
                            minWidth: { xs: "100%", sm: 120 },
                            fontWeight: 500,
                          }}
                        >
                          Escalate
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit(onFormSubmitWith("resolve"))}
                        disabled={!isDirty || isSubmitting}
                        sx={{
                          minWidth: { xs: "100%", sm: 120 },
                          fontWeight: 500,
                        }}
                      >
                        Resolve
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </FormProvider>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
