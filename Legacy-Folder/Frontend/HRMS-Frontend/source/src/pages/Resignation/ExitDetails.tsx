import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import { formatDate } from "@/utils/formatDate";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ResignationReasonPreview from "@/pages/Resignation/components/ResignationReasonPreview";
import { useMemo, useState } from "react";
import EarlyReleaseDialog from "@/pages/Resignation/components/EarlyReleaseDialog/index";
import useAsync from "@/hooks/useAsync";
import {
  GetResignationExitDetails,
  getResignationExitDetails,
  GetResignationExitDetailsResponse,
  revokeResignation,
  RevokeResignationResponse,
} from "@/services/EmployeeExit";
import { useUserStore } from "@/store";
import methods from "@/utils";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { toast } from "react-toastify";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  EARLY_RELEASE_STATUS_LABELS,
  EarlyReleaseStatus,
  EarlyReleaseStatusValue,
  RESIGNATION_STATUS_LABELS,
  ResignationStatus,
  ResignationStatusCode, 
} from "@/utils/constants";
import moment from "moment";

const isEnableProgress = false;
const steps = ["Pending", "Manager Approved", "HR Approved", "Completed"];
const mockStatus = "Manager Approved";

type PreviewType =
  | "resignationReason"
  | "resignationRejectReason"
  | "earlyReleaseRejectReason";

type ExitDetailsPageProps = {
  fetchResignationActiveStatus: (params?: void | undefined) => Promise<void>;
};

const ExitDetails = (props: ExitDetailsPageProps) => {
  const { fetchResignationActiveStatus } = props;
  const [previewType, setPreviewType] = useState<PreviewType | null>(null);
  const [isEarlyReleaseDialogOpen, setIsEarlyReleaseDialogOpen] =
    useState(false);
  const { userData } = useUserStore();
  const [exitData, setExitData] = useState<GetResignationExitDetails | null>(
    null
  );
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");

  const { execute: fetchExitDetails, isLoading } =
    useAsync<GetResignationExitDetailsResponse>({
      requestFn: async (): Promise<GetResignationExitDetailsResponse> => {
        return await getResignationExitDetails(
          Number(employeeId ? employeeId : userData.userId)
        );
      },
      onSuccess: ({ data }) => {
        setExitData(data.result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: true,
    });

  const { execute: revoke, isLoading: isRevoking } = useAsync<
    RevokeResignationResponse,
    number
  >({
    requestFn: async (
      resignationId: number
    ): Promise<RevokeResignationResponse> => {
      return await revokeResignation(resignationId);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      setIsRevokeDialogOpen(false);

      fetchResignationActiveStatus();

      const targetId = employeeId ?? String(userData.userId);
      const isOwnProfile = targetId === String(userData.userId);

      const to = isOwnProfile
        ? "/profile/personal-details"
        : `/profile/personal-details?employeeId=${employeeId}`;

      navigate(to);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const details = useMemo(() => {
    if (!exitData) {
      return null;
    }

    return [
      { label: "Name", value: exitData?.employeeName },
      { label: "Department", value: exitData?.department },
      { label: "Reporting Manager", value: exitData?.reportingManager },
      {
        label: "Resignation Date",
        value: formatDate(exitData.resignationDate),
      },
      {
        label: "Last Working Day",

        value: formatDate(exitData.lastWorkingDay),
      },
      {
        label: "Resignation Reason",
        customElement: (
          <Tooltip title="View Reason">
            <IconButton
              color="primary"
              onClick={() => {
                setPreviewType("resignationReason");
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        label: "Resignation Status",
        customElement: (
          <Stack direction="row" gap={2} alignItems="center">
            <TruncatedText
              text={
                RESIGNATION_STATUS_LABELS[
                  exitData.status as ResignationStatusCode
                ]
              }
              tooltipTitle={
                RESIGNATION_STATUS_LABELS[
                  exitData.status as ResignationStatusCode
                ]
              }
              maxLength={20}
            />
            {exitData.rejectResignationReason &&
              exitData.status === ResignationStatus.cancelled && (
                <Tooltip title="View Reason">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setPreviewType("resignationRejectReason");
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              )}
          </Stack>
        ),
      },
      ...(exitData.earlyReleaseDate && exitData.earlyReleaseStatus
        ? [
            {
              label: "Early Release Request",
              customElement: (
                <Stack direction="row" gap={2} alignItems="center">
                  <TruncatedText
                    text={`${moment(exitData.earlyReleaseDate, "YYYY-MM-DD").format("MMM Do, YYYY")} (${EARLY_RELEASE_STATUS_LABELS[exitData.earlyReleaseStatus as EarlyReleaseStatusValue]})`}
                    tooltipTitle={`${moment(exitData.earlyReleaseDate, "YYYY-MM-DD").format("MMM Do, YYYY")} (${EARLY_RELEASE_STATUS_LABELS[exitData.earlyReleaseStatus as EarlyReleaseStatusValue]})`}
                    maxLength={30}
                  />
                  {exitData.rejectEarlyReleaseReason &&
                    exitData.earlyReleaseStatus ===
                      EarlyReleaseStatus.rejected && (
                      <Tooltip title="View Reason">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setPreviewType("earlyReleaseRejectReason");
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                </Stack>
              ),
            },
          ]
        : []),
    ];
  }, [exitData]);

  const previewData = useMemo(() => {
    if (!exitData) {
      return { title: "", content: "" };
    }

    switch (previewType) {
      case "resignationReason":
        return {
          title: "Resignation Reason",
          content: exitData.reason,
        };
      case "resignationRejectReason":
        return {
          title: "Resignation Reject Reason",
          content: exitData.rejectResignationReason,
        };
      case "earlyReleaseRejectReason":
        return {
          title: "Early Release Reject Reason",
          content: exitData.rejectEarlyReleaseReason,
        };
      default:
        return { title: "", content: "" };
    }
  }, [previewType]);

  const activeStep = steps.findIndex((step) => step === mockStatus);

  const handleRevoke = () => {
    if (!exitData || !exitData.id) {
      toast.error("Resignation Id not found");
      return;
    }

    revoke(exitData.id);
  };

  const showEarlyReleaseButton = useMemo(
    () =>
      exitData &&
      exitData.status === ResignationStatus.accepted &&
      !exitData.earlyReleaseDate &&
      !exitData.earlyReleaseStatus,
    [exitData]
  );

  return (
    <>
      <PageHeader
        variant="h3"
        title="Exit Details"
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
      />
      <Box paddingY="30px" gap="30px" display="flex" flexDirection="column">
        {!details ? (
          <Typography textAlign="center">No Data Found</Typography>
        ) : (
          <Stack gap={5}>
            <Grid container spacing={2}>
              {details.map(({ label, value, customElement }, index) => (
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

            <Stack direction="row" pb={2} spacing={2} justifyContent="center">
              {exitData &&
                (exitData.status === ResignationStatus.pending ||
                  exitData.status === ResignationStatus.accepted) &&
                moment(exitData.lastWorkingDay).isSameOrAfter(
                  moment(),
                  "day"
                ) && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setIsRevokeDialogOpen(true);
                    }}
                  >
                    Revoke
                  </Button>
                )}
              {showEarlyReleaseButton && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsEarlyReleaseDialogOpen(true);
                  }}
                >
                  Request Early Release
                </Button>
              )}
            </Stack>
          </Stack>
        )}

        {isEnableProgress && (
          <Stack>
            <PageHeader
              variant="h4"
              title="Exit Progress"
              containerStyles={{ paddingX: 0, paddingTop: 0 }}
            />
            <Stepper
              sx={{ pt: "30px" }}
              activeStep={activeStep}
              alternativeLabel
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        )}
      </Box>
      {exitData && !!previewType && (
        <ResignationReasonPreview
          title={previewData.title}
          open={!!previewType}
          onClose={() => {
            setPreviewType(null);
          }}
          reason={previewData.content}
        />
      )}
      {isEarlyReleaseDialogOpen && exitData && (
        <EarlyReleaseDialog
          open={isEarlyReleaseDialogOpen}
          onClose={() => {
            setIsEarlyReleaseDialogOpen(false);
          }}
          lastWorkingDay={exitData.lastWorkingDay}
          resignationId={exitData.id}
          fetchExitDetails={fetchExitDetails}
        />
      )}
      {isRevokeDialogOpen && (
        <ConfirmationDialog
          open={isRevokeDialogOpen}
          onClose={() => {
            setIsRevokeDialogOpen(false);
          }}
          onConfirm={handleRevoke}
          title="Revoke Resignation?"
          content="Revoking your resignation will terminate the current resignation process. Please contact the HR Admin for further guidance on the next steps."
        />
      )}
      <GlobalLoader loading={isLoading || isRevoking} />
    </>
  );
};

export default ExitDetails;
