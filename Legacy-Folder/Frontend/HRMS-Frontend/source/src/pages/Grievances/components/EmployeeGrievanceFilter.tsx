import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
} from "react";
import { GetEmployeeGrievanceFilter } from "@/services/Grievances";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { DEFAULT_EMPLOYEE_GRIEVANCE_FILTERS } from "@/pages/Grievances/constants";
import Grid from "@mui/material/Grid2";
import FormSelectField from "@/components/FormSelectField";
import {
  GRIEVANCE_STATUS_OPTIONS,
  GrievanceStatus,
} from "@/utils/constants";
import { Box, Stack } from "@mui/material";
import GrievanceTypeSelect from "@/pages/Grievances/components/GrievanceTypeSelect";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";

const validationSchema = Yup.object().shape({
  grievanceTypeId: Yup.string().defined().nullable(),
  status: Yup.string().defined().nullable(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

type EmployeeGrievanceFilterProps = {
  onSearch: (values: GetEmployeeGrievanceFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

export type EmployeeGrievanceFilterHandle = {
  handleReset: () => void;
};

const EmployeeGrievanceFilter = forwardRef<
  EmployeeGrievanceFilterHandle,
  EmployeeGrievanceFilterProps
>((props, ref) => {
  const { onSearch, setHasActiveFilters } = props;

  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      grievanceTypeId: "",
      status: "",
    },
  });

  const { reset, handleSubmit } = method;

  const handleReset = () => {
    reset();
    onSearch(DEFAULT_EMPLOYEE_GRIEVANCE_FILTERS);
    setHasActiveFilters(false);
  };

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    onSearch({
      grievanceTypeId: values.grievanceTypeId
        ? Number(values.grievanceTypeId)
        : null,
      status: values.status ? (Number(values.status) as GrievanceStatus) : null,
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
      <Box
        component="form"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <GrievanceTypeSelect
              name="grievanceTypeId"
              label="Grievance Type"
              isEditable
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormSelectField
              label="Status"
              name="status"
              options={GRIEVANCE_STATUS_OPTIONS}
            />
          </Grid>
          <Grid size={12} sx={{ pt: 2 }}>
            <Stack direction="row" sx={{ gap: 2, justifyContent: "center" }}>
              <SubmitButton />
              <ResetButton onClick={handleReset} />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
});

export default EmployeeGrievanceFilter;
