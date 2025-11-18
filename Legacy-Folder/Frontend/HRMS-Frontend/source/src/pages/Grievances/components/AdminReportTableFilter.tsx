import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
  useState,
} from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import { DEFAULT_ADMIN_REPORT_GRIEVANCE_FILTERS } from "@/pages/Grievances/constants";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import FormDatePicker from "@/components/FormDatePicker";
import FormSelectField from "@/components/FormSelectField";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import {
  GRIEVANCE_LEVEL_OPTIONS,
  GRIEVANCE_STATUS_OPTIONS,
  GRIEVANCE_TAT_STATUS_OPTIONS,
} from "@/utils/constants";
import GrievanceTypeSelect from "@/pages/Grievances/components/GrievanceTypeSelect";
import { AdminReportGrievanceFilter } from "@/services/Grievances";
import moment from "moment";

const validationSchema = Yup.object().shape({
  grievanceType: Yup.string().nullable(),
  status: Yup.string().nullable(),
  escalationCount: Yup.string().nullable(),
  tatStatus: Yup.string().nullable(),
  createdOnFrom: Yup.mixed<moment.Moment>().nullable(),
  createdOnTo: Yup.mixed<moment.Moment>().nullable(),
  resolvedDate: Yup.mixed<moment.Moment>().nullable(),
});
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
type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onSearch: (values: AdminReportGrievanceFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

export type FilterFormHandle = {
  handleReset: () => void;
};
export const AdminReportTableFilter = forwardRef<
  FilterFormHandle,
  FilterFormProps
>((props, ref) => {
  const { onSearch, setHasActiveFilters } = props;
  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      tatStatus: "",
      createdOnFrom: null,
      createdOnTo: null,
      escalationCount: "",
      grievanceType: "",
      resolvedDate: null,
      status: "",
    },
  });
  const { reset, handleSubmit, setValue } = method;
  const handleReset = () => {
    reset();
    onSearch(DEFAULT_ADMIN_REPORT_GRIEVANCE_FILTERS);
    setHasActiveFilters(false);
  };
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    onSearch({
      grievanceTypeId: values.grievanceType
        ? Number(values.grievanceType)
        : null,
      level: values.escalationCount ? Number(values.escalationCount) : null,
      createdOnFrom: values.createdOnFrom
        ? moment(values.createdOnFrom).format("YYYY-MM-DD")
        : null,
      createdOnTo: values.createdOnTo
        ? moment(values.createdOnTo).format("YYYY-MM-DD")
        : null,
      status: values.status ? Number(values.status) : null,
      tatStatus: values.tatStatus ? Number(values.tatStatus) : null,
      resolvedDate: values.resolvedDate
        ? moment(values.resolvedDate).format("YYYY-MM-DD")
        : null,
    });
    setHasActiveFilters(true);
  };
  const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");
  const handleDateRangeChange = (e: SelectChangeEvent<DateRangeType>) => {
    const value = e.target.value as DateRangeType;
    const dateRange = getDateRange(value);

    if (value === "custom") {

      setValue("createdOnFrom", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("createdOnTo", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else if (dateRange) {
      setValue("createdOnFrom", dateRange.from, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("createdOnTo", dateRange.to, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setSelectedRange(value);
  };
  useImperativeHandle(
    ref,
    () => ({
      handleReset,
    }),
    [handleReset]
  );
  return (
    <FormProvider<FormValues> {...method}>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ minWidth: "168px" }}>
            <GrievanceTypeSelect
              name="grievanceType"
              label="Grievance Type"
              isEditable
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              name="status"
              label="Status"
              options={GRIEVANCE_STATUS_OPTIONS}
              valueKey="value"
              labelKey="label"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              name="escalationCount"
              label="Escalation Level"
              options={GRIEVANCE_LEVEL_OPTIONS}
              valueKey="value"
              labelKey="label"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              name="tatStatus"
              label="Tat Status"
              options={GRIEVANCE_TAT_STATUS_OPTIONS}
              valueKey="value"
              labelKey="label"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
              <InputLabel>Created Date Range</InputLabel>
              <Select
                value={selectedRange}
                onChange={handleDateRangeChange}
                label="Created On"
              >
                {dateRangeOptions.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormDatePicker name="resolvedDate" label="Resolved Date" />
          </Grid> */}
          {selectedRange === "custom" ? (
            // <Grid container size={12} justifyContent={"center"}>
            <>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <FormDatePicker
                  name="createdOnFrom"
                  label="Created From"
                  maxDate={moment()}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <FormDatePicker
                  name="createdOnTo"
                  label="Created To"
                  maxDate={moment()}
                />
              </Grid>
              {/* // </Grid> */}
            </>
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
