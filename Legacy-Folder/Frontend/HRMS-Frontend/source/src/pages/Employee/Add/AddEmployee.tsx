import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { EmploymentStatus } from "@/utils/constants";
import * as Yup from "yup";
import {
  addEmploymentDetail,
  AddEmploymentDetailArgs,
  AddOrUpdateEmploymentDetailResponse,
  getLatestEmployeeCode,
  GetLatestEmployeeCodeResponse,
} from "@/services/User";
import { toast } from "react-toastify";
import methods from "@/utils";
import useAsync from "@/hooks/useAsync";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { validationSchema } from "./validationSchema";
import { CRIMINAL_VERIFICATION_STATUS } from "./util";
import AddEmployeeForm from "./AddEmployeeFrom";

type FormDataType = Yup.InferType<typeof validationSchema>;

const AddEmployee = () => {
  const navigate = useNavigate();
  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      designationId: "",
      departmentId: "",
      teamId: "",
      reportingManagerId: 0,
      employmentStatus: "",
      joiningDate: undefined,
      jobType: "",
      branchId: "",
      employeeCode: "",
      timeDoctorUserId: "",
      backgroundVerificationstatus: "",
      criminalVerification: "",
      totalExperienceYear: 0,
      totalExperienceMonth: 0,
      relevantExperienceYear: 0,
      relevantExperienceMonth: 0,
      probationMonths: 0,
    },
  });

  const { reset, setValue, getValues, control } = method;

  const prevEmploymentStatusRef = useRef<FormDataType["employmentStatus"]>("");
  const savedEmployeeCodeRef = useRef<FormDataType["employeeCode"]>("");

  const watchedEmploymentStatus = useWatch({
    control,
    name: "employmentStatus",
  });

  useEffect(() => {
    const prevEmploymentStatus = Number(prevEmploymentStatusRef.current);
    const currEmploymentStatus = Number(watchedEmploymentStatus);

    if (
      currEmploymentStatus === EmploymentStatus.internship &&
      prevEmploymentStatus !== EmploymentStatus.internship
    ) {
      savedEmployeeCodeRef.current = getValues("employeeCode");
      setValue("employeeCode", "");
    }

    if (
      prevEmploymentStatus === EmploymentStatus.internship &&
      currEmploymentStatus !== EmploymentStatus.internship
    ) {
      setValue("employeeCode", savedEmployeeCodeRef.current);
    }

    prevEmploymentStatusRef.current = watchedEmploymentStatus;
  }, [watchedEmploymentStatus]);

  const { execute: fetchLatestEmployeeCode } =
    useAsync<GetLatestEmployeeCodeResponse>({
      requestFn: async (): Promise<GetLatestEmployeeCodeResponse> => {
        return await getLatestEmployeeCode();
      },
      onSuccess: ({ data }) => {
        const latestEmployeeCode = data.result;
        reset((values) => ({ ...values, employeeCode: latestEmployeeCode }));
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { execute: create, isLoading: isSaving } = useAsync<
    AddOrUpdateEmploymentDetailResponse,
    AddEmploymentDetailArgs
  >({
    requestFn: async (
      args: AddEmploymentDetailArgs
    ): Promise<AddOrUpdateEmploymentDetailResponse> => {
      return await addEmploymentDetail(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      navigate("/employees/employee-list");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchLatestEmployeeCode();
  }, []);

  const onSubmit = (data: FormDataType) => {
    const criminalVerification =
      data.criminalVerification === CRIMINAL_VERIFICATION_STATUS.COMPLETED;

    create({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      employeeCode: data.employeeCode,
      email: data.email,
      joiningDate: data.joiningDate.format("YYYY-MM-DD"), // moment(data.joiningDate).format("YYYY-MM-DD"),
      branchId: +data.branchId,
      teamId: +data.teamId,
      designationId: +data.designationId,
      reportingManagerId: data.reportingManagerId,
      employmentStatus: +data.employmentStatus,
      backgroundVerificationstatus: +data.backgroundVerificationstatus,
      criminalVerification: criminalVerification,
      departmentId: +data.departmentId,
      totalExperienceYear: data.totalExperienceYear,
      totalExperienceMonth: data.totalExperienceMonth,
      relevantExperienceYear: data.relevantExperienceYear,
      relevantExperienceMonth: data.relevantExperienceMonth,
      jobType: +data.jobType,
      probationMonths: data.probationMonths,
      timeDoctorUserId: data.timeDoctorUserId,
    });
  };

  return (
    <AddEmployeeForm method={method} onSubmit={onSubmit} isSaving={isSaving} />
  );
};

export default AddEmployee;
