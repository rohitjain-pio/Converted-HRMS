import React from "react";
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
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useNavigate } from "react-router-dom";
import { EmployeeSearch } from "@/components/EmployeeSearch/EmployeeSearch";
import { ImportButton } from "@/pages/AssetManagement/components/ImportButton";
import ItAssetTableFilter from "@/pages/AssetManagement/components/ItAssetTableFilter";
import { FilterFormHandle } from "@/utils/constants";
import { ItAssetSearchFilter } from "@/services/AssetManagement";

interface TableTopToolbarProps {
  selectedEmployees: string[];
  setSelectedEmployees: (employees: string[]) => void;
  hasActiveFilters: boolean;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setGlobalLoading: (loading: boolean) => void;
  onImportSuccess: () => void;
  onFilterReset: () => void;
  onSearch: (filters: ItAssetSearchFilter) => void;
  setHasActiveFilters: React.Dispatch<React.SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

export const TableTopToolbar: React.FC<TableTopToolbarProps> = ({
  selectedEmployees,
  setSelectedEmployees,
  hasActiveFilters,
  showFilters,
  setShowFilters,
  setGlobalLoading,
  onImportSuccess,
  onFilterReset,
  onSearch,
  setHasActiveFilters,
  filterFormRef,
}) => {
  const navigate = useNavigate();

  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row">
          <Tooltip title="Add Asset">
            <IconButton
              onClick={() => {
                navigate(`add`);
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <ImportButton
            setGlobalLoading={setGlobalLoading}
            onImportSuccess={onImportSuccess}
          />
        </Stack>
        <Stack direction="row" gap={0.5}>
          <EmployeeSearch
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
          />
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
          {hasActiveFilters ? (
            <Tooltip title="Remove Filters">
              <IconButton color="error" onClick={onFilterReset}>
                <FilterListOffIcon />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      </Stack>
      <Collapse in={showFilters} sx={{ mr: "-2.75rem" }}>
        <Box sx={{ p: 2 }}>
          <ItAssetTableFilter
            onSearch={onSearch}
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};
