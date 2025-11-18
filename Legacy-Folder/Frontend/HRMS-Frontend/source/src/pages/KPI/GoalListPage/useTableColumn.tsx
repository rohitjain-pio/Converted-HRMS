import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import {  goalList } from "@/services/KPI";
import { hasPermission } from "@/utils/hasPermission";
import {  permissionValue } from "@/utils/constants";
import moment from "moment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/material";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { useNavigate } from "react-router-dom";
export type UseTableColumnsProps= {
  pagination: MRT_PaginationState;
  openConfirmationDialog: (goalId: number) => void
}

export const useTableColumns = ({ pagination ,openConfirmationDialog}: UseTableColumnsProps) => {
    const {KPI}=permissionValue
    const navigate=useNavigate()
  const columns = useMemo<MRT_ColumnDef<goalList>[]>(
    () => [
      {
             header: "Title",
             accessorKey: "title",
             size: 180,
             accessorFn: (row: goalList) => (
               <TruncatedText
                 text={row.title}
                 tooltipTitle={row.title}
                 maxLength={30}
               />
             ),
             visibleInShowHideMenu: false,
             enableHiding: false,
           },
           {
             header: "Description",
             accessorKey: "description",
             enableSorting: false,
             accessorFn: (row: goalList) => (
               <TruncatedText
                 text={row.description}
                 tooltipTitle={row.description}
                 maxLength={30}
               />
             ),
             size: 150,
             visibleInShowHideMenu: false,
             enableHiding: false,
           },
           {
             header: "Department",
             accessorKey: "department",
     
             size: 150,
           },
           {
             header: "Created By",
             accessorKey: "createdBy",
     
             size: 150,
           },
           {
             header: "Created At",
             accessorKey: "createdOn",
             accessorFn: (row: goalList) =>
               moment(row.createdOn).format("DD MMM YYYY"),
             size: 120,
           },
           ...(hasPermission(KPI.EDIT) || hasPermission(KPI.DELETE)
             ? [
                 {
                   header: "Actions",
                   id: "actions",
                   size: 120,
                   enableSorting: false,
                   visibleInShowHideMenu: false,
                   enableHiding: false,
                   enablePinning: true,
                   accessorFn: (row: goalList) => (
                     <Box
                       aria-label="Action buttons"
                       sx={{ display: "flex", gap: "10px" }}
                     >
                       {hasPermission(KPI.EDIT) ? (
                         <ActionIconButton
                           label="Edit Goal"
                           colorType="primary"
                           icon={<EditIcon />}
                           onClick={() => navigate(`Edit-Goal/${row.id}`)}
                         />
                       ) : null}
                       {hasPermission(KPI.DELETE) ? (
                         <ActionIconButton
                           label="Delete Goal"
                           size="small"
                           onClick={() => openConfirmationDialog(Number(row.id))}
                           icon={<DeleteIcon />}
                           colorType="error"
                         />
                       ) : null}
                     </Box>
                   ),
                 },
               ]
             : []),
    ],
    [pagination]
  );

  return columns;
};
