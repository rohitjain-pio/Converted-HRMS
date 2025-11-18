import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { styled } from "@mui/system";
import useAsync from "@/hooks/useAsync";
import {
  updatePermission,
  GetRolePermissionResponse,
  UpdatePermissionArgs,
  UpdatePermissionResponse,
  getRolePermissionById,
  GetPermissionListResponse,
  getRolePermission,
} from "@/services/Roles";
import {
  useForm,
  useFieldArray,
  Controller,
  FieldArrayWithId,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import useModulePermissionsStore from "@/store/useModulePermissionsStore";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import NotFoundPage from "@/pages/NotFoundPage";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import { useUserStore } from "@/store";
import { regex } from "@/utils/regexPattern";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import methods from "@/utils";

interface Permission {
  permissionId: number;
  permissionName: string;
  isActive: boolean;
}

interface Module {
  moduleId: number;
  moduleName: string;
  isActive: boolean;
  permissions: Permission[];
}

interface RoleFormData {
  roleId: number;
  roleName: string;
  modules: Module[];
}

const HeaderStyled = styled(Box)(() => ({
  backgroundColor: "#e6f4ff",
  borderLeft: "2px solid #1E75BB",
  color: "#1E75BB",
  padding: "10px 20px",
}));

const {
  notOnlyNumbers,
  nameMaxLength_50,
  minCharactersExist,
  allowOnlyAlphabets,
} = regex;
// Yup validation schema
const validationSchema = Yup.object().shape({
  roleName: Yup.string()
    .trim()
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      return notOnlyNumbers.pattern.test(value);
    })
    .test(allowOnlyAlphabets.key, allowOnlyAlphabets.message, (value) => {
      if (!value) return true;
      return allowOnlyAlphabets.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_50.number, nameMaxLength_50.message)
    .required("Role name is required"),
});

type RoleDetailsProps = {
  isAdd?: boolean;
};

const RoleDetails: React.FC<RoleDetailsProps> = ({ isAdd = false }) => {
  const { userData } = useUserStore();
  const { updateModulePermissions } = useModulePermissionsStore();
  const { id } = useParams<{ id: string }>();
  const { EDIT, READ } = permissionValue.ROLE;
  const {
    execute: fetchPermissions,
    isLoading,
    data: rolePermissionResponse,
  } = useAsync<GetPermissionListResponse | GetRolePermissionResponse, string>({
    requestFn: async (
      roleId: string
    ): Promise<GetPermissionListResponse | GetRolePermissionResponse> => {
      if (isAdd) {
        return (await getRolePermission()) as GetPermissionListResponse;
      }
      return (await getRolePermissionById(roleId)) as GetRolePermissionResponse;
    },
    onSuccess: (response) => {
      if (isAdd) {
        const data = response?.data as GetPermissionListResponse;
        method.setValue("roleName", "");
        method.setValue("roleId", 0);
        method.setValue("modules", data?.result);
      } else {
        const data = response?.data as GetRolePermissionResponse;
        method.setValue("roleName", data.result?.roleName);
        method.setValue("roleId", data.result?.roleId);
        method.setValue("modules", data.result?.modules);
      }
    },
    onError: (error) => {
      methods.throwApiError(error, "Enable to fetch permission for this role.");
    },
    defaultParams: id,
    autoExecute: hasPermission(READ) ? true : false,
  });

  const { execute: update, isLoading: isSaving } = useAsync<
    UpdatePermissionResponse,
    UpdatePermissionArgs
  >({
    requestFn: async (
      args: UpdatePermissionArgs
    ): Promise<UpdatePermissionResponse> => {
      return await updatePermission(args);
    },
    onSuccess: () => {
      toast.success("Update successful! Your changes have been saved.");
      fetchPermissions(id);
    },
    onError: (error) => {
      methods.throwApiError(error, "Something went wrong!");
    },
  });

  const method = useForm<RoleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      roleId: 1,
      roleName: "",
      modules: [] as Module[],
    },
  });

  const { fields: moduleFields } = useFieldArray({
    control: method.control,
    name: "modules",
  });

  const onSubmit = (data: RoleFormData) => {
    const newActivePermission: number[] = data.modules.reduce<number[]>(
      (result, item) => {
        const activePermission = item.permissions
          .filter((p) => p.isActive)
          .map<number>((p) => p.permissionId);
        return [...result, ...activePermission];
      },
      []
    );

    if (newActivePermission.length == 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    let isRoleNameUpdate = true;
    if (
      rolePermissionResponse?.result &&
      "roleName" in rolePermissionResponse.result
    ) {
      isRoleNameUpdate =
        data.roleName !== rolePermissionResponse?.result.roleName;
    }

    let oldActivePermission: number[] = [];
    if (
      rolePermissionResponse?.result &&
      "modules" in rolePermissionResponse.result
    ) {
      oldActivePermission = (
        rolePermissionResponse?.result.modules || []
      ).reduce<number[]>((result, item) => {
        const activePermission = item.permissions
          .filter((p) => p.isActive)
          .map<number>((p) => p.permissionId);
        return [...result, ...activePermission];
      }, []);
    }

    const isRolePermissionUpdate =
      JSON.stringify(oldActivePermission) !==
      JSON.stringify(newActivePermission);

    if (isRoleNameUpdate || isRolePermissionUpdate) {
      update({
        roleId: isAdd ? 0 : data.roleId,
        isRoleNameUpdate,
        isRolePermissionUpdate,
        ...(isRoleNameUpdate ? { roleName: data.roleName } : {}),
        ...(isRolePermissionUpdate
          ? { permissionList: newActivePermission }
          : {}),
      });
      if (userData.roleId === id) {
        updateModulePermissions(newActivePermission);
      }
    } else {
      toast("No modifications detected. There's nothing to save.");
    }
  };

  if (!hasPermission(READ)) {
    return <NotFoundPage />;
  }

  return !isLoading ? (
    <>
      <BreadCrumbs />
      <Card style={{ paddingBottom: "40px" }}>
        <PageHeader
          variant="h3"
          title={isAdd ? "Create Role" : "Edit Role"}
          goBack={true}
        />
        <FormProvider<RoleFormData> {...method}>
          <form autoComplete="off" onSubmit={method.handleSubmit(onSubmit)}>
            <Box
              display={"flex"}
              gap={"16px"}
              style={{ padding: "0 20px" }}
              justifyContent="space-between"
              margin={"20px 0px"}
            >
              <Grid container spacing={"20px"}>
                <Grid item sm={6} xs={12}>
                  <FormTextField
                    label="Role Name"
                    name="roleName"
                    required
                    disabled={!isAdd}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  {hasPermission(EDIT) && (
                    <Button
                      variant="contained"
                      size="medium"
                      style={{ height: "fit-content", float: "right" }}
                      disabled={isSaving}
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              marginTop="16px"
              gap={"16px"}
            >
              {moduleFields?.map((field, index) => (
                <PermissionCard
                  key={field.id}
                  moduleField={field}
                  moduleIndex={index}
                />
              ))}
            </Box>
          </form>
        </FormProvider>
      </Card>
      <GlobalLoader loading={isSaving} />
    </>
  ) : (
    <Box
      height={"calc(100vh - 80px)"}
      justifyContent="center"
      alignItems="center"
      display="flex"
    >
      <CircularProgress />
    </Box>
  );
};

interface PermissionCardProps {
  moduleField: FieldArrayWithId<RoleFormData, "modules", "id">;
  moduleIndex: number;
}

const PermissionCard: FC<PermissionCardProps> = ({
  moduleField,
  moduleIndex,
}) => {
  const { control, getValues, setValue } = useFormContext<RoleFormData>();
  const [isAllSeleted, setIsAllSeleted] = useState(false);

  useEffect(() => {
    checkAllSelected();
  }, []);

  const checkAllSelected = () => {
    const permissions = getValues()?.modules[moduleIndex].permissions;
    const isAllSeleted = !permissions.find((p) => !p.isActive);
    setIsAllSeleted(isAllSeleted);
  };

  const checkAllPermission = () => {
    const permissions = getValues()?.modules[moduleIndex].permissions;
    permissions.forEach(
      (p, index) =>
        p.isActive == isAllSeleted &&
        setValue(
          `modules.${moduleIndex}.permissions.${index}.isActive`,
          !isAllSeleted
        )
    );
    setIsAllSeleted(!isAllSeleted);
  };

  return (
    <Box>
      <HeaderStyled
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography fontWeight="600" variant="h6">
          {" "}
          {moduleField?.moduleName}{" "}
        </Typography>
        <FormControlLabel
          onChange={checkAllPermission}
          control={<Checkbox checked={isAllSeleted} size="small" />}
          label="Select All"
        />
      </HeaderStyled>
      <Grid
        style={{ padding: "0 20px" }}
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        margin={"10px"}
      >
        {moduleField.permissions.map((permission, index) => (
          <Grid item xs={6} md={4} lg={3}>
            <Controller
              name={`modules.${moduleIndex}.permissions.${index}.isActive`}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        checkAllSelected();
                      }}
                    />
                  }
                  label={permission.permissionName}
                />
              )}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoleDetails;
