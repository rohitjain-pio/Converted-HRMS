import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
} from "@mui/material";
import methods from "@/utils";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import useAsync from "@/hooks/useAsync/useAsync";
import { useNavigate } from "react-router-dom";
import {
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import {
  FilterFormHandle,
} from "@/pages/Developer/Logging/FilterForm";
import {
  VisibilityState,
} from "@tanstack/table-core";
import {
  DeveloperLogsFilter,
  DeveloperLogsResponse,
  DeveloperLogsResponseData,
} from "@/services/Developer/types";
import { getDeveloperLogs } from "@/services/Developer/DeveloperService";
import { DEFAULT_DEVELOPER_LOGS_FILTER } from "@/pages/Developer/constants";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { useTableColumns } from "./useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolbar from "./TableTopToolbar";
import { initialPagination } from "@/utils/constants";

const Logs = () => {
  const [logs, setLogs] = useState<DeveloperLogsResponseData[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<FilterFormHandle>(null);

  const [filters, setFilters] = useState<DeveloperLogsFilter>(
    DEFAULT_DEVELOPER_LOGS_FILTER.filters
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
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

  const columns = useTableColumns({ pagination, handleViewLog });

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
          <MaterialDataTable<DeveloperLogsResponseData>
            columns={columns}
            data={logs}
            pagination={pagination}
            sorting={sorting}
            columnVisibility={columnVisibility}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            setColumnVisibility={setColumnVisibility}
            topToolbar={() => (
              <TableTopToolbar
                hasActiveFilters={hasActiveFilters}
                setShowFilters={setShowFilters}
                showFilters={showFilters}
                handleFilterFormReset={handleFilterFormReset}
                handleSearch={handleSearch}
                setHasActiveFilters={setHasActiveFilters}
                filterFormRef={filterFormRef}
              />
            )}
          />
        </Box>
      </Paper>
    </>
  );
};

export default Logs;
