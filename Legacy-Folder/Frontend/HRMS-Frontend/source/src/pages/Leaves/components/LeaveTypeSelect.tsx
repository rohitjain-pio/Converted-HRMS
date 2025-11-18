import {
  
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
type LeaveTypeProps = {
  setSelectedOption: (selectedType: "compOff" | "leaveSwap") => void;
};

const ActionMenu = ({ setSelectedOption }: LeaveTypeProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value: "compOff" | "leaveSwap") => {
    setSelectedOption(value);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Request Holiday-Swap/Comp-Off">
        <IconButton onClick={handleClick}>
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Menu
        sx={{
          ml: 10,
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={() => handleSelect("compOff")}>
          <ListItemIcon>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Request Comp-Off" />
        </MenuItem>

        <MenuItem onClick={() => handleSelect("leaveSwap")}>
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Request Holiday-Swap" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ActionMenu;
