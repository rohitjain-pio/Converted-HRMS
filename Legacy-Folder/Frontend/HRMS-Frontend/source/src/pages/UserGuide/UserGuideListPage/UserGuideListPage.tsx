import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import MaterialDataTable from "@/components/MaterialDataTable";
import {
  deleteUserGuideById,
  DeleteUserGuideResponse,
  GetUserGuideFilter,
  getUserGuideList,
  GetUserGuideListResponse,
  UserGuide,
} from "@/services/UserGuide";
import { useTableColumns } from "./useTableColumns";
import TableTopToolBar from "./TableTopToolBar";
import useAsync from "@/hooks/useAsync";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { useCallback, useEffect, useRef, useState } from "react";
import methods from "@/utils";
import { DEFAULT_USER_GUIDE_FILTERS } from "./constants";
import {
  MRT_PaginationState,
  MRT_SortingState,
  MRT_VisibilityState,
} from "material-react-table";
import { FilterFormHandle, initialPagination } from "@/utils/constants";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const UserGuideListPage = () => {
  const [userGuideList, setUserGuideList] = useState<UserGuide[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_USER_GUIDE_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    { modifiedOn: false, modifiedBy: false }
  );

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState<{
    userGuideId: number;
  } | null>(null);

  const filterFormRef = useRef<FilterFormHandle>(null);

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };

  const handleDeleteClick = useCallback(
    (userGuideId: number) => {
      setOpenConfirmationDialog({ userGuideId });
    },
    [setOpenConfirmationDialog]
  );

  const handleUserGuideDelete = () => {
    deleteUserGuide(openConfirmationDialog?.userGuideId);
  };

  const columns = useTableColumns({ onDeleteClick: handleDeleteClick });

  const handleSearch = (filters: GetUserGuideFilter) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setFilters(filters);
  };

  const { execute: fetchUserGuideList, isLoading } =
    useAsync<GetUserGuideListResponse>({
      requestFn: async (): Promise<GetUserGuideListResponse> => {
        return await getUserGuideList({
          ...mapSortingToApiParams(sorting),
          ...mapPaginationToApiParams(pagination),
          filters: { ...filters },
        });
      },
      onSuccess: ({ data }) => {
        setUserGuideList(data?.result?.userGuideList || []);
        setTotalRecords(data?.result?.totalRecords || 0);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { execute: deleteUserGuide, isLoading: isDeletingUserGuide } = useAsync<
    DeleteUserGuideResponse,
    number
  >({
    requestFn: async (
      userGuideId: number
    ): Promise<DeleteUserGuideResponse> => {
      return await deleteUserGuideById(userGuideId);
    },
    onSuccess: () => {
      setOpenConfirmationDialog(null);
      fetchUserGuideList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchUserGuideList();
  }, [pagination, sorting, filters]);

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="User Guides" />
        <Box padding="20px">
          <MaterialDataTable<UserGuide>
            columns={columns}
            data={userGuideList}
            pagination={pagination}
            sorting={sorting}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            topToolbar={() => (
              <TableTopToolBar
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                onFilterReset={handleFilterFormReset}
                onSearch={handleSearch}
                setHasActiveFilters={setHasActiveFilters}
                filterFormRef={filterFormRef}
              />
            )}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </Box>
      </Paper>
      {!!openConfirmationDialog && (
        <ConfirmationDialog
          open={!!openConfirmationDialog}
          title="Delete User Guide?"
          content="Are you sure you want to proceed? The selected user guide will be removed."
          onClose={() => setOpenConfirmationDialog(null)}
          onConfirm={handleUserGuideDelete}
        />
      )}
      <GlobalLoader loading={isLoading || isDeletingUserGuide} />
    </>
  );
};

export default UserGuideListPage;
