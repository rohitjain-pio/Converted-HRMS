import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import FormSelectField from "@/components/FormSelectField";
import { GetRoleIDListResponse, getRoleIDList } from "@/services/User";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  Alert,
  Box,
  Snackbar,
  SnackbarCloseReason,
  Tooltip,
} from "@mui/material";

const roleAccessForbiddenMessage =
  "Roles filter is disabled for your role. Please contact your admin if you need access.";

interface RoleIDSelectFieldProps {
  isEditable?: boolean;
  required?: boolean;
  defaultValue?: string;
}

const RoleIDSelectField = ({
  isEditable,
  required,
  defaultValue,
}: RoleIDSelectFieldProps) => {
  const { setValue, watch } = useFormContext();

  const [openToast, setOpenToast] = useState(false);
  const [enableTooltip, setEnableTooltip] = useState(false);

  const handleClose = (
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenToast(false);
  };

  const { data } = useAsync<GetRoleIDListResponse>({
    requestFn: async (): Promise<GetRoleIDListResponse> => {
      return await getRoleIDList();
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        setOpenToast(true);
        setEnableTooltip(true);
        return;
      }
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const options = useMemo(() => data?.result || [], [data]);

  const roleIdField = watch("roleId");

  useEffect(() => {
    if(!isEditable){
      if (roleIdField) {
        const label = options.find(({ id }) => id == Number(roleIdField))?.name;
        setValue("roleId", label);
      } else {
        setValue("roleId", "");
      }
    }
  }, [watch, isEditable]);

  return (
    <>
      <Tooltip
        title={enableTooltip ? roleAccessForbiddenMessage : null}
        placement="top"
        arrow
        slotProps={{
          arrow: {
            sx: (theme) => ({ color: theme.palette.error.main }),
          },
          tooltip: {
            sx: (theme) => ({ bgcolor: theme.palette.error.main }),
          },
        }}
      >
        <Box>
          <FormSelectField
            defaultValue={defaultValue}
            name="roleId"
            label="Roles"
            textFormat={!isEditable}
            options={options}
            labelKey="name"
            valueKey="id"
            required={required}
          />
        </Box>
      </Tooltip>
      <Snackbar
        open={openToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
      >
        <Alert severity="error" onClose={handleClose} sx={{ fontSize: "15px" }}>
          {roleAccessForbiddenMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RoleIDSelectField;
