import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Grid from "@mui/material/Grid2";
import FormTextField from "@/components/FormTextField";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import { Quarter } from "@/utils/constants";
import GoalsAutoComplete from "@/pages/KPI/Components/GoalAutocomplete";
import { useEffect } from "react";
import {
  assignGoalByManager,
  AssignGoalByManagerRequest,
  AssignGoalByManagerResponse,
} from "@/services/KPI";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";

const schema = Yup.object().shape({
  target: Yup.string().required("Target is required"),
  quarters: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one quarter")
    .required("Please select at least one quarter"),
  goalId: Yup.string()
    .required("Goal is required")
    .notOneOf(["0"], "Please select a goal"),
});

type FormValues = Yup.InferType<typeof schema>;

type KPIEditDialogProps = {
  open: boolean;
  onClose: () => void;
  fetchData:  (params?: number | undefined) => Promise<void>

  editable?: boolean;
  data?: {
    goalId?: number;
    target?: string;
    isDisabled?: boolean;
    employeeId?: number;
    quarter?: string;
    plainId?: number | null;
    employeeName?: string;
    employeeEmail?: string;
  } | null;
};

const AssignGoalDialog = (props: KPIEditDialogProps) => {
  const { open, onClose, data, fetchData } = props;
  const {
    goalId,
    target,
    plainId,
    employeeId,
    employeeName,
    employeeEmail,
    isDisabled,
    quarter,
  } = data ?? {};
  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      goalId: goalId != null ? String(goalId) : "",
      target: target ?? "",
      quarters: quarter ? String(quarter).split(",") : [],
    },
  });

  const { handleSubmit, reset, setValue, control, formState } = method;

  const watchedQuarters = useWatch({
    control,
    name: "quarters",
  });

  const handleReset = () => {
    reset({
      goalId: goalId != null ? String(goalId) : "",
      target: target ?? "",
      quarters: quarter ? String(quarter).split(",") : [],
    });
  };
  const { execute: assignGoal } = useAsync<
    AssignGoalByManagerResponse,
    AssignGoalByManagerRequest
  >({
    requestFn: async (args: AssignGoalByManagerRequest) => {
      return await assignGoalByManager(args);
    },
    onSuccess: () => {
      toast.success("Goal Assigned Successfully");
      onClose();
      fetchData();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const quartersOptions = [
    { label: "Quarter 1", value: Quarter.Q1 },
    { label: "Quarter 2", value: Quarter.Q2 },
    { label: "Quarter 3", value: Quarter.Q3 },
    { label: "Quarter 4", value: Quarter.Q4 },
  ];

  useEffect(() => {
    if (data) {
      reset({
        goalId: data.goalId != null ? String(data.goalId) : "",
        target: data.target ?? "",
        quarters: data.quarter ? String(data.quarter).split(",") : [],
      });
    }
  }, [data, reset]);

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    assignGoal({
      employeeId: Number(employeeId),
      goalId: Number(values.goalId),
      targetExpected: values.target,
      allowedQuarter: values.quarters
        .filter((q) => q !== "undefined")
        .join(","),
      planId: plainId ? Number(plainId) : null,
    });
  };

  const handleQuarterChange = (quarter: Quarter) => {
    const currentQuarters = watchedQuarters ?? [];
    let newQuarters;
    if (currentQuarters.includes(quarter)) {
      newQuarters = currentQuarters.filter((q) => q !== quarter);
    } else {
      newQuarters = [...currentQuarters, quarter];
    }
    newQuarters = newQuarters.filter((q) => q !== undefined && q !== null);
    setValue("quarters", newQuarters, { shouldDirty: true });
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
              {data?.goalId ? "Edit Target & Quarter" : " Assign Goal"}
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
                  <TextField
                    variant="outlined"
                    label="Employee Name"
                    sx={{ width: "100%" }}
                    slotProps={{
                      htmlInput: { readOnly: true },
                    }}
                    value={employeeName}
                    disabled={true}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    variant="outlined"
                    label="Employee Email"
                    sx={{ width: "100%" }}
                    slotProps={{
                      htmlInput: { readOnly: true },
                    }}
                    value={employeeEmail}
                    disabled={true}
                  />
                </Grid>
                <Grid size={12}>
                  <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                    Select Quarters
                  </FormLabel>
                  <Stack direction="row" marginLeft={1} spacing={1}>
                    {quartersOptions.map((option) => (
                      <Grid key={option.value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={watchedQuarters?.includes(option.value)}
                              onChange={() => handleQuarterChange(option.value)}
                            />
                          }
                          label={option.label}
                        />
                      </Grid>
                    ))}
                  </Stack>
                  {formState.errors.quarters && (
                    <Typography color="error" variant="body2">
                      {formState.errors.quarters.message}
                    </Typography>
                  )}
                </Grid>
                <Grid size={12}>
                  <GoalsAutoComplete
                    label="Select Goal"
                    name="goalId"
                    disabled={isDisabled}
                    required
                  />
                </Grid>
              </Grid>
              <Grid size={12}>
                <FormTextField
                  name="target"
                  label="Target"
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
                  <SubmitButton>Save</SubmitButton>
                  <ResetButton onClick={handleReset} />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </Box>
      </FormProvider>
    </Dialog>
  );
};

export default AssignGoalDialog;
