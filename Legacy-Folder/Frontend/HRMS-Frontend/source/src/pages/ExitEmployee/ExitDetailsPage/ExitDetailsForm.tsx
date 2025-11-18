import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import FormTextField from "@/components/FormTextField";
import FormDatePicker from "@/components/FormDatePicker";
import moment from "moment";
import AccountClearance from "../components/AccountClearance";
import DepartmentClearance from "../components/DepartmentClearance";
import HrClearance from "../components/HRClearance";
import ITClearance from "../components/ITClearance";
import {
  RejectForm,
  AcceptEarlyReleaseForm,
  UpdateLastWorkingForm,
} from "./validationSchema";
import BreadCrumbs from "@/components/@extended/Router";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import PageHeader from "@/components/PageHeader/PageHeader";
import TabPanel from "@/components/TabPanel";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import ResignationReasonPreview from "@/pages/Resignation/components/ResignationReasonPreview";
import { formatDate } from "@/utils/formatDate";
import { useEffect } from "react";
import { ExitDetails } from "@/services/EmployeeExitAdmin";
import { PreviewType } from "./utils";

type Props = {
  details:
    | (
        | {
            label: string;
            value: string;
            customElement?: undefined;
          }
        | {
            label: string;
            customElement: JSX.Element;
            value?: undefined;
          }
      )[]
    | null;
  dialogType: string | null;
  previewType: string | null;
  previewData: { title: string; content: string };
  exitDetails: ExitDetails | null;
  rejectMethod: UseFormReturn<
    {
      comment: string;
    },
    undefined
  >;
  acceptEarlyReleaseMethod: UseFormReturn<
    {
      releaseDate: moment.Moment | null;
    },
    undefined
  >;
  updateLastWorkingMethod: UseFormReturn<
    {
      lastWorkingDay: moment.Moment | null;
    },
    undefined
  >;
  onReject: SubmitHandler<RejectForm>;
  onAcceptEarlyRelease: SubmitHandler<AcceptEarlyReleaseForm>;
  onUpdateLastWorkingDay: SubmitHandler<UpdateLastWorkingForm>;
  onAcceptResignation: () => void;
  closeDialog: () => void;
  canEditExitDetails: boolean;
  setPreviewType: React.Dispatch<React.SetStateAction<PreviewType | null>>;
  isSubmittingRejection: boolean;
  isSubmittingEarlyReleaseApproval: boolean;
  isSubmittingResignationApproval: boolean;
  isUpdatingLastWorkingDay: boolean;
};

const ExitEmployeeDetailsForms: React.FC<Props> = ({
  details,
  canEditExitDetails,
  dialogType,
  previewType,
  previewData,
  exitDetails,
  rejectMethod,
  acceptEarlyReleaseMethod,
  updateLastWorkingMethod,
  onReject,
  onAcceptEarlyRelease,
  onUpdateLastWorkingDay,
  onAcceptResignation,
  closeDialog,
  setPreviewType,
  isSubmittingRejection,
  isSubmittingEarlyReleaseApproval,
  isSubmittingResignationApproval,
  isUpdatingLastWorkingDay,
}) => {
  useEffect(() => {
    if (exitDetails) {
      acceptEarlyReleaseMethod.reset({
        releaseDate: moment(exitDetails.earlyReleaseDate, "YYYY-MM-DD"),
      });
    }
  }, [exitDetails]);

  useEffect(() => {
    if (exitDetails) {
      updateLastWorkingMethod.reset({
        lastWorkingDay: moment(exitDetails.lastWorkingDay, "YYYY-MM-DD"),
      });
    }
  }, [exitDetails]);
  const tabs = [
    {
      label: "HR Clearance",
      content: <HrClearance editable={canEditExitDetails} />,
      canRead: true,
    },
    {
      label: "Department Clearance",
      content: <DepartmentClearance editable={canEditExitDetails} />,
      canRead: true,
    },
    {
      label: "IT Clearance",
      content: <ITClearance editable={canEditExitDetails} />,
      canRead: true,
    },
    {
      label: "Account Clearance",
      content: <AccountClearance editable={canEditExitDetails} />,
      canRead: true,
    },
  ];

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="Exit Employee Details" goBack={true} />
        <Box padding="30px" gap="30px" display="flex" flexDirection="column">
          <Stack gap={4}>
            <Grid container spacing={2}>
              {details?.map(({ label, value, customElement }, index) => (
                <Grid
                  key={index}
                  item
                  xs={12}
                  sm={6}
                  md={4}
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
                  {customElement ? (
                    customElement
                  ) : (
                    <TruncatedText
                      text={value}
                      tooltipTitle={value}
                      maxLength={20}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
            <Divider />
            <TabPanel tabs={tabs} />
          </Stack>
        </Box>
      </Paper>
      <Dialog maxWidth="sm" fullWidth open={!!dialogType}>
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            px: 4,
          }}
        >
          {dialogType === "acceptResignation" && "Accept Resignation"}
          {dialogType === "rejectResignation" && "Reject Resignation"}
          {dialogType === "acceptEarlyRelease" && "Accept Early Release"}
          {dialogType === "rejectEarlyRelease" && "Reject Early Release"}
          {dialogType === "updateLastWorking" && "Update Last Working Day"}
        </DialogTitle>

        <DialogContent dividers>
          {dialogType === "acceptResignation" && (
            <Typography gutterBottom>
              You are about to accept the resignation of{" "}
              {exitDetails?.employeeName}. The last working day is currently set
              as {formatDate(exitDetails?.lastWorkingDay)}. You may update this
              date if needed before proceeding.
            </Typography>
          )}
          {(dialogType === "rejectResignation" ||
            dialogType === "rejectEarlyRelease") && (
            <FormProvider<RejectForm> {...rejectMethod}>
              <Box
                id="rejection-form"
                component="form"
                autoComplete="off"
                onSubmit={rejectMethod.handleSubmit(onReject)}
              >
                <FormTextField
                  multiline
                  name="comment"
                  label="Comment"
                  placeholder="Add your comments"
                />
              </Box>
            </FormProvider>
          )}
          {dialogType === "acceptEarlyRelease" && (
            <FormProvider<AcceptEarlyReleaseForm> {...acceptEarlyReleaseMethod}>
              <Stack
                id="early-release-form"
                component="form"
                autoComplete="off"
                onSubmit={acceptEarlyReleaseMethod.handleSubmit(
                  onAcceptEarlyRelease
                )}
                gap={2}
              >
                <FormDatePicker
                  label="Release Date"
                  name="releaseDate"
                  format="MMM Do, YYYY"
                  minDate={moment()}
                  maxDate={moment(exitDetails?.earlyReleaseDate, "YYYY-MM-DD")}
                  required
                />
                <Typography textAlign="center">
                  Calculate the buyout amount and share with the employee for
                  smooth exit.
                </Typography>
              </Stack>
            </FormProvider>
          )}
          {dialogType === "updateLastWorking" && (
            <FormProvider<UpdateLastWorkingForm> {...updateLastWorkingMethod}>
              <Stack
                id="update-last-working-form"
                component="form"
                autoComplete="off"
                onSubmit={updateLastWorkingMethod.handleSubmit(
                  onUpdateLastWorkingDay
                )}
                gap={2}
              >
                <FormDatePicker
                  label="Last Working Day"
                  name="lastWorkingDay"
                  format="MMM Do, YYYY"
                  minDate={moment()}
                  required
                />
              </Stack>
            </FormProvider>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ minWidth: "120px", justifyContent: "space-evenly" }}
            type="button"
            onClick={closeDialog}
          >
            Cancel
          </Button>
          <Button
            form={
              dialogType === "acceptResignation"
                ? undefined
                : dialogType === "acceptEarlyRelease"
                  ? "early-release-form"
                  : dialogType === "updateLastWorking"
                    ? "update-last-working-form"
                    : "rejection-form"
            }
            variant="contained"
            type={dialogType === "acceptResignation" ? "button" : "submit"}
            onClick={
              dialogType === "acceptResignation"
                ? onAcceptResignation
                : undefined
            }
            sx={{ minWidth: "120px", justifyContent: "space-evenly" }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {exitDetails && !!previewType && (
        <ResignationReasonPreview
          title={previewData.title}
          open={!!previewType}
          onClose={() => {
            setPreviewType(null);
          }}
          reason={previewData.content}
        />
      )}
      <GlobalLoader
        loading={
          isSubmittingRejection ||
          isSubmittingEarlyReleaseApproval ||
          isSubmittingResignationApproval ||
          isUpdatingLastWorkingDay
        }
      />
    </>
  );
};
export default ExitEmployeeDetailsForms;
