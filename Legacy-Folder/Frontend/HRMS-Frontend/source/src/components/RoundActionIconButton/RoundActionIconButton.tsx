import React from "react";
import { Fab, Box, FabProps, Tooltip, SxProps } from "@mui/material";

export interface RoundActionIconButtonProps extends FabProps {
  label: string;
  icon: React.ReactElement;
  colorType?: "primary" | "error" | "success" | "info";
  size?: "small" | "medium" | "large";
  tooltipSx?: SxProps;
  fabSx?: SxProps;
  onClick?: () => void;
}

const RoundActionIconButton = ({
  label,
  icon,
  colorType = "primary",
  size = "small",
  tooltipSx = {},
  fabSx = {},
  ...rest
}: RoundActionIconButtonProps) => {
  return (
    <Tooltip title={label} sx={tooltipSx}>
      <Box>
        <Fab
          sx={fabSx}
          size={size}
          color={colorType}
          aria-label={label}
          {...rest}
        >
          {icon}
        </Fab>
      </Box>
    </Tooltip>
  );
};

export default RoundActionIconButton;
