import Grid from "@mui/material/Grid2";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ResetButton from "@/components/ResetButton/ResetButton";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import moment from "moment";
import FormDatePicker from "@/components/FormDatePicker";
import { forwardRef, useImperativeHandle, useState } from "react";
import FormSelectField from "@/components/FormSelectField";
import { LEAVE_TYPES_OPTIONS } from "@/utils/constants";
import { LeaveHistoryFilter } from "@/services/EmployeeLeave";

export type LeaveHistoryFilters = {
  startDate: string | null;
  endDate: string | null;
  leaveType: string | null;
};

interface LeaveHistoryTableFilterProps {
  onSearch: (filter: LeaveHistoryFilter) => void;
  setHasActiveFilters:(flag:boolean)=>void
}

const getDateRange = (range: DateRangeType) => {
  const today = moment();

  switch (range) {
    case "past7Days":
      return {
        from: today.clone().subtract(7, "day").startOf("day"),
        to: today.clone().endOf("day"),
      };
    case "past15Days":
      return {
        from: today.clone().subtract(15, "day").startOf("day"),
        to: today.clone().endOf("day"),
      };
    case "past30Days":
      return {
        from: today.clone().subtract(30, "day").startOf("day"),
        to: today.clone().endOf("day"),
      };
    case "thisMonth":
      return {
        from: today.clone().startOf("month"),
        to: today.clone().endOf("month"),
      };
    case "previousMonth":
      return {
        from: today.clone().subtract(1, "month").startOf("month"),
        to: today.clone().subtract(1, "month").endOf("month"),
      };
    default:
      return null;
  }
};

type DateRangeType =
  | "past7Days"
  | "past15Days"
  | "past30Days"
  | "thisMonth"
  | "previousMonth"
  | "custom";

const dateRangeOptions = [
  { id: "past7Days", label: "Past 7 Days" },
  { id: "past15Days", label: "Past 15 Days" },
  { id: "past30Days", label: "Past 30 Days" },
  { id: "thisMonth", label: "This Month" },
  { id: "previousMonth", label: "Previous Month" },
  { id: "custom", label: "Custom" },
];

const validationSchema = Yup.object().shape({
  startDate: Yup.mixed<moment.Moment>().nullable(),
  endDate: Yup.mixed<moment.Moment>().nullable(),
  leaveType: Yup.string().nullable(),
});

type FormData = Yup.InferType<typeof validationSchema>;

export type LeaveHistoryTableFilterHandle = {
  handleReset: () => void;
};

export type FilterFormHandle = {
  handleReset: () => void;
};
const LeaveHistoryTableFilter = forwardRef<
  LeaveHistoryTableFilterHandle,
  LeaveHistoryTableFilterProps
>(({ onSearch ,setHasActiveFilters}, ref) => {
  const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");

  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      startDate: null,
      endDate: null,
      leaveType: "",
    },
  });

  const { handleSubmit, reset, setValue, resetField } = method;

  const handleDateRangeChange = (e: SelectChangeEvent<DateRangeType>) => {
    const value = e.target.value as DateRangeType;
    setSelectedRange(value);

    const dateRange = getDateRange(value);

    if (!dateRange) {
      resetField("startDate");
      resetField("endDate");
      return;
    }

    setValue("startDate", dateRange.from, { shouldDirty: true });
    setValue("endDate", dateRange.to, { shouldDirty: true });
  };

  const onSubmit: SubmitHandler<FormData> = ({
    startDate,
    endDate,
    leaveType,
  }) => {
    onSearch({
      startDate: startDate ? startDate.format("YYYY-MM-DD") : null,
      endDate: endDate ? endDate.format("YYYY-MM-DD") : null,
      leaveType: Number(leaveType),
    });
  };

  const handleReset = () => {
    reset();
    setSelectedRange("");
    onSearch({
      startDate: null,
      endDate: null,
      leaveType: 0,
    });
    setHasActiveFilters(false)
  };

  useImperativeHandle(
    ref,
    () => ({
      handleReset,
    }),
    [handleReset]
  );

  return (
    <FormProvider {...method}>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
              <InputLabel>Select Leave Date Range</InputLabel>
              <Select
                value={selectedRange}
                onChange={handleDateRangeChange}
                label="Select Leave Date Range"
              >
                {dateRangeOptions.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {selectedRange === "custom" && (
            <>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <FormDatePicker name="startDate" label="Leave From" />
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <FormDatePicker name="endDate" label="Leave To" />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              label={"Select Leave Type"}
              name={"leaveType"}
              options={LEAVE_TYPES_OPTIONS}
              valueKey="id"
              labelKey="label"
            />
          </Grid>
          <Grid size={12} sx={{ pt: 2 }}>
            <Stack direction="row" sx={{ gap: 2, justifyContent: "center" }}>
              <SubmitButton />
              <ResetButton onClick={handleReset} />
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
});

export default LeaveHistoryTableFilter;
