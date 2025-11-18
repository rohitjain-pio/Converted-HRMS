import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
  useState,
} from "react";
import { DeveloperLogsFilter } from "@/services/Developer/types";
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
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import { DEFAULT_DEVELOPER_LOGS_FILTER } from "@/pages/Developer/constants";
import FormTextField from "@/components/FormTextField";
import FormDateTimePicker from "@/components/FormDateTimePicker";
import FormSelectField from "@/components/FormSelectField";

const LOG_LEVEL_OPTIONS = [
  { id: "Warning", label: "Warning" },
  { id: "Error", label: "Error" },
];

const validationSchema = Yup.object().shape({
  message: Yup.string().defined().nullable(),
  requestId: Yup.string().defined().nullable(),
  dateFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  dateTo: Yup.mixed<moment.Moment>().defined().nullable(),
  level: Yup.string().defined().nullable(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onSearch: (values: DeveloperLogsFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

export type FilterFormHandle = {
  handleReset: () => void;
};

type DateRangeType =
  | "Last15Min"
  | "Last1Hour"
  | "Today"
  | "Yesterday"
  | "Last7Days"
  | "custom";

const dateRangeOptions = [
  { id: "Last15Min", label: "Last 15 Minutes" },
  { id: "Last1Hour", label: "Last 1 Hour" },
  { id: "Today", label: "Today" },
  { id: "Yesterday", label: "Yesterday" },
  { id: "Last7Days", label: "Last 7 Days" },
  { id: "custom", label: "Custom" },
];

const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>(
  (props, ref) => {
    const { onSearch, setHasActiveFilters } = props;
    const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");

    const method = useForm<FormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: {
        message: "",
        requestId: "",
        level: "",
        dateFrom: null,
        dateTo: null,
      },
    });

    const { handleSubmit, reset, setValue } = method;

    const onSubmit: SubmitHandler<FormValues> = ({
      message,
      requestId,
      dateFrom,
      dateTo,
      level,
    }) => {
      onSearch({
        message,
        requestId,
        dateFrom: dateFrom
          ? moment(dateFrom).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        dateTo: dateTo ? moment(dateTo).format("YYYY-MM-DDTHH:mm:ss") : null,
        level,
      });

      setHasActiveFilters(true);
    };

    const handleReset = () => {
      reset();
      setSelectedRange("");
      onSearch(DEFAULT_DEVELOPER_LOGS_FILTER.filters);
      setHasActiveFilters(false);
    };

    useImperativeHandle(
      ref,
      () => ({
        handleReset,
      }),
      [handleReset]
    );

    const getDateRange = (range: DateRangeType) => {
      const today = moment();

      switch (range) {
        case "Last15Min":
          return {
            from: today.clone().subtract(15, "minutes"),
            to: today.clone(),
          };
        case "Last1Hour":
          return {
            from: today.clone().subtract(1, "hour"),
            to: today.clone(),
          };
        case "Today":
          return {
            from: today.clone().startOf("day"),
            to: today.clone().endOf("day"),
          };
        case "Yesterday":
          return {
            from: today.clone().subtract(1, "day").startOf("day"),
            to: today.clone().subtract(1, "day").endOf("day"),
          };
        case "Last7Days":
          return {
            from: today.clone().subtract(7, "day").startOf("day"),
            to: today.clone().endOf("day"),
          };
        default:
          return null;
      }
    };

    const handleDateRangeChange = (e: SelectChangeEvent<DateRangeType>) => {
      const value = e.target.value as DateRangeType;
      const dateRange = getDateRange(value);

      if (value === "custom") {
        setValue("dateFrom", null, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("dateTo", null, {
          shouldDirty: true,
          shouldValidate: true,
        });
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
      <FormProvider<FormValues> {...method}>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormTextField name="message" label="Message" />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormTextField name="requestId" label="Request Id" />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormSelectField
                name="level"
                label="Log Level"
                options={LOG_LEVEL_OPTIONS}
                valueKey="id"
                labelKey="label"
              />
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
                <Grid size={{ xs: 6, md: 6, lg: 6 }}>
                  <FormDateTimePicker
                    name="dateFrom"
                    label="From"
                    format="MMM Do, YYYY, hh:mm A"
                    maxDateTime={moment()}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 6, lg: 6 }}>
                  <FormDateTimePicker
                    name="dateTo"
                    label="To"
                    format="MMM Do, YYYY, hh:mm A"
                    maxDateTime={moment()}
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
