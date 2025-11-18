import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { FormProvider, useForm } from "react-hook-form";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import FormSelectField from "@/components/FormSelectField";
import { FEEDBACK_STATUS_OPTIONS } from "@/utils/constants";
import FormTextField from "@/components/FormTextField";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { FeedbackTicket, UpdateStatusFeedBackArgs } from "@/services/Support";
import { useEffect } from "react";

interface props {
  open: boolean;
  onClose: () => void;
  updateStatus: (params?: UpdateStatusFeedBackArgs | undefined) => Promise<void>
  id: number | undefined;
  details: FeedbackTicket | undefined
}
export const UpdateStatusDialog = ({
  open,
  onClose,
  details,
  id,
  updateStatus,
}: props) => {
  const validationSchema = Yup.object().shape({
    status: Yup.string().required("Status Type is required"),
    comment: Yup.string().required("Comment is required"),
  });
  type FormValues = Yup.InferType<typeof validationSchema>;

  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      status:details?.ticketStatus?String(details?.ticketStatus):"",
      comment: details?.adminComment?details.adminComment:"",
    },
  });
  useEffect(()=>{
    reset(({
      status:String(details?.ticketStatus),
      comment:details?.adminComment?details.adminComment:""
    }))
  },[details])

  const { handleSubmit,reset } = method;
  const onSubmit = (data: FormValues) => {
    updateStatus({
      AdminComment: data.comment,
      ticketStatus: Number(data.status),
      id: Number(id),
    });
  };
  return (
    <>
      <Dialog
        open={open}
        maxWidth="md"
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
                Edit Support Query Status
              </Typography>
              <Stack direction="row" gap={1.5} mr={-1}>
                <IconButton
                  color="inherit"
                  onClick={onClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <FormSelectField
                    label="Status"
                    name="status"
                    options={FEEDBACK_STATUS_OPTIONS}
                    labelKey="label"
                    valueKey="value"
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <FormTextField
                    label="Comment"
                    name="comment"
                    multiline
                    maxLength={600}
                    required
                  />
                </Grid>

                <Grid size={12} sx={{ pt: 2 }}>
                  <Stack
                    direction="row"
                    sx={{ gap: 2, justifyContent: "center" }}
                  >
                    <SubmitButton />
                    <ResetButton />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
          </Box>
        </FormProvider>
      </Dialog>
    </>
  );
};
