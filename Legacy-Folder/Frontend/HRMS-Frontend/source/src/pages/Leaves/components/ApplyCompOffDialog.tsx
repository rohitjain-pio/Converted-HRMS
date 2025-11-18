import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid2";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import FormTextField from "@/components/FormTextField";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import * as Yup from "yup";
import FormDatePicker from "@/components/FormDatePicker";
import FormSelectField from "@/components/FormSelectField";
import { yupResolver } from "@hookform/resolvers/yup";
import moment, { Moment } from "moment";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import {
  applyCompOff,
  ApplyLeaveCompOffArgs,
  ApplyLeaveCompOffResponse,
} from "@/services/EmployeeLeave";
import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { useUserStore } from "@/store";

type ActionDialogProps = {
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
};
const dayOption = [
  {
    id: 0.5,
    label: "0.5 day",
  },

  { id: 1, label: "1 day" },
];
export const ApplyCompOffDialog = ({
  open,
  onClose,
  onSuccess,
}: ActionDialogProps) => {
  const schema = Yup.object().shape({
    selectedDate: Yup.mixed<Moment>()
      .required(" Date is required")
      .test(
        "is-valid",
        "Invalid Date",
        (value) => moment.isMoment(value) && value.isValid()
      ),

    slot: Yup.string().required("Slot is required"),
    reason: Yup.string().required("Reason is required"),
  });

  type FormValues = Yup.InferType<typeof schema>;
  const { userData } = useUserStore();
  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      selectedDate: undefined,
      slot: "",
      reason: "",
    },
  });
  const { execute: addCompOff, isLoading: addLoading } = useAsync<
    ApplyLeaveCompOffResponse,
    ApplyLeaveCompOffArgs
  >({
    requestFn: async (args: ApplyLeaveCompOffArgs) => await applyCompOff(args),
    onSuccess: () => {
      toast.success("Leave Swap Applied Successfully");
      onSuccess();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { handleSubmit, reset } = method;
  const handleReset = () => {
    reset();
  };
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    addCompOff({
      employeeId: Number(userData.userId),
      reason: values.reason,
      numberOfDays: Number(values.slot),
      workingDate: moment(values.selectedDate).format("YYYY-MM-DD"),
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
              Request Comp-Off
            </Typography>
            <Stack direction="row" gap={1.5} mr={-1}>
              <IconButton color="inherit" onClick={onClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="Select Date"
                      name="selectedDate"
                      format="MMM Do, YYYY"
                      minDate={moment().startOf("year")}
                      maxDate={moment().endOf("year")}
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormSelectField
                      name="slot"
                      label="Slot"
                      options={dayOption}
                      valueKey="id"
                      labelKey="label"
                      required
                    />
                  </FormInputContainer>
                </FormInputGroup>
              </Grid>

              <Grid size={12}>
                <FormTextField
                  multiline
                  name="reason"
                  label="Enter Reason"
                  maxLength={500}
                  required
                />
              </Grid>

              <Grid size={12} sx={{ pt: 2 }}>
                <Stack
                  direction="row"
                  sx={{ gap: 2, justifyContent: "center" }}
                >
                  <SubmitButton />
                  <ResetButton onClick={handleReset} />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </Box>
      </FormProvider>
      <GlobalLoader loading={addLoading} />
    </Dialog>
  );
};
