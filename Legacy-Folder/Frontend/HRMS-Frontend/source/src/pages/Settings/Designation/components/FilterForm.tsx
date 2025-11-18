import { Grid } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import SearchIcon from "@mui/icons-material/Search";
import { FilterFormProps } from "@/pages/Settings/Designation/types";
import FormTextField from "@/components/FormTextField";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import StatusSelectField from "@/pages/Settings/components/StatusSelectFiled";

const validationSchema = Yup.object().shape({
  designation: Yup.string(),
  status: Yup.boolean().nullable(),
});

type FormData = Yup.InferType<typeof validationSchema>;

const FilterForm: React.FC<FilterFormProps> = ({ onSearch, addIcon }) => {
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      designation: "",
      status: null,
    },
  });

  const { handleSubmit, reset } = method;

  const onSubmit = ({ designation, status }: FormData) => {
    onSearch({
      designation,
      status
    });
  };

  const handleReset = () => {
    reset();
    onSearch({
      designation: "",
      status: null
    });
  };

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
            <FormTextField name="designation" label="Designation Name" />
          </Grid>
          <Grid item xs={12} md="auto">
            <StatusSelectField />
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
              {addIcon}
            </Grid>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default FilterForm;
