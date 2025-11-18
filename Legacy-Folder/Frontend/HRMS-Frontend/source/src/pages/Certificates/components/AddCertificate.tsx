import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import PageHeader from "@/components/PageHeader/PageHeader";
import FormTextField from "@/components/FormTextField";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useUserStore } from "@/store";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import {
  addCertificate,
  AddCertificateArgs,
  AddCertificateResponse,
  CertificateType,
  getCertificateById,
  GetCertificateByIdResponse,
  updateCertificate,
  UpdateCertificateArgs,
} from "@/services/Certificates";
import ViewCertificateDocument from "@/pages/Certificates/components/ViewCertificateDocument";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import moment, { Moment } from "moment";
import FormDatePicker from "@/components/FormDatePicker";
import { onCloseHandler } from "@/utils/dialog";
import { regex } from "@/utils/regexPattern";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { useSearchParams } from "react-router-dom";
import { fileValidation } from "@/utils/fileSchema";

const { notOnlyNumbers, nameMaxLength_50, minCharactersExist } = regex;

const getValidationSchema = (
  isFileRequired: boolean,
  existingCertificates: string[],
  currentCertificate: string
) =>
  Yup.object().shape({
    certificateName: Yup.string()
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
      .test(
        "unique-certificate-name",
        "This certificate already exists",
        (value) => {
          if (!value) return true;
          if (value && currentCertificate && value === currentCertificate) {
            return true;
          }
          return !existingCertificates.includes(value);
        }
      )
      .required("Certificate name is required."),
    certificateExpiry: Yup.mixed<Moment>()
      .nullable()
      .defined()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (certificateExpiry) => {
          if (!certificateExpiry) {
            return true;
          }

          return moment.isMoment(certificateExpiry);
        },
      })
      .test({
        name: "no-past-dates",
        message: "Expiry date cannot be in the past",
        test: (certificateExpiry) => {
          if (!certificateExpiry) {
            return true;
          }

          return certificateExpiry.isSameOrAfter(moment(), "day");
        },
      }),
    file: isFileRequired
      ? Yup.mixed<File>()
          .required("File is required")
          .test("fileValidation", fileValidation)
      : Yup.mixed<File>().nullable().test("fileValidation", fileValidation),
  });

type FormData = Yup.InferType<ReturnType<typeof getValidationSchema>>;

interface AddCertificateProps {
  open: boolean;
  onClose: () => void;
  certificateId: number;
  existingCertificates: string[];
  currentCertificate: string;
}

const AddCertificate = ({
  open,
  onClose,
  certificateId,
  existingCertificates,
  currentCertificate,
}: AddCertificateProps) => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { VIEW } = permissionValue.CERTIFICATION_DETAILS;
  const [certificateData, setCertificateData] = useState<CertificateType>();
  const validationSchema = getValidationSchema(
    certificateId && certificateData?.fileName ? false : true,
    existingCertificates,
    currentCertificate
  );
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      certificateName: "",
      certificateExpiry: null,
      file: null,
    },
  });
  const { handleSubmit, reset, setValue } = method;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { isLoading } = useAsync<GetCertificateByIdResponse, number>({
    requestFn: async (id: number): Promise<GetCertificateByIdResponse> => {
      return await getCertificateById(id);
    },
    onSuccess: (response) => {
      const { certificateName, certificateExpiry } = response?.data
        ?.result as CertificateType;
      setCertificateData(response?.data?.result);
      setValue("certificateName", certificateName);
      setValue(
        "certificateExpiry",
        certificateExpiry ? moment(certificateExpiry, "YYYY-MM-DD") : null
      );
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: certificateId as number | undefined,
    autoExecute: certificateId ? true : false,
  });

  const { execute: create, isLoading: isSaving } = useAsync<
    AddCertificateResponse,
    AddCertificateArgs
  >({
    requestFn: async (
      args: AddCertificateArgs
    ): Promise<AddCertificateResponse> => {
      return await addCertificate(args);
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
    AddCertificateResponse,
    UpdateCertificateArgs
  >({
    requestFn: async (
      args: UpdateCertificateArgs
    ): Promise<AddCertificateResponse> => {
      return await updateCertificate(args);
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
    if (certificateId) {
      update({
        Id: +certificateId,
        EmployeeId: employeeId ? +employeeId : +userData.userId,
        CertificateName: data.certificateName,
        CertificateExpiry: data.certificateExpiry
          ? moment(data.certificateExpiry).format("YYYY-MM-DD")
          : "",
        File: data.file || "",
      });
    } else {
      create({
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        CertificateName: data.certificateName,
        CertificateExpiry: data.certificateExpiry
          ? moment(data.certificateExpiry).format("YYYY-MM-DD")
          : "",
        File: data.file,
      });
    }
  };

  const handleResetForm = () => {
    if (certificateId) {
      const { certificateName, certificateExpiry } =
        certificateData as CertificateType;
      setValue("certificateName", certificateName);
      setValue(
        "certificateExpiry",
        certificateExpiry ? moment(certificateExpiry, "YYYY-MM-DD") : null
      );
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
          title={`${certificateId ? "Edit" : "Add"} Certificate`}
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
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <FormTextField
                      label="Certificate Name"
                      name="certificateName"
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="Expiry Date"
                      name="certificateExpiry"
                      format="MMM Do, YYYY"
                      minDate={moment()}
                      views={["year", "month", "day"]}
                      openTo="year"
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <Grid display="flex" flexDirection="row" gap={2}>
                      <Box maxWidth="500px">
                        <FileUpload name="file" />
                      </Box>
                      {certificateId ? (
                        <Box maxWidth="500px">
                          <ViewCertificateDocument
                            fileName={certificateData?.fileName as string}
                            hasPermission={hasPermission(VIEW)}
                          />
                        </Box>
                      ) : (
                        ""
                      )}
                    </Grid>
                  </FormInputContainer>
                </FormInputGroup>
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isSaving || isUpdating}>
                      {isSaving
                        ? "Saving"
                        : isUpdating
                          ? "Updating"
                          : certificateId
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

export default AddCertificate;
