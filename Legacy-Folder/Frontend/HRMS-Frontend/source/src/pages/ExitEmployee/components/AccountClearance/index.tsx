import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useParams } from "react-router-dom";
import {
  AccountClearanceDetails,
  getAccountClearanceDetails,
  GetAccountClearanceDetailsResponse,
  upsertAccountClearanceDetails,
  UpsertAccountClearanceDetailsArgs,
  UpsertAccountClearanceDetailsResponse,
} from "@/services/EmployeeExitAdmin";
import { useState } from "react";
import { useUserStore } from "@/store";
import { FormValues } from "./utils";
import { schema } from "./validationSchema";
import AccountClearanceForm from "./AccountClearance";

const AccountClearance = ({ editable }: { editable?: boolean }) => {
  const { userData } = useUserStore();
  const { resignationId } = useParams<{ resignationId: string }>();
  const [accountClearanceDetails, setAccountClearanceDetails] =
    useState<AccountClearanceDetails | null>(null);

  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fnFStatus: false,
      fnFAmount: "",
      issueNoDueCertificate: false,
      note: "",
      accountAttachment: null,
    },
  });


  const {
    execute: fetchAccountClearanceDetails,
    isLoading: isFetchingDetails,
  } = useAsync<GetAccountClearanceDetailsResponse>({
    requestFn: async () =>
      await getAccountClearanceDetails(Number(resignationId || 0)),
    onSuccess: ({ data }) => {
      setAccountClearanceDetails(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const { execute: upsert, isLoading: isUpsertingDetails } = useAsync<
    UpsertAccountClearanceDetailsResponse,
    UpsertAccountClearanceDetailsArgs
  >({
    requestFn: async (args) => await upsertAccountClearanceDetails(args),
    onSuccess: () => {
      fetchAccountClearanceDetails();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

 

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const file = method.getValues("accountAttachment") as File | null;
    const args: UpsertAccountClearanceDetailsArgs = {
      employeeId: Number(userData.userId),
      resignationId: Number(resignationId || 0),
      fnFStatus: values.fnFStatus,
      fnFAmount: values.fnFAmount ? Number(values.fnFAmount) : 0,
      issueNoDueCertificate: values.issueNoDueCertificate,
      note: values.note,
      accountAttachment: file ?? "",
    };

    upsert(args);
  };

  return (
    <AccountClearanceForm
      editable={editable}
      accountClearanceDetails={accountClearanceDetails}
      isUpsertingDetails={isUpsertingDetails}
      isFetchingDetails={isFetchingDetails}
      onSubmit={onSubmit}
    />
  );
};

export default AccountClearance;
