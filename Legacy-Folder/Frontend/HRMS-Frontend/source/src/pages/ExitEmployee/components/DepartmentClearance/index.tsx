import useAsync from "@/hooks/useAsync/useAsync";
import { useParams } from "react-router-dom";
import {
  GetDepartmentClearanceByResignationId,
  GetDepartmentClearanceByResignationIdResponse,
  UpsertDepartmentClearanceArgs,
  UpsertDepartmentClearanceResponse,
} from "@/services/EmployeeExitAdmin/types";
import {
  getDepartmentClearanceByResignationId,
  upsertDepartmentClearance,
} from "@/services/EmployeeExitAdmin/employeeExitAdminService";
import methods from "@/utils";
import { useUserStore } from "@/store";
import { useState } from "react";
import DepartmentClearanceForm from "./DepartmentClearanceForm";
import { KTFormValues } from "./utils";

const DepartmentClearance = ({ editable }: { editable?: boolean }) => {
  const { resignationId } = useParams<{ resignationId: string }>();
  const { userData } = useUserStore();
  const [departmentData, setDepartmentData] =
    useState<GetDepartmentClearanceByResignationId>();
  const { execute: upsert, isLoading: isSaving } = useAsync<
    UpsertDepartmentClearanceResponse,
    UpsertDepartmentClearanceArgs
  >({
    requestFn: async (args) => await upsertDepartmentClearance(args),
    onSuccess: () => fetchDepartment(),
    onError: (err) => methods.throwApiError(err),
  });

  const { execute: fetchDepartment, isLoading: fetchLoading } = useAsync<
    GetDepartmentClearanceByResignationIdResponse,
    number
  >({
    requestFn: async () =>
      await getDepartmentClearanceByResignationId(Number(resignationId || 0)),
    onSuccess: (res) => {
      const data = res?.data?.result;
      setDepartmentData(data ?? null);
    },
    autoExecute: true,
  });

  const onSubmit = (data: KTFormValues) => {
    const args: UpsertDepartmentClearanceArgs = {
      resignationId: Number(resignationId),
      ktStatus: Number(data.ktStatus),
      ktNotes: data.notes,
      ktUsers: data.ktUser.map(Number),
      employeeId: Number(userData.userId),
      attachment: data.departmentAttachment ?? "",
    };
    upsert(args);
  };

  return (
    <DepartmentClearanceForm
      editable={editable}
      departmentData={departmentData}
      isSaving={isSaving}
      fetchLoading={fetchLoading}
      onSubmit={onSubmit}
    />
  );
};

export default DepartmentClearance;
