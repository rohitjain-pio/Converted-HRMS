import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { regex } from "@/utils/regexPattern";
import {
  addDepartment,
  AddDepartmentArgs,
  AddDepartmentResponse,
  DepartmentType,
  getDepartmentById,
  GetDepartmentByIdResponse,
  updateDepartment,
  UpdateDepartmentArgs,
} from "@/services/Department";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { onCloseHandler } from "@/utils/dialog";
import PageHeader from "@/components/PageHeader/PageHeader";
import FormTextField from "@/components/FormTextField";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";

const { notOnlyNumbers, nameMaxLength_50, minCharactersExist } = regex;

const validationSchema = Yup.object().shape({
  department: Yup.string()
    .transform((value) =>
      typeof value === "string" ? value.replace(/\s+/g, " ") : value
    )
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
    .required("Department name is required."),
});

type FormData = Yup.InferType<typeof validationSchema>;

interface AddDepartmentPopupProps {
  open: boolean;
  onClose: () => void;
  departmentId: number;
}

const AddDepartmentPopup = ({
  open,
  onClose,
  departmentId,
}: AddDepartmentPopupProps) => {
  const [departmentData, setDepartmentData] = useState<DepartmentType>();
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      department: "",
    },
  });
  const { handleSubmit, reset, setValue } = method;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { isLoading } = useAsync<GetDepartmentByIdResponse, number>({
    requestFn: async (id: number): Promise<GetDepartmentByIdResponse> => {
      return await getDepartmentById(id);
    },
    onSuccess: (response) => {
      const { name } = response?.data?.result as DepartmentType;
      setDepartmentData(response?.data?.result);
      setValue("department", name);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: departmentId as number | undefined,
    autoExecute: departmentId ? true : false,
  });

  const { execute: create, isLoading: isSaving } = useAsync<
    AddDepartmentResponse,
    AddDepartmentArgs
  >({
    requestFn: async (
      args: AddDepartmentArgs
    ): Promise<AddDepartmentResponse> => {
      return await addDepartment(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    AddDepartmentResponse,
    UpdateDepartmentArgs
  >({
    requestFn: async (
      args: UpdateDepartmentArgs
    ): Promise<AddDepartmentResponse> => {
      return await updateDepartment(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (data: FormData) => {
    if (departmentId) {
      update({
        id: Number(departmentId),
        department: data.department,
      });
    } else {
      create({
        department: data.department,
      });
    }
  };

  const handleResetForm = () => {
    if (departmentId) {
      const { name } = departmentData as DepartmentType;
      setValue("department", name);
    } else {
      reset();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => onCloseHandler(reason, onClose)}
        maxWidth="sm"
        fullWidth
      >
        <PageHeader
          variant="h4"
          title={`${departmentId ? "Edit" : "Add"} Department`}
        />
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          style={{ position: "absolute", right: 20, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        {!isLoading ? (
          <FormProvider<FormData> {...method}>
            <DialogContent>
              <Box
                component="form"
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
                paddingY="30px"
                gap="30px"
                display="flex"
                flexDirection="column"
              >
                <FormTextField
                  label="Department Name"
                  name="department"
                  required
                />
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isSaving || isUpdating}>
                      {isSaving
                        ? "Saving"
                        : isUpdating
                          ? "Updating"
                          : departmentId
                            ? "Update"
                            : "Save"}
                    </SubmitButton>
                    <ResetButton onClick={handleResetForm} />
                  </DialogActions>
                </Box>
              </Box>
            </DialogContent>
          </FormProvider>
        ) : (
          <Box
            height={"calc(100vh - 80px)"}
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <CircularProgress />
          </Box>
        )}
      </Dialog>
      <GlobalLoader loading={isSaving || isUpdating} />
    </>
  );
};

export default AddDepartmentPopup;
