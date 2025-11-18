import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import moment from "moment";
import useAsync from "@/hooks/useAsync";
import {
  addEducationDetail,
  AddEducationDetailApiResponse,
  AddEducationDetailArgs,
  EducationDetailType,
  getEducationDetailById,
  GetEducationDetailByIdApiResponse,
  updateEducationDetail,
  UpdateEducationDetailArgs,
} from "@/services/EducationDetails";
import methods from "@/utils";
import { toast } from "react-toastify";
import { useUserStore } from "@/store";
import { useEffect, useState } from "react";
import { onCloseHandler } from "@/utils/dialog";
import { useSearchParams } from "react-router-dom";
import EducationDetailsForm from "./EducationDetailForm";
import { getValidationSchema } from "./validationSchema";

type EducationDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  educationDetailId?: number;
  existingQualification: string[];
  currentQualification: string;
};

const EducationDetailDialog = (props: EducationDetailDialogProps) => {
  const {
    open,
    onClose,
    mode,
    educationDetailId,
    existingQualification,
    currentQualification,
  } = props;
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [educationDetail, setEducationDetail] =
    useState<EducationDetailType | null>(null);
  const validationSchema = getValidationSchema(
    educationDetailId && educationDetail?.fileName ? false : true,
    existingQualification,
    currentQualification
  );
  type FormData = Yup.InferType<ReturnType<typeof getValidationSchema>>;

  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      qualificationId: "",
      collegeUniversity: "",
      aggregatePercentage: 0,
      file: null,
      degreeName: "",
      startYear: undefined,
      endYear: undefined,
    },
  });
  const { reset, setValue } = method;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { execute: create, isLoading: isSaving } = useAsync<
    AddEducationDetailApiResponse,
    AddEducationDetailArgs
  >({
    requestFn: async (
      args: AddEducationDetailArgs
    ): Promise<AddEducationDetailApiResponse> => {
      return await addEducationDetail(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    AddEducationDetailApiResponse,
    UpdateEducationDetailArgs
  >({
    requestFn: async (
      args: UpdateEducationDetailArgs
    ): Promise<AddEducationDetailApiResponse> => {
      return await updateEducationDetail(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { isLoading } = useAsync<GetEducationDetailByIdApiResponse, number>({
    requestFn: async (
      id: number
    ): Promise<GetEducationDetailByIdApiResponse> => {
      return await getEducationDetailById(id);
    },
    onSuccess: ({ data }) => {
      const {
        qualificationId,
        collegeUniversity,
        aggregatePercentage,
        startYear,
        endYear,
        degreeName,
      } = data.result;

      setEducationDetail(data.result);

      setValue("aggregatePercentage", aggregatePercentage);
      setValue("degreeName", degreeName);
      setValue("collegeUniversity", collegeUniversity);
      setValue("qualificationId", qualificationId.toString());
      setValue("startYear", moment(startYear, "MM-YYYY"));
      setValue("endYear", moment(endYear, "MM-YYYY"));
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: educationDetailId,
    autoExecute: mode === "edit" && typeof educationDetailId === "number",
  });

  const onSubmit = (data: FormData) => {
    if (mode === "edit" && typeof educationDetailId !== "undefined") {
      update({
        Id: educationDetailId,
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        AggregatePercentage: data.aggregatePercentage,
        DegreeName: data.degreeName,
        CollegeUniversity: data.collegeUniversity,
        QualificationId: +data.qualificationId,
        StartYear: data.startYear
          ? moment(data.startYear).format("MM-YYYY")
          : "",
        EndYear: data.endYear ? moment(data.endYear).format("MM-YYYY") : "",
        File: data.file || "",
      });
    } else {
      create({
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        AggregatePercentage: data.aggregatePercentage,
        DegreeName: data.degreeName,
        CollegeUniversity: data.collegeUniversity,
        QualificationId: +data.qualificationId,
        StartYear: data.startYear
          ? moment(data.startYear).format("MM-YYYY")
          : "",
        EndYear: data.endYear ? moment(data.endYear).format("MM-YYYY") : "",
        File: data.file,
      });
    }
  };

  const handleResetForm = () => {
    if (
      mode === "edit" &&
      typeof educationDetailId !== "undefined" &&
      educationDetail
    ) {
      const {
        qualificationId,
        collegeUniversity,
        aggregatePercentage,
        startYear,
        endYear,
        degreeName,
      } = educationDetail;

      setValue("aggregatePercentage", aggregatePercentage);
      setValue("degreeName", degreeName);
      setValue("collegeUniversity", collegeUniversity);
      setValue("qualificationId", qualificationId.toString());
      setValue("startYear", moment(startYear, "MM-YYYY"));
      setValue("endYear", moment(endYear, "MM-YYYY"));
    } else {
      reset();
    }
  };

  return (
    <EducationDetailsForm
      open={open}
      onClose={onClose}
      onCloseHandler={onCloseHandler}
      mode={mode}
      method={method}
      onSubmit={onSubmit}
      handleResetForm={handleResetForm}
      isLoading={isLoading}
      isSaving={isSaving}
      isUpdating={isUpdating}
      educationDetailId={educationDetailId}
      educationDetail={educationDetail}
    />
  );
};
export default EducationDetailDialog;
