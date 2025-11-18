import useAsync from "@/hooks/useAsync";
import {
  GrievanceType,
  GetGrievanceTypesResponse,
  getGrievanceData,
  DeleteGrievanceTypeApiResponse,
  deleteGrievance,
  UpdateGrievanceTypeApiResponse,
  GrievanceTypeRequestArgs,
  updateGrievanceType,
} from "@/services/Grievances";
import methods from "@/utils";
import { initialPagination } from "@/utils/constants";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import  { useState } from "react";
import { toast } from "react-toastify";
import { useTableColumns } from "@/pages/Grievances/GrievanceConfiguration/useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import Box from "@mui/material/Box/Box";
import TableTopToolbar from "@/pages/Grievances/GrievanceConfiguration/TableTopToolbar";
import BreadCrumbs from "@/components/@extended/Router";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PageHeader from "@/components/PageHeader/PageHeader";
import { Paper } from "@mui/material";
import { VisibilityState } from "node_modules/@tanstack/table-core/build/lib/features/ColumnVisibility";

const GrievanceConfiguration = () => {
  const [data, setData] = useState<GrievanceType[]>([]);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [grievanceToDeleteId, setGrievanceToDeleteId] = useState<number | null>(
    null
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [columnVisibility,setColumnVisibility]=useState<VisibilityState>({})
  const handleConfirmDelete = (grievanceId: number|null) => {
    if (!grievanceId) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    deleteGrievanceType(Number(grievanceToDeleteId));
  };
  const openConfirmationDialog = (grievanceId: number) => {
    setGrievanceToDeleteId(grievanceId);
    setIsConfirmationDialogOpen(true);
  };

  const closeConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
    setGrievanceToDeleteId(null);
  };
  const handleAutoEscalation = (row: GrievanceType) => {
    update({
      id: row.id,
      grievanceName: row.grievanceName,
      description: row.grievanceName,
      l1TatHours: row.l1TatHours,
      l1OwnerIds: row.l1OwnerId,
      l2TatHours: row.l1TatHours,
      l2OwnerIds: row.l2OwnerId,
      l3TatDays: row.l3TatDays,
      l3OwnerIds: row.l3OwnerId,
      isAutoEscalation: !row.isAutoEscalation,
    });
  };
  const columns = useTableColumns({
    pagination,
    handleAutoEscalation,
    openConfirmationDialog,
  });
  
  const { execute: fetchGrievance } = useAsync<GetGrievanceTypesResponse>({
    requestFn: async (): Promise<GetGrievanceTypesResponse> => {
      return await getGrievanceData();
    },
    onSuccess: ({ data }) => {
      setData(data.result.grievanceList);
    },
    autoExecute: true,
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: deleteGrievanceType } = useAsync<
    DeleteGrievanceTypeApiResponse,
    number
  >({
    requestFn: async (id: number): Promise<DeleteGrievanceTypeApiResponse> => {
      return await deleteGrievance(id);
    },
    onSuccess: () => {
      toast.success("Deleted Grievance Successfully");
      fetchGrievance();
      setIsConfirmationDialogOpen(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
      setIsConfirmationDialogOpen(false);
    },
  });

  const { execute: update } = useAsync<
    UpdateGrievanceTypeApiResponse,
    GrievanceTypeRequestArgs
  >({
    requestFn: async (
      args: GrievanceTypeRequestArgs
    ): Promise<UpdateGrievanceTypeApiResponse> => {
      return await updateGrievanceType(args);
    },
    onSuccess: (_, args) => {
      const message = args?.isAutoEscalation
        ? " Auto-Escalation is now enabled."
        : " Auto-Escalation has been disabled.";
      toast.success(message);
      fetchGrievance();
    },

    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Grievance Configuration"
          hideBorder={true}
        />
        <Box padding="20px">
          <MaterialDataTable<GrievanceType>
            columns={columns}
            data={data}
            pagination={pagination}
            totalRecords={data?.length}
            sorting={sorting}
            setSorting={setSorting}
            setPagination={setPagination}
            manualPagination={false}
            manualSorting={false}
            topToolbar={() => <TableTopToolbar />} 
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}/>
        </Box>
      </Paper>
      <ConfirmationDialog
        title="Delete Grievance"
        content="Are you sure you want to proceed? The selected item will be permanently deleted."
        open={isConfirmationDialogOpen}
        onClose={closeConfirmationDialog}
        onConfirm={() => handleConfirmDelete(grievanceToDeleteId)}
      />
    </>
  );
};
export default GrievanceConfiguration;
