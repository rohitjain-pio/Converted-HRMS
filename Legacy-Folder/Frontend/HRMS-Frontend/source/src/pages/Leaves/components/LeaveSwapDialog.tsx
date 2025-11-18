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
import { yupResolver } from "@hookform/resolvers/yup";
import moment, { Moment } from "moment";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import HolidayAutoComplete from "@/pages/Leaves/components/HolidayAutoComplete";
import {
  applyLeaveSwap,
  ApplyLeaveSwapArgs,
  ApplyLeaveSwapResponse,
} from "@/services/EmployeeLeave";
import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useUserStore } from "@/store";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";

type ActionDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess:()=>void
};

export const LeaveSwapDialog = ({ open, onClose,onSuccess }: ActionDialogProps) => {
  const schema = Yup.object().shape({
    selectedDate: Yup.mixed<Moment>()
      .required(" Date is required")
      .test(
        "is-valid",
        "Invalid Date",
        (value) => moment.isMoment(value) && value.isValid()
      ),

    holiday: Yup.string().required("holiday is required"),
    leaveLabel: Yup.string().required("Holiday Name  is required")
     .max(100, "Holiday Name must be at most 50 characters"),

    reason: Yup.string().required("Reason is required"),

    attachment: Yup.mixed().nullable(),
  });
  const { userData } = useUserStore();
  type FormValues = Yup.InferType<typeof schema>;

  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      selectedDate: undefined,
      holiday: "",
      reason: "",
      attachment: null,
    },
  });

  const { handleSubmit, reset } = method;
  const handleReset = () => {
    reset();
  };
   const shouldDisableDateCombined = (date: moment.Moment) => {
    const day = date.day();
    if (day === 0 || day === 6) {
      return true;
    }
    return false;
  };
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const holiday=values.holiday.split(',') 
    const workingDateLabel=holiday[0]
    const workingDate=holiday[1]
    addSwapLeave({
      employeeId: Number(userData.userId),
      workingDate: moment(workingDate).format("YYYY-MM-DD"),
      leaveDate:moment(values.selectedDate).format("YYYY-MM-DD"),
      workingDateLabel: workingDateLabel,
      leaveDateLabel: values.leaveLabel,
      reason: values.reason
    })

  };
  const { execute: addSwapLeave,isLoading:addLoading } = useAsync<
    ApplyLeaveSwapResponse,
    ApplyLeaveSwapArgs
  >({
    requestFn: async (args: ApplyLeaveSwapArgs) => await applyLeaveSwap(args),
    onSuccess: () => {
      toast.success("Holiday Swap Applied Successfully");
      onSuccess()
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

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
              Request Holiday-Swap
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
                    <HolidayAutoComplete label="Select Holiday" />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="Select Date"
                      name="selectedDate"
                      format="MMM Do, YYYY"
                      minDate={moment().startOf("year")}
                      maxDate={moment().endOf("year")}
                      shouldDisableDate={shouldDisableDateCombined}
                      required
                    />
                  </FormInputContainer>
                </FormInputGroup>
              </Grid>
              <Grid size={12}>
                <FormTextField
                  name="leaveLabel"
                  label="Holiday Name to Swap"
                  required
                  placeholder="Enter the exact name of the holiday (e.g., Diwali)"
                />
              </Grid>
              <Grid size={12}></Grid>
              <Grid size={12}>
                <FormTextField
                  multiline
                  name="reason"
                  label="Enter Reason"
                  required
                  maxLength={500}
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
      <GlobalLoader loading={addLoading}/>
    </Dialog>
  );
};
