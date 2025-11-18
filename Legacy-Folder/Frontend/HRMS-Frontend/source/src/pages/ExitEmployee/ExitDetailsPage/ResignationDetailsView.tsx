
import {
  Stack,
  IconButton,
  Tooltip,
  ButtonGroup,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";


import moment from "moment";
import { ExitDetails } from "@/services/EmployeeExitAdmin";
import { useMemo } from "react";
import { formatDate } from "@/utils/formatDate";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { RESIGNATION_STATUS_LABELS, ResignationStatusCode, ResignationStatus, EMPLOYMENT_STATUS_LABELS, EmploymentStatusCode, EARLY_RELEASE_STATUS_LABELS, EarlyReleaseStatusValue, EarlyReleaseStatus } from "@/utils/constants";
import { getNoticePeriod } from "@/utils/helpers";
import { DialogType, PreviewType } from "./utils";

type Props = {
  exitDetails: ExitDetails|null;
  canEditExitDetails: boolean;
  setPreviewType: React.Dispatch<React.SetStateAction<PreviewType | null>>
 openDialog:(type: DialogType)=>void
};

export const useResignationDetails = ({
  exitDetails,
  canEditExitDetails,
  setPreviewType,
  openDialog,
}: Props) => {
  return useMemo(() => {
    if (!exitDetails) {
      return null;
    }

    return [
      { label: "Employee Name", value: exitDetails.employeeName },
      {
        label: "Resignation Date",
        value: formatDate(exitDetails.resignationDate),
      },
      { label: "Department", value: exitDetails.departmentName },
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
                  exitDetails.resignationStatus as ResignationStatusCode
                ]
              }
              tooltipTitle={
                RESIGNATION_STATUS_LABELS[
                  exitDetails.resignationStatus as ResignationStatusCode
                ]
              }
              maxLength={20}
            />
            {exitDetails.rejectResignationReason &&
              exitDetails.resignationStatus === ResignationStatus.cancelled && (
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
            {canEditExitDetails &&
              exitDetails.resignationStatus === ResignationStatus.pending && (
                <ButtonGroup
                  size="small"
                  sx={(theme) => ({
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.grey[400]}`,
                  })}
                >
                  <Tooltip title="Accept">
                    <IconButton
                      color="success"
                      onClick={() => {
                        openDialog("acceptResignation");
                      }}
                      size="small"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Divider
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={(theme) => ({ borderColor: theme.palette.grey[300] })}
                  />
                  <Tooltip title="Reject">
                    <IconButton
                      color="error"
                      onClick={() => {
                        openDialog("rejectResignation");
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ButtonGroup>
              )}
          </Stack>
        ),
      },
      { label: "Reporting Manager", value: exitDetails.reportingManagerName },
      {
        label: "Last Working Day",
        customElement: (
          <Stack direction="row" gap={2} alignItems="center">
            <TruncatedText
              text={formatDate(exitDetails.lastWorkingDay)}
              tooltipTitle={formatDate(exitDetails.lastWorkingDay)}
              maxLength={20}
            />
            {canEditExitDetails && (
              <ButtonGroup
                size="small"
                sx={(theme) => ({
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.grey[400]}`,
                })}
              >
                <Tooltip title="Update">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      openDialog("updateLastWorking");
                    }}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
            )}
          </Stack>
        ),
      },
      {
        label: "Employment Type",
        value:
          EMPLOYMENT_STATUS_LABELS[
            exitDetails.employmentStatus as EmploymentStatusCode
          ],
      },
      ...(exitDetails.earlyReleaseDate && exitDetails.earlyReleaseStatus
        ? [
            {
              label: "Early Release Request",
              customElement: (
                <Stack direction="row" gap={2} alignItems="center">
                  <TruncatedText
                    text={`${moment(exitDetails.earlyReleaseDate, "YYYY-MM-DD").format("MMM Do, YYYY")} (${EARLY_RELEASE_STATUS_LABELS[exitDetails.earlyReleaseStatus as EarlyReleaseStatusValue]})`}
                    tooltipTitle={`${moment(exitDetails.earlyReleaseDate, "YYYY-MM-DD").format("MMM Do, YYYY")} (${EARLY_RELEASE_STATUS_LABELS[exitDetails.earlyReleaseStatus as EarlyReleaseStatusValue]})`}
                    maxLength={30}
                  />
                  {exitDetails.rejectEarlyReleaseReason &&
                    exitDetails.earlyReleaseStatus ===
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
                  {canEditExitDetails &&
                    exitDetails.earlyReleaseDate &&
                    exitDetails.earlyReleaseStatus ===
                      EarlyReleaseStatus.pending && (
                      <ButtonGroup
                        size="small"
                        sx={(theme) => ({
                          borderRadius: "8px",
                          border: `1px solid ${theme.palette.grey[400]}`,
                        })}
                      >
                        <Tooltip title="Accept">
                          <IconButton
                            color="success"
                            onClick={() => {
                              openDialog("acceptEarlyRelease");
                            }}
                            size="small"
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Divider
                          orientation="vertical"
                          variant="middle"
                          flexItem
                          sx={(theme) => ({
                            borderColor: theme.palette.grey[300],
                          })}
                        />
                        <Tooltip title="Reject">
                          <IconButton
                            color="error"
                            onClick={() => {
                              openDialog("rejectEarlyRelease");
                            }}
                            size="small"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ButtonGroup>
                    )}
                </Stack>
              ),
            },
          ]
        : []),
      { label: "Notice Period", value: getNoticePeriod(exitDetails.jobType) },
    ];
  }, [exitDetails]);}
