import { Box, Button, ButtonProps, CircularProgress } from "@mui/material";

type LoadingButtonProps = ButtonProps & { loading?: boolean };

export const LoadingButton = ({
  loading,
  startIcon,
  children,
  ...rest
}: LoadingButtonProps) => {
  return (
    <Button
      type="button"
      sx={{
        "& .MuiButton-startIcon": {
          fontSize: "18px",
        },
        pointerEvents: loading ? "none" : "initial",
      }}
      variant="outlined"
      startIcon={!loading ? startIcon : null}
      {...rest}
    >
      {loading ? (
        <Box
          component="span"
          sx={{
            height: "100%",
            display: "inherit",
            alignItems: "center",
            mr: "8px",
          }}
        >
          <CircularProgress size="14px" color="inherit" />
        </Box>
      ) : null}
      {children}
    </Button>
  );
};
