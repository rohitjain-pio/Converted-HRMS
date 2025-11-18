import React from "react";
import { Box, Stack, Tooltip, IconButton, Badge, Collapse } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useNavigate } from "react-router-dom";

import { FilterFormHandle, permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import KpiGoalFilterForm from "../Components/KpiGoalFilterForm";
import { KPIGoalRequestFilter } from "@/services/KPI";

interface KpiGoalToolbarProps {
  hasActiveFilters: boolean;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setHasActiveFilters: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch:  (filters: KPIGoalRequestFilter) => void
  handleFilterFormReset: () => void;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolbar: React.FC<KpiGoalToolbarProps> = ({
  hasActiveFilters,
  showFilters,
  setShowFilters,
  setHasActiveFilters,
  handleSearch,
  handleFilterFormReset,
  filterFormRef,
}) => {
  const navigate = useNavigate();
    const {KPI}=permissionValue
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row">
          {hasPermission(KPI.CREATE) && (
            <Tooltip title="Add Goal">
              <IconButton onClick={() => navigate("Add-Goal")}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

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
          <KpiGoalFilterForm
            onSearch={handleSearch}
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default TableTopToolbar;