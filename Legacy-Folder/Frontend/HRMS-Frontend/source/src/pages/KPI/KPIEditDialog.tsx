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
import { Quarter, QUARTER_OPTIONS } from "@/utils/constants";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import {
  updateEmployeeSelfRating,
  UpdateSelfRatingPayload,
  UpdateSelfRatingResponse,
} from "@/services/KPI";
import { toast } from "react-toastify";
import methods from "@/utils";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { CellAction } from "@/pages/KPI/EmployeeKPI";
import LabelValue from "@/components/LabelValue";

const MIN_RATING = 1;
const MAX_RATING = 10;

const schema = Yup.object().shape({
  quarter: Yup.string()
    .trim()
    .required("Quarter is required")
    .oneOf([...Object.values(Quarter)], "Please select a valid quarter"),
  rating: Yup.string()
    .trim()
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
  onSuccess?: () => void;
  action: CellAction;
  data: {
    quarter: Quarter;
    goalId: number;
    planId: number;
    goalTitle: string;
    rating: number | null;
    note: string | null;
  };
};

const KPIEditDialog = (props: KPIEditDialogProps) => {
  const { open, onClose, data, onSuccess, action } = props;
  const { goalTitle, goalId, quarter, rating, note, planId } = data;

  const isEditable = action !== "view";

  const dialogTitle =
    action === "edit"
      ? "Edit KPI Details"
      : action === "add"
        ? "Add KPI Details"
        : "View KPI Details";

  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      quarter: quarter,
      rating: rating ? String(rating) : "",
      note: note ?? "",
    },
  });

  const { handleSubmit, reset, getValues } = method;

  const handleReset = () => {
    reset();
  };

  const { execute: updateSelfRating, isLoading: isUpdating } = useAsync<
    UpdateSelfRatingResponse,
    UpdateSelfRatingPayload
  >({
    requestFn: async (
      payload: UpdateSelfRatingPayload
    ): Promise<UpdateSelfRatingResponse> => {
      return await updateEmployeeSelfRating(payload);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    updateSelfRating({
      planId: planId,
      goalId: goalId,
      quarter: values.quarter,
      rating: +values.rating,
      note: values.note,
    });
  };

  return (
    <>
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
                {dialogTitle}
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
                <Grid container size={12} spacing={2}>
                  <Grid size={6}>
                    {!isEditable ? (
                      <LabelValue label="Goal" value={goalTitle} />
                    ) : (
                      <TextField
                        variant="outlined"
                        label="Goal*"
                        sx={{ width: "100%" }}
                        slotProps={{
                          htmlInput: { readOnly: true },
                        }}
                        value={goalTitle}
                      />
                    )}
                  </Grid>
                  <Grid size={3}>
                    <FormSelectField
                      name="quarter"
                      label="Quarter"
                      required
                      options={QUARTER_OPTIONS}
                      readOnly
                      textFormat={!isEditable}
                    />
                  </Grid>
                  <Grid size={3}>
                    <FormTextField
                      name="rating"
                      label="Rating"
                      required
                      textFormat={!isEditable}
                      slotProps={{
                        htmlInput: {
                          inputMode: "numeric",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid size={12}>
                  {isEditable ? (
                    <FormTextField
                      name="note"
                      label="Note"
                      multiline
                      maxLength={600}
                    />
                  ) : (
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ color: "#273a50", fontWeight: 600 }}
                      >
                        Note
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
                {isEditable && (
                  <Grid size={12} sx={{ pt: 2 }}>
                    <Stack
                      direction="row"
                      sx={{ gap: 2, justifyContent: "center" }}
                    >
                      <SubmitButton loading={isUpdating}>Save</SubmitButton>
                      <ResetButton onClick={handleReset} />
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
          </Box>
        </FormProvider>
      </Dialog>
      <GlobalLoader loading={isUpdating} />
    </>
  );
};

export default KPIEditDialog;
