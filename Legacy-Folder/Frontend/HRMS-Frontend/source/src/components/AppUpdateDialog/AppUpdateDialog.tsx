import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { useAppUpdateStore } from "@/store/useAppUpdateStore";
import { BUILD_VERSION_STORAGE_KEY } from "@/utils/constants";

const AppUpdateDialog = () => {
  const { clearUpdate, newVersionAvailable, showUpdateDialog } =
    useAppUpdateStore();

  const handleOk = () => {
    localStorage.setItem(
      BUILD_VERSION_STORAGE_KEY,
      JSON.stringify(newVersionAvailable)
    );
    clearUpdate();
    window.location.reload();
  };

  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      open={showUpdateDialog}
      slotProps={{
        paper: {
          sx: {
            maxHeight: "80%",
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#1E75BB",
          color: "white",
          fontWeight: 600,
          fontSize: "1.25rem",
          px: 4,
        }}
      >
        New Version Available!
      </DialogTitle>
      <DialogContent sx={{ mt: 2, px: 4, fontWeight: 600, fontSize: "1rem" }}>
        A new version of this app is available! Click 'Ok' to view changes.
      </DialogContent>
      <DialogActions sx={{ pb: 3, justifyContent: "center" }}>
        <Button
          sx={{
            minWidth: "96px",
            fontWeight: 500,
            bgcolor: "#1E75BB",
            "&:hover": {
              bgcolor: "#155182",
            },
          }}
          variant="contained"
          onClick={handleOk}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppUpdateDialog;
