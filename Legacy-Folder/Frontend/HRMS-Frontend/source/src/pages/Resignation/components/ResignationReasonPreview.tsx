import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type ResignationReasonPreviewProps = {
  open: boolean;
  onClose: () => void;
  reason: string;
  title: string;
};

const ResignationReasonPreview = (props: ResignationReasonPreviewProps) => {
  const { open, onClose, reason, title } = props;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxHeight: "80%",
          },
        }
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Typography
          sx={{ alignSelf: "center", color: "#273A50", flex: 1 }}
          variant="h4"
        >
          {title}
        </Typography>
        <Stack direction="row" gap={1.5} mr={-1}>
          <IconButton color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>{reason}</DialogContent>
    </Dialog>
  );
};

export default ResignationReasonPreview;
