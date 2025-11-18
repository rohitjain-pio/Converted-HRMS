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
  addDesignation,
  AddDesignationArgs,
  AddDesignationResponse,
  DesignationType,
  getDesignationById,
  GetDesignationByIdResponse,
  updateDesignation,
  UpdateDesignationArgs,
} from "@/services/Designation";
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
  designation: Yup.string()
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
    .required("Designation name is required."),
});

type FormData = Yup.InferType<typeof validationSchema>;

interface AddDesignationPopupProps {
  open: boolean;
  onClose: () => void;
  designationId: number;
}

const AddDesignationPopup = ({
  open,
  onClose,
  designationId,
}: AddDesignationPopupProps) => {
  const [designationData, setDesignationData] = useState<DesignationType>();
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      designation: "",
    },
  });
  const { handleSubmit, reset, setValue } = method;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { isLoading } = useAsync<GetDesignationByIdResponse, number>({
    requestFn: async (id: number): Promise<GetDesignationByIdResponse> => {
      return await getDesignationById(id);
    },
    onSuccess: (response) => {
      const { name } = response?.data?.result as DesignationType;
      setDesignationData(response?.data?.result);
      setValue("designation", name);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: designationId as number | undefined,
    autoExecute: designationId ? true : false,
  });

  const { execute: create, isLoading: isSaving } = useAsync<
    AddDesignationResponse,
    AddDesignationArgs
  >({
    requestFn: async (
      args: AddDesignationArgs
    ): Promise<AddDesignationResponse> => {
      return await addDesignation(args);
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
    AddDesignationResponse,
    UpdateDesignationArgs
  >({
    requestFn: async (
      args: UpdateDesignationArgs
    ): Promise<AddDesignationResponse> => {
      return await updateDesignation(args);
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
    if (designationId) {
      update({
        id: Number(designationId),
        designation: data.designation,
      });
    } else {
      create({
        designation: data.designation,
      });
    }
  };

  const handleResetForm = () => {
    if (designationId) {
      const { name } = designationData as DesignationType;
      setValue("designation", name);
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
          title={`${designationId ? "Edit" : "Add"} Designation`}
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
                  label="Designation Name"
                  name="designation"
                  required
                />
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isSaving || isUpdating}>
                      {isSaving
                        ? "Saving"
                        : isUpdating
                          ? "Updating"
                          : designationId
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

export default AddDesignationPopup;
