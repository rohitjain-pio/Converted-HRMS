import React, { cloneElement } from "react";
import { LinkProps } from "react-router-dom";
import { IconButton, IconButtonProps, SxProps, Tooltip } from "@mui/material";

export interface ActionIconButtonProps extends IconButtonProps {
  label: string;
  colorType?: "primary" | "error" | "success";
  children?: React.ReactElement;
  icon: React.ReactElement;
  as?: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;
  to?: string;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  tooltipSx?: SxProps;
}

// const borderColors = {
//   primary: "blue",
//   error: "red",
//   success: "green",
// };

const ActionIconButton = ({
  label,
  icon,
  colorType = "primary",
  size = "small",
  disabled = false,
  tooltipSx = {},
  ...rest
}: ActionIconButtonProps) => {
  if (disabled) {
    return (
      <span>
        <IconButton aria-label={label} size={size} disabled>
          {cloneElement(icon, { color: "disabled", fontSize: size })}
        </IconButton>
      </span>
    );
  }
  return (
    <Tooltip title={label} sx={tooltipSx}>
      <IconButton
        aria-label={label}
        size={size}
        // style={{ border: `1px solid ${borderColors[colorType]}` }}
        color={colorType}
        {...rest}
      >
        {cloneElement(icon, { color: colorType, fontSize: size })}
      </IconButton>
    </Tooltip>
  );
};

export default ActionIconButton;
