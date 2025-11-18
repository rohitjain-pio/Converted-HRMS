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
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Grid from "@mui/material/Grid2";
import FormTextField from "@/components/FormTextField";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import {
  UpdateManagerRatingResponse,
  updateManagerRating,
  updateEmployeeRatingByManager,
} from "@/services/KPI";
import methods from "@/utils";
import LabelValue from "@/components/LabelValue";

const MIN_RATING = 1;
const MAX_RATING = 10;

const schema = Yup.object().shape({
  rating: Yup.string()
    .required("Rating is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Only numbers with up to two decimal places are allowed")
    
.test(
  "is-within-range",
  `Value must be between ${MIN_RATING} and ${MAX_RATING}, with up to two decimal places.`,
  (value) => {
    if (!value) return true;

    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) return true;

    const isWithinRange = numValue >= MIN_RATING && numValue <= MAX_RATING;
    const hasTwoDecimals = /^\d+(\.\d{1,2})?$/.test(value);

    return isWithinRange && hasTwoDecimals;
  }
),

    
  note: Yup.string()
    .nullable()
    .defined()
    .transform((value) => (value === "" ? null : value)),
});

type FormValues = Yup.InferType<typeof schema>;

type KPIEditDialogProps = {
  open: boolean;
  onClose: () => void;
  editable?: boolean;
  fetchEmployeeRating?: (params?: number | undefined) => Promise<void>
  data: {
    goalId: number;
    planId: number;
    goalTitle: string;
    rating: number | null;
    note: string | null;
  };
};

const ManagerKPIEditDialog = (props: KPIEditDialogProps) => {
  const { open, onClose, data, editable = true, fetchEmployeeRating } = props;
  const { goalTitle, goalId, rating, note, planId } = data;

  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      rating: rating ? String(rating) : "",
      note: !note && !editable ? "No Comment Provided" : (note ?? ""),
    },
  });

  const { handleSubmit, reset, getValues } = method;

  const handleReset = () => {
    reset({
      rating: rating ? String(rating) : "",
      note: !note && !editable ? "No Comment Provided" : (note ?? ""),
    });
  };

  const { execute: updateRating } = useAsync<
    UpdateManagerRatingResponse,
    updateManagerRating
  >({
    requestFn: async (
      args: updateManagerRating
    ): Promise<UpdateManagerRatingResponse> => {
      return await updateEmployeeRatingByManager(args);
    },
    onSuccess: () => {
      toast.success("Review Updated Successfully");
      onClose();
      fetchEmployeeRating?.();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const payload: updateManagerRating = {
      planId: planId,
      goalId: goalId,

      managerRating: +values.rating,
      managerNote: values.note,
    };

    updateRating(payload);
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxHeight: "80%",
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
              {editable ? "Edit Review" : "Manager Review"}
            </Typography>
            <Stack direction="row" gap={1.5} mr={-1}>
              <IconButton color="inherit" onClick={onClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid container size={12} spacing={2}>
                <Grid size={6}>
                  {editable ? (
                    <TextField
                      variant="outlined"
                      label="Goal"
                      sx={{ width: "100%" }}
                      slotProps={{
                        htmlInput: { readOnly: true },
                      }}
                      value={goalTitle}
                      disabled={true}
                    />
                  ) : (
                    <LabelValue label={"Goal"} value={goalTitle} />
                  )}
                </Grid>
                <Grid size={6}>
                  <FormTextField
                    name="rating"
                    label="Rating"
                    required
                    slotProps={{ htmlInput: { inputMode: "numeric" } }}
                    textFormat={!editable}
                  />
                </Grid>
              </Grid>
              <Grid size={12}>
                {editable ? (
                  <FormTextField name="note" label="Comment" multiline maxLength={600} />
                ) : (
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "#273a50", fontWeight: 600 }}
                    >
                      Comment
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#4b535b", whiteSpace: "pre-wrap" }}
                    >
                      {getValues("note")}
                    </Typography>
                  </Box>
                )}
              </Grid>
              {editable && (
                <Grid size={12} sx={{ pt: 2 }}>
                  <Stack
                    direction="row"
                    sx={{ gap: 2, justifyContent: "center" }}
                  >
                    <SubmitButton>Save</SubmitButton>
                    <ResetButton onClick={handleReset} />
                  </Stack>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </Box>
      </FormProvider>
    </Dialog>
  );
};

export default ManagerKPIEditDialog;
