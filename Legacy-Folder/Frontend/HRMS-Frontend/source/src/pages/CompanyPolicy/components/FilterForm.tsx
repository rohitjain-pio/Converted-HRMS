import { Grid } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import CategorySelect from "@/pages/CompanyPolicy/components/CategorySelect";
import ResetButton from "@/components/ResetButton/ResetButton";
import { FilterFormProps } from "@/pages/CompanyPolicy/types";
import SearchIcon from "@mui/icons-material/Search";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import FormTextField from "@/components/FormTextField";
import StatusSelect from "@/pages/CompanyPolicy/components/StatusSelect";
import { useUserStore } from "@/store";
import { CompanyPolicyStatus, role } from "@/utils/constants";
import { useEffect } from "react";

const validationSchema = Yup.object().shape({
  name: Yup.string(),
  documentCategoryId: Yup.string(),
  statusId: Yup.string(),
});

type FormData = Yup.InferType<typeof validationSchema>;

const FilterForm: React.FC<FilterFormProps> = ({ onSearch, addIcon }) => {
  const { userData } = useUserStore();
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      documentCategoryId: "",
      statusId:
        userData.roleName !== role.EMPLOYEE
          ? ""
          : String(CompanyPolicyStatus.Active),
    },
  });

  const handleSubmit = ({ name, documentCategoryId, statusId }: FormData) => {
    onSearch({
      name,
      documentCategoryId,
      statusId,
    });
  };

  const handleReset = () => {
    method.reset();
    onSearch({
      name: "",
      documentCategoryId: "",
      statusId:
        userData.roleName !== role.EMPLOYEE
          ? ""
          : String(CompanyPolicyStatus.Active),
    });
  };

  useEffect(() => {
    if (userData.roleName !== role.EMPLOYEE) {
      method.setValue("statusId", String(CompanyPolicyStatus.Active), {
        shouldDirty: true,
      });
    }
  }, []);

  return (
    <FormProvider<FormData> {...method}>
      <form autoComplete="off" onSubmit={method.handleSubmit(handleSubmit)}>
        <Grid
          container
          sx={{
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Grid item xs={12} md="auto">
            <FormTextField name="name" label="Document Name" />
          </Grid>
          <Grid item xs={12} md="auto">
            <CategorySelect required={false} />
          </Grid>
          {userData.roleName !== role.EMPLOYEE && (
            <Grid item xs={12} md="auto">
              <StatusSelect required={false} />
            </Grid>
          )}
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
