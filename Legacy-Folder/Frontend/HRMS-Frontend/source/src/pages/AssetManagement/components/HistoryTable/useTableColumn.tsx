import { useMemo } from "react";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import {  ItAssetHistory } from "@/services/AssetManagement/types";
import { formatDate } from "@/utils/formatDate";
import {
    ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABEL,
} from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";

type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
};

export const useTableColumns = ({ pagination }: UseTableColumnsProps) => {

  const columns = useMemo<MRT_ColumnDef<ItAssetHistory>[]>(
    () => [
       {
            header: "Employee Name",
            accessorKey: "employeeName",
            accessorFn: (row: ItAssetHistory) =>
              row.employeeName?.trim() ? row.employeeName : "N/A",
            size: 220,
          },
          {
            header: "Asset Status",
            accessorKey: "status",
            accessorFn: (row: ItAssetHistory) =>ASSET_STATUS_LABEL[row.assetStatus],
            size: 180,
          },
          {
            header: "Asset Condition",
            accessorKey: "assetCondition",
            accessorFn: (row: ItAssetHistory) =>
              ASSET_CONDITION_LABELS[row.assetCondition],
            size: 120,
          },
          {
            header: "Updated by",
            accessorKey: "modifiedBy",
            size: 120,
          },
          {
            header: "Updated On",
            accessorKey: "modifiedOn",
            accessorFn: (row: ItAssetHistory) =>
             formatDate(row.modifiedOn),
            size: 150,
          },
           {
            header: "Issue Date",
            accessorKey: "issueDate",
            accessorFn: (row: ItAssetHistory) =>
              row.issueDate ? formatDate(row.issueDate) : "NIL",
            size: 150,
          },
          {
            header: "Return Date",
            accessorKey: "returnDate",
            accessorFn: (row: ItAssetHistory) =>
              row.returnDate ? formatDate(row.returnDate) : "NIL",
            size: 150,
          },
          {
            header: "Comment",
            id: "note",
            accessorFn: (row: ItAssetHistory) => {
              const note=row.note??"N/A"
              return(
              <TruncatedText
                tooltipTitle={note}
                text={note}
                maxLength={20}
              />
            )},
            enableSorting: false,
            size: 200,
          },
    ],
    [pagination]
  );

  return columns;
};
