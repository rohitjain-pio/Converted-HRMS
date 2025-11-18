import {
  Box,
  Stack,
  Tooltip,
  IconButton,
  Badge,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { hasPermission } from "@/utils/hasPermission";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import EmployeeGrievanceFilter from "@/pages/Grievances/components/EmployeeGrievanceFilter";
import { FilterFormHandle, permissionValue } from "@/utils/constants";
import { Dispatch, SetStateAction } from "react";
import { GetEmployeeGrievanceFilter } from "@/services/Grievances";
import { Link } from "react-router-dom";

interface Props {
  hasActiveFilters: boolean;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  handleFilterFormReset: () => void;
  handleSearch: (filters: GetEmployeeGrievanceFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const GrievanceToolbarActions: React.FC<Props> = ({
  hasActiveFilters,
  showFilters,
  setShowFilters,
  handleFilterFormReset,
  handleSearch,
  setHasActiveFilters,
  filterFormRef,
}) => {
  const { GRIEVANCE } = permissionValue;
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        {hasPermission(GRIEVANCE.CREATE) && (
          <Stack flex={1} direction="row">
            <Tooltip title="Add Grievance">
              <IconButton
                component={Link}
                to={"/Grievance/My-Grievance/add-grievance"}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
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
          {hasActiveFilters && (
            <Tooltip title="Remove Filters">
              <IconButton color="error" onClick={handleFilterFormReset}>
                <FilterListOffIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
      <Collapse in={showFilters} sx={{ mr: "-2.75rem" }}>
        <Box sx={{ p: 2 }}>
          <EmployeeGrievanceFilter
            onSearch={handleSearch}
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};
export default GrievanceToolbarActions;
