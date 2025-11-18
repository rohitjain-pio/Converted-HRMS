import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { FormProvider, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormTextField from "@/components/FormTextField";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import PageHeader from "@/components/PageHeader/PageHeader";
import useAsync from "@/hooks/useAsync";
import {
  GetProfessionalReferenceByIdApiResponse,
  UpdateProfessionalReferenceApiResponse,
  UpdateProfessionalReferenceArgs,
} from "@/services/EmploymentDetails";
import {
  getProfessionalReferenceById,
  updateProfessionalReference,
} from "@/services/EmploymentDetails/employmentDetailsService";
import { useState } from "react";
import methods from "@/utils";
import { toast } from "react-toastify";
import { onCloseHandler } from "@/utils/dialog";
import { regex } from "@/utils/regexPattern";
import FormPhoneField from "@/components/FormPhoneField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";

const {
  phone,
  allZeros,
  email,
  name,
  notOnlyNumbers,
  nameMaxLength_35,
  nameMaxLength_50,
  minCharactersExist,
} = regex;

const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      return notOnlyNumbers.pattern.test(value);
    })
    .test(name.key, name.message, (value) => {
      if (!value) return true;
      return name.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_35.number, nameMaxLength_35.message)
    .required("Full Name is required."),
  designation: Yup.string()
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
    .required("Designation is required"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .matches(email.pattern, email.message)
    .min(8, "Email must be at least 8 characters long.")
    .max(50, "Email cannot exceed 50 characters."),
  contactNumber: Yup.string()
    .trim()
    .required("Contact number is required")
    .test("country-code", "Please select country code", (value) => {
      if (!value) return true;
      const countryCode = value.includes("+1") || value.includes("+91");
      return !countryCode ? false : true;
    })
    .test(phone.key, phone.message, (value) => {
      if (!value) return true;
      return phone.pattern.test(value);
    })
    .test(allZeros.key, allZeros.message, (value) => {
      if (!value) return true;
      const phoneNumber = value.split(" ")[1] || "";
      if (phoneNumber) {
        const digitsOnly = phoneNumber.replace(/\D/g, "");
        return digitsOnly ? !allZeros.pattern.test(digitsOnly) : false;
      }
    }),
});

type FormDataType = Yup.InferType<typeof validationSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  professionalReferenceId?: number;
};

const ProfessionalReferenceDialog = (props: Props) => {
  const { open, onClose, professionalReferenceId } = props;

  const [professionalReferenceDetail, setProfessionalReferenceDetail] =
    useState<{
      id: number;
      previousEmployerId: number;
      fullName: string;
      designation: string;
      email: string;
      contactNumber: string;
    } | null>(null);

  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      fullName: "",
      designation: "",
      email: "",
      contactNumber: "",
    },
  });

  const { handleSubmit, reset, setValue } = method;

  const { isLoading } = useAsync<
    GetProfessionalReferenceByIdApiResponse,
    number
  >({
    requestFn: async (
      id: number
    ): Promise<GetProfessionalReferenceByIdApiResponse> => {
      return await getProfessionalReferenceById(id);
    },
    onSuccess: ({ data }) => {
      const { fullName, designation, email, contactNumber } = data.result;

      setProfessionalReferenceDetail(data.result);

      setValue("fullName", fullName);
      setValue("designation", designation);
      setValue("email", email);
      setValue("contactNumber", contactNumber);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: professionalReferenceId,
    autoExecute: true,
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    UpdateProfessionalReferenceApiResponse,
    UpdateProfessionalReferenceArgs
  >({
    requestFn: async (
      args: UpdateProfessionalReferenceArgs
    ): Promise<UpdateProfessionalReferenceApiResponse> => {
      return await updateProfessionalReference(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      reset();
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (formData: FormDataType) => {
    if (
      typeof professionalReferenceId !== "undefined" &&
      professionalReferenceDetail
    ) {
      update({
        ...formData,
        previousEmployerId: professionalReferenceDetail.previousEmployerId,
        id: professionalReferenceId,
      });
    }
  };

  const handleResetForm = () => {
    if (
      professionalReferenceDetail &&
      typeof professionalReferenceId !== "undefined"
    ) {
      const { fullName, designation, email, contactNumber } =
        professionalReferenceDetail;

      setValue("fullName", fullName);
      setValue("designation", designation);
      setValue("email", email);
      setValue("contactNumber", contactNumber);
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
        <PageHeader variant="h4" title="Edit Professional Reference" />
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => {
            reset();
            onClose();
          }}
          aria-label="close"
          style={{ position: "absolute", right: 20, top: 8 }}
        >
          <Close />
        </IconButton>

        {!isLoading ? (
          <FormProvider<FormDataType> {...method}>
            <DialogContent>
              <Box
                component="form"
                autoComplete="off"
                paddingY="30px"
                gap="30px"
                display="flex"
                flexDirection="column"
                onSubmit={handleSubmit(onSubmit)}
              >
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <FormTextField name="fullName" label="Full Name" required />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormTextField
                      name="designation"
                      label="Designation"
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormTextField name="email" label="Email" required />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormPhoneField
                      name="contactNumber"
                      label="Contact Number"
                      type="number"
                      required
                    />
                  </FormInputContainer>
                </FormInputGroup>
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isUpdating}>
                      {isUpdating ? "Updating" : "Update"}
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
      <GlobalLoader loading={isUpdating} />
    </>
  );
};

export default ProfessionalReferenceDialog;
