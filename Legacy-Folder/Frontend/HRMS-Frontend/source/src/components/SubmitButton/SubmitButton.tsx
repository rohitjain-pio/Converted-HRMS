import { Box, Button, ButtonProps, CircularProgress } from "@mui/material";
import { useFormContext } from "react-hook-form";

const SubmitButton: React.FC<ButtonProps & { loading?: boolean }> = ({
  children,
  loading,
}) => {
  const { formState } = useFormContext();

  return (
    <Button
      variant="contained"
      type="submit"
      disabled={!formState.isDirty || loading}
      sx={{ minWidth: "120px", justifyContent: "space-evenly" }}
    >
      {loading ? (
        <Box
          component="span"
          sx={{ height: "100%", display: "inherit", alignItems: "center" }}
        >
          <CircularProgress size="14px" color="inherit" />
        </Box>
      ) : null}
      {children || "Submit"}
    </Button>
  );
};

export default SubmitButton;
