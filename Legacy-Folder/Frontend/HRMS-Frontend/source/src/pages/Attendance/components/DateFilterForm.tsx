import React from "react";
import { Box } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import moment from "moment";
import SearchIcon from "@mui/icons-material/Search";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import FormDatePicker from "@/components/FormDatePicker";
import { validationProp } from "@/pages/Attendance/Employee";

interface DateFilterFormProps {
  filterStartDate: string;
  setFilterStartDate: (date: string) => void;
  filterEndDate: string;
  setFilterEndDate: (date: string) => void;
  setStartIndex: (idx: number) => void;
  setPageSize: (size: number) => void;
  validationSchema: Yup.ObjectSchema<validationProp>;
}

export const DateFilterForm: React.FC<DateFilterFormProps> = ({
  setFilterStartDate,
  setFilterEndDate,
  setStartIndex,
  setPageSize,
  validationSchema,
}) => {
  const method = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      start: undefined,
      end: undefined,
    },
  });
  const { handleSubmit, reset } = method;

  const onSubmit = (data: { start?: unknown; end?: unknown }) => {
    const startDate = data.start
      ? moment(data.start).format("YYYY-MM-DD")
      : undefined;
    const endDate = data.end
      ? moment(data.end).format("YYYY-MM-DD")
      : undefined;
    setFilterStartDate(startDate ? startDate : "");
    setFilterEndDate(endDate ? endDate : "");
    setStartIndex(1);
    setPageSize(10);
  };

  const handleReset = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    reset({ start: undefined, end: undefined });
  };

  return (
    <FormProvider {...method}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          width: "100%",
          height: "100%",
          justifyContent: { xs: "center", sm: "flex-start" },
          mr: { xs: 0, md: 4 },
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormDatePicker label="Start Date" name="start" maxDate={moment()} />
        <FormDatePicker label="End Date" name="end" maxDate={moment()} />
        <RoundActionIconButton
          label="Search"
          type="submit"
          size="small"
          icon={<SearchIcon />}
        />
        <ResetButton onClick={handleReset} size="small" isIcon={true} />
      </Box>
    </FormProvider>
  );
};
