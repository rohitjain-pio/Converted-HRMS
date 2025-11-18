import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { SubmitHandler, useForm } from "react-hook-form";
import UserGuideForm from "./UserGuideForm/UserGuideForm";
import { useParams } from "react-router-dom";
import useAsync from "@/hooks/useAsync";
import {
  addUserGuide,
  AddUserGuidePayload,
  AddUserGuideResponse,
  getUserGuideById,
  GetUserGuideByIdResponse,
  updateUserGuide,
  UpdateUserGuidePayload,
  UpdateUserGuideResponse,
} from "@/services/UserGuide";
import methods from "@/utils";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { FormValues, validationSchema } from "./UserGuideForm/validationSchema";
import { toast } from "react-toastify";
import { FormMode, UserGuideStatus } from "@/utils/constants";

const defaultFormValues: FormValues = {
  title: "",
  status: "",
  menuId: "",
  content: "",
};

const UpsertUserGuide = ({ mode }: { mode: FormMode }) => {
  const { userGuideId } = useParams();

  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultFormValues,
  });

  const { reset } = method;

  const { execute: fetchUserGuideById, isLoading } =
    useAsync<GetUserGuideByIdResponse>({
      requestFn: async (): Promise<GetUserGuideByIdResponse> => {
        return await getUserGuideById(Number(userGuideId || 0));
      },
      onSuccess: (response) => {
        const data = response.data.result;
        if (data) {
          reset({
            title: data?.title,
            status: data?.status?.toString(),
            menuId: data?.menuId?.toString(),
            content: data?.content,
          });
        }
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: !!userGuideId && mode === FormMode.Edit,
    });

  const { execute: add, isLoading: isAddingUserGuide } = useAsync<
    AddUserGuideResponse,
    AddUserGuidePayload
  >({
    requestFn: async (
      payload: AddUserGuidePayload
    ): Promise<AddUserGuideResponse> => {
      return await addUserGuide(payload);
    },
    onSuccess: ({ data }) => {
      reset();
      toast.success(data.message);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: update, isLoading: isUpdatingUserGuide } = useAsync<
    UpdateUserGuideResponse,
    UpdateUserGuidePayload
  >({
    requestFn: async (
      payload: UpdateUserGuidePayload
    ): Promise<UpdateUserGuideResponse> => {
      return await updateUserGuide(payload);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      fetchUserGuideById();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (mode === FormMode.Create) {
      add({
        title: values.title,
        content: values.content,
        menuId: Number(values.menuId),
        status: Number(values.status) as UserGuideStatus,
        roleId: null,
      });
    } else if (mode === FormMode.Edit) {
      update({
        id: Number(userGuideId || 0),
        roleId: null,
        content: values.content,
        title: values.title,
        status: Number(values.status) as UserGuideStatus,
      });
    }
  };

  return (
    <Box>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          title={
            mode === FormMode.Create ? "Add User Guide" : "Edit User Guide"
          }
        />
        <UserGuideForm
          method={method}
          onSubmit={onSubmit}
          mode={mode}
          isSubmitting={isAddingUserGuide || isUpdatingUserGuide}
        />
      </Paper>
      <GlobalLoader
        loading={isLoading || isAddingUserGuide || isUpdatingUserGuide}
      />
    </Box>
  );
};

export default UpsertUserGuide;
