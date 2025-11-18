import { yupResolver } from "@hookform/resolvers/yup";
import Grid from "@mui/material/Grid2";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
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
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
  useState,
} from "react";
import moment from "moment";
import { KPIGoalRequestFilter } from "@/services/KPI/types";
import { DEFAULT_KPI_GOAL_FILTERS } from "@/pages/KPI/constant";
import FormDatePicker from "@/components/FormDatePicker";
import FormTextField from "@/components/FormTextField";
import DepartmentAutocomplete from "@/pages/Employee/components/DepartmentAutocomplete";


const getDateRange = (range: DateRangeType) => {
  const today = moment();

  switch (range) {
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
    default:
      return null;
  }
};

type DateRangeType = "previous15Days" | "previous30Days" | "previous90Days" | "custom";
const dateRangeOptions = [
  { id: "previous15Days", label: "Past 15 Days" },
  { id: "previous30Days", label: "Past 30 Days" },
  { id: "previous90Days", label: "Past 90 Days" },
  { id: "custom", label: "Custom" },
];



const validationSchema = Yup.object().shape({
  title: Yup.string().nullable(),
  departmentId: Yup.string().nullable(),
  createdOnFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  createdOnTo: Yup.mixed<moment.Moment>().defined().nullable(),
  createdBy: Yup.string().nullable(),
});


type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onSearch: (values: KPIGoalRequestFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

export type FilterFormHandle = {
  handleReset: () => void;
};

const KpiGoalFilterForm = forwardRef<FilterFormHandle, FilterFormProps>(
  (props, ref) => {
    const { onSearch, setHasActiveFilters } = props;
    const [selectedRange, setSelectedRange] = useState<"" | DateRangeType>("");

    const method = useForm<FormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues:  {
        title:"",
        createdBy:"",
        departmentId:"",
        createdOnFrom:null,
        createdOnTo:null
         

      },
    });

    const { reset, handleSubmit, setValue } = method;

   

    const onSubmit: SubmitHandler<FormValues> = (values) => {
      onSearch({
        title: values.title?.length ?values.title: null,
        departmentId: values.departmentId?Number(values.departmentId) : null,
        createdOnFrom: values.createdOnFrom ? moment(values.createdOnFrom).format("YYYY-MM-DD") :null,
        createdOnTo: values.createdOnTo ? moment(values.createdOnTo).format("YYYY-MM-DD") : null,
        createdBy:values.createdBy ?values.createdBy : null,
      });
      setHasActiveFilters(true);
    };

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

    const handleReset = () => {
      reset();
      onSearch(DEFAULT_KPI_GOAL_FILTERS);
      setSelectedRange("")
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
             <FormTextField name="title" label="Title" />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
<DepartmentAutocomplete/>
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
                    name="createdOnFrom"
                    label="Created From"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <FormDatePicker
                    name="createdOnTo"
                    label="Created To"
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

export default KpiGoalFilterForm;
