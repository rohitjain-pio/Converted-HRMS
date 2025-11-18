import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

type LeaveActionDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
};

const LeaveActionDialog: React.FC<LeaveActionDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [comment, setComment] = useState<string>("");

  const handleConfirm = () => {
    onConfirm(comment);
    setComment("");
  };

  const title = "Reject Leave";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem", px: 4 }}>
        {title}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Comment"
          placeholder="Add your comment"
          multiline
          fullWidth
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="error">
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveActionDialog;
