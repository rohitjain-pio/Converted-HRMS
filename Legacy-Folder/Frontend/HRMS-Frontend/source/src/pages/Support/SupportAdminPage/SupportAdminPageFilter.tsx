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
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import FormSelectField from "@/components/FormSelectField";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { BUG_TYPE_OPTIONS, FEEDBACK_STATUS_OPTIONS } from "@/utils/constants";
import { FeedbackTypeFilter } from "@/services/Support/types";
import { DEFAULT_FEEDBACK_TYPE_FILTERS } from "./constant";
import FormTextField from "@/components/FormTextField";
import { dateRangeOptions, DateRangeType, getDateRange } from "../utils";
import FormDatePicker from "@/components/FormDatePicker";
import moment from "moment";

const validationSchema = Yup.object().shape({
  ticketStatus: Yup.string().nullable(),
  feedbackType: Yup.string().nullable(),
  supportId: Yup.string().nullable(),
  createdFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  createdTo: Yup.mixed<moment.Moment>().defined().nullable(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onSearch: (values: FeedbackTypeFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

export type FilterFormHandle = {
  handleReset: () => void;
};
export const FeedbackReportTableFilter = forwardRef<
  FilterFormHandle,
  FilterFormProps
>((props, ref) => {
  const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");
  const handleDateRangeChange = (e: SelectChangeEvent<DateRangeType>) => {
    const value = e.target.value as DateRangeType;
    const dateRange = getDateRange(value);

    if (value === "custom") {
      setValue("createdFrom", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("createdTo", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else if (dateRange) {
      setValue("createdFrom", dateRange.from, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("createdTo", dateRange.to, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setSelectedRange(value);
  };
  const { onSearch, setHasActiveFilters } = props;
  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),

    defaultValues: {
      ticketStatus: "",
      feedbackType: "",
      supportId: "",
      createdFrom: null,
      createdTo: null,
    },
  });
  const { reset, handleSubmit, setValue } = method;
  const handleReset = () => {
    reset({
      ticketStatus: "",
      feedbackType: "",
       createdFrom:null,
      createdTo:null
    });
    onSearch(DEFAULT_FEEDBACK_TYPE_FILTERS);
    setHasActiveFilters(false);
    setSelectedRange("");
  };
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    console.log(values);
    onSearch({
      ticketStatus: Number(values?.ticketStatus),
      feedbackType: Number(values?.feedbackType),
      searchQuery: values?.supportId ?? "",
      createdOnFrom: values.createdFrom
        ? moment(values.createdFrom).format("YYYY-MM-DD")
        : null,
      createdOnTo: values.createdTo
        ? moment(values.createdTo).format("YYYY-MM-DD")
        : null,
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
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              name="ticketStatus"
              label="Ticket Status"
              options={FEEDBACK_STATUS_OPTIONS}
              valueKey="value"
              labelKey="label"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              name="feedbackType"
              label="Type"
              options={BUG_TYPE_OPTIONS}
              valueKey="value"
              labelKey="label"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormTextField name="supportId" label="Support Query" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
              <InputLabel> Created On </InputLabel>
              <Select
                value={selectedRange}
                onChange={handleDateRangeChange}
                label="Select Created On Range"
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
                <FormDatePicker name="createdFrom" label="Created On From" />
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <FormDatePicker name="createdTo" label="Created On To" />
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
