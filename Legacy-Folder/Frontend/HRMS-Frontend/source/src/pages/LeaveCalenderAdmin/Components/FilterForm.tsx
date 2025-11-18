import { Grid } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ResetButton from "@/components/ResetButton/ResetButton";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import SearchIcon from "@mui/icons-material/Search";

import FormSelectField from "@/components/FormSelectField";
import FormDatePicker from "@/components/FormDatePicker";


import DepartmentAutocomplete from "@/pages/Employee/components/DepartmentAutocomplete";
import moment from "moment";

const validationSchema = Yup.object().shape({
  date: Yup.mixed().nullable(),

  status: Yup.string(),

  departmentId: Yup.string(),

  // leaveTypeId: Yup.string(),
});

interface FilterFormProps {
  onSearch: (data: FormData) => void;
  roleId?: string;
}

export type FormData = Yup.InferType<typeof validationSchema>;

const FilterForm: React.FC<FilterFormProps> = ({ onSearch }) => {
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      departmentId: "",
      status: "",
      // leaveTypeId: "",
      date: null,
    },
  });

  const { handleSubmit, reset } = method;

  const onSubmit = ({
    departmentId,
    status,

    // leaveTypeId,
    date,
  }: FormData) => {
    onSearch({
      departmentId,
      status,

      // leaveTypeId,
      date,
    });
  };

  const handleReset = () => {
    reset();
    onSearch({
      departmentId: "",
      status: "",
      // leaveTypeId: "",
      date: null,
    });
  };
  const status = [
    { id: 1, label: "Pending" },
    { id: 2, label: "Approved" },
  ];

  return (
    <FormProvider<FormData> {...method}>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid
          container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Grid item xs={12} md="auto">
            <DepartmentAutocomplete />
          </Grid>

          <Grid item xs={12} md="auto" sx={{ minWidth: "168px" }}>
            <FormSelectField
              label="Leave Status"
              name="status"
              options={status}
              valueKey="id"
              labelKey="label"
            />
          </Grid>
          {/* <Grid item xs={12} md="auto" sx={{ minWidth: "168px" }}>
            <LeaveTypeSelectField />
          </Grid> */}
          <Grid item xs={12} md="auto">
            <FormDatePicker
              name="date"
              minDate={moment().subtract(1, "year").startOf("year")}
              maxDate={moment().add(1, "year").endOf("year")}
              label="Month/Year"
              views={["month", "year"]}
            />
          </Grid>
          <Grid item xs={12} md="auto">
            <Grid container sx={{ gap: 2 }}>
              <RoundActionIconButton
                label="Search"
                type="submit"
                size="small"
                icon={<SearchIcon />}
              />
              <ResetButton onClick={handleReset} size="small" isIcon={true} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default FilterForm;
