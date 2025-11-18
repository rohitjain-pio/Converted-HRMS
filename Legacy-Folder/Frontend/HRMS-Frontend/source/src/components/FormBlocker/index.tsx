import { useBlocker } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { Modal, Typography, Button, Box } from "@mui/material";

interface UseFormBlockerOptions {
  message?: string;
}

const FormBlocker = ({
  message = "You have unsaved changes. Are you sure you want to leave?",
}: UseFormBlockerOptions) => {
  const { formState } = useFormContext();
  const blocker = useBlocker(formState.isDirty);

  return (
    <Modal open={blocker.state === "blocked"} onClose={blocker.reset}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography sx={{ mt: 2 }}>{message}</Typography>
        <Box marginTop="20px">
          <Button
            variant="contained"
            color="primary"
            onClick={blocker.proceed}
            sx={{ marginRight: "15px" }}
          >
            Leave
          </Button>
          <Button variant="contained" color="error" onClick={blocker.reset}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default FormBlocker;
