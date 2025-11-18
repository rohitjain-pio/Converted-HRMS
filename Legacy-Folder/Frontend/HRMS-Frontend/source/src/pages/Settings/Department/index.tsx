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
import FilterForm from "@/pages/Settings/Department/components/FilterForm";
import {
  updateDepartmentStatus,
  UpdateDepartmentStatusResponse,
  DepartmentSearchFilter,
  DepartmentType,
  getDepartmentList,
  GetDepartmentListResponse,
  UpdateDepartmentStatusArgs,
} from "@/services/Department";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AddDepartmentPopup from "@/pages/Settings/Department/components/AddDepartmentPopup";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import { No_Permission_To_Update_Status } from "@/utils/messages";

const Department = () => {
  const [data, setData] = useState<DepartmentType[]>([]);
  const [tempData, setTempData] = useState<DepartmentType[]>([]);
  const [sortColumnName, setSortColumnName] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [department, setDepartment] = useState<string | undefined>("");
  const [status, setStatus] = useState<boolean | null | undefined>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(0);
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
      renderColumn: (_row: DepartmentType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
    },
    {
      label: "Department Name",
      accessor: "name",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: DepartmentType) => (
        <TruncatedText text={row.name} tooltipTitle={row.name} maxLength={50} />
      ),
    },
    {
      label: "Status",
      accessor: "status",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: DepartmentType) => (
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
            renderColumn: (row: DepartmentType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(EMPLOYMENT_DETAILS.EDIT) && (
                  <ActionIconButton
                    label="Edit Department"
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

  const { execute: fetchDepartments, isLoading } = useAsync<
    GetDepartmentListResponse
  >({
    requestFn: async (): Promise<GetDepartmentListResponse> => {
      return await getDepartmentList({
        sortColumnName,
        sortDirection,
        startIndex,
        pageSize,
        filters: {
          department: department,
          status: status,
        },
      });
    },
    onSuccess: ({ data }) => {
      const deptList = data.result?.departmentList || [];
      setData(deptList);
      setTempData(deptList);
      setTotalRecords(data.result?.totalRecords || 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: false,
  });

  const { execute: updateStatus, isLoading: isStatusUpdating } = useAsync<
    UpdateDepartmentStatusResponse,
    UpdateDepartmentStatusArgs
  >({
    requestFn: async (
      args: UpdateDepartmentStatusArgs
    ): Promise<UpdateDepartmentStatusResponse> => {
      return await updateDepartmentStatus(args);
    },
    onSuccess: (_, args) => {
      const updatedData = data.map((item) =>
        item.id === args?.id ? { ...item, status: args.isArchived } : item
      );
      setData(updatedData);
      if (department || status) {
        fetchDepartments();
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
    department,
    status,
  }: DepartmentSearchFilter) => {
    setDepartment(department);
    setStatus(status);
    setStartIndex(1);
  };

  useEffect(() => {
    fetchDepartments();
  }, [department, status, sortColumnName, sortDirection, startIndex, pageSize]);

  const handleStatusChange = (department: DepartmentType, status: boolean) => {
    if (!department.id) {
      toast.error("Invalid department ID");
      return;
    }
    const updatedData = tempData.map((item) =>
      item.id === department.id ? { ...item, status } : item
    );
    setTempData(updatedData);
    setStatusChangeInfo({
      id: department.id,
      newStatus: status,
      previousStatus: department.status,
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
    setSelectedDepartmentId(0);
    fetchDepartments();
  };

  const handleEditClick = (department: DepartmentType) => {
    if (department.id) {
      setSelectedDepartmentId(department.id);
      setIsPopupOpen(true);
    } else {
      setSelectedDepartmentId(0);
      setIsPopupOpen(false);
      toast.error("Department Id not found");
    }
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Department"
          hideBorder={true}
          actionButton={
            <FilterForm
              onSearch={handleSearch}
              addIcon={
                hasPermission(EMPLOYMENT_DETAILS.CREATE) && (
                  <RoundActionIconButton
                    onClick={handleOpenPopup}
                    label="Add Department"
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
            "Are you sure you want to change the status of this department?"
          }
          open={isStatusDialogOpen}
          onClose={cancelStatusChange}
          onConfirm={confirmStatusChange}
          confirmBtnColor="primary"
        />
        <AddDepartmentPopup
          open={isPopupOpen}
          onClose={handleClosePopup}
          departmentId={selectedDepartmentId}
        />
      </Paper>
    </>
  );
};

export default Department;
