import {
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import {
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { AdjustedLeave } from "@/services/EmployeeLeave";
import {
  initialPagination,
} from "@/utils/constants";
import { useTableColumns } from "./useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import { VisibilityState } from "node_modules/@tanstack/table-core/build/lib/features/ColumnVisibility";
import TableTopToolBar from "./TableTopToolbar";

const EARLIEST_YEAR = 2025;
const CURRENT_YEAR = moment().year();

const buildYearsDesc = (fromYear: number, toYear: number) =>
  Array.from({ length: fromYear - toYear + 1 }, (_, i) => fromYear - i);

function getWorkDaysLabel(numberOfDays: number | null) {
  if (typeof numberOfDays !== "number") {
    return null;
  }

  switch (numberOfDays) {
    case 0.5:
      return "Half Day";

    case 1:
      return "Full Day";

    default:
      return `${numberOfDays} days`;
  }
}
type Props = {
  data: AdjustedLeave[];
  fetchData: () => Promise<void>;
  setSelectedType: (selectedType: "compOff" | "leaveSwap" | null) => void;
};
const CompAndSwapTable = ({ data, fetchData, setSelectedType }: Props) => {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const years = useMemo(() => buildYearsDesc(CURRENT_YEAR, EARLIEST_YEAR), []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const m = moment(row.createdOn);
      if (!m.isValid()) return false;
      return m.year() === selectedYear;
    });
  }, [data, selectedYear]);

  const handleSelectedYearChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    console.table({ value, type: typeof value });
    setSelectedYear(Number(value));
  };
  useEffect(() => {
    fetchData();
  }, []);

  const columns = useTableColumns({ pagination, getWorkDaysLabel });

  return (
    <Stack gap={3}>
      <MaterialDataTable<AdjustedLeave>
        columns={columns}
        data={filteredData}
        pagination={pagination}
        sorting={sorting}
        columnVisibility={columnVisibility}
        totalRecords={data.length}
        setPagination={setPagination}
        setSorting={setSorting}
        setColumnVisibility={setColumnVisibility}
        manualPagination={true}
        manualSorting={true}
        topToolbar={() => (
          <TableTopToolBar
            selectedYear={selectedYear}
            years={years}
            handleSelectedYearChange={handleSelectedYearChange}
            setSelectedType={setSelectedType}
          />
        )}
      />
    </Stack>
  );
};

export default CompAndSwapTable;
