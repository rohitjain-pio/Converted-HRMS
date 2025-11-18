import * as Yup from "yup";
import { Paper, Stack, Typography } from "@mui/material";
import { FormProvider, SubmitHandler,  UseFormReturn } from "react-hook-form";
import FormDatePicker from "@/components/FormDatePicker";
import FormSelectField from "@/components/FormSelectField";
import FormTextField from "@/components/FormTextField";
import moment from "moment";
import { schema } from "./validationSchema";
import BreadCrumbs from "@/components/@extended/Router";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import PageHeader from "@/components/PageHeader/PageHeader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import LeaveStatsSection, { LeaveStats } from "../components/LeaveStatsSection";
import { DAY_SLOT_LABELS } from "@/utils/constants";

type FormValues = Yup.InferType<typeof schema>;

type Props = {
  leaveTypeLabel: string;
  leaveStats:  LeaveStats | null;
  method: UseFormReturn<
    {
      startDate: moment.Moment | null;
      startDateSlot: string;
      endDate: moment.Moment | null;
      endDateSlot: string;
      reason: string;
      attachment: string | null;
    },
    undefined
  >;
  onSubmit:SubmitHandler<FormValues>
  shouldDisableDateCombined: (date: moment.Moment) => boolean;
  totalLeaveDays: number;
  isAdding: boolean;
  isFetchingBalanceDetails: boolean;
  isFetchingHoliday: boolean;
  isSameDay: boolean;
};

const LeaveApplicationForm: React.FC<Props> = ({
  leaveTypeLabel,
  leaveStats,
  onSubmit,
  method,
  shouldDisableDateCombined,
  isSameDay,
  totalLeaveDays,
  isAdding,
  isFetchingBalanceDetails,
  isFetchingHoliday,
}) => {
 
  const { handleSubmit } = method;

  const daySlotOptions = Object.entries(DAY_SLOT_LABELS).map(([id, label]) => ({
    id: String(id),
    label,
  }));

  type FormValues = Yup.InferType<typeof schema>;

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          title={`Apply for Leave: ${leaveTypeLabel}`}
          goBack={true}
        />
        {leaveStats && (
          <Stack padding="30px">
            <LeaveStatsSection stats={leaveStats} />
          </Stack>
        )}
        <FormProvider<FormValues> {...method}>
          <Stack
            component="form"
            autoComplete="off"
            padding="30px"
            gap="30px"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInputGroup>
              <FormInputContainer md={6}>
                <FormDatePicker
                  name="startDate"
                  label="Start Date"
                  format="MMM Do, YYYY"
                  required
                  shouldDisableDate={shouldDisableDateCombined}
                  minDate={moment().subtract(1, "year").startOf("year")}
                  maxDate={moment().add(1, "year").endOf("year")}
                />
              </FormInputContainer>
              <FormInputContainer md={6}>
                <FormSelectField
                  name="startDateSlot"
                  label="Slot"
                  options={daySlotOptions}
                  valueKey="id"
                  labelKey="label"
                  required
                />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer md={6}>
                <FormDatePicker
                  name="endDate"
                  label="End Date"
                  format="MMM Do, YYYY"
                  required
                  shouldDisableDate={shouldDisableDateCombined}
                  minDate={moment().subtract(1, "year").startOf("year")}
                  maxDate={moment().add(1, "year").endOf("year")}
                />
              </FormInputContainer>
              <FormInputContainer md={6}>
                <FormSelectField
                  name="endDateSlot"
                  label="Slot"
                  options={daySlotOptions}
                  valueKey="id"
                  labelKey="label"
                  required
                  disabled={isSameDay}
                />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer md={12}>
                <FormTextField
                  name="reason"
                  label="Reason"
                  multiline
                  required
                  maxLength={600}
                />
              </FormInputContainer>
            </FormInputGroup>

            {totalLeaveDays > 0 ? (
              <Typography>
                Total Leaves Applied for : <strong>{totalLeaveDays} </strong>
                {totalLeaveDays === 1 || totalLeaveDays === 0.5
                  ? "day"
                  : "days"}
              </Typography>
            ) : null}

            <Stack direction="row" gap="15px" justifyContent="center">
              <SubmitButton loading={isAdding}>Submit</SubmitButton>
              <ResetButton />
            </Stack>
          </Stack>
        </FormProvider>
      </Paper>
      <GlobalLoader
        loading={isAdding || isFetchingBalanceDetails || isFetchingHoliday}
      />
    </>
  );
};
export default LeaveApplicationForm;
