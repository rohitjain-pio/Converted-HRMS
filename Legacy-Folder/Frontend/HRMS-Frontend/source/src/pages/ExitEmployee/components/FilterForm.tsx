import { yupResolver } from "@hookform/resolvers/yup";
import Grid from "@mui/material/Grid2";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import ResetButton from "@/components/ResetButton/ResetButton";
import { ExitEmployeeSearchFilter } from "@/services/EmployeeExitAdmin";
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
import { RESIGNATION_STATUS_OPTIONS } from "@/utils/constants";
import { DEFAULT_EXIT_EMPLOYEE_FILTERS } from "@/pages/ExitEmployee/constants";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
  useState,
} from "react";
import moment from "moment";
import DepartmentSelectField from "@/pages/Profile/components/DepartmentSelectField";
import BranchSelectField from "@/pages/Profile/components/BranchSelectField";
import FormDatePicker from "@/components/FormDatePicker";
import EmployeeStatusSelectField from "@/pages/Profile/components/EmployeeStatus";

const getDateRange = (range: DateRangeType) => {
  const today = moment();

  switch (range) {
    case "next15Days":
      return {
        from: today.clone().startOf("day"),
        to: today.clone().add(15, "day").endOf("day"),
      };
    case "next30Days":
      return {
        from: today.clone().startOf("day"),
        to: today.clone().add(30, "day").endOf("day"),
      };
    case "next90Days":
      return {
        from: today.clone().startOf("day"),
        to: today.clone().add(90, "day").endOf("day"),
      };
    default:
      return null;
  }
};

type DateRangeType = "next15Days" | "next30Days" | "next90Days" | "custom";

const dateRangeOptions = [
  { id: "next15Days", label: "Next 15 Days" },
  { id: "next30Days", label: "Next 30 Days" },
  { id: "next90Days", label: "Next 90 Days" },
  { id: "custom", label: "Custom" },
];

const status = [
  { id: false, label: "No" },
  { id: true, label: "Yes" },
];

const validationSchema = Yup.object().shape({
  resignationStatus: Yup.string().defined(),
  branchId: Yup.string().defined(),
  departmentId: Yup.string().defined(),
  itNoDue: Yup.boolean().nullable().defined(),
  accountsNoDue: Yup.boolean().nullable().defined(),
  lastWorkingDayFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  lastWorkingDayTo: Yup.mixed<moment.Moment>().defined().nullable(),
  resignationDate: Yup.mixed<moment.Moment>().defined().nullable(),
  employeeStatus: Yup.string().defined(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onSearch: (values: ExitEmployeeSearchFilter) => void;
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
        resignationStatus: "",
        departmentId: "",
        branchId: "",
        itNoDue: null,
        accountsNoDue: null,
        lastWorkingDayFrom: null,
        lastWorkingDayTo: null,
        employeeStatus: "",
        resignationDate: null,
      },
    });

    const { reset, handleSubmit, setValue } = method;

    const handleDateRangeChange = (e: SelectChangeEvent<DateRangeType>) => {
      const value = e.target.value as DateRangeType;
      const dateRange = getDateRange(value);

      if (value === "custom") {
        setValue("lastWorkingDayFrom", null, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("lastWorkingDayTo", null, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else if (dateRange) {
        setValue("lastWorkingDayFrom", dateRange.from, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("lastWorkingDayTo", dateRange.to, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      setSelectedRange(value);
    };

    const handleReset = () => {
      reset();
      onSearch(DEFAULT_EXIT_EMPLOYEE_FILTERS);
      setSelectedRange("")
      setHasActiveFilters(false);
      setSelectedRange("");
    };

    const onSubmit: SubmitHandler<FormValues> = (values) => {
      onSearch({
        resignationStatus: Number(values.resignationStatus),
        branchId: Number(values.branchId),
        departmentId: Number(values.departmentId),
        itNoDue: values.itNoDue,
        accountsNoDue: values.accountsNoDue,
        lastWorkingDayFrom: values.lastWorkingDayFrom
          ? moment(values.lastWorkingDayFrom).format("YYYY-MM-DD")
          : null,
        lastWorkingDayTo: values.lastWorkingDayTo
          ? moment(values.lastWorkingDayTo).format("YYYY-MM-DD")
          : null,
        resignationDate: values.resignationDate
          ? moment(values.resignationDate).format("YYYY-MM-DD")
          : null,
        employeeStatus: Number(values.employeeStatus),
      });
      setHasActiveFilters(true);
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
              <FormSelectField
                name="resignationStatus"
                label="Resignation Status"
                options={RESIGNATION_STATUS_OPTIONS}
                valueKey="id"
                labelKey="label"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <DepartmentSelectField isEditable />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <BranchSelectField isEditable />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormSelectField
                name="itNoDue"
                label="IT No Due"
                options={status}
                valueKey="id"
                labelKey="label"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormSelectField
                name="accountsNoDue"
                label="Accounts No Due"
                options={status}
                valueKey="id"
                labelKey="label"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
                <InputLabel>Select Last Working Range</InputLabel>
                <Select
                  value={selectedRange}
                  onChange={handleDateRangeChange}
                  label="Select Last Working Range"
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
              <FormDatePicker name="resignationDate" label="Resignation Date" />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <EmployeeStatusSelectField name="employeeStatus" isEditable />
            </Grid>
            {selectedRange === "custom" ? (
              <Grid container size={12} justifyContent={"center"}>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="lastWorkingDayFrom"
                    label="Last Working From"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="lastWorkingDayTo"
                    label="Last Working To"
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
