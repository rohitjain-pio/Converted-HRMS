import { yupResolver } from "@hookform/resolvers/yup";
import Grid from "@mui/material/Grid2";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";
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
import { forwardRef, useImperativeHandle, useState } from "react";
import moment from "moment";
import FormDatePicker from "@/components/FormDatePicker";
import { DEFAULT_EMPLOYEE_GOAL_FILTERS } from "@/pages/KPI/constant";
import { employeesGoalListFilter } from "@/services/KPI";
import { KPI_STATUS_OPTIONS } from "@/utils/constants";
import FormSelectField from "@/components/FormSelectField";
type LastDateRangeType =
  | "previous15Days"
  | "previous30Days"
  | "previous90Days"
  | "previousMonth"
  | "thisMonth"
  | "custom";
// type NextDateRangeType =
//   | "next15Days"
//   | "next30Days"
//   | "next90Days"
//   | "thisMonth"
//   | "nextMonth"
//   | "custom";

const lastRangeOptions = [
  { id: "previous15Days", label: "Past 15 Days" },
  { id: "previous30Days", label: "Past 30 Days" },
  { id: "previous90Days", label: "Past 90 Days" },
  { id: "thisMonth", label: "This Month" },
  { id: "previousMonth", label: "Previous Month" },
  { id: "custom", label: "Custom" },
];

// const nextRangeOptions = [
//   { id: "next15Days", label: "Next 15 Days" },
//   { id: "next30Days", label: "Next 30 Days" },
//   { id: "next90Days", label: "Next 90 Days" },
//   { id: "thisMonth", label: "This Month" },
//   { id: "nextMonth ", label: "Next Month" },
//   { id: "custom", label: "Custom" },
// ];

const getDateRange = (type: "last" | "next", rangeId: string) => {
  const today = moment();
  if (type === "last") {
    switch (rangeId) {
      case "previous15Days":
        return {
          from: today.clone().subtract(15, "days").startOf("day"),
          to: today.clone().endOf("day"),
        };
      case "previous30Days":
        return {
          from: today.clone().subtract(30, "days").startOf("day"),
          to: today.clone().endOf("day"),
        };
      case "previous90Days":
        return {
          from: today.clone().subtract(90, "days").startOf("day"),
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
  } else {
    switch (rangeId) {
      case "next15Days":
        return {
          from: today.clone().add(1, "day").startOf("day"),
          to: today.clone().add(15, "days").endOf("day"),
        };
      case "next30Days":
        return {
          from: today.clone().add(1, "day").startOf("day"),
          to: today.clone().add(30, "days").endOf("day"),
        };
      case "next90Days":
        return {
          from: today.clone().add(1, "day").startOf("day"),
          to: today.clone().add(90, "days").endOf("day"),
        };
      case "thisMonth":
        return {
          from: today.clone().startOf("month"),
          to: today.clone().endOf("month"),
        };
      case "nextMonth":
        return {
          from: today.clone().add(1, "month").startOf("month"),
          to: today.clone().add(1, "month").endOf("month"),
        };
      default:
        return null;
    }
  }
};

const validationSchema = Yup.object().shape({
  reviewDateFrom: Yup.mixed().nullable(),
  reviewDateTo: Yup.mixed().nullable(),
  appraisalDateFrom: Yup.mixed().nullable(),
  appraisalDateTo: Yup.mixed().nullable(),
  statusFilter: Yup.string().nullable(),
});

type EmployeeGoalFilterValues = Yup.InferType<typeof validationSchema>;

type ManagerFilterFormProps = {
  onSearch: (values: employeesGoalListFilter) => void;
  setHasActiveFilters: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ManagerFilterFormHandle = {
  handleReset: () => void;
};

const ManagerDashboardFilterForm = forwardRef<
  ManagerFilterFormHandle,
  ManagerFilterFormProps
>(({ onSearch, setHasActiveFilters }, ref) => {
  const [lastRange, setLastRange] = useState<string>("");
  // const [nextRange, setNextRange] = useState<string>("");

  const method = useForm<EmployeeGoalFilterValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      reviewDateFrom: null,
      reviewDateTo: null,
      appraisalDateFrom: null,
      appraisalDateTo: null,
      statusFilter:""
    },
  });
  const { reset, handleSubmit, setValue } = method;

  const handleLastRangeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as LastDateRangeType;
    setLastRange(value);

    const dateRange = getDateRange("last", value);

    if (value === "custom") {
      setValue("reviewDateFrom", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("reviewDateTo", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else if (dateRange) {
      setValue("reviewDateFrom", dateRange.from, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("reviewDateTo", dateRange.to, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // const handleNextRangeChange = (e: SelectChangeEvent<string>) => {
  //   const value = e.target.value as NextDateRangeType;
  //   setNextRange(value);

  //   const dateRange = getDateRange("next", value);

  //   if (value === "custom") {
  //     setValue("appraisalDateFrom", null, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //     setValue("appraisalDateTo", null, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //   } else if (dateRange) {
  //     setValue("appraisalDateFrom", dateRange.from, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //     setValue("appraisalDateTo", dateRange.to, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //   }
  // };

  const handleReset = () => {
    reset();
    onSearch(DEFAULT_EMPLOYEE_GOAL_FILTERS);
    setLastRange("");
    // setNextRange("");
    setHasActiveFilters(false);
  };

  const onSubmit: SubmitHandler<EmployeeGoalFilterValues> = (values) => {
    onSearch({
      reviewDateFrom: values.reviewDateFrom
        ? moment(values.reviewDateFrom).format("YYYY-MM-DD")
        : undefined,
      reviewDateTo: values.reviewDateTo
        ? moment(values.reviewDateTo).format("YYYY-MM-DD")
        : undefined,
      appraisalDateFrom: values.appraisalDateFrom
        ? moment(values.appraisalDateFrom).format("YYYY-MM-DD")
        : undefined,
      appraisalDateTo: values.appraisalDateTo
        ? moment(values.appraisalDateTo).format("YYYY-MM-DD")
        : undefined,
      statusFilter: Number(values.statusFilter),
    });

    setHasActiveFilters(true);
  };

  useImperativeHandle(ref, () => ({ handleReset }), [handleReset]);

  return (
    <FormProvider<EmployeeGoalFilterValues> {...method}>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
              <InputLabel>Select Last Review Date</InputLabel>
              <Select
                value={lastRange}
                onChange={handleLastRangeChange}
                label="Select Last Review Date "
              >
                {lastRangeOptions.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Next Review Date</InputLabel>
              <Select
                value={nextRange}
                onChange={handleNextRangeChange}
                label="Select  Next Review Date "
              >
                {nextRangeOptions.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid> */}

          <>
            {lastRange === "custom" && (
              <>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="reviewDateFrom"
                    label="Select Last Review Date From"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="reviewDateTo"
                    label="Select Last Review Date To"
                  />
                </Grid>
              </>
            )}
            {/* {nextRange === "custom" && (
              <>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="reviewDateFrom"
                    label="Select Next Review Date From"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="reviewDateTo"
                    label="Select Next Review Date To"
                  />
                </Grid>
              </>
            )} */}
          </>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              label={"Status"}
              name={"statusFilter"}
              options={KPI_STATUS_OPTIONS}
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

export default ManagerDashboardFilterForm;
