import Grid from "@mui/material/Grid2";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ResetButton from "@/components/ResetButton/ResetButton";
import { FilterFormProps } from "@/pages/Employee/types";
import RoleIDSelectField from "@/pages/Profile/components/RoleIDSelectField";
import EmployeeStatusSelectField from "@/pages/Profile/components/EmployeeStatus";
import { hasPermission } from "@/utils/hasPermission";
import {
  EMPLOYMENT_STATUS_OPTIONS,
  permissionValue,
} from "@/utils/constants";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import DepartmentAutocomplete from "@/pages/Employee/components/DepartmentAutocomplete";
import DesignationAutocomplete from "@/pages/Employee/components/DesignationAutocomplete";
import FormSelectField from "@/components/FormSelectField";
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
import BranchSelectField from "@/pages/Profile/components/BranchSelectField";
import FormDatePicker from "@/components/FormDatePicker";
import CountrySelectField from "@/pages/Employee/components/CountrySelectField";
import { DEFAULT_EMPLOYEE_FILTERS } from "@/pages/Employee/constants";

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
  roleId: Yup.string().defined(),
  employeeStatus: Yup.string().defined(),
  employmentStatus: Yup.string().defined(),
  branchId: Yup.string().defined(),
  dojFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  dojTo: Yup.mixed<moment.Moment>().defined().nullable(),
  countryId: Yup.string().defined(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

export type FilterFormHandle = {
  handleReset: () => void;
};

const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>(
  (props, ref) => {
    const { onSearch, roleId, setHasActiveFilters } = props;

    const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");

    const method = useForm<FormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: {
        departmentId: "",
        designationId: "",
        roleId: "",
        employeeStatus: "",
        employmentStatus: "",
        branchId: "",
        dojFrom: null,
        dojTo: null,
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
      roleId,
      employeeStatus,
      employmentStatus,
      branchId,
      countryId,
      dojFrom,
      dojTo,
    }) => {
      onSearch({
        departmentId: Number(departmentId),
        designationId: Number(designationId),
        roleId: Number(roleId),
        employeeStatus: Number(employeeStatus),
        employmentStatus: Number(employmentStatus),
        branchId: Number(branchId),
        countryId: Number(countryId),
        dojFrom: dojFrom ? moment(dojFrom).format("YYYY-MM-DD") : null,
        dojTo: dojTo ? moment(dojTo).format("YYYY-MM-DD") : null,
      });

      setHasActiveFilters(true);
    };

    const handleReset = () => {
      reset();
      setValue("roleId", "");
      onSearch(DEFAULT_EMPLOYEE_FILTERS);
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

    useEffect(() => {
      if (roleId) {
        setValue("roleId", String(roleId), { shouldDirty: true });
      }
    }, []);

    return (
      <FormProvider<FormValues> {...method}>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {hasPermission(permissionValue.ROLE.READ) && (
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <RoleIDSelectField
                  isEditable={true}
                  required={false}
                  defaultValue={String(roleId)}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <DepartmentAutocomplete />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <DesignationAutocomplete />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <EmployeeStatusSelectField
                name="employeeStatus"
                isEditable={true}
                required={false}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ minWidth: "168px" }}>
              <FormSelectField
                label="Employment Status"
                name="employmentStatus"
                options={EMPLOYMENT_STATUS_OPTIONS}
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
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <BranchSelectField isEditable />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <CountrySelectField name="countryId" />
            </Grid>
            {selectedRange === "custom" ? (
              <Grid container size={12} justifyContent={"center"}>
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
  }
);

export default FilterForm;
