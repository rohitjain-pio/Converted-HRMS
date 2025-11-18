import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Fab,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import DataTable from "@/components/DataTable/DataTable";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import PageHeader from "@/components/PageHeader/PageHeader";
import methods from "@/utils";
import { GetRolesResponse, RoleType, getRoles } from "@/services/Roles";
import { useDebounce } from "@/hooks/useDebounce";
import useAsync from "@/hooks/useAsync";
import MUILink from "@mui/material/Link";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import BreadCrumbs from "@/components/@extended/Router";

const Roles = () => {
  const [data, setData] = useState<RoleType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumnName, setSortColumnName] = useState<string>("roleName");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const roleName = useDebounce(searchQuery, 500);
  const { EDIT, CREATE } = permissionValue.ROLE;
  const navigate = useNavigate();

  const { execute: fetchRoles } = useAsync<GetRolesResponse>({
    requestFn: async (): Promise<GetRolesResponse> => {
      return await getRoles({
        sortColumnName,
        sortDirection,
        startIndex,
        pageSize,
        filters: {
          roleName,
        },
      });
    },
    onSuccess: ({ data }) => {
      setData(data.result?.roleResponseList || []);
      setTotalRecords(data.result?.totalRecords || 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: false,
  });

  const headerCells = [
    {
      label: "S.No",
      accessor: "roleId",
      renderColumn: (_row: RoleType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
      width: "50px",
    },
    { label: "Role", accessor: "roleName", enableSorting: true, maxLength: 50 },
    {
      label: "Users",
      accessor: "userCount",
      renderColumn: (row: RoleType) => (
        <MUILink
          onClick={() => {
            navigate("/employees/employee-list", {
              state: { roleId: row.roleId, fromRolesPage: true },
            });
          }}
        >
          <Tooltip title="View Employee">
            <Fab size="small" color="primary" aria-label="View Employees">
              {row.userCount}
            </Fab>
          </Tooltip>
        </MUILink>
      ),
    },
    ...(hasPermission(EDIT)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "150px",
            renderColumn: (row: RoleType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(EDIT) && (
                  <ActionIconButton
                    label="Edit Role"
                    colorType="primary"
                    as={Link}
                    icon={<EditIcon />}
                    to={`/roles/edit/${row.roleId}`}
                  />
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  useEffect(() => {
    fetchRoles();
  }, [roleName, sortColumnName, sortDirection, startIndex, pageSize]);

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          hideBorder={true}
          title="Roles"
          actionButton={
            <Grid container gap={2}>
              <Grid item xs={12} md="auto">
                <TextField
                  variant="outlined"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Grid>
              {hasPermission(CREATE) && (
                <Grid item xs={12} md="auto">
                  <RoundActionIconButton
                    onClick={() => navigate("/roles/add")}
                    label="Add Role"
                    size="small"
                    icon={<AddIcon />}
                  />
                </Grid>
              )}
            </Grid>
          }
        />
        <Box sx={{ paddingX: "20px" }}>
          <DataTable
            data={data}
            headerCells={headerCells}
            setSortColumnName={setSortColumnName}
            setSortDirection={setSortDirection}
            setStartIndex={setStartIndex}
            startIndex={startIndex}
            setPageSize={setPageSize}
            pageSize={pageSize}
            totalRecords={totalRecords}
          />
        </Box>
      </Paper>
    </>
  );
};

export default Roles;
