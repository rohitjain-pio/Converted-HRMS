import { Box, Paper, Stack } from "@mui/material";
import FormTextField from "@/components/FormTextField";
import DepartmentAutocomplete from "@/pages/Employee/components/DepartmentAutocomplete";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";

import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import PageHeader from "@/components/PageHeader/PageHeader";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import {
  GetGoalByIdResponse,
  UpsertGoalResponse,
  UpsertRequestGoal,
} from "@/services/KPI/types";

import methods from "@/utils";
import useAsync from "@/hooks/useAsync";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { useUserStore } from "@/store";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import BreadCrumbs from "@/components/@extended/Router";
import GoalsUserAutocomplete from "@/pages/KPI/Components/GoalsUserAutocomplte";
import { addGoal, updateGoal, getGoalById } from "@/services/KPI";

interface UpsertGoalDialogProps {
  mode: "add" | "edit";
}

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  departmentId: Yup.string().required("Department is required"),
  employeeIds: Yup.array().of(Yup.string()),
});

type GoalFormValues = Yup.InferType<typeof validationSchema>;

export default function UpsertGoal({ mode }: Readonly<UpsertGoalDialogProps>) {
  const { userData } = useUserStore();
  const { userId } = userData;
  const navigate = useNavigate();
  const { id } = useParams();
  const method = useForm<GoalFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      description: "",
      departmentId: "",
      employeeIds: [],
    },
  });
  const { execute: add, isLoading: addLoading } = useAsync<
    UpsertGoalResponse,
    UpsertRequestGoal
  >({
    requestFn: async (
      payload: UpsertRequestGoal
    ): Promise<UpsertGoalResponse> => {
      return await addGoal(payload);
    },
    onSuccess: () => {
      navigate("/Kpi/Goals");
      toast.success("Goal Added Successfully");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: update, isLoading: updateLoading } = useAsync<
    UpsertGoalResponse,
    UpsertRequestGoal
  >({
    requestFn: async (
      payload: UpsertRequestGoal
    ): Promise<UpsertGoalResponse> => {
      return await updateGoal(payload);
    },
    onSuccess: () => {
      toast.success("Goal Updated Successfully");
      navigate("/Kpi/Goals");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: getGoal, isLoading: getLoading } = useAsync<
    GetGoalByIdResponse,
    number
  >({
    requestFn: async (payload: number): Promise<GetGoalByIdResponse> => {
      return await getGoalById(payload);
    },
    onSuccess: ({ data }) => {
      const editData = data.result;
      reset({
        title: editData.title,
        description: editData.description,
        departmentId: String(editData.departmentId),
        employeeIds: editData.employeeIds
          ? editData.employeeIds.split(",")
          : [],
      });
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { handleSubmit, reset } = method;
  useEffect(() => {
    if (mode == "edit" && id) {
      getGoal(Number(id));
    }
  }, [mode, id]);
  const handleResetForm = () => {
    reset();
  };
  useEffect(() => {
    if (mode == "add") {
      reset({
        title: "",
        description: "",
        departmentId: "",
        employeeIds: [],
      });
    }
  }, [mode, reset]);
  const onSubmit: SubmitHandler<GoalFormValues> = (values) => {
    if (mode == "add") {
      add({
        departmentId: Number(values.departmentId),
        description: values.description,
        employeeId: Number(userId),
        id: 0,
        employeeIds: values.employeeIds ? values.employeeIds.join(",") : "",
        title: values.title,
      });
    } else {
      update({
        departmentId: Number(values.departmentId),
        description: values.description,
        employeeId: Number(userId),
        id: Number(id),
        title: values.title,
        employeeIds: values.employeeIds ? values.employeeIds.join(",") : "",
      });
    }
  };
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h3"
          title={mode == "add" ? "Add Goal" : "Edit Goal"}
        />

        <FormProvider<GoalFormValues> {...method}>
          <Box
            component="form"
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ padding: "20px" }}
          >
            <FormInputGroup>
              <FormInputContainer md={12}>
                <FormTextField name="title" label="Enter Title" required />
              </FormInputContainer>
              <FormInputContainer md={12}>
                <DepartmentAutocomplete label="Select Department" required />
              </FormInputContainer>
              <FormInputContainer md={12}>
                <FormTextField
                  multiline
                  name="description"
                  label="Enter Description"
                  maxLength={600}
                  required
                />
              </FormInputContainer>
              <FormInputContainer md={12}>
                <GoalsUserAutocomplete
                  name="employeeIds"
                  label="Select Employees"
                />
              </FormInputContainer>
            </FormInputGroup>
            <Stack
              direction="row"
              sx={{ gap: 2, justifyContent: "center", pt: 2 }}
            >
              <SubmitButton>Save</SubmitButton>
              <ResetButton onClick={handleResetForm} />
            </Stack>
          </Box>
        </FormProvider>
      </Paper>
      <GlobalLoader loading={addLoading || getLoading || updateLoading} />
    </>
  );
}
