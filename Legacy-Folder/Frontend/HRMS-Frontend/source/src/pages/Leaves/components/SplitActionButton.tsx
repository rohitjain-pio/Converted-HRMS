import React, { useState, useRef } from "react";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  useTheme,
  lighten,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { LeaveStatus } from "@/utils/constants";

interface SplitButtonProps {
  initial: LeaveStatus;
  onAction: (newStatus: LeaveStatus) => void;
}

const SplitButton: React.FC<SplitButtonProps> = ({ initial, onAction }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const leaveStatusMap: Record<LeaveStatus, string> = {
    [LeaveStatus.Pending]: "Pending",
    [LeaveStatus.Accepted]: "Accepted",
    [LeaveStatus.Rejected]: "Rejected",
  };

  const menuLeaveStatusMap: Record<LeaveStatus, string> = {
    [LeaveStatus.Pending]: "Pending",
    [LeaveStatus.Accepted]: "Accept",
    [LeaveStatus.Rejected]: "Reject",
  };

  const handleMenuItemClick = (
    _event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    status: LeaveStatus
  ) => {
    onAction(status);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const getButtonStyle = () => {
    if (initial === LeaveStatus.Accepted)
      return {
        minWidth: "95px",
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
      };
    if (initial === LeaveStatus.Rejected)
      return {
        minWidth: "95px",
        backgroundColor: lighten(theme.palette.error.main, 0.2),
        color: theme.palette.error.contrastText,
        // color: theme.palette.getContrastText(),
      };
    if (initial === LeaveStatus.Pending)
      return {
        minWidth: "95px",
        // backgroundColor: "#1976d2",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      };
    return {};
  };

  const DropdownStyles = () => {
    if (initial === LeaveStatus.Accepted)
      return {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
      };
    if (initial === LeaveStatus.Rejected)
      return {
        backgroundColor: lighten(theme.palette.error.main, 0.2),
        color: theme.palette.error.contrastText,
      };
    if (initial === LeaveStatus.Pending)
      return {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      };
    return {};
  };

  const isDisabled = initial === LeaveStatus.Rejected;
  const menuItems =
    initial === LeaveStatus.Accepted
      ? { [LeaveStatus.Rejected]: "Reject" }
      : menuLeaveStatusMap;

  return (
    <>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="status split button"
        disabled={isDisabled}
        disableElevation
        sx={{
         "& .MuiButton-root": {
           borderRight: "1px solid white",
          },
          ...(isDisabled && {
            cursor: "not-allowed",
            "& .MuiButton-root": {
              pointerEvents: "none",
              cursor: "not-allowed",
              borderRight: "none",
            },
          }),
        }}
      >
        <Button
          onClick={handleToggle}
          // disabled={isDisabled}
          // disableRipple={isDisabled}
          style={{
            ...getButtonStyle(),
            // opacity: initial === LeaveStatus.Rejected ? 0.6 : 1,
            cursor:
              initial === LeaveStatus.Rejected ? "not-allowed" : "pointer",
          }}
        >
          {leaveStatusMap[initial]}
        </Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select status"
          aria-haspopup="menu"
          type="button"
          onClick={handleToggle}
          style={{
            ...DropdownStyles(),
            // opacity: initial === LeaveStatus.Rejected ? 0.6 : 1,
            cursor:
              initial === LeaveStatus.Rejected ? "not-allowed" : "pointer",
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 99 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper
              sx={
                {
                  // width: "100px",
                }
              }
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {Object.entries(menuItems).map(([key, label]) => {
                    const statusKey = Number(key);
                    if (statusKey === initial) {
                      return null;
                    }
                    return (
                      <MenuItem
                        key={key}
                        onClick={(event) =>
                          handleMenuItemClick(event, statusKey as LeaveStatus)
                        }
                      >
                        {label}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default SplitButton;
