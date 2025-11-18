import React from "react";
import { DateFilterForm } from "@/pages/Attendance/components/DateFilterForm";
import * as Yup from "yup";
import { validationProp } from "@/pages/Attendance/Employee";

interface DateFilterProps {
  filterStartDate: string;
  setFilterStartDate: (date: string) => void;
  filterEndDate: string;
  setFilterEndDate: (date: string) => void;
  setStartIndex: (idx: number) => void;
  setPageSize: (size: number) => void;
  validationSchema: Yup.ObjectSchema<validationProp>;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  setStartIndex,
  setPageSize,
  validationSchema,
}) => {
  return (
    <DateFilterForm
      filterStartDate={filterStartDate}
      setFilterStartDate={setFilterStartDate}
      filterEndDate={filterEndDate}
      setFilterEndDate={setFilterEndDate}
      setStartIndex={setStartIndex}
      setPageSize={setPageSize}
      validationSchema={validationSchema}
    />
  );
};

export default DateFilter;
