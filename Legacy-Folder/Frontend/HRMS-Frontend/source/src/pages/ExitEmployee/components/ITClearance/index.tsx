import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { AssetCondition } from "@/utils/constants";
import { useEffect, useState } from "react";
import useAsync from "@/hooks/useAsync";
import {
  getITClearanceDetails,
  GetITClearanceDetailsResponse,
  ITClearanceDetails,
  upsertITClearanceDetails,
  UpsertITClearanceDetailsArgs,
  UpsertITClearanceDetailsResponse,
} from "@/services/EmployeeExitAdmin";
import { useParams } from "react-router-dom";
import methods from "@/utils";
import { useUserStore } from "@/store";
import ItClearanceForm from "./ITClearanceForm";
import { defaultValues, FormValues } from "./utils";
import { schema } from "./validationSchema";

const ITClearance = ({ editable }: { editable?: boolean }) => {
  const { resignationId } = useParams<{ resignationId: string }>();
  const [itClearanceDetails, setItClearanceDetails] =
    useState<ITClearanceDetails | null>(null);
  const { userData } = useUserStore();

  const { execute: fetchITClearanceDetails, isLoading: isFetchingDetails } =
    useAsync<GetITClearanceDetailsResponse>({
      requestFn: async (): Promise<GetITClearanceDetailsResponse> => {
        return await getITClearanceDetails(Number(resignationId || 0));
      },
      onSuccess: ({ data }) => {
        setItClearanceDetails(data.result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: true,
    });

  const { execute: upsert, isLoading: isUpsertingDetails } = useAsync<
    UpsertITClearanceDetailsResponse,
    UpsertITClearanceDetailsArgs
  >({
    requestFn: async (
      args: UpsertITClearanceDetailsArgs
    ): Promise<UpsertITClearanceDetailsResponse> => {
      return await upsertITClearanceDetails(args);
    },
    onSuccess: () => {
      fetchITClearanceDetails();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const method = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { control, trigger, reset } = method;

  const watchedAssetCondition = useWatch({ control, name: "assetCondition" });

  useEffect(() => {
    reset({
      accessRevoked: itClearanceDetails?.accessRevoked ?? false,
      assetReturned: itClearanceDetails?.assetReturned ?? false,
      assetCondition: Object.values(AssetCondition).includes(
        itClearanceDetails?.assetCondition as AssetCondition
      )
        ? String(itClearanceDetails?.assetCondition)
        : "",
      note: itClearanceDetails?.note ?? "",
      itClearanceCertification: itClearanceDetails?.itClearanceCertification,
    });
  }, [itClearanceDetails]);

  useEffect(() => {
    if (watchedAssetCondition) {
      trigger("note");
    }
  }, [watchedAssetCondition]);

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const args: UpsertITClearanceDetailsArgs = {
      resignationId: Number(resignationId || 0),
      accessRevoked: values.accessRevoked,
      assetReturned: values.assetReturned,
      assetCondition: Number(values.assetCondition),
      note: values.note,
      itClearanceCertification: values.itClearanceCertification,
      employeeId: Number(userData.userId),
      attachmentUrl: values.itAttachment ?? "",
    };
    upsert(args);
  };

  return (
    <ItClearanceForm
      editable={editable}
      itClearanceDetails={itClearanceDetails}
      isFetchingDetails={isFetchingDetails}
      isUpsertingDetails={isUpsertingDetails}
      onSubmit={onSubmit}
    />
  );
};

export default ITClearance;
