import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import BreadCrumbs from "@/components/@extended/Router";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useAsync from "@/hooks/useAsync";
import {
  AddGrievanceRemarksPayload,
  AddGrievanceRemarksResponse,
  addGrievanceTicketRemarks,
  addRemarksAllowed,
  AddRemarksAllowedParams,
  AddRemarksAllowedResponse,
  EmployeeGrievanceDetail,
  getEmployeeGrievanceDetail,
  GetEmployeeGrievanceDetailResponse,
  getGrievanceTicketRemarks,
  GetGrievanceTicketRemarksResponse,
  getGrievanceViewAllowed,
  GrievanceTicketRemark,
  GrievanceViewAllowedResponse,
} from "@/services/Grievances";
import methods from "@/utils";
import TicketHeader from "@/pages/Grievances/TicketPage/TicketHeader";
import { ResponseComposerCard } from "@/pages/Grievances/TicketPage/ResponseComposerCard";
import { parseCsv } from "@/utils/helpers";
import MessageCard from "@/pages/Grievances/TicketPage/MessageCard";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { toast } from "react-toastify";
import { GrievanceStatus } from "@/utils/constants";
import Alert from "@mui/material/Alert";
import TicketNotFound from "@/pages/Grievances/TicketPage/TicketNotFound";

const GrievanceTicketPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();

  const [grievanceDetails, setGrievanceDetails] =
    useState<EmployeeGrievanceDetail | null>(null);
  const [remarks, setRemarks] = useState<GrievanceTicketRemark[]>([]);
  const [isCurrentOwner, setIsCurrentOwner] = useState<boolean | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  const canAddRemark = useMemo(
    () =>
      !!grievanceDetails?.status &&
      grievanceDetails.status !== GrievanceStatus.Resolved &&
      isCurrentOwner === true,
    [isCurrentOwner, grievanceDetails]
  );

  const { isLoading: isGateLoading } = useAsync<GrievanceViewAllowedResponse>({
    requestFn: async (): Promise<GrievanceViewAllowedResponse> => {
      return await getGrievanceViewAllowed(Number(ticketId ?? 0));
    },
    onSuccess: ({ data }) => {
      const allowed = data?.result === true;
      setIsAllowed(allowed);
      if (allowed) {
        fetchEmployeeGrievanceDetail();
      }
    },
    onError: (err) => {
      setIsAllowed(false);
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const {
    execute: fetchEmployeeGrievanceDetail,
    isLoading: isLoadingTicketDetails,
  } = useAsync<GetEmployeeGrievanceDetailResponse>({
    requestFn: async (): Promise<GetEmployeeGrievanceDetailResponse> => {
      return await getEmployeeGrievanceDetail(Number(ticketId ?? 0));
    },
    onSuccess: ({ data }) => {
      setGrievanceDetails(data?.result ?? null);

      if (data.result) {
        const { level, grievanceTypeId } = data.result;

        fetchGrievanceTicketRemarks();
        remarksAllowed({ level, grievanceTypeId });
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: fetchGrievanceTicketRemarks, isLoading: isLoadingRemarks } =
    useAsync<GetGrievanceTicketRemarksResponse>({
      requestFn: async (): Promise<GetGrievanceTicketRemarksResponse> => {
        return await getGrievanceTicketRemarks(Number(ticketId ?? 0));
      },
      onSuccess: ({ data }) => {
        setRemarks(data?.result?.remarksList ?? []);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { execute: remarksAllowed, isLoading: isCheckingRemarkAllowed } =
    useAsync<AddRemarksAllowedResponse, AddRemarksAllowedParams>({
      requestFn: async (
        params: AddRemarksAllowedParams
      ): Promise<AddRemarksAllowedResponse> => {
        return await addRemarksAllowed(params);
      },
      onSuccess: ({ data }) => {
        setIsCurrentOwner(data?.result ?? null);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { execute: addRemarks, isLoading: isAddingRemarks } = useAsync<
    AddGrievanceRemarksResponse,
    AddGrievanceRemarksPayload
  >({
    requestFn: async (
      payload: AddGrievanceRemarksPayload
    ): Promise<AddGrievanceRemarksResponse> => {
      return await addGrievanceTicketRemarks(payload);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      fetchEmployeeGrievanceDetail();
      fetchGrievanceTicketRemarks();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const handleRemarkSubmit = (
    args: Omit<AddGrievanceRemarksPayload, "ticketId">
  ) => {
    const payload: AddGrievanceRemarksPayload = {
      ticketId: Number(ticketId ?? 0),
      ...args,
    };

    addRemarks(payload);
  };

  const isGateChecking = isGateLoading && isAllowed === null;
  const isInitialDetailsLoading = isLoadingTicketDetails && !grievanceDetails;

  if (isGateChecking || isInitialDetailsLoading) {
    return <GlobalLoader loading />;
  }

  if (isAllowed === false) {
    return <TicketNotFound />;
  }

  if (!grievanceDetails && !isLoadingTicketDetails) {
    return <TicketNotFound />;
  }

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <Box sx={{ p: "20px" }}>
          {grievanceDetails && !isLoadingTicketDetails ? (
            <TicketHeader
              title={grievanceDetails.title}
              ticketNumber={grievanceDetails.ticketNo}
              createdAt={grievanceDetails.createdOn}
              status={grievanceDetails.status}
              level={grievanceDetails.level}
              currentLevelOwnerNames={parseCsv(grievanceDetails.manageBy)}
              grievanceTypeName={grievanceDetails.grievanceTypeName}
              resolvedDate={grievanceDetails.resolvedDate}
            />
          ) : null}

          {grievanceDetails?.status === GrievanceStatus.Resolved ? (
            <Box sx={{ p: "20px" }}>
              <Alert severity="success" elevation={3} sx={{ fontWeight: 500 }}>
                This ticket has been resolved. Conversations are read-only.
              </Alert>
            </Box>
          ) : null}

          <Box p={2}>
            {grievanceDetails && !isLoadingTicketDetails ? (
              <MessageCard
                actor={{
                  name: grievanceDetails.requesterName,
                  email: grievanceDetails.requesterEmail,
                  avatarUrl: grievanceDetails.requesterAvatar ?? "",
                }}
                timestamp={grievanceDetails.createdOn}
                bodyHtml={grievanceDetails.description}
                attachment={
                  grievanceDetails.attachmentPath &&
                  grievanceDetails.fileOriginalName
                    ? {
                        name: grievanceDetails.fileOriginalName,
                        url: grievanceDetails.attachmentPath,
                      }
                    : undefined
                }
                origin="requester"
              />
            ) : null}

            {/* Responses */}
            {remarks?.length
              ? remarks.map((remark) => {
                  /* Auto escalation log */
                  if (!remark.remarkOwnerEmpId) {
                    return (
                      <MessageCard
                        key={`${remark.createdOn}`}
                        actor={{ name: "System" }}
                        timestamp={remark.createdOn}
                        bodyHtml={remark.remarks}
                        status={remark.status}
                        origin="owner"
                        toneBy="status"
                      />
                    );
                  }

                  return (
                    <MessageCard
                      key={`${remark.remarkOwnerEmail}-${remark.createdOn}`}
                      actor={{
                        name: remark.remarkOwnerName,
                        email: remark.remarkOwnerEmail,
                        avatarUrl: remark.remarkOwnerAvatar ?? "",
                      }}
                      timestamp={remark.createdOn}
                      bodyHtml={remark.remarks}
                      status={remark.status}
                      attachment={
                        remark.attachmentPath && remark.fileOriginalName
                          ? {
                              name: remark.fileOriginalName,
                              url: remark.attachmentPath,
                            }
                          : undefined
                      }
                      origin="owner"
                      toneBy="status"
                    />
                  );
                })
              : null}

            {canAddRemark && grievanceDetails?.level ? (
              <ResponseComposerCard
                level={grievanceDetails.level}
                onSubmit={handleRemarkSubmit}
              />
            ) : null}
          </Box>
        </Box>
      </Paper>

      <GlobalLoader
        loading={
          isLoadingTicketDetails ||
          isCheckingRemarkAllowed ||
          isLoadingRemarks ||
          isAddingRemarks
        }
      />
    </>
  );
};

export default GrievanceTicketPage;
