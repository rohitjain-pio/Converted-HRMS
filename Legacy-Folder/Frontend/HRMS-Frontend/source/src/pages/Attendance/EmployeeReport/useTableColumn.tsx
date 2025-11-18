import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { BRANCH_LOCATION_LABEL, BranchLocation } from "@/utils/constants";
import {  Box, LinearProgress, Typography } from "@mui/material";
import moment from "moment";
import {  EmployeeReportTableRow } from "@/pages/Attendance/types";

 type UseTableColumnsProps= {
  pagination: MRT_PaginationState;
  dateRange: string[]
}
export const useTableColumns = ({  dateRange}: UseTableColumnsProps) => {
    
    
 const dailyColumns: MRT_ColumnDef<EmployeeReportTableRow>[] = useMemo(() => {
     return dateRange.map((date) => ({
       header: moment(date).format("ddd MMM D"),
       accessorKey: `timeEntries.${moment(date).format("YYYY-MM-DD")}`,
       id: moment(date).format("YYYY-MM-DD"),
       size: 210,
       visibleInShowHideMenu: false,
       enablePinning: false,
       enableSorting: false,
       Cell: ({ row }) => {
         let decimalHours = row.original.timeEntries?.[date] ?? 0;
         if (decimalHours === undefined || isNaN(decimalHours)) {
           decimalHours = 0;
         }
 
         const hours = Math.floor(decimalHours);
         const minutes = Math.round((decimalHours - hours) * 60);
         const display = `${hours}h${minutes > 0 ? " " + minutes + "min" : ""}`;
         return (
           <Box key={date}>
             <Typography>{display}</Typography>
             <Box sx={{ mt: 0.5 }}>
               <LinearProgress
                 variant="determinate"
                 value={Math.min((decimalHours / 10) * 100, 100)}
                 sx={{ height: 8, borderRadius: 0 }}
               />
             </Box>
           </Box>
         );
       },
     }));
   }, [dateRange]);

 
   const baseEmployeeColumns: MRT_ColumnDef<EmployeeReportTableRow>[] = [
     {
       header: "Employee Code",
       accessorKey: "employeeCode",
       size: 140,
       enableSorting: true,
       enablePinning: true,
     },
     {
       header: "Employee Name",
       accessorKey: "employeeName",
       size: 210,
       enableSorting: true,
     },
     {
       header: "Total Hours",
       accessorKey: "totalHour",
       size: 120,
       enableSorting: true,
       enablePinning: true,
       Cell: ({ row }) => {
         const [h, m] = row.original.totalHour.split(":").map(Number);
         const totalHours = `${h}h${m > 0 ? " " + m + "min" : ""}`;
         return <Typography>{totalHours}</Typography>;
       },
     },
     {
       header: "Branch",
       accessorKey: "branchId",
       id: "branchId",
       size: 180,
       enableSorting: true,
       enablePinning: true,
       Cell: ({ row }) => {
         return (
           <Typography>
             {BRANCH_LOCATION_LABEL[row.original.branch as BranchLocation]}
           </Typography>
         );
       },
     },
     {
       header: "Department",
       accessorKey: "department",
       size: 200,
       enableSorting: true,
       enablePinning: true,
     },
   ];

  return { baseEmployeeColumns, dailyColumns };
};
