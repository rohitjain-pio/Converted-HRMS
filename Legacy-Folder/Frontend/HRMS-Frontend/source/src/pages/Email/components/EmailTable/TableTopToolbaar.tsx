import React from "react";
import {
  Box,
  Stack,
  IconButton,
  Badge,
  Collapse,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";

import { FilterFormHandle } from "@/pages/Leaves/components/LeaveMangerTableFilter";
import FilterForm from "../FilterForm";
import { EmailTemplateName, NotificationTemplateSerachFilter } from "@/services/Notification";

interface EmailTemplateToolbarProps {
  hasActiveFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch: (filters: NotificationTemplateSerachFilter) => void
  filterFormRef: React.RefObject<FilterFormHandle>;
  templateTypeList: EmailTemplateName[];
}

const TableTopToolbar: React.FC<EmailTemplateToolbarProps> = ({
  hasActiveFilters,
  setShowFilters,
  showFilters,
  handleFilterFormReset,
  handleSearch,
  filterFormRef,
  templateTypeList,
}) => {
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row">
          <Tooltip title="Add Email Template">
            <IconButton component={Link} to="/settings/email-and-notification/add">
              <AddIcon />
            </IconButton>
          </Tooltip>
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
        </Stack>``
      </Stack>
      <Collapse in={showFilters} sx={{ mr: "-2.75rem" }}>
        <Box sx={{ p: 2 }}>
          <FilterForm
            onSearch={handleSearch}
            templateTypeList={templateTypeList}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default TableTopToolbar;