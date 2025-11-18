import { forwardRef, useImperativeHandle } from "react";
import * as Yup from "yup";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import moment from "moment";
import Grid from "@mui/material/Grid2";
import ResetButton from "@/components/ResetButton/ResetButton";
import { momentToFormatString } from "@/utils/helpers";
import FormDatePicker from "@/components/FormDatePicker";
import SubmitButtonSimple from "@/components/SubmitButtonSimple/SubmitButtonSimple";

const validationSchema = Yup.object().shape({
  forDate: Yup.mixed<moment.Moment>()
    .defined()
    .required("For Date is required"),
});

type TriggerPayload = {
  forDate: string;
};

type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onTrigger: (values: TriggerPayload) => void;
  loading?: boolean;
};

export type FilterFormHandle = {
  handleReset: () => void;
};

const FetchTimeDoctorStatsFormForm = forwardRef<
  FilterFormHandle,
  FilterFormProps
>((props, ref) => {
  const { onTrigger, loading } = props;

  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      forDate: moment(),
    },
  });

  const { handleSubmit, reset } = method;

  const onSubmit: SubmitHandler<FormValues> = ({ forDate }) => {
    onTrigger({
      forDate: momentToFormatString(forDate),
    });
  };

  const handleReset = () => {
    reset();
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
          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <FormDatePicker
              name="forDate"
              label="For Date"
              format="MMM Do, YYYY"
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 12, lg: 12 }}
            sx={{ pt: 2, paddingTop: 0, alignContent: "center" }}
          >
            <Stack direction="row" sx={{ gap: 2, justifyContent: "center" }}>
              <SubmitButtonSimple loading={loading}>Run</SubmitButtonSimple>
              <ResetButton onClick={handleReset} />
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
});

export default FetchTimeDoctorStatsFormForm;
