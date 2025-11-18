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
  addTeam,
  AddTeamArgs,
  AddTeamResponse,
  TeamType,
  getTeamById,
  GetTeamByIdResponse,
  updateTeam,
  UpdateTeamArgs,
} from "@/services/Team";
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
  teamName: Yup.string()
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
    .required("Team name is required."),
});

type FormData = Yup.InferType<typeof validationSchema>;

interface AddTeamPopupProps {
  open: boolean;
  onClose: () => void;
  teamId: number;
}

const AddTeamPopup = ({ open, onClose, teamId }: AddTeamPopupProps) => {
  const [teamData, setTeamData] = useState<TeamType>();
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      teamName: "",
    },
  });
  const { handleSubmit, reset, setValue } = method;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { isLoading } = useAsync<GetTeamByIdResponse, number>({
    requestFn: async (id: number): Promise<GetTeamByIdResponse> => {
      return await getTeamById(id);
    },
    onSuccess: (response) => {
      const { name } = response?.data?.result as TeamType;
      setTeamData(response?.data?.result);
      setValue("teamName", name);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: teamId as number | undefined,
    autoExecute: teamId ? true : false,
  });

  const { execute: create, isLoading: isSaving } = useAsync<
    AddTeamResponse,
    AddTeamArgs
  >({
    requestFn: async (args: AddTeamArgs): Promise<AddTeamResponse> => {
      return await addTeam(args);
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
    AddTeamResponse,
    UpdateTeamArgs
  >({
    requestFn: async (args: UpdateTeamArgs): Promise<AddTeamResponse> => {
      return await updateTeam(args);
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
    if (teamId) {
      update({
        id: Number(teamId),
        teamName: data.teamName,
      });
    } else {
      create({
        teamName: data.teamName,
      });
    }
  };

  const handleResetForm = () => {
    if (teamId) {
      const { name } = teamData as TeamType;
      setValue("teamName", name);
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
        <PageHeader variant="h4" title={`${teamId ? "Edit" : "Add"} Team`} />
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
                <FormTextField label="Team Name" name="teamName" required />
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isSaving || isUpdating}>
                      {isSaving
                        ? "Saving"
                        : isUpdating
                          ? "Updating"
                          : teamId
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

export default AddTeamPopup;
