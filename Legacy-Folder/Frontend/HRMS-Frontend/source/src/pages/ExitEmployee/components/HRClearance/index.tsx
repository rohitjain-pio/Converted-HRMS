import {
  getHRClearanceByResignationId,
  upsertHRClearance,
} from "@/services/EmployeeExitAdmin/employeeExitAdminService";
import useAsync from "@/hooks/useAsync/useAsync";
import {
  GetHRClearanceByResignationIdResponse,
  HrClearanceDetails,
  UpsertHRClearanceArgs,
  UpsertHRClearanceResponse,
} from "@/services/EmployeeExitAdmin/types";
import { useParams } from "react-router-dom";
import methods from "@/utils";
import { useState } from "react";
import { useUserStore } from "@/store";
import HrClearanceForm from "./HrClearanceForm";
import { FormValues } from "./utils";

const HrClearance = ({ editable }: { editable?: boolean }) => {
  const { resignationId } = useParams<{ resignationId: string }>();
  const parsedResignationId = Number(resignationId);

  
  const [hrClearanceData, setHrCleranceData] = useState<HrClearanceDetails>();
  const { execute: fetchHrClearance, isLoading: fetchLoading } = useAsync<
    GetHRClearanceByResignationIdResponse,
    number
  >({
    requestFn: async (): Promise<GetHRClearanceByResignationIdResponse> => {
      return await getHRClearanceByResignationId(Number(resignationId ?? 0));
    },
    onSuccess: (res) => {
      const data = res.data.result;
      setHrCleranceData(data);
      
    },
    onError: (error) => {
      methods.throwApiError(error);
    },
    autoExecute: true,
  });

  const { execute: upsert, isLoading: isSaving } = useAsync<
    UpsertHRClearanceResponse,
    UpsertHRClearanceArgs
  >({
    requestFn: async (args: UpsertHRClearanceArgs) => {
      return await upsertHRClearance(args);
    },
    onSuccess: () => {
      fetchHrClearance();
    },
    onError: (error) => {
      methods.throwApiError(error);
    },
  });

  const { userData } = useUserStore();

  const onSubmit = (data: FormValues) => {
    const args: UpsertHRClearanceArgs = {
      employeeId: Number(userData.userId),
      resignationId: parsedResignationId,
      advanceBonusRecoveryAmount: data.advanceBonusRecoveryAmount,
      serviceAgreementDetails: data.serviceAgreementDetails,
      currentEL: data.currentEL,
      numberOfBuyOutDays: data.numberOfBuyOutDays,
      exitInterviewStatus: data.exitInterviewStatus,
      exitInterviewDetails: data.exitInterviewDetails,
      attachment: data.hrAttachment ?? "",
    };
    upsert(args);
  };

  return (
    <HrClearanceForm
      editable={editable}
      hrClearanceData={hrClearanceData}
      isSaving={isSaving}
      fetchLoading={fetchLoading}
      onSubmit={onSubmit}
    />
  );
};

export default HrClearance;
