import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
  useState,
} from "react";
import { AttendanceConfigFilter } from "@/services/Attendence/typs";
import * as Yup from "yup";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import moment from "moment";
import Grid from "@mui/material/Grid2";
import DepartmentAutocomplete from "@/pages//Employee/components/DepartmentAutocomplete";
import DesignationAutocomplete from "@/pages//Employee/components/DesignationAutocomplete";
import BranchSelectField from "@/pages//Profile/components/BranchSelectField";
import CountrySelectField from "@/pages//Employee/components/CountrySelectField";
import FormDatePicker from "@/components/FormDatePicker";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import { DEFAULT_ATTENDANCE_CONFIG_FILTERS } from "@/pages/Attendance/AttendanceConfiguration/constants";
import FormSelectField from "@/components/FormSelectField";

const ATTENDANCE_METHOD_OPTIONS = [
  { id: "timeDoctor", label: "Time Doctor" },
  { id: "manual", label: "Manual" },
];

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
  departmentId: Yup.string().defined(),
  designationId: Yup.string().defined(),
  branchId: Yup.string().defined(),
  countryId: Yup.string().defined(),
  dojFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  dojTo: Yup.mixed<moment.Moment>().defined().nullable(),
  attendanceMethod: Yup.string().defined(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onSearch: (values: AttendanceConfigFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

export type FilterFormHandle = {
  handleReset: () => void;
};

const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>(
  (props, ref) => {
    const { onSearch, setHasActiveFilters } = props;

    const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");

    const method = useForm<FormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: {
        departmentId: "",
        designationId: "",
        branchId: "",
        dojFrom: null,
        dojTo: null,
        attendanceMethod: "",
        countryId: "",
      },
    });

    const { handleSubmit, reset, setValue } = method;

    const handleDateRangeChange = (e: SelectChangeEvent<DateRangeType>) => {
      const value = e.target.value as DateRangeType;
      const dateRange = getDateRange(value);

      if (value === "custom") {
        const today = moment();

        setValue("dojFrom", null, { shouldDirty: true, shouldValidate: true });
        setValue("dojTo", today, { shouldDirty: true, shouldValidate: true });
      } else if (dateRange) {
        setValue("dojFrom", dateRange.from, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("dojTo", dateRange.to, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      setSelectedRange(value);
    };

    const onSubmit: SubmitHandler<FormValues> = ({
      departmentId,
      designationId,
      branchId,
      countryId,
      dojFrom,
      dojTo,
      attendanceMethod,
    }) => {
      onSearch({
        departmentId: Number(departmentId),
        designationId: Number(designationId),
        branchId: Number(branchId),
        countryId: Number(countryId),
        dojFrom: dojFrom ? moment(dojFrom).format("YYYY-MM-DD") : null,
        dojTo: dojTo ? moment(dojTo).format("YYYY-MM-DD") : null,
        isManualAttendance:
          attendanceMethod === "manual"
            ? true
            : attendanceMethod === "timeDoctor"
              ? false
              : null,
      });

      setHasActiveFilters(true);
    };

    const handleReset = () => {
      reset();
      onSearch(DEFAULT_ATTENDANCE_CONFIG_FILTERS);
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

    return (
      <FormProvider<FormValues> {...method}>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <DepartmentAutocomplete />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <DesignationAutocomplete />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <BranchSelectField isEditable />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <CountrySelectField name="countryId" />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormSelectField
                name="attendanceMethod"
                label="Attendance Method"
                options={ATTENDANCE_METHOD_OPTIONS}
                valueKey="id"
                labelKey="label"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
                <InputLabel>Select DOJ Range</InputLabel>
                <Select
                  value={selectedRange}
                  onChange={handleDateRangeChange}
                  label="Select DOJ Range"
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
              <>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="dojFrom"
                    label="DOJ From"
                    maxDate={moment()}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="dojTo"
                    label="DOJ To"
                    maxDate={moment()}
                  />
                </Grid>
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
  }
);

export default FilterForm;
