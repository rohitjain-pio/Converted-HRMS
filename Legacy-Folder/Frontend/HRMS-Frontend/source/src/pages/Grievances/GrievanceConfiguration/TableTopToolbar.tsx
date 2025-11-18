import { Box, Stack, Tooltip, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

const TableTopToolbar = () => {
  const navigate = useNavigate();
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row">
          <Tooltip title="Add Grievance">
            <IconButton onClick={() => navigate("Add-Grievance")}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};
export default TableTopToolbar;
