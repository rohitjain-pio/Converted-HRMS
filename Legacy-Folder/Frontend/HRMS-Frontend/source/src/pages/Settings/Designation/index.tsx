import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import EditIcon from "@mui/icons-material/Edit";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import DataTable from "@/components/DataTable/DataTable";
import FilterForm from "@/pages/Settings/Designation/components/FilterForm";
import {
  updateDesignationStatus,
  UpdateDesignationStatusResponse,
  DesignationSearchFilter,
  DesignationType,
  getDesignationList,
  GetDesignationListResponse,
  UpdateDesignationStatusArgs,
} from "@/services/Designation";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AddDesignationPopup from "@/pages/Settings/Designation/components/AddDesignationPopup";
import { permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import { No_Permission_To_Update_Status } from "@/utils/messages";

const Designation = () => {
  const [data, setData] = useState<DesignationType[]>([]);
  const [tempData, setTempData] = useState<DesignationType[]>([]);
  const [sortColumnName, setSortColumnName] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [designation, setDesignation] = useState<string | undefined>("");
  const [status, setStatus] = useState<boolean | null | undefined>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDesignationId, setSelectedDesignationId] = useState<number>(0);
  const [statusChangeInfo, setStatusChangeInfo] = useState<{
    id: number;
    newStatus: boolean;
    previousStatus: boolean;
  } | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const { EMPLOYMENT_DETAILS } = permissionValue;

  const headerCells = [
    {
      label: "S.No",
      accessor: "sNo",
      width: "50px",
      renderColumn: (_row: DesignationType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
    },
    {
      label: "Designation Name",
      accessor: "name",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: DesignationType) => (
        <TruncatedText text={row.name} tooltipTitle={row.name} maxLength={50} />
      ),
    },
    {
      label: "Status",
      accessor: "status",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: DesignationType) => (
        <Tooltip
          title={
            !hasPermission(EMPLOYMENT_DETAILS.DELETE)
              ? No_Permission_To_Update_Status
              : ""
          }
          arrow
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={!row.status}
                onChange={(e) => handleStatusChange(row, !e.target.checked)}
                disabled={
                  isStatusUpdating || !hasPermission(EMPLOYMENT_DETAILS.DELETE)
                }
              />
            }
            label=""
          />
        </Tooltip>
      ),
    },
    ...(hasPermission(EMPLOYMENT_DETAILS.EDIT)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "100px",
            renderColumn: (row: DesignationType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(EMPLOYMENT_DETAILS.EDIT) && (
                  <ActionIconButton
                    label="Edit Designation"
                    colorType="primary"
                    onClick={() => handleEditClick(row)}
                    icon={<EditIcon />}
                  />
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  const { execute: fetchDesignations, isLoading } = useAsync<
    GetDesignationListResponse
  >({
    requestFn: async (): Promise<GetDesignationListResponse> => {
      return await getDesignationList({
        sortColumnName,
        sortDirection,
        startIndex,
        pageSize,
        filters: {
          designation: designation,
          status: status,
        },
      });
    },
    onSuccess: ({ data }) => {
      const desList = data.result?.designationList || [];
      setData(desList);
      setTempData(desList);
      setTotalRecords(data.result?.totalRecords || 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: false,
  });

  const { execute: updateStatus, isLoading: isStatusUpdating } = useAsync<
    UpdateDesignationStatusResponse,
    UpdateDesignationStatusArgs
  >({
    requestFn: async (
      args: UpdateDesignationStatusArgs
    ): Promise<UpdateDesignationStatusResponse> => {
      return await updateDesignationStatus(args);
    },
    onSuccess: (_, args) => {
      const updatedData = data.map((item) =>
        item.id === args?.id ? { ...item, status: args.isArchived } : item
      );
      setData(updatedData);
      if (designation || status) {
        fetchDesignations();
      }
      toast.success("Status updated successfully");
      setIsStatusDialogOpen(false);
      setStatusChangeInfo(null);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const handleSearch = async ({
    designation,
    status,
  }: DesignationSearchFilter) => {
    setDesignation(designation);
    setStatus(status);
    setStartIndex(1);
  };

  useEffect(() => {
    fetchDesignations();
  }, [
    designation,
    status,
    sortColumnName,
    sortDirection,
    startIndex,
    pageSize,
  ]);

  const handleStatusChange = (
    designation: DesignationType,
    status: boolean
  ) => {
    if (!designation.id) {
      toast.error("Invalid designation ID");
      return;
    }
    const updatedData = tempData.map((item) =>
      item.id === designation.id ? { ...item, status } : item
    );
    setTempData(updatedData);
    setStatusChangeInfo({
      id: designation.id,
      newStatus: status,
      previousStatus: designation.status,
    });
    setIsStatusDialogOpen(true);
  };

  const cancelStatusChange = () => {
    if (statusChangeInfo) {
      const revertedData = tempData.map((item) =>
        item.id === statusChangeInfo.id
          ? { ...item, status: statusChangeInfo.previousStatus }
          : item
      );
      setTempData(revertedData);
    }
    setStatusChangeInfo(null);
    setIsStatusDialogOpen(false);
  };

  const confirmStatusChange = () => {
    if (statusChangeInfo) {
      updateStatus({
        id: statusChangeInfo.id,
        isArchived: statusChangeInfo.newStatus,
      });
    }
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedDesignationId(0);
    fetchDesignations();
  };

  const handleEditClick = (designation: DesignationType) => {
    if (designation.id) {
      setSelectedDesignationId(designation.id);
      setIsPopupOpen(true);
    } else {
      setSelectedDesignationId(0);
      setIsPopupOpen(false);
      toast.error("Designation Id not found");
    }
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Designation"
          hideBorder={true}
          actionButton={
            <FilterForm
              onSearch={handleSearch}
              addIcon={
                hasPermission(EMPLOYMENT_DETAILS.CREATE) && (
                  <RoundActionIconButton
                    onClick={handleOpenPopup}
                    label="Add Designation"
                    size="small"
                    icon={<AddIcon />}
                  />
                )
              }
            />
          }
        />
        <Box paddingX="20px">
          {isLoading ? (
            <Box
              height={"calc(100vh - 80px)"}
              justifyContent="center"
              alignItems="center"
              display="flex"
            >
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              data={tempData}
              headerCells={headerCells}
              setSortColumnName={setSortColumnName}
              setSortDirection={setSortDirection}
              setStartIndex={setStartIndex}
              startIndex={startIndex}
              setPageSize={setPageSize}
              pageSize={pageSize}
              totalRecords={totalRecords}
            />
          )}
        </Box>
        <ConfirmationDialog
          title="Change Status"
          content={
            "Are you sure you want to change the status of this designation?"
          }
          open={isStatusDialogOpen}
          onClose={cancelStatusChange}
          onConfirm={confirmStatusChange}
          confirmBtnColor="primary"
        />
        <AddDesignationPopup
          open={isPopupOpen}
          onClose={handleClosePopup}
          designationId={selectedDesignationId}
        />
      </Paper>
    </>
  );
};

export default Designation;
