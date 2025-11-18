import { useParams } from "react-router-dom";
import BreadCrumbs from "@/components/@extended/Router";
import { Box, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";

import EditIcon from "@mui/icons-material/Edit";

import { useMemo, useState } from "react";
import {
  BUG_TYPE,
  BUG_TYPE_LABEL,
  FEEDBACK_STATUS,
  FEEDBACK_STATUS_LABEL,
  permissionValue,
  role,
} from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { formatDate } from "@/utils/formatDate";
import {
  GetFeedbackById,
  getFeedBackDetails,
  updateFeedBackStatus,
  UpdateStatusFeedBack,
  UpdateStatusFeedBackArgs,
} from "@/services/Support";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";
import { UpdateStatusDialog } from "./UpdateStatusDialog";
import { toast } from "react-toastify";
import { hasPermission } from "@/utils/hasPermission";
import { useUserStore } from "@/store";

const FeedBackDetailsPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { userData } = useUserStore();
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const theme = useTheme();

  const handleEditClick = () => {
    setOpenEditDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenEditDialog(false);
  };

  const {
    execute: fetchDetails,
    data,
    isLoading,
  } = useAsync<GetFeedbackById, number>({
    requestFn: async (): Promise<GetFeedbackById> => {
      return await getFeedBackDetails(requestId ? Number(requestId) : 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const { execute: updateStatus } = useAsync<
    UpdateStatusFeedBack,
    UpdateStatusFeedBackArgs
  >({
    requestFn: async (
      args: UpdateStatusFeedBackArgs
    ): Promise<UpdateStatusFeedBack> => {
      return await updateFeedBackStatus(args);
    },
    onSuccess: () => {
      toast.success("Status Update Successfully");
      fetchDetails();
      setOpenEditDialog(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const canEdit =
    userData &&
    data &&
    (userData.roleName === role.SUPER_ADMIN ||
      data.result.employeeId !== Number(userData.userId));

  const details = useMemo(() => {
    const details = data?.result;

    return [
      { label: "Support Id", value: details?.id },
      { label: "Name", value: details?.employeeName },
      { label: "Email", value: details?.employeeEmail },
      {
        label: "Type",
        value: BUG_TYPE_LABEL[details?.feedbackType as BUG_TYPE],
      },
      {
        label: "Ticket Status",
        value: FEEDBACK_STATUS_LABEL[details?.ticketStatus as FEEDBACK_STATUS],
      },
      { label: "Created On", value: formatDate(details?.createdOn) },
      { label: "Subject", value: details?.subject },
      {
        label: "Description",
        value: details?.description,
      },
      ...(details?.adminComment
        ? [{ label: "Admin Comment", value: details?.adminComment }]
        : []),
      {
        label: "File Name",
        customElement: (
          <Box display="flex" alignItems="center">
            {details?.fileOriginalName ? (
              <>
                <Typography>{details?.fileOriginalName}</Typography>
                <ViewDocument
                  containerType={1}
                  filename={String(details?.attachmentPath)}
                />
              </>
            ) : (
              <Typography>No file uploaded</Typography>
            )}
          </Box>
        ),
      },
    ];
  }, [data]);
  const { SUPPORT_DASHBOARD } = permissionValue;
  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title={"Support Details"} goBack={true} />
        <Box padding="30px">
          {!details ? (
            <Typography textAlign="center">No Data Found</Typography>
          ) : (
            <Stack gap={5}>
              <Grid container spacing={2}>
                {details.map(({ label, value, customElement }, index) => (
                  <Grid
                    key={index}
                    item
                    xs={6}
                    display="flex"
                    flexDirection="row"
                    gap="5px"
                    alignItems="center"
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >{`${label}:`}</Typography>
                    {customElement ?? (
                      <TruncatedText
                        text={value}
                        tooltipTitle={value}
                        maxLength={40}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </Box>

        {openEditDialog && hasPermission(SUPPORT_DASHBOARD.READ) && canEdit && (
          <UpdateStatusDialog
            open={openEditDialog}
            details={data.result}
            onClose={handleCloseDialog}
            id={data?.result.id}
            updateStatus={updateStatus}
          />
        )}
        {details && hasPermission(SUPPORT_DASHBOARD.READ) && canEdit && (
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box
              onClick={handleEditClick}
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
              mr={2}
              px={2}
              py={1}
              border={1}
              borderRadius={2}
              bgcolor={theme.palette.grey[100]}
              sx={{
                maxWidth: "250px",
                cursor: "pointer",
                transition: "background-color 0.3s",
                "&:hover": {
                  backgroundColor: theme.palette.grey[300],
                },
              }}
            >
              <EditIcon fontSize="small" color="primary" />
              <Typography variant="body1" color="textPrimary">
                Support Query Status
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
      <GlobalLoader loading={isLoading} />
    </>
  );
};

export default FeedBackDetailsPage;
