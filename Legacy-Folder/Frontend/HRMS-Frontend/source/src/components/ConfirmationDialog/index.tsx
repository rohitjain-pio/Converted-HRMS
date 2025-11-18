import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { ReactNode } from "react";
import PageHeader from "@/components/PageHeader/PageHeader"

export interface ConfirmDialogAction extends ButtonProps {
  _id: string;
  label: ReactNode;
}

type ConfirmationDialogProps = {
  open: boolean;
  title?: string;
  content: ReactNode;
  onClose: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  cancelBtnLabel?: string;
  confirmBtnLabel?: string;
  confirmBtnColor?:
    | "error"
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning";
};

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const {
    open,
    title,
    content,
    onClose,
    onCancel,
    onConfirm,
    cancelBtnLabel = "Cancel",
    confirmBtnLabel = "Confirm",
    confirmBtnColor = "error",
  } = props;

  const actions: ConfirmDialogAction[] = [
    {
      _id: "cancel",
      label: cancelBtnLabel,
      onClick: onCancel ?? onClose,
      color: "inherit",
      variant: "outlined",
    },
    {
      _id: "confirm",
      label: confirmBtnLabel,
      onClick: onConfirm,
      color: confirmBtnColor,
      variant: "contained",
    },
  ];

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      {title && (
        <>
          <PageHeader title={title} variant="h4" />
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            style={{ position: "absolute", right: 20, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </>
      )}
      <DialogContent>
        <Typography>{content}</Typography>
      </DialogContent>
      <DialogActions>
        {actions.map(({ label, _id, variant, color, ...restProps }) => (
          <Button
            key={_id}
            sx={{
              minWidth: "120px",
              fontFamily: "Roboto",
              fontWeight: 500,
            }}
            color={color}
            variant={variant}
            {...restProps}
          >
            {label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
