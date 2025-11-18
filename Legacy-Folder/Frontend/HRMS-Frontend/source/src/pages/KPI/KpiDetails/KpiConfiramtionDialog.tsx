import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

type KpiRatingConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
};

const KpiRatingConfirmDialog: React.FC<KpiRatingConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      
      aria-labelledby="kpi-rating-dialog-title"
    >
      <DialogTitle
        id="kpi-rating-dialog-title"
        sx={{ fontWeight: 600, fontSize: "1.25rem" }}
      >
        Confirm KPI Rating Submission
      </DialogTitle>

      <DialogContent dividers >
        <Typography variant="body1">
          Please confirm that you would like to submit your KPI rating.
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          <strong>Important:</strong> Once submitted, your rating will be
          finalized and cannot be modified.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KpiRatingConfirmDialog;