import { forwardRef, useImperativeHandle } from "react";
import * as Yup from "yup";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButtonSimple from "@/components/SubmitButtonSimple/SubmitButtonSimple";
import moment from "moment";
import FormDatePicker from "@/components/FormDatePicker";

const validationSchema = Yup.object().shape({
  forMonthYear: Yup.mixed<moment.Moment>()
    .defined()
    .required("For month and year is required"),
});

type TriggerPayload = {
  forMonth: number;
  forYear: number;
};

type FormValues = Yup.InferType<typeof validationSchema>;

type FilterFormProps = {
  onTrigger: (values: TriggerPayload) => void;
  loading?: boolean;
};

export type FilterFormHandle = {
  handleReset: () => void;
};

const MonthlyLeavesCreditForm = forwardRef<FilterFormHandle, FilterFormProps>(
  (props, ref) => {
    const { onTrigger, loading } = props;

    const method = useForm<FormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: {
        forMonthYear: moment(),
      },
    });

    const { handleSubmit, reset } = method;

    const onSubmit: SubmitHandler<FormValues> = ({ forMonthYear }) => {
      onTrigger({
        forMonth: forMonthYear.month(),
        forYear: forMonthYear.year(),
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
          <Grid container spacing={2} size={12}>
            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
              <FormDatePicker
                name="forMonthYear"
                label="For Date"
                format="MMM, YYYY"
                views={["year", "month"]}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 12, lg: 12 }}
              sx={{ pt: 2, paddingTop: 0 }}
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
  }
);

export default MonthlyLeavesCreditForm;
