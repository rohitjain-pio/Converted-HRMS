import { useForm } from "react-hook-form";
import moment, { Moment } from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUserStore } from "@/store";
import useAsync from "@/hooks/useAsync";
import {
  AddPreviousEmployerApiResponse,
  AddPreviousEmployerArgs,
  GetPreviousEmployerByIdApiResponse,
  UpdatePreviousEmployerApiResponse,
  UpdatePreviousEmployerArgs,
} from "@/services/EmploymentDetails";
import {
  addPreviousEmployer,
  getPreviousEmployerById,
  updatePreviousEmployer,
} from "@/services/EmploymentDetails/employmentDetailsService";
import methods from "@/utils";
import { useEffect, useState } from "react";
import { onCloseHandler } from "@/utils/dialog";
import { regex } from "@/utils/regexPattern";
import { useSearchParams } from "react-router-dom";
import { PreviousEmployeeDialogForm } from "./PreviousEmployeeDialogForm";

const {
  name,
  nameMaxLength_35,
  nameMaxLength_50,
  notOnlyNumbers,
  minCharactersExist,
} = regex;

const validationSchema = Yup.object({
  employerName: Yup.string()
    .trim()
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      return notOnlyNumbers.pattern.test(value);
    })
    .test(name.key, name.message, (value) => {
      if (!value) return true;
      return name.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_35.number, nameMaxLength_35.message)
    .required("Employer Name required."),
  designation: Yup.string()
    .trim()
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      return notOnlyNumbers.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_50.number, nameMaxLength_50.message)
    .required("Designation is required"),
  startDate: Yup.mixed<Moment>()
    .test({
      name: "is-valid",
      message: "Invalid Date",
      test: (startDate) => moment.isMoment(startDate),
    })
    .test({
      name: "no-future-dates",
      message: "Start date cannot be in the future",
      test: (startDate) =>
        moment.isMoment(startDate)
          ? startDate.isSameOrBefore(moment(), "day")
          : false,
    })
    .required("Start date is required"),
  endDate: Yup.mixed<Moment>()
    .test({
      name: "is-valid",
      message: "Invalid Date",
      test: (endDate) => moment.isMoment(endDate),
    })
    .test({
      name: "no-future-dates",
      message: "End date cannot be in the future",
      test: (endDate) =>
        moment.isMoment(endDate)
          ? endDate.isSameOrBefore(moment(), "day")
          : false,
    })
    .test({
      name: "end-after-start",
      message: "End date must be after start date",
      test: (endDate, context) => {
        const startDate = context.parent.startDate as Moment | undefined;
        return moment.isMoment(endDate) && moment.isMoment(startDate)
          ? endDate.isAfter(startDate, "day")
          : false;
      },
    })
    .required("End date is required"),
});

type PreviousEmployerDialogProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  previousEmployerId?: number;
};

export type FormDataType = Yup.InferType<typeof validationSchema>;

const PreviousEmployerDialog = (props: PreviousEmployerDialogProps) => {
  const { open, onClose, mode, previousEmployerId } = props;
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      employerName: "",
      designation: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const { reset, setValue } = method;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const [previousEmployerDetail, setPreviousEmployerDetail] = useState<{
    id: number;
    employeeId: number;
    employerName: string;
    designation: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  const { execute: create, isLoading: isSaving } = useAsync<
    AddPreviousEmployerApiResponse,
    AddPreviousEmployerArgs
  >({
    requestFn: async (
      args: AddPreviousEmployerArgs
    ): Promise<AddPreviousEmployerApiResponse> => {
      return await addPreviousEmployer(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { isLoading } = useAsync<GetPreviousEmployerByIdApiResponse, number>({
    requestFn: async (
      id: number
    ): Promise<GetPreviousEmployerByIdApiResponse> => {
      return await getPreviousEmployerById(id);
    },
    onSuccess: ({ data }) => {
      const { employerName, designation, startDate, endDate } = data.result;

      setPreviousEmployerDetail(data.result);

      setValue("employerName", employerName);
      setValue("designation", designation);
      setValue("startDate", moment(startDate, "YYYY-MM-DD"));
      setValue("endDate", moment(endDate, "YYYY-MM-DD"));
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: previousEmployerId,
    autoExecute: mode === "edit" && typeof previousEmployerId === "number",
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    UpdatePreviousEmployerApiResponse,
    UpdatePreviousEmployerArgs
  >({
    requestFn: async (
      args: UpdatePreviousEmployerArgs
    ): Promise<UpdatePreviousEmployerApiResponse> => {
      return await updatePreviousEmployer(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (formData: FormDataType) => {
    if (mode === "edit" && typeof previousEmployerId !== "undefined") {
      update({
        ...formData,
        startDate: moment(formData.startDate).format("YYYY-MM-DD"),
        endDate: moment(formData.endDate).format("YYYY-MM-DD"),
        employeeId: employeeId ? +employeeId : +userData.userId,
        id: previousEmployerId,
      });
    } else {
      create({
        ...formData,
        startDate: moment(formData.startDate).format("YYYY-MM-DD"),
        endDate: moment(formData.endDate).format("YYYY-MM-DD"),
        employeeId: employeeId ? +employeeId : +userData.userId,
      });
    }
  };

  const handleResetForm = () => {
    if (
      mode === "edit" &&
      typeof previousEmployerId !== "undefined" &&
      previousEmployerDetail
    ) {
      const { employerName, designation, startDate, endDate } =
        previousEmployerDetail;

      setValue("employerName", employerName);
      setValue("designation", designation);
      setValue("startDate", moment(startDate, "YYYY-MM-DD"));
      setValue("endDate", moment(endDate, "YYYY-MM-DD"));
    } else {
      reset();
    }
  };

  return (
    <PreviousEmployeeDialogForm
      method={method}
      handleResetForm={handleResetForm}
      isLoading={isLoading}
      onCloseHandler={onCloseHandler}
      open={open}
      mode={mode}
      isSaving={isSaving}
      previousEmployerId={previousEmployerId}
      isUpdating={isUpdating}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};

export default PreviousEmployerDialog;
