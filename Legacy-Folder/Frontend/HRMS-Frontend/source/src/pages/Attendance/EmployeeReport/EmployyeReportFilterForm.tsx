import { yupResolver } from "@hookform/resolvers/yup";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import moment from "moment";
import React, { Dispatch, forwardRef, SetStateAction, useImperativeHandle, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";

import FormDatePicker from "@/components/FormDatePicker";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { DEFAULT_EMPLOYEE_ATTENDANCE_REPORT_FILTER } from "@/pages/Attendance/components/constanst";
import { EmployeeReportSearchFilter } from "@/pages/Attendance/types";
import DepartmentAutocomplete from "@/pages/Employee/components/DepartmentAutocomplete";
import BranchSelectField from "@/pages/Profile/components/BranchSelectField";


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
        to: today,
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

interface EmployeeReportFilterFormProps {
  onSearch: (filter: EmployeeReportSearchFilter) => void;
   setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
  setSelectedEmployees: (value: React.SetStateAction<string[]>) => void;
}

export type EmployeeReportFilterFormHandle = {
  handleReset: () => void;
};
const validationSchema = Yup.object().shape({
  dateFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  dateTo: Yup.mixed<moment.Moment>()
    .defined()
    .nullable()
    .test(
      "is-greater",
      "End date cannot be before start date",
      function (value) {
        const { start } = this.parent;
        const momentStart = start instanceof moment ? start : null;
        const momentEnd = value instanceof moment ? value : null;

        if (!momentEnd || !momentStart) return true;
        return momentEnd.isSameOrAfter(momentStart, "day");
      }
    )
    .test("max-diff", "Cannot select more than 90 days", function (value) {
      const { start } = this.parent;
      const momentStart = start instanceof moment ? start : null;
      const momentEnd = value instanceof moment ? value : null;

      if (!momentEnd || !momentStart) return true;

      const diffInDays = momentEnd.diff(momentStart, "days");
      return diffInDays <= 90;
    }),

  branchId: Yup.string().defined(),
  departmentId: Yup.string().defined(),
});
type FormValues = Yup.InferType<typeof validationSchema>;

export const EmployeeReportFilterForm = forwardRef<
  EmployeeReportFilterFormHandle,
  EmployeeReportFilterFormProps
>(({ onSearch,setHasActiveFilters }, ref) => {
  const method = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues:{
      departmentId:"",
      branchId:"",
      dateFrom:null,
      dateTo:null
    }
  });

  const { handleSubmit, reset, setValue } = method;

   const onSubmit: SubmitHandler<FormValues> = ({dateFrom,dateTo,branchId,departmentId
 })=> {
    onSearch( {
      dateFrom,
      dateTo,
      branchId:Number(branchId),
      departmentId:Number(departmentId),
    });
    setHasActiveFilters(true)
  }

  const handleReset = () => {
    reset()
   
    onSearch(DEFAULT_EMPLOYEE_ATTENDANCE_REPORT_FILTER
    );
    setSelectedRange("");
    setHasActiveFilters(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      handleReset,
    }),
    [handleReset]
  );
  const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");

  const handleDateRangeChange = (e: SelectChangeEvent<DateRangeType>) => {
    const value = e.target.value as DateRangeType;
    const dateRange = getDateRange(value);

    if (value === "custom") {
     

      setValue("dateFrom", null, { shouldDirty: true, shouldValidate: true });
      setValue("dateTo", null, { shouldDirty: true, shouldValidate: true });
    } else if (dateRange) {
      setValue("dateFrom", dateRange.from, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("dateTo", dateRange.to, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setSelectedRange(value);
  };

  return (
    <FormProvider {...method}>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid container  spacing={2} justifyContent="center">
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <BranchSelectField isEditable={true}  />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <DepartmentAutocomplete />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
              <InputLabel>Select Date Range</InputLabel>
              <Select
                value={selectedRange}
                onChange={handleDateRangeChange}
                label="Select Date Range"
              >
                {dateRangeOptions.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedRange === "custom" ? (
            <Grid container size={12} justifyContent={"center"}>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <FormDatePicker
                  name="dateFrom"
                  label="Start Date"
                  maxDate={moment()}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <FormDatePicker
                  name="dateTo"
                  label="End Date"
                  maxDate={moment()}
                />
              </Grid>
            </Grid>
          ) : null}

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
