import React, {  useState, useRef, useEffect } from "react";
import {
  Box,

} from "@mui/material";
import { AttendanceRow, EditDetails } from "@/pages/Attendance/types";
import { VisibilityState } from "@tanstack/table-core";
import {
  MRT_SortingState,
} from "material-react-table";
import  {
  AttendanceFilter,
  FilterFormHandle,
} from "@/pages/Attendance/components/AttendanceFilter";
import MaterialDataTable from "@/components/MaterialDataTable";

import { useTableColumns } from "@/pages/Attendance/components/AttendanceTable/useTableColumn";
import TableTopToolbar from "@/pages/Attendance/components/AttendanceTable/TableTopToolbar";

interface AttendanceTableProps {
  rows: AttendanceRow[];
  startIndex: number;
  pageSize: number;
  setStartIndex: (idx: number) => void;
  setPageSize: (size: number) => void;
  totalRecords?: number;
  setOpenTimeIn: (flag: boolean) => void;
  setEditDetail: (data: EditDetails) => void;
  setFilterStartDate: (date: string) => void;
  setFilterEndDate: (date: string) => void;
  setOpenTimeOut: (flag: boolean) => void;
  isManualAttendance: boolean;
  showTimeInButton: boolean;
  handleTimeInButton: () => void;
  isLoading: boolean;
}
const AttendanceTable: React.FC<AttendanceTableProps> = ({
  rows,
  startIndex,
  pageSize,
  setStartIndex,
  setPageSize,
  totalRecords,
  setOpenTimeIn,
  setEditDetail,
  setFilterStartDate,
  setFilterEndDate,
  setOpenTimeOut,
  isManualAttendance,
  showTimeInButton,
  handleTimeInButton,
  isLoading,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const filterFormRef = useRef<FilterFormHandle>(null);
  
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: startIndex,
    pageSize: pageSize,
  });
  useEffect(()=>{
    setStartIndex(pagination.pageIndex)
    setPageSize(pagination.pageSize)
  },[pagination])
  const handleEditClick = (row: AttendanceRow) => {
    setEditDetail({
      id: row.id,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime ?? undefined,
      location: row.location,
      reason: row.audit[0]?.reason || "",
      totalHours: row.totalHours || "",
    });

    setOpenTimeIn(true);
  };
  const handleSearch = (filters: AttendanceFilter) => {
    setFilterEndDate(filters?.endDate);
    setFilterStartDate(filters?.startDate);
    const active = filters.startDate !== "" || filters.endDate !== "";
    setHasActiveFilters(active);
  };
  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
    setFilterStartDate("");
    setFilterEndDate("");
    setHasActiveFilters(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const columns = useTableColumns({
    pagination,
    handleEditClick,
    isManualAttendance,
  });
  return (
    <>
      <Box padding={2}>
        <MaterialDataTable<AttendanceRow>
          columns={columns}
          data={rows}
          pagination={pagination}
          sorting={sorting}
          totalRecords={Number(totalRecords)}
          setPagination={setPagination}
          setSorting={setSorting}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          topToolbar={() => (
            <TableTopToolbar
              hasActiveFilters={hasActiveFilters}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              handleFilterFormReset={handleFilterFormReset}
              handleSearch={handleSearch}
              filterFormRef={filterFormRef}
              isManualAttendance={isManualAttendance}
              showTimeInButton={showTimeInButton}
              isLoading={isLoading}
              handleTimeInButton={handleTimeInButton}
              setOpenTimeOut={setOpenTimeOut}
            />
          )}
        />
      </Box>
    </>
  );
};
export default AttendanceTable
