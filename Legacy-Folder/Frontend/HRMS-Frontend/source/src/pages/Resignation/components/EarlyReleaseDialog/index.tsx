import { useState } from "react";
import * as Yup from "yup";
import moment from "moment";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useAsync from "@/hooks/useAsync";
import {
  requestEarlyRelease,
  RequestEarlyReleaseArgs,
  RequestEarlyReleaseResponse,
} from "@/services/EmployeeExit";
import { toast } from "react-toastify";
import methods from "@/utils";
import EarlyReleaseDialogForm from "./EarlyReleaseDialogForm";
import { earlyReleaseSchema } from "./validationSchema";


type EarlyReleaseDialogProps = {
  open: boolean;
  onClose: () => void;
  lastWorkingDay: string;
  resignationId: number;
  fetchExitDetails: (params?: void | undefined) => Promise<void>;
};


type FormDateType = Yup.InferType<typeof earlyReleaseSchema>;

const EarlyReleaseDialog = (props: EarlyReleaseDialogProps) => {
  const { open, onClose, lastWorkingDay, resignationId, fetchExitDetails } =
    props;
  const [step, setStep] = useState<0 | 1>(0);

  const { execute: addEarlyReleaseRequest, isLoading } = useAsync<
    RequestEarlyReleaseResponse,
    RequestEarlyReleaseArgs
  >({
    requestFn: async (
      args: RequestEarlyReleaseArgs
    ): Promise<RequestEarlyReleaseResponse> => {
      return await requestEarlyRelease(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      fetchExitDetails();
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const method = useForm<FormDateType>({
    resolver: yupResolver(earlyReleaseSchema),
    mode: "all",
    context: { lastWorkingDay },
    defaultValues: {
      agreed: false,
      releaseDate: undefined,
    },
  });

  const {  watch, trigger } = method;

  const agreed = watch("agreed");

  const onNext = async () => {
    const valid = await trigger("agreed");

    if (valid) {
      setStep(1);
    }
  };

  const onSubmit = (values: FormDateType) => {
    addEarlyReleaseRequest({
      resignationId,
      earlyReleaseDate: moment(values.releaseDate).format("YYYY-MM-DD"),
    });
  };

  return (
   
<EarlyReleaseDialogForm
  open={open}
  onClose={onClose}
  method={method}
  onSubmit={onSubmit}
  step={step}
  setStep={setStep}
  agreed={agreed}
  onNext={onNext}
  lastWorkingDay={lastWorkingDay}
  isLoading={isLoading}
/>

  );
};

export default EarlyReleaseDialog;
