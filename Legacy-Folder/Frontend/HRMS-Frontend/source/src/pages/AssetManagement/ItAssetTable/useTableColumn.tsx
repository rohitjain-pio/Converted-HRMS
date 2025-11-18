import { useMemo } from "react";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { ItAsset } from "@/services/AssetManagement/types";
import { formatDate } from "@/utils/formatDate";
import {
  ASSET_STATUS_LABEL,
  ASSET_TYPE_LABEL,
  BRANCH_LOCATION_LABEL,
} from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";

type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
};

export const useTableColumns = ({ pagination }: UseTableColumnsProps) => {
  const navigate = useNavigate();

  const columns = useMemo<MRT_ColumnDef<ItAsset>[]>(
    () => [
      {
        header: "Device Code",
        accessorKey: "deviceCode",
        size: 150,
      },
      {
        header: "Device Name",
        accessorKey: "deviceName",
        size: 200,
      },
      {
        header: "Asset Type",
        enableSorting: false,
        accessorKey: "assetType",
        accessorFn: (row: ItAsset) => ASSET_TYPE_LABEL[row.assetType],
        size: 120,
      },
      {
        header: "Brand",
        accessorKey: "manufacturer",
        size: 120,
      },
      {
        header: "Branch",
        accessorKey: "branch",
        accessorFn: (row: ItAsset) => BRANCH_LOCATION_LABEL[row.branch],
        size: 120,
      },
      {
        header: "Model",
        accessorKey: "model",
        size: 120,
      },
      {
        header: "Asset Status",
        enableSorting: false,
        accessorKey: "status",
        accessorFn: (row: ItAsset) => ASSET_STATUS_LABEL[row.assetStatus],
        size: 120,
      },
      {
        header: "Last Update",
        accessorKey: "modifiedOn",
        accessorFn: (row: ItAsset) =>
          row.modifiedOn ? formatDate(row.modifiedOn) : "N/A",
        size: 150,
      },
      {
        header: "Comment",
        id: "comments",
        enableSorting: false,
        accessorFn: (row: ItAsset) => (
          <TruncatedText
            text={row.comments}
            tooltipTitle={row.comments}
            maxLength={20}
          />
        ),
        size: 180,
      },
      {
        header: "Allocated To",
        enableSorting: false,
        accessorKey: "custodian",
        accessorFn: (row: ItAsset) =>
          row.custodian == null ? "N/A" : row.custodianFullName,
        size: 200,
      },
      {
        header: "Updated By",
        accessorKey: "modifiedBy",
        enableSorting: false,
        accessorFn: (row: ItAsset) =>
          row.allocatedBy ? row.allocatedBy : "N/A",
        size: 150,
      },
      {
        header: "Actions",
        visibleInShowHideMenu: false,
        id: "actions",
        size: 120,
        enableSorting: false,
        enablePinning: true,
        Cell: ({ row }) => (
          <Tooltip title="View Asset">
            <IconButton
              aria-label="View"
              onClick={() => {
                navigate(`${row.original.id}`);
              }}
            >
              <VisibilityIcon color="primary" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [pagination]
  );

  return columns;
};
