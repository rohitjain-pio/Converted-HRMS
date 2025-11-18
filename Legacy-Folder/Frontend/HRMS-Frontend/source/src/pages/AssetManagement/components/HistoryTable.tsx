import {
  Box,
  FormLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  MRT_SortingState,
  MRT_PaginationState,
  MRT_ColumnDef,
  useMaterialReactTable,
  MaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import {
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABEL,
} from "@/utils/constants";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PageHeader from "@/components/PageHeader/PageHeader";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { useParams } from "react-router-dom";
import useAsync from "@/hooks/useAsync";

import methods from "@/utils";
import {
  GetItAssetHistory,
  ItAssetHistory,
} from "@/services/AssetManagement/types";
import { getItHistory } from "@/services/AssetManagement";
import { formatDate } from "@/utils/formatDate";

function getSerialNumber(
  pageIndex: number,
  pageSize: number,
  rowIndex: number
) {
  return pageIndex * pageSize + rowIndex + 1;
}

export const HistoryTable = () => {
  const { assetId } = useParams();
  const initPagination: MRT_PaginationState = {
    pageIndex: 0,
    pageSize: 10,
  };
  const [data, setData] = useState<ItAssetHistory[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageError, setPageError] = useState("");
  const [goToPage, setGoToPage] = useState("");
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  useAsync<GetItAssetHistory>({
    requestFn: async (): Promise<GetItAssetHistory> => {
      return await getItHistory(Number(assetId));
    },
    onSuccess: ({ data }) => {
      setData(data.result || []);
      setTotalRecords(data.result?.length || 0);
    },
    autoExecute: true,
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const columns = useMemo<MRT_ColumnDef<ItAssetHistory>[]>(
    () => [
      {
        header: "S No.",
        id: "sNo",
        size: 20,
        enableSorting: false,
        visibleInShowHideMenu: false,
        Cell: ({ staticRowIndex }) => (
          <>
            {typeof staticRowIndex === "number"
              ? getSerialNumber(
                  pagination.pageIndex,
                  pagination.pageSize,
                  staticRowIndex
                )
              : null}
          </>
        ),
      },

      {
        header: "Employee Name",
        accessorKey: "employeeName",
        accessorFn: (row: ItAssetHistory) =>
          row.employeeName?.trim() ? row.employeeName : "NIL",
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
  const table = useMaterialReactTable({
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    columns: columns,
    data: data,
    enableColumnActions: false,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
    enableFilters: false,
    enableDensityToggle: false,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      sorting: sorting,
    },
    rowCount: totalRecords,
    muiPaginationProps: {
      showFirstButton: true,
      showLastButton: true,
      rowsPerPageOptions: [10, 25, 50, 100],
    },
    muiTableHeadRowProps: {
      sx: {
        bgcolor: "#1E75BB",
      },
    },
    muiTableHeadCellProps: {
      sx: (theme) => ({
        color: theme.palette.primary.contrastText,
        textTransform: "inherit",
        "& .Mui-TableHeadCell-Content-Labels": {
          "& .MuiTableSortLabel-icon": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
          "& :hover": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
          "& .Mui-active": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
        },
      }),
    },
    autoResetPageIndex: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderBottomToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "1rem",
          p: "1rem",
        }}
      >
        <FormLabel sx={{ color: "#595959" }}>Go To Page</FormLabel>
        <TextField
          value={goToPage}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setGoToPage(value);
            setPageError("");
          }}
          size="small"
          sx={{
            width: "5rem",
            fontSize: "0.875rem",
            lineHeight: "1.4375rem",
            "& .MuiInputBase-root": {
              pr: 0.5,
            },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end" sx={{ ml: 0 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    disabled={goToPage.length === 0}
                    onClick={() => {
                      const maxPage = Math.ceil(
                        totalRecords / pagination.pageSize
                      );

                      const pageNumber = Number.parseInt(goToPage);
                      if (pageNumber >= 1 && pageNumber <= maxPage) {
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: pageNumber - 1,
                        }));
                        setPageError("");
                      } else {
                        setPageError(`Page ${pageNumber} does not exist.`);
                      }
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
            htmlInput: {
              inputMode: "decimal",
            },
          }}
        />

        {pageError && (
          <Typography variant="body2" color="error" sx={{ minWidth: "150px" }}>
            {pageError}
          </Typography>
        )}
      </Box>
    ),
  });
  return (
    <>
      <Paper elevation={3}>
        <PageHeader variant="h2" title="History" hideBorder={true} />
        <Box padding="20px">
          <MaterialReactTable table={table} />
        </Box>
      </Paper>
    </>
  );
};
