import { Box, ButtonProps, Fab, Tooltip, Button } from "@mui/material";
import { useFormContext } from "react-hook-form";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface ResetButtonProps extends ButtonProps {
  isIcon?: boolean;
}

const ResetButton: React.FC<ResetButtonProps> = ({
  size = "medium",
  children,
  isIcon = false,
  ...rest
}) => {
  const { reset, formState } = useFormContext();
  return (
    <>
      {!isIcon && (
        <Button
          variant="contained"
          color="inherit"
          onClick={() => reset()}
          disabled={!formState.isDirty}
          sx={{ minWidth: "120px" }}
          {...rest}
        >
          {children || "Reset"}
        </Button>
      )}
      {isIcon && (
        <Tooltip title={(formState.isDirty && children) || "Reset"}>
          <Box>
            <Fab
              onClick={rest.onClick}
              size={size}
              aria-label="Reset"
              disabled={!formState.isDirty}
            >
              {children || <RestartAltIcon />}
            </Fab>
          </Box>
        </Tooltip>
      )}
    </>
  );
};

export default ResetButton;
