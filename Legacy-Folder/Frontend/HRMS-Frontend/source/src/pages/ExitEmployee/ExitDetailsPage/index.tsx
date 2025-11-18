import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import {
  acceptEarlyRelease,
  AcceptEarlyReleaseArgs,
  AcceptEarlyReleaseResponse,
  acceptResignation,
  AcceptResignationResponse,
  ExitDetails,
  getExitDetails,
  GetExitDetailsResponse,
  rejectResignationOrEarlyRelease,
  RejectResignationOrEarlyReleaseArgs,
  RejectResignationOrEarlyReleaseResponse,
  updateLastWorkingDay,
  UpdateLastWorkingDayArgs,
  UpdateLastWorkingDayResponse,
} from "@/services/EmployeeExitAdmin";
import useAsync from "@/hooks/useAsync";
import { useParams } from "react-router-dom";
import methods from "@/utils";
import {
  ResignationStatus,
  ResignationStatusCode,
} from "@/utils/constants";
import ExitEmployeeDetailsForms from "./ExitDetailsForm";
import { useResignationDetails } from "./ResignationDetailsView";
import { DialogType, PreviewType } from "./utils";
import { RejectForm, rejectionSchema, AcceptEarlyReleaseForm, acceptEarlyReleaseSchema, UpdateLastWorkingForm, updateLastWorkingSchema } from "./validationSchema";


const ExitEmployeeDetails = () => {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const { resignationId } = useParams<{ resignationId: string }>();
  const [exitDetails, setExitDetails] = useState<ExitDetails | null>(null);
  const [previewType, setPreviewType] = useState<PreviewType | null>(null);

  const { execute: fetchExitDetails } = useAsync<GetExitDetailsResponse>({
    requestFn: async (): Promise<GetExitDetailsResponse> => {
      return await getExitDetails(Number(resignationId ?? 0));
    },
    onSuccess: ({ data }) => {
      setExitDetails(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const { execute: reject, isLoading: isSubmittingRejection } = useAsync<
    RejectResignationOrEarlyReleaseResponse,
    RejectResignationOrEarlyReleaseArgs
  >({
    requestFn: async (
      args: RejectResignationOrEarlyReleaseArgs
    ): Promise<RejectResignationOrEarlyReleaseResponse> => {
      return await rejectResignationOrEarlyRelease(args);
    },
    onSuccess: () => {
      closeDialog();
      fetchExitDetails();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const {
    execute: acceptEarlyReleaseRequest,
    isLoading: isSubmittingEarlyReleaseApproval,
  } = useAsync<AcceptEarlyReleaseResponse, AcceptEarlyReleaseArgs>({
    requestFn: async (
      args: AcceptEarlyReleaseArgs
    ): Promise<AcceptEarlyReleaseResponse> => {
      return await acceptEarlyRelease(args);
    },
    onSuccess: () => {
      closeDialog();
      fetchExitDetails();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: updateLastWorking, isLoading: isUpdatingLastWorkingDay } =
    useAsync<UpdateLastWorkingDayResponse, UpdateLastWorkingDayArgs>({
      requestFn: async (
        args: UpdateLastWorkingDayArgs
      ): Promise<UpdateLastWorkingDayResponse> => {
        return await updateLastWorkingDay(args);
      },
      onSuccess: () => {
        closeDialog();
        fetchExitDetails();
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const {
    execute: acceptResignationRequest,
    isLoading: isSubmittingResignationApproval,
  } = useAsync<AcceptResignationResponse>({
    requestFn: async (): Promise<AcceptResignationResponse> => {
      return await acceptResignation(exitDetails?.resignationId ?? 0);
    },
    onSuccess: () => {
      closeDialog();
      fetchExitDetails();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const previewData = useMemo(() => {
    if (!exitDetails) {
      return { title: "", content: "" };
    }

    switch (previewType) {
      case "resignationReason":
        return {
          title: "Resignation Reason",
          content: exitDetails.reason,
        };
      case "resignationRejectReason":
        return {
          title: "Resignation Reject Reason",
          content: exitDetails.rejectResignationReason,
        };
      case "earlyReleaseRejectReason":
        return {
          title: "Early Release Reject Reason",
          content: exitDetails.rejectEarlyReleaseReason,
        };
      default:
        return { title: "", content: "" };
    }
  }, [previewType]);

  const openDialog = (type: DialogType) => {
    setDialogType(type);
    rejectMethod.reset();
    acceptEarlyReleaseMethod.reset();
  };

  const closeDialog = () => {
    setDialogType(null);
  };

  const onAcceptResignation = () => {
    acceptResignationRequest();
  };

  const onReject: SubmitHandler<RejectForm> = (values) => {
    if (
      !exitDetails?.resignationId ||
      typeof exitDetails.resignationId !== "number"
    ) {
      console.error("Invalid resignation id:", exitDetails?.resignationId);
      return;
    }

    const rejectionType =
      dialogType === "rejectResignation"
        ? "resignation"
        : dialogType === "rejectEarlyRelease"
          ? "earlyrelease"
          : "";

    if (!rejectionType) {
      return;
    }

    reject({
      resignationId: exitDetails.resignationId,
      rejectReason: values.comment?.trim() === "" ? null : values.comment,
      rejectionType,
    });
  };
  const rejectMethod = useForm<RejectForm>({
    resolver: yupResolver(rejectionSchema),
    defaultValues: {
      comment: "",
    },
  });

  const acceptEarlyReleaseMethod = useForm<AcceptEarlyReleaseForm>({
    resolver: yupResolver(acceptEarlyReleaseSchema),
    defaultValues: {
      releaseDate: null,
    },
  });

  const updateLastWorkingMethod = useForm<UpdateLastWorkingForm>({
    resolver: yupResolver(updateLastWorkingSchema),
    defaultValues: {
      lastWorkingDay: null,
    },
  });
  const onAcceptEarlyRelease: SubmitHandler<AcceptEarlyReleaseForm> = (
    values
  ) => {
    if (
      !exitDetails?.resignationId ||
      typeof exitDetails.resignationId !== "number"
    ) {
      console.error("Invalid resignation id:", exitDetails?.resignationId);
      return;
    }

    if (!values.releaseDate) {
      console.error("Invalid release date:", values.releaseDate);
      return;
    }

    acceptEarlyReleaseRequest({
      resignationId: exitDetails.resignationId,
      earlyReleaseDate: moment(values.releaseDate).format("YYYY-MM-DD"),
    });
  };

  const onUpdateLastWorkingDay: SubmitHandler<UpdateLastWorkingForm> = (
    values
  ) => {
    if (
      !exitDetails?.resignationId ||
      typeof exitDetails.resignationId !== "number"
    ) {
      console.error("Invalid resignation id:", exitDetails?.resignationId);
      return;
    }

    if (!values.lastWorkingDay) {
      console.error("Invalid release date:", values.lastWorkingDay);
      return;
    }

    updateLastWorking({
      resignationId: exitDetails.resignationId,
      lastWorkingDay: moment(values.lastWorkingDay).format("YYYY-MM-DD"),
    });
  };

  const canEditExitDetails = useMemo(() => {
    if (!exitDetails) {
      return false;
    }

    const disabledStatuses: ResignationStatusCode[] = [
      ResignationStatus.completed,
      ResignationStatus.cancelled,
      ResignationStatus.revoked,
    ];

    return !disabledStatuses.includes(
      exitDetails.resignationStatus as ResignationStatusCode
    );
  }, [exitDetails]);

  const details = useResignationDetails({
    canEditExitDetails,
    exitDetails,
    openDialog,
    setPreviewType,
  });

  return (
    <ExitEmployeeDetailsForms
      details={details}
      dialogType={dialogType}
      previewType={previewType}
      previewData={previewData}
      exitDetails={exitDetails}
      rejectMethod={rejectMethod}
      acceptEarlyReleaseMethod={acceptEarlyReleaseMethod}
      updateLastWorkingMethod={updateLastWorkingMethod}
      onReject={onReject}
      onAcceptEarlyRelease={onAcceptEarlyRelease}
      onUpdateLastWorkingDay={onUpdateLastWorkingDay}
      onAcceptResignation={onAcceptResignation}
      closeDialog={closeDialog}
      setPreviewType={setPreviewType}
      isSubmittingRejection={isSubmittingRejection}
      isSubmittingEarlyReleaseApproval={isSubmittingEarlyReleaseApproval}
      isSubmittingResignationApproval={isSubmittingResignationApproval}
      isUpdatingLastWorkingDay={isUpdatingLastWorkingDay}
      canEditExitDetails={canEditExitDetails}
    />
  );
};

export default ExitEmployeeDetails;
