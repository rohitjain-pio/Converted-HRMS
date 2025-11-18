import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import * as Yup from "yup";
import { useForm, Controller, FormProvider, useWatch } from "react-hook-form";
import FormTextField from "@/components/FormTextField";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useNavigate, useParams } from "react-router-dom";
import {
  AddorUpdateNotificationTemplateRequest,
  AddorUpdateNotificationTemplateResponse,
  EmailTemplate,
  GetDefaultNotFicationTemplateById,
  GetNotFicationTemplateById,
} from "@/services/Notification/type";
import {
  addNotificationTemplate,
  getDefaultTemplate,
  getNotifictionTemplateById,
  updateNotificationTemplate,
} from "@/services/Notification/notificationService";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import FormTextEditor from "@/pages/Email/components/FormTextEditor/FormTextEditor";
import BreadCrumbs from "@/components/@extended/Router";
import { yupResolver } from "@hookform/resolvers/yup";
import { EMAIL_TEMPLATE_OPTIONS } from "@/utils/constants";
import EmailTemplateTypeAutoComplete from "./EmailTemplateAutoComplete";

const defaultValues = {
  type: 1,
  templateName: "",
  subject: "",
  // to:  string,
  cc: "",
  bcc: "",
  isSelected: false,
  body: "",
  senderEmail: "",
  senderName: "",
};

interface EmailTemplateFormProps {
  mode: "add" | "edit";
}

const emailTemplateSchema = Yup.object().shape({
  type: Yup.number().required("Template type is required"),
  templateName: Yup.string().required("Template name is required"),
  subject: Yup.string().required("Subject is required"),
  cc: Yup.string().default(""),
  bcc: Yup.string().default(""),
  isSelected: Yup.boolean().default(false),
  body: Yup.string().required("Mail body is required"),
  senderEmail: Yup.string().required("Sender email is required"),
  senderName: Yup.string().required("Sender name is required"),
});

export default function EmailTemplates({ mode }: EmailTemplateFormProps) {
  const { id } = useParams();
  const method = useForm({
    defaultValues,
    resolver: yupResolver(emailTemplateSchema),
  });
  const navigate = useNavigate();
  const { control, handleSubmit, reset } = method;

  const [email, setEmail] = useState<EmailTemplate>();
  const { execute: fetchNotification, isLoading: getLoading } =
    useAsync<GetNotFicationTemplateById>({
      requestFn: async (): Promise<GetNotFicationTemplateById> => {
        return await getNotifictionTemplateById(Number(id));
      },
      onSuccess: ({ data }) => {
        const { result } = data;
        setEmail(result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { execute: fetchDefaultNotification, isLoading: defaultLoading } =
    useAsync<GetDefaultNotFicationTemplateById, number>({
      requestFn: async (
        type: number
      ): Promise<GetDefaultNotFicationTemplateById> => {
        return await getDefaultTemplate(Number(type));
      },
      onSuccess: ({ data }) => {
        const { result } = data;
        setEmail(result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });
  useEffect(() => {
    if (mode == "edit") {
      fetchNotification();
    }
  }, []);

  const { execute: add, isLoading: addLoading } = useAsync<
    AddorUpdateNotificationTemplateResponse,
    AddorUpdateNotificationTemplateRequest
  >({
    requestFn: async (
      args: AddorUpdateNotificationTemplateRequest
    ): Promise<AddorUpdateNotificationTemplateResponse> => {
      return await addNotificationTemplate(args);
    },
    onSuccess: () => {
      toast.success("Template Added Successfully");
      navigate(-1);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: update, isLoading: updateLoading } = useAsync<
    AddorUpdateNotificationTemplateResponse,
    AddorUpdateNotificationTemplateRequest
  >({
    requestFn: async (
      args: AddorUpdateNotificationTemplateRequest
    ): Promise<AddorUpdateNotificationTemplateResponse> => {
      return await updateNotificationTemplate(args);
    },
    onSuccess: () => {
      toast.success("Template Updated Successfully");
      navigate(-1);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    if (email) {
      reset({
        type: email.type,
        templateName: email.templateName,
        subject: email.subject ?? "",
        // to: email.toEmail??"",
        cc: email.ccEmails ?? "",
        bcc: email.bccEmails ?? "",
        isSelected: false,
        body: email.content ?? "",
        senderEmail: email.senderEmail ?? "",
        senderName: email.senderName ?? "",
      });
    }
  }, [email]);
  const onSubmit = (data: typeof defaultValues) => {
    const payload: AddorUpdateNotificationTemplateRequest = {
      templateName: data.templateName,
      bccEmails: data.bcc,
      ccEmails: data.cc,
      id: data.isSelected || mode == "edit" ? Number(email?.id) : 0,
      subject: data.subject,
      content: data.body,
      type: data.type,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
    };
    if (data.isSelected || mode == "edit") {
      update(payload);
    } else {
      add(payload);
    }
  };

  const selectedType = useWatch({
    control,
    name: "type",
  });

  useEffect(() => {
    if (mode === "add" && selectedType !== undefined && selectedType !== null) {
      fetchDefaultNotification(selectedType);
    }
  }, [selectedType, mode]);

  return (
    <FormProvider {...method}>
      <BreadCrumbs />
      <Paper elevation={2} sx={{ p: 4 }}>
        <PageHeader variant="h2" title="Email Template" hideBorder />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <Stack spacing={3}>
            <FormInputGroup>
              <FormInputContainer md={6}>
                <EmailTemplateTypeAutoComplete
                  label="Template type"
                  name="type"
                  templateType={EMAIL_TEMPLATE_OPTIONS}
                  disabled={mode === "edit"}
                />
              </FormInputContainer>

              <FormInputContainer md={6}>
                <FormTextField
                  label="template Name"
                  name="templateName"
                  required
                />
              </FormInputContainer>

              <FormInputContainer md={12}>
                <FormTextField label="Sender Name" name="senderName" required />
              </FormInputContainer>

              <FormInputContainer md={12}>
                <FormTextField name="subject" label="Subject" required />
              </FormInputContainer>
              <FormInputContainer md={12}>
                <FormTextField
                  name="senderEmail"
                  label="Sender Email"
                  required
                />
              </FormInputContainer>

              {/* <FormInputContainer md={12}>
                <EmailAutocomplete name="to" label="To" />
              </FormInputContainer> */}

              <FormInputContainer md={12}>
                <FormTextField name="cc" label="CC" />
              </FormInputContainer>

              <FormInputContainer md={12}>
                <FormTextField name="bcc" label="BCC" />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer md={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Mail Body
                </Typography>

                <FormTextEditor name="body" />
              </FormInputContainer>
            </FormInputGroup>
            {mode == "add" && (
              <FormInputContainer md={12}>
                <Controller
                  name="isSelected"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Select this template"
                    />
                  )}
                />
              </FormInputContainer>
            )}

            <Box display="flex" justifyContent="center" gap={2}>
              <SubmitButton loading={addLoading || updateLoading}>
                Save
              </SubmitButton>
              <ResetButton />
            </Box>
          </Stack>
        </Box>
      </Paper>
      <GlobalLoader loading={getLoading || defaultLoading} />
    </FormProvider>
  );
}
