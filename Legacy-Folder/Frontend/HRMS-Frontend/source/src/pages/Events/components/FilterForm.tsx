import { Grid } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ResetButton from "@/components/ResetButton/ResetButton";
import FormTextField from "@/components/FormTextField";
import { EventListSearchFilter } from "@/services/Events";
import StatusSelectField from "@/pages/Events/components/StatusSelectField";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import SearchIcon from "@mui/icons-material/Search";
import { ReactNode, useEffect, useState } from "react";
import { eventStatusToId } from "@/utils/constants";

const validationSchema = Yup.object().shape({
  eventName: Yup.string(),
  statusId: Yup.string(),
});

type FormDataType = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onSearch: ({ eventName, statusId }: EventListSearchFilter) => Promise<void>;
  addIcon: ReactNode;
};

const FilterForm = (props: FilterFormProps) => {
  const { onSearch, addIcon } = props;
  const [isFilteredResult, setIsFilteredResult] = useState(true);
  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      eventName: "",
      statusId: "",
    },
  });

  const { handleSubmit, reset, setValue } = method;

  const onSubmit = ({ eventName, statusId }: FormDataType) => {
    if (
      typeof eventName !== "undefined" &&
      typeof statusId !== "undefined" &&
      (Boolean(eventName) || Boolean(statusId))
    ) {
      setIsFilteredResult(true);
      onSearch({
        eventName: eventName.trim(),
        statusId: statusId === "" ? 0 : +statusId,
        isReset: true,
      });
    }
  };

  const handleReset = () => {
    reset();
    onSearch({
      eventName: "",
      statusId: 0,
      isReset: isFilteredResult,
    });
    setIsFilteredResult(false);
  };

  useEffect(() => {
    setValue("statusId", String(eventStatusToId["Upcoming"]), {
      shouldDirty: true,
    });
  }, []);

  return (
    <FormProvider<FormDataType> {...method}>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid
          container
          sx={{
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Grid item xs={12} md="auto">
            <FormTextField name="eventName" label="Event Name" />
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
