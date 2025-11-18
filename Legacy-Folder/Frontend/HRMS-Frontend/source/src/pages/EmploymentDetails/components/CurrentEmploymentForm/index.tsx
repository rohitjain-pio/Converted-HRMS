import { useEffect, useState } from "react";
import moment from "moment";
import { useUserStore } from "@/store";
import useAsync from "@/hooks/useAsync";
import {
  AddOrUpdateEmploymentDetailResponse,
  EmployeeDetailsType,
  getEmploymentDetailById,
  GetEmploymentDetailByIdResponse,
  getLatestEmployeeCode,
  GetLatestEmployeeCodeResponse,
  updateEmploymentDetail,
  UpdateEmploymentDetailArgs,
} from "@/services/User";
import methods from "@/utils";
import {
  useForm,
} from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { hasPermission } from "@/utils/hasPermission";
import NotFoundPage from "@/pages/NotFoundPage";
import {
  EmploymentStatus,
  permissionValue,
} from "@/utils/constants";
import { getValidationSchema } from "./validationSchema";
import EmploymentForm from "./EmploymentForm";
import { CRIMINAL_VERIFICATION_STATUS, convertApiValueToStr, convertFormStrToApiValue } from "./utils";


type FormDataType = Yup.InferType<ReturnType<typeof getValidationSchema>>;

const CurrentEmploymentForm = (props: { isEditable: boolean }) => {
  const { id } = useParams<{ id: string }>();
  const { isEditable } = props;
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { READ } = permissionValue.EMPLOYMENT_DETAILS;
  const [
    isExtendedConfirmationDateChanged,
    setIsExtendedConfirmationDateChanged,
  ] = useState(false);
  const [currentEmploymentDetails, setCurrentEmploymentDetails] =
    useState<EmployeeDetailsType | null>(null);

  const [isEmployeeCodeEditable, setIsEmployeeCodeEditable] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const hasRolePermission = isEditable
    ? hasPermission(permissionValue.ROLE.READ) &&
      hasPermission(permissionValue.ROLE.EDIT)
    : hasPermission(permissionValue.ROLE.READ);

  const hasEmployeePermission = isEditable
    ? hasPermission(permissionValue.EMPLOYEES.READ) &&
      hasPermission(permissionValue.EMPLOYEES.EDIT)
    : hasPermission(permissionValue.EMPLOYEES.READ);

  const { execute: fetchEmploymentDetailById, isLoading } =
    useAsync<GetEmploymentDetailByIdResponse>({
      requestFn: async (): Promise<GetEmploymentDetailByIdResponse> => {
        return await getEmploymentDetailById(
          id ? id : employeeId ? employeeId : userData.userId
        );
      },
      onSuccess: ({ data }) => {
        setCurrentEmploymentDetails(data.result ?? null);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { execute: update, isLoading: isUpdating } = useAsync<
    AddOrUpdateEmploymentDetailResponse,
    UpdateEmploymentDetailArgs
  >({
    requestFn: async (
      args: UpdateEmploymentDetailArgs
    ): Promise<AddOrUpdateEmploymentDetailResponse> => {
      return await updateEmploymentDetail(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);

      if (fromAttendanceConfig) {
        navigate("/attendance/attendance-configuration");
        return;
      }

      window.close();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const {
    execute: fetchLatestEmployeeCode,
    isLoading: isFetchingNewEmployeeCode,
  } = useAsync<GetLatestEmployeeCodeResponse>({
    requestFn: async (): Promise<GetLatestEmployeeCodeResponse> => {
      return await getLatestEmployeeCode();
    },
    onSuccess: ({ data }) => {
      const latestEmployeeCode = data.result;
      setValue("employeeCode", latestEmployeeCode, { shouldDirty: true });
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    if (hasPermission(READ)) {
      fetchEmploymentDetailById();
    }
  }, [employeeId]);

  const validationSchema = getValidationSchema(hasRolePermission);

  const method = useForm<FormDataType>({
    context: {
      updated: isExtendedConfirmationDateChanged,
    },
    resolver: yupResolver(validationSchema),
    defaultValues: {
      employeeId: "",
      employeeCode: "",
      email: "",
      designationId: "",
      departmentId: "",
      teamId: "",
      employmentStatus: "",
      jobType: "",
      branchId: "",
      roleId: "",
      isReportingManager: false,
      employeeStatus: "",
      reportingManagerId: "",
      joiningDate: null,
      backgroundVerificationstatus: "",
      criminalVerification: "",
      probationMonths: 0,
      confirmationDate: null,
      totalExperienceYears: 0,
      totalExperienceMonths: 0,
      relevantExperienceYears: 0,
      relevantExperienceMonths: 0,
      probExtendedWeeks: 0,
      extendedConfirmationDate: null,
      linkedInUrl: "",
      timeDoctorUserId: "",
    },
  });

  const {
    reset,
    watch,
    formState,
    setValue,
  } = method;

  const criminalVerificationValue = watch("criminalVerification");
  const watchedEmploymentStatus = watch("employmentStatus");

  const isCriminalVerificationCompleted =
    !formState.dirtyFields.criminalVerification &&
    criminalVerificationValue === CRIMINAL_VERIFICATION_STATUS.COMPLETED;

  useEffect(() => {
    if (currentEmploymentDetails) {
      const criminalVerificationStatus =
        currentEmploymentDetails.criminalVerification === null
          ? ""
          : currentEmploymentDetails.criminalVerification
            ? CRIMINAL_VERIFICATION_STATUS.COMPLETED
            : CRIMINAL_VERIFICATION_STATUS.PENDING;

      reset({
        employeeId: currentEmploymentDetails.employeeId?.toString(),
        employeeCode: currentEmploymentDetails.employeeCode,
        email: currentEmploymentDetails.email,
        designationId: convertApiValueToStr(
          currentEmploymentDetails.designationId
        ),
        departmentId: convertApiValueToStr(
          currentEmploymentDetails.departmentId
        ),
        teamId: convertApiValueToStr(currentEmploymentDetails.teamId),
        employmentStatus: convertApiValueToStr(
          currentEmploymentDetails.employmentStatus
        ),
        jobType: convertApiValueToStr(currentEmploymentDetails.jobType),
        branchId: convertApiValueToStr(currentEmploymentDetails.branchId),
        roleId: hasRolePermission
          ? convertApiValueToStr(currentEmploymentDetails.roleId)
          : currentEmploymentDetails.roleId.toString(),
        isReportingManager:
          currentEmploymentDetails?.isReportingManager ?? false,
        employeeStatus: convertApiValueToStr(
          currentEmploymentDetails.employeeStatus
        ),
        reportingManagerId: convertApiValueToStr(
          currentEmploymentDetails.reportingManagerId
        ),
        joiningDate: currentEmploymentDetails.joiningDate
          ? moment(currentEmploymentDetails.joiningDate, "YYYY-MM-DD")
          : null,
        backgroundVerificationstatus: convertApiValueToStr(
          currentEmploymentDetails.backgroundVerificationstatus
        ),
        criminalVerification: criminalVerificationStatus,
        probationMonths: currentEmploymentDetails.probationMonths,
        confirmationDate: currentEmploymentDetails.confirmationDate
          ? moment(currentEmploymentDetails.confirmationDate, "YYYY-MM-DD")
          : null,
        totalExperienceYears: currentEmploymentDetails.totalExperienceYear,
        totalExperienceMonths: currentEmploymentDetails.totalExperienceMonth,
        relevantExperienceYears:
          currentEmploymentDetails.relevantExperienceYear,
        relevantExperienceMonths:
          currentEmploymentDetails.relevantExperienceMonth,
        probExtendedWeeks: currentEmploymentDetails.probExtendedWeeks,
        extendedConfirmationDate:
          currentEmploymentDetails.extendedConfirmationDate
            ? moment(
                currentEmploymentDetails.extendedConfirmationDate,
                "YYYY-MM-DD"
              )
            : null,
        linkedInUrl: currentEmploymentDetails.linkedInUrl,
        timeDoctorUserId:
          typeof currentEmploymentDetails.timeDoctorUserId === "string"
            ? currentEmploymentDetails.timeDoctorUserId?.trim()
            : "",
      });
    }
  }, [currentEmploymentDetails]);

  useEffect(() => {
    if (!currentEmploymentDetails) {
      return;
    }

    const originalEmploymentStatus = currentEmploymentDetails?.employmentStatus;

    const originalEmployeeCode = currentEmploymentDetails?.employeeCode;

    const fromInternship =
      Number(originalEmploymentStatus) === EmploymentStatus.internship;
    const toFullTime =
      Number(watchedEmploymentStatus) === EmploymentStatus.fullTime;

    if (fromInternship && toFullTime) {
      fetchLatestEmployeeCode();
      setIsEmployeeCodeEditable(true);
    } else {
      setIsEmployeeCodeEditable(false);
      setValue("employeeCode", String(originalEmployeeCode));
    }
  }, [watchedEmploymentStatus]);
 const fromAttendanceConfig = Boolean(location.state?.fromAttendanceConfig);

  const onSubmit = (values: FormDataType) => {
    const criminalVerification =
      values.criminalVerification === ""
        ? null
        : values.criminalVerification ===
          CRIMINAL_VERIFICATION_STATUS.COMPLETED;

    if (typeof values.roleId === "undefined") {
      throw new Error("roleId is undefined");
    }

    if (typeof values.employeeStatus === "undefined") {
      throw new Error("employeeStatus is undefined");
    }

    update({
      id: currentEmploymentDetails ? currentEmploymentDetails.id : 0,
      employeeId: +values.employeeId,
      employeeCode: values.employeeCode,
      email: values.email,
      joiningDate: values.joiningDate
        ? values.joiningDate.format("YYYY-MM-DD")
        : null,
      branchId: +values.branchId,
      roleId: +values.roleId,
      isReportingManager: values.isReportingManager,
      employeeStatus: convertFormStrToApiValue(values.employeeStatus),
      teamId: +values.teamId,
      designationId: +values.designationId,
      reportingManagerId: !values.reportingManagerId
        ? null
        : Number(values.reportingManagerId),
      employmentStatus: convertFormStrToApiValue(values.employmentStatus),
      linkedInUrl: values.linkedInUrl,
      backgroundVerificationstatus: convertFormStrToApiValue(
        values.backgroundVerificationstatus
      ),
      criminalVerification: criminalVerification,
      departmentId: +values.departmentId,
      totalExperienceYear: values.totalExperienceYears,
      totalExperienceMonth: values.totalExperienceMonths,
      relevantExperienceYear: values.relevantExperienceYears,
      relevantExperienceMonth: values.relevantExperienceMonths,
      jobType: convertFormStrToApiValue(values.jobType),
      isProbExtended: false,
      probExtendedWeeks: values.probExtendedWeeks,
      probationMonths: values.probationMonths,
      confirmationDate: values.confirmationDate
        ? values.confirmationDate.format("YYYY-MM-DD")
        : null,
      extendedConfirmationDate: values.extendedConfirmationDate
        ? values.extendedConfirmationDate.format("YYYY-MM-DD")
        : null,
      timeDoctorUserId: values.timeDoctorUserId,
    });
  };

  useEffect(() => {
    setIsExtendedConfirmationDateChanged(
      Boolean(formState.dirtyFields.extendedConfirmationDate)
    );
  }, [formState]);

  if (!hasPermission(READ)) {
    return <NotFoundPage />;
  }

  return (
    <EmploymentForm
      currentEmploymentDetails={currentEmploymentDetails}
      isLoading={isLoading}
      method={method}
      onSubmit={onSubmit}
      isEditable={isEditable}
      isEmployeeCodeEditable={isEmployeeCodeEditable}
      hasEmployeePermission={hasEmployeePermission}
      hasRolePermission={hasRolePermission}
      isCriminalVerificationCompleted={isCriminalVerificationCompleted}
      isUpdating={isUpdating}
      isFetchingNewEmployeeCode={isFetchingNewEmployeeCode}
    />
  );
};

export default CurrentEmploymentForm;
