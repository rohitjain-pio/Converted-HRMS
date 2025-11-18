import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Tooltip,
  FormLabel,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Badge,
} from "@mui/material";
import methods from "@/utils";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import useAsync from "@/hooks/useAsync/useAsync";
import { Link, useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  useMaterialReactTable,
} from "material-react-table";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FilterForm, { FilterFormHandle } from "@/pages/Developer/FilterForm";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { SortDirection } from "@tanstack/table-core";
import {
  DeveloperLogsFilter,
  DeveloperLogsResponse,
  DeveloperLogsResponseData,
} from "@/services/Developer/types";
import { getDeveloperLogs } from "@/services/Developer/DeveloperService";
import { DEFAULT_DEVELOPER_LOGS_FILTER } from "@/pages/Developer/constants";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import { truncate } from "@/utils/helpers";

type APISortParams = {
  sortColumnName: string;
  sortDirection: "" | SortDirection;
};

const mapSortingToApiParams = (sorting: MRT_SortingState): APISortParams => {
  if (!sorting.length) {
    return { sortColumnName: "", sortDirection: "" };
  }

  const { id, desc } = sorting[0];

  return {
    sortColumnName: id,
    sortDirection: desc ? "desc" : "asc",
  };
};

type APIPaginationParams = {
  startIndex: number;
  pageSize: number;
};

const mapPaginationToApiParams = (
  pagination: MRT_PaginationState
): APIPaginationParams => {
  return {
    startIndex: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  };
};

const Logs = () => {
  const [logs, setLogs] = useState<DeveloperLogsResponseData[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [goToPage, setGoToPage] = useState("");
  const [pageError, setPageError] = useState("");

  const initPagination: MRT_PaginationState = {
    pageIndex: 0,
    pageSize: 10,
  };

  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<FilterFormHandle>(null);

  const [filters, setFilters] = useState<DeveloperLogsFilter>(
    DEFAULT_DEVELOPER_LOGS_FILTER.filters
  );

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };

  const navigate = useNavigate();

  //   const { DEVELOPER } = permissionValue;

  const { execute: fetchLogs } = useAsync<DeveloperLogsResponse>({
    requestFn: async () => {
      return await getDeveloperLogs({
        ...mapPaginationToApiParams(pagination),
        ...mapSortingToApiParams(sorting),
        filters: { ...filters },
      });
    },
    onSuccess: (res) => {
      if (res.data) {
        setLogs(res.data.result?.logsList || []);
        setTotalRecords(res.data.result?.totalRecords || 0);
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
      setLogs([]);
    },
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination, sorting, filters]);

  const handleViewLog = (rowData: DeveloperLogsResponseData) => {
    navigate(`/developer/logs/${rowData.id}`, { state: rowData });
  };

  const columns = useMemo<MRT_ColumnDef<DeveloperLogsResponseData>[]>(
    () => [
      {
        header: "Id",
        accessorKey: "id",
        size: 50,
        visibleInShowHideMenu: true,
        enableHiding: true,
      },
      {
        header: "Level",
        accessorKey: "level",
        size: 100,
        visibleInShowHideMenu: true,
        enableHiding: true,
      },
      {
        header: "Message",
        accessorKey: "message",
        size: 200,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
      {
        header: "Request Id",
        accessorKey: "requestId",
        size: 150,
        enableSorting: false,
        visibleInShowHideMenu: true,
        enableHiding: true,
      },
      {
        header: "Timestamp",
        accessorKey: "timeStamp",
        size: 120,
        visibleInShowHideMenu: true,
        enableHiding: true,
        Cell: ({ row }) => {
          const v = row.getValue<string | null>("timeStamp");
          if (!v) return "";
          return moment(v).format("MMM Do, YYYY, hh:mm A");
          // return  moment(v).format("MMM Do YYYY, hh:mm A")
        },
      },
      {
        header: "Exception",
        accessorKey: "exception",
        size: 150,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
        Cell: ({ row }) => {
          const v = row.getValue<string | null>("exception");
          return truncate(v ?? "", { maxLength: 100 });
        },
      },
      {
        header: "Log Event",
        accessorKey: "logEvent",
        size: 150,
        enableSorting: false,
        visibleInShowHideMenu: true,
        enableHiding: true,
        Cell: ({ row }) => {
          const v = row.getValue<string | null>("logEvent");
          return truncate(v ?? "", { maxLength: 100 });
        },
      },
      {
        header: "Actions",
        id: "actions",
        size: 120,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
        enablePinning: true,
        accessorFn: (row: DeveloperLogsResponseData) => (
          <Box
            role="group"
            aria-label="Action buttons"
            sx={{ display: "flex", gap: "10px" }}
          >
            <ActionIconButton
              label="View Log Details"
              colorType="primary"
              as={Link}
              icon={<VisibilityIcon />}
              onClick={() => handleViewLog(row)}
            />
          </Box>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: logs,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableFilters: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableRowNumbers: true,
    displayColumnDefOptions: {
      "mrt-row-numbers": {
        Header: "S.No",
        header: "S.No",
        size: 80,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
    },
    initialState: {
      columnPinning: { right: ["actions"] },
      columnVisibility: {
        id: false,
        messageTemplate: false,
      },
    },
    state: {
      pagination: pagination,
      sorting: sorting,
    },
    rowCount: totalRecords,
    autoResetPageIndex: false,
    muiPaginationProps: {
      showFirstButton: true,
      showLastButton: true,
      rowsPerPageOptions: [10, 25, 50, 100],
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
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
    renderTopToolbarCustomActions: () => (
      <Box flex={1}>
        <Stack
          direction="row"
          flex={1}
          alignItems="center"
          justifySelf="flex-end"
        >
          <Stack direction="row" gap={0.5}>
            <Tooltip title="Filters">
              <IconButton
                color={hasActiveFilters ? "primary" : "inherit"}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={!hasActiveFilters}
                >
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            {hasActiveFilters ? (
              <Tooltip title="Remove Filters">
                <IconButton color="error" onClick={handleFilterFormReset}>
                  <FilterListOffIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>
        <Collapse in={showFilters} sx={{ mr: "-2.75rem" }}>
          <Box sx={{ p: 2 }}>
            <FilterForm
              onSearch={handleSearch}
              setHasActiveFilters={setHasActiveFilters}
              ref={filterFormRef}
            />
          </Box>
        </Collapse>
      </Box>
    ),
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

  const handleSearch = async (filters: DeveloperLogsFilter) => {
    setFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" hideBorder={true} title="Developer Logs" />
        <Box padding="20px">
          <MaterialReactTable table={table} />
        </Box>
      </Paper>
    </>
  );
};

export default Logs;
