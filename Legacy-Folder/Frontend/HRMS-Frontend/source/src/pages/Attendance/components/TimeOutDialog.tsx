import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface TimeOutDialogProps {
  open: boolean;
  onClose: () => void;
  timeOutDate: string;
  onSubmit: () => void;
  isLoading:boolean
}

const TimeOutDialog: React.FC<TimeOutDialogProps> = ({
  open,
  onClose,
  timeOutDate,
  onSubmit,
  isLoading
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Time Out</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Please confirm your Time Out for the selected date.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Confirm Time Out for <b>{timeOutDate}</b>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="error"disabled={isLoading} >
          Time Out
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeOutDialog;
