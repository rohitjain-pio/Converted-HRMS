import { useEffect, useRef, useState } from "react";
import { VisibilityState } from "@tanstack/table-core";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { Box, Paper } from "@mui/material";
import useAsync from "@/hooks/useAsync";
import {
  GetItAssetDetailsResponse,
  ItAsset,
  ItAssetSearchFilter,
} from "@/services/AssetManagement/types";
import { getItAssetList } from "@/services/AssetManagement/assetManagementService";
import methods from "@/utils";
import { DEFAULT_IT_ASSET_FILTER } from "@/pages/AssetManagement/constants";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { FilterFormHandle, initialPagination } from "@/utils/constants";
import { useTableColumns } from "@/pages/AssetManagement/ItAssetTable/useTableColumn";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { TableTopToolbar } from "@/pages/AssetManagement/ItAssetTable/TableTopToolBar";
import MaterialDataTable from "@/components/MaterialDataTable";

const ItAssetTable = () => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    model: false,
    comments: false,
  });
  const [globalLoading, setGlobalLoading] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_IT_ASSET_FILTER);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itAssetData, setItAssetData] = useState<ItAsset[]>([]);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const filterFormRef = useRef<FilterFormHandle>(null);
  const columns = useTableColumns({ pagination });
  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };


  const { execute: fetchItAssetList } = useAsync<GetItAssetDetailsResponse>({
    requestFn: async (): Promise<GetItAssetDetailsResponse> => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      return await getItAssetList({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...filters, employeeCodes },
      });
    },
    onSuccess: ({ data }) => {
      setItAssetData(data.result?.itAssetList || []);
      setGlobalLoading(false);
      setTotalRecords(data.result?.totalRecords || 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
      setGlobalLoading(false);
    },
  });

  useEffect(() => {
    fetchItAssetList();
  }, [pagination, sorting, filters, selectedEmployees]);

  const handleImportSuccess = () => {
    const { sortColumnName, sortDirection } = mapSortingToApiParams(sorting);
    const hasActiveSort = sortColumnName !== "" || sortDirection !== "";
    setSorting([]);
    if (!hasActiveSort) {
      fetchItAssetList();
    }
  };

  const handleSearch = async (filters: ItAssetSearchFilter) => {
    setFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="IT Assets" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<ItAsset>
            columns={columns}
            data={itAssetData}
            pagination={pagination}
            sorting={sorting}
            columnVisibility={columnVisibility}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            setColumnVisibility={setColumnVisibility}
            topToolbar={() => (
              <TableTopToolbar
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                setGlobalLoading={setGlobalLoading}
                onImportSuccess={handleImportSuccess}
                onFilterReset={handleFilterFormReset}
                onSearch={handleSearch}
                setHasActiveFilters={setHasActiveFilters}
                filterFormRef={filterFormRef}
              />
            )}
          />
        </Box>
      </Paper>
      <GlobalLoader loading={globalLoading} />
    </>
  );
};
export default ItAssetTable;
