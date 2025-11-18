import { Grid } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FilterFormProps } from "@/pages/Nominee/types";
import ResetButton from "@/components/ResetButton/ResetButton";
import RelationshipSelectField from "@/pages/Nominee/components/RelationshipSelectField";
import FormTextField from "@/components/FormTextField";
import { useEffect, useState } from "react";
import { OTHER_RELATIONSHIP_ID } from "@/utils/constants";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import SearchIcon from "@mui/icons-material/Search";
import { regex } from "@/utils/regexPattern";

const { nameMaxLength_35 } = regex;

const validationSchema = Yup.object().shape({
  nomineeName: Yup.string(),
  relationshipId: Yup.string(),
  others: Yup.string()
    .trim()
    .max(nameMaxLength_35.number, nameMaxLength_35.message)
    .when("relationshipId", {
      is: (value: string) => value === OTHER_RELATIONSHIP_ID.toString(),
      then: (schema) => schema.required("Relationship is required"),
      otherwise: (schema) => schema,
    }),
});

type FormData = Yup.InferType<typeof validationSchema>;

const FilterForm: React.FC<FilterFormProps> = ({ onSearch, addIcon }) => {
  const [showOtherRelationship, setShowOtherRelationship] = useState(false);
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nomineeName: "",
      relationshipId: "",
      others: "",
    },
  });

  const { handleSubmit, watch, reset } = method;

  const selectedRelationship = watch("relationshipId");

  useEffect(() => {
    if (Number(selectedRelationship) === OTHER_RELATIONSHIP_ID) {
      setShowOtherRelationship(true);
    } else {
      setShowOtherRelationship(false);
    }
  }, [selectedRelationship]);

  const onSubmit = ({ nomineeName, relationshipId, others }: FormData) => {
    onSearch({
      nomineeName,
      relationshipId,
      others,
    });
  };

  const handleReset = () => {
    reset();
    onSearch({ nomineeName: "", relationshipId: "", others: "" });
  };

  return (
    <FormProvider<FormData> {...method}>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid container sx={{ gap: 2 }}>
          <Grid item xs={12} md="auto">
            <FormTextField name="nomineeName" label="Nominee Name" />
          </Grid>
          <Grid item xs={12} md="auto">
            <RelationshipSelectField />
          </Grid>
          {showOtherRelationship && (
            <Grid item xs={12} md="auto">
              <FormTextField
                name="others"
                label="Specify Relationship"
                required
              />
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
