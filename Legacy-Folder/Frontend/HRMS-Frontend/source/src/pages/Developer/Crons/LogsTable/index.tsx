import { useEffect, useRef, useState } from "react";
import { Box, Paper } from "@mui/material";
import methods from "@/utils";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import useAsync from "@/hooks/useAsync/useAsync";
import { useNavigate } from "react-router-dom";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { FilterFormHandle } from "@/pages/Developer/Crons/FilterForm";
import { VisibilityState } from "@tanstack/table-core";
import { initialPagination } from "@/utils/constants";
import {
  CronLogsFilter,
  CronLogsResponse,
  CronLogsResponseData,
} from "@/services/Developer/types";
import { getCronLogs } from "@/services/Developer/DeveloperService";
import { DEFAULT_CRON_LOGS_FILTER } from "@/pages/Developer/Crons/constants";
import CronForm from "@/pages/Developer/Crons/CronForm";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { useTableColumns } from "./useTableColumns";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolbar from "./TableTopToolbar";

const Logs = () => {
  const [logs, setLogs] = useState<CronLogsResponseData[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<FilterFormHandle>(null);

  const [filters, setFilters] = useState<CronLogsFilter>(
    DEFAULT_CRON_LOGS_FILTER.filters
  );

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };

  const { execute: fetchLogs } = useAsync<CronLogsResponse>({
    requestFn: async () => {
      return await getCronLogs({
        ...mapPaginationToApiParams(pagination),
        ...mapSortingToApiParams(sorting),
        filters: { ...filters },
      });
    },
    onSuccess: (res) => {
      if (res.data) {
        setLogs(res.data.result?.cronLogsList || []);
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

  const navigate = useNavigate();
  const handleViewLog = (id: number) => {
    navigate(`/developer/logs/${id}`, { state: {} });
  };

  const columns = useTableColumns({ pagination, handleViewLog });

  const handleSearch = async (filters: CronLogsFilter) => {
    setFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3} sx={{ mb: 2 }}>
        <PageHeader variant="h2" hideBorder={true} title="Cron Run" />
        <Box padding="20px">
          <CronForm refreshList={() => fetchLogs()} />
        </Box>
      </Paper>
      <Paper elevation={3}>
        <PageHeader variant="h2" hideBorder={true} title="Cron Jobs" />
        <Box padding="20px">
          <MaterialDataTable<CronLogsResponseData>
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
                fetchLogs={fetchLogs}
              />
            )}
          />
        </Box>
      </Paper>
    </>
  );
};

export default Logs;
