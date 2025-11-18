import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormProvider, useForm } from "react-hook-form";
import * as Yup from "yup";
import { supportQuerySchema } from "./validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import FormSelectField from "@/components/FormSelectField";
import { BUG_TYPE_OPTIONS } from "@/utils/constants";
import FormTextField from "@/components/FormTextField";
import Grid from "@mui/material/Grid2";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import { useUserStore } from "@/store";
import { AddFeedBackRequestArgs } from "@/services/Support/types";

interface props {
  open: boolean;
  onClose: () => void;
  add: (params?: AddFeedBackRequestArgs | undefined) => Promise<void>;
  isLoading: boolean;
}
type FormValues = Yup.InferType<typeof supportQuerySchema>;

export const FeedBackDialog = ({ open, onClose, add, isLoading }: props) => {
  const { userData } = useUserStore();
  const { firstName, lastName, userEmail, userId } = userData;
  const userName = `${firstName} ${lastName}`;
  const method = useForm<FormValues>({
    resolver: yupResolver(supportQuerySchema),
    defaultValues: {
      attachment: null,
      bugType: "",
      subject: "",
      description: "",
    },
  });
  const { handleSubmit } = method;
  const onSubmit = (data: FormValues) => {
    add({
      attachment: data?.attachment ?? "",
      employeeId: Number(userId),
      feedbackType: Number(data?.bugType),
      subject: data?.subject,
      description: data?.description,
    });
  };
  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxHeight: "90%",
          },
        },
      }}
    >
      <FormProvider<FormValues> {...method}>
        <Box
          component="form"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", p: 2 }}>
            <Typography
              sx={{ alignSelf: "center", color: "#273A50", flex: 1 }}
              variant="h4"
            >
              Send Support Query
            </Typography>
            <Stack direction="row" gap={1.5} mr={-1}>
              <IconButton color="inherit" onClick={onClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={4}>
                <TextField
                  label="Name"
                  value={userName}
                  disabled
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      cursor: "not-allowed",
                    },
                  }}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Email"
                  value={userEmail}
                  disabled
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      cursor: "not-allowed",
                    },
                  }}
                />
              </Grid>
              <Grid size={4}>
                <FormSelectField
                  label="Bug Type"
                  name="bugType"
                  options={BUG_TYPE_OPTIONS}
                  labelKey="label"
                  valueKey="value"
                  required
                />
              </Grid>

              <Grid size={12}>
                <FormTextField label="Subject" name="subject" required />
              </Grid>
              <Grid size={12}>
                <FormTextField
                  label="Description"
                  name="description"
                  multiline
                  required
                  maxLength={600}
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
                  <SubmitButton loading={isLoading} />
                  <ResetButton />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </Box>
      </FormProvider>
    </Dialog>
  );
};
