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
import FilterForm from "@/pages/Settings/Team/components/FilterForm";
import {
  updateTeamStatus,
  UpdateTeamStatusResponse,
  TeamSearchFilter,
  TeamType,
  getTeamList,
  GetTeamListResponse,
  UpdateTeamStatusArgs,
} from "@/services/Team";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AddTeamPopup from "@/pages/Settings/Team/components/AddTeamPopup";
import { permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import { No_Permission_To_Update_Status } from "@/utils/messages";

const Team = () => {
  const [data, setData] = useState<TeamType[]>([]);
  const [tempData, setTempData] = useState<TeamType[]>([]);
  const [sortColumnName, setSortColumnName] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [team, setTeam] = useState<string | undefined>("");
  const [status, setStatus] = useState<boolean | null | undefined>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(0);
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
      renderColumn: (_row: TeamType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
    },
    {
      label: "Team Name",
      accessor: "name",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: TeamType) => (
        <TruncatedText text={row.name} tooltipTitle={row.name} maxLength={50} />
      ),
    },
    {
      label: "Status",
      accessor: "status",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: TeamType) => (
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
            renderColumn: (row: TeamType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(EMPLOYMENT_DETAILS.EDIT) && (
                  <ActionIconButton
                    label="Edit Team"
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

  const { execute: fetchTeams, isLoading } = useAsync<GetTeamListResponse>({
    requestFn: async (): Promise<GetTeamListResponse> => {
      return await getTeamList({
        sortColumnName,
        sortDirection,
        startIndex,
        pageSize,
        filters: {
          teamName: team,
          status: status,
        },
      });
    },
    onSuccess: ({ data }) => {
      const deptList = data.result?.teamList || [];
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
    UpdateTeamStatusResponse,
    UpdateTeamStatusArgs
  >({
    requestFn: async (
      args: UpdateTeamStatusArgs
    ): Promise<UpdateTeamStatusResponse> => {
      return await updateTeamStatus(args);
    },
    onSuccess: (_, args) => {
      const updatedData = data.map((item) =>
        item.id === args?.id ? { ...item, status: args.isArchived } : item
      );
      setData(updatedData);
      if (team || status) {
        fetchTeams();
      }
      toast.success("Status updated successfully");
      setIsStatusDialogOpen(false);
      setStatusChangeInfo(null);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const handleSearch = async ({ teamName, status }: TeamSearchFilter) => {
    setTeam(teamName);
    setStatus(status);
    setStartIndex(1);
  };

  useEffect(() => {
    fetchTeams();
  }, [team, status, sortColumnName, sortDirection, startIndex, pageSize]);

  const handleStatusChange = (team: TeamType, status: boolean) => {
    if (!team.id) {
      toast.error("Invalid team ID");
      return;
    }
    const updatedData = tempData.map((item) =>
      item.id === team.id ? { ...item, status } : item
    );
    setTempData(updatedData);
    setStatusChangeInfo({
      id: team.id,
      newStatus: status,
      previousStatus: team.status,
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
    setSelectedTeamId(0);
    fetchTeams();
  };

  const handleEditClick = (team: TeamType) => {
    if (team.id) {
      setSelectedTeamId(team.id);
      setIsPopupOpen(true);
    } else {
      setSelectedTeamId(0);
      setIsPopupOpen(false);
      toast.error("Team Id not found");
    }
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Team"
          hideBorder={true}
          actionButton={
            <FilterForm
              onSearch={handleSearch}
              addIcon={
                hasPermission(EMPLOYMENT_DETAILS.CREATE) && (
                  <RoundActionIconButton
                    onClick={handleOpenPopup}
                    label="Add Team"
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
          content={"Are you sure you want to change the status of this team?"}
          open={isStatusDialogOpen}
          onClose={cancelStatusChange}
          onConfirm={confirmStatusChange}
          confirmBtnColor="primary"
        />
        <AddTeamPopup
          open={isPopupOpen}
          onClose={handleClosePopup}
          teamId={selectedTeamId}
        />
      </Paper>
    </>
  );
};

export default Team;
