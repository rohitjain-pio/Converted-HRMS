import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  deleteEventDocument,
  DeleteEventDocumentResponse,
  EventDocumentType,
} from "@/services/Events";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useState } from "react";
import useAsync from "@/hooks/useAsync";
import { toast } from "react-toastify";
import methods from "@/utils";

type Props = {
  eventDocuments: EventDocumentType[];
  removeFromDocumentList: (documentId: number) => void;
  disabled?: boolean;
};

const EventDocuments = (props: Props) => {
  const { eventDocuments, removeFromDocumentList, disabled } = props;

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [documentToDeleteId, setDocumentToDeleteId] = useState<number | null>(
    null
  );

  const { execute: removeDocument } = useAsync<
    DeleteEventDocumentResponse,
    number
  >({
    requestFn: async (id: number): Promise<DeleteEventDocumentResponse> => {
      return await deleteEventDocument(id);
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");

      if (documentToDeleteId === null) {
        throw new TypeError("Document id cannot be null");
      }

      removeFromDocumentList(documentToDeleteId);
      closeConfirmationDialog();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  function openConfirmationDialog(id: number) {
    setIsConfirmationDialogOpen(true);
    setDocumentToDeleteId(id);
  }

  function closeConfirmationDialog() {
    setDocumentToDeleteId(null);
    setIsConfirmationDialogOpen(false);
  }

  function handleConfirmDelete(id: number) {
    removeDocument(id);
  }

  return (
    <>
      {eventDocuments.length > 0 && (
        <Box
          sx={{
            borderRadius: "0.25rem",
            border: "1px solid #d9d9d9",
            pt: 1,
            pb: 1,
          }}
        >
          <Stack>
            {eventDocuments.map((eventDocument) => (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(0 0 0 / 0.04)",
                  },
                }}
                gap={1}
              >
                <Tooltip title={eventDocument.originalFileName}>
                  <Typography
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    pl={1}
                    flexGrow={1}
                    sx={{
                      color: (theme) =>
                        disabled ? theme.palette.grey[400] : "initial",
                    }}
                  >
                    {eventDocument.originalFileName}
                  </Typography>
                </Tooltip>
                {!disabled && (
                  <Tooltip title="Delete document">
                    <IconButton
                      color="error"
                      aria-label="delete"
                      onClick={() => openConfirmationDialog(eventDocument.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
      {documentToDeleteId && (
        <ConfirmationDialog
          title={"Delete document"}
          content={
            "This file will be permanently deleted from the event. Do you wish to continue?"
          }
          open={isConfirmationDialogOpen}
          onClose={closeConfirmationDialog}
          onConfirm={() => handleConfirmDelete(documentToDeleteId)}
        />
      )}
    </>
  );
};

export default EventDocuments;
