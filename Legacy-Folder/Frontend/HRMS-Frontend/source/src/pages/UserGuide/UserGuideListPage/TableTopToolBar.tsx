import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import Badge from "@mui/material/Badge";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import Collapse from "@mui/material/Collapse";
import UserGuideTableFilter from "./UserGuideTableFilter";
import { Dispatch, RefObject, SetStateAction } from "react";
import { FilterFormHandle } from "@/utils/constants";
import { GetUserGuideFilter } from "@/services/UserGuide";

type Props = {
  hasActiveFilters: boolean;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  onFilterReset: () => void;
  onSearch: (filters: GetUserGuideFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
  filterFormRef: RefObject<FilterFormHandle>;
};

const TableTopToolBar = (props: Props) => {
  const {
    showFilters,
    hasActiveFilters,
    setHasActiveFilters,
    filterFormRef,
    setShowFilters,
    onSearch,
    onFilterReset,
  } = props;

  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row">
          <Tooltip title="Add User Guide">
            <IconButton component={Link} to={"add"}>
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
          <UserGuideTableFilter
            onSearch={onSearch}
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default TableTopToolBar;
