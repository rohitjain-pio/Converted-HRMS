import { FilterFormHandle, UserGuideStatus } from "@/utils/constants";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import FormTextField from "@/components/FormTextField";
import UserGuideStatusSelect from "../components/UserGuideStatusSelect";
import FormDatePicker from "@/components/FormDatePicker";
import Stack from "@mui/material/Stack";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
} from "react";
import { DEFAULT_USER_GUIDE_FILTERS } from "./constants";
import { GetUserGuideFilter } from "@/services/UserGuide";

const validationSchema = Yup.object({
  modifiedOn: Yup.mixed<moment.Moment>().nullable().default(null),
  createdOn: Yup.mixed<moment.Moment>().nullable().default(null),
  menuName: Yup.string().trim().default(""),
  status: Yup.string().trim().default(""),
  title: Yup.string().trim().default(""),
});

type FormValues = Yup.InferType<typeof validationSchema>;

const defaultFormValues: FormValues = {
  modifiedOn: null,
  createdOn: null,
  menuName: "",
  status: "",
  title: "",
};

type UserGuideTableFilterProps = {
  onSearch: (values: GetUserGuideFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

const UserGuideTableFilter = forwardRef<
  FilterFormHandle,
  UserGuideTableFilterProps
>((props, ref) => {
  const { onSearch, setHasActiveFilters } = props;

  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, handleSubmit } = method;

  const handleReset = () => {
    reset();
    onSearch(DEFAULT_USER_GUIDE_FILTERS);
    setHasActiveFilters(false);
  };

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    onSearch({
      modifiedOn: null,
      createdOn: values.createdOn
        ? moment(values.createdOn).format("YYYY-MM-DD")
        : null,
      menuName: values.menuName,
      status: values.status ? (Number(values.status) as UserGuideStatus) : null,
      title: values.title,
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
            <FormTextField name="title" label="Title" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormTextField name="menuName" label="Menu" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <UserGuideStatusSelect name="status" label="Status" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormDatePicker
              name="createdOn"
              label="Created On"
              format="MMM Do, YYYY"
              maxDate={moment()}
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

export default UserGuideTableFilter;
