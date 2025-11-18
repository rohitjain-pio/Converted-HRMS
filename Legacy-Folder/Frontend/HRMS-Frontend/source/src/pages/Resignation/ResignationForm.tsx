import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Typography,
} from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormTextField from "@/components/FormTextField";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import ResetButton from "@/components/ResetButton/ResetButton";
import { useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "@/store";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import BreadCrumbs from "@/components/@extended/Router";
import { useEffect, useState } from "react";
import { regex } from "@/utils/regexPattern";
import moment from "moment";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import useAsync from "@/hooks/useAsync";
import {
  addResignation,
  AddResignationArgs,
  AddResignationResponse,
  getResignationActiveStatus,
  getResignationForm,
  GetResignationFormResponse,
  ResignationActiveStatusResponse,
  ResignationDetails,
} from "@/services/EmployeeExit";
import methods from "@/utils";
import { toast } from "react-toastify";
import { calculateLastWorkingDay, isValidJobType } from "@/utils/helpers";
import {
  permissionValue,
  ResignationStatus,
  ResignationStatusCode,
} from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";

const { EMPLOYEES } = permissionValue;

const { nameMaxLength_500 } = regex;

const validationSchema = Yup.object().shape({
  employeeName: Yup.string().trim().required("Employee name is required"),
  department: Yup.string().trim().required("Department is required"),
  reportingManager: Yup.string()
    .trim()
    .required("Reporting manager is required"),
  resignationReason: Yup.string()
    .trim()
    .required("Resignation reason is required")
    .max(nameMaxLength_500.number, nameMaxLength_500.message),
});

type FormDataType = Yup.InferType<typeof validationSchema>;

const ResignationForm = () => {
  const { userData } = useUserStore();
  const { userId: paramId } = useParams<{ userId?: string }>();
  const currentUserId = userData.userId;

  const targetId = paramId ?? String(currentUserId);

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [resignationDetails, setResignationDetails] =
    useState<ResignationDetails | null>(null);

  const [resignationDate, setResignationDate] = useState<moment.Moment | null>(
    null
  );
  const [lastWorkingDay, setLastWorkingDay] = useState<moment.Moment | null>(
    null
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (
      paramId &&
      paramId !== String(currentUserId) &&
      !hasPermission(EMPLOYEES.READ)
    ) {
      navigate("/unauthorized", { replace: true });
    } else {
      fetchResignationActiveStatus();
    }
  }, [paramId, currentUserId]);

  const { execute: fetchResignationForm, isLoading } =
    useAsync<GetResignationFormResponse>({
      requestFn: async (): Promise<GetResignationFormResponse> => {
        return await getResignationForm(Number(targetId));
      },
      onSuccess: ({ data }) => {
        setResignationDetails(data.result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const {
    execute: fetchResignationActiveStatus,
    isLoading: loadingResignationStatus,
  } = useAsync<ResignationActiveStatusResponse>({
    requestFn: async (): Promise<ResignationActiveStatusResponse> => {
      return await getResignationActiveStatus(Number(targetId));
    },
    onSuccess: ({ data }) => {
      const resignationStatus = data?.result?.resignationStatus;

      const canInitiateNewResignation = !resignationStatus
        ? true
        : (
            [
              ResignationStatus.cancelled,
              ResignationStatus.revoked,
            ] as ResignationStatusCode[]
          ).includes(resignationStatus);

      if (canInitiateNewResignation) {
        fetchResignationForm();
      } else {
        navigate("/not-found", { replace: true });
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: add, isLoading: isAdding } = useAsync<
    AddResignationResponse,
    AddResignationArgs
  >({
    requestFn: async (
      args: AddResignationArgs
    ): Promise<AddResignationResponse> => {
      return await addResignation(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      setOpenConfirmationDialog(true);

      const today = moment();
      setResignationDate(today);

      const jobType = resignationDetails?.jobType;
      if (!isValidJobType(jobType)) {
        console.error("Invalid job type", jobType);
        return;
      }

      setLastWorkingDay(calculateLastWorkingDay(today, jobType));
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      employeeName: "",
      department: "",
      reportingManager: "",
      resignationReason: "",
    },
  });

  const { reset } = method;

  useEffect(() => {
    if (resignationDetails) {
      reset({
        employeeName: resignationDetails.employeeName,
        department: resignationDetails.department,
        reportingManager: resignationDetails.reportingManagerName,
        resignationReason: "",
      });
    }
  }, [resignationDetails]);

  const { handleSubmit } = method;

  const onSubmit = (values: FormDataType) => {
    if (resignationDetails) {
      add({
        employeeId: resignationDetails?.id,
        departmentId: resignationDetails?.departmentId,
        reportingManagerId: resignationDetails?.reportingManagerId,
        jobType: resignationDetails?.jobType,
        reason: values.resignationReason,
      });
    }
  };

  if (isLoading || loadingResignationStatus) {
    return <GlobalLoader loading />;
  }

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="Resignation Form" goBack={true} />
        <FormProvider<FormDataType> {...method}>
          <Box
            component="form"
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            padding="30px"
            gap="30px"
            display="flex"
            flexDirection="column"
          >
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField
                  label="Employee Name"
                  name="employeeName"
                  readOnly
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Department"
                  name="department"
                  readOnly
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Reporting Manager"
                  name="reportingManager"
                  readOnly
                  required
                />
              </FormInputContainer>
              <FormInputContainer md={12}>
                <FormTextField
                  label="Resignation Reason"
                  name="resignationReason"
                  multiline
                  maxLength={600}
                  required
                />
              </FormInputContainer>
            </FormInputGroup>
            <Box display="flex" gap="15px" justifyContent="center">
              <SubmitButton />
              <ResetButton />
            </Box>
          </Box>
        </FormProvider>
      </Paper>
      <Dialog open={openConfirmationDialog} maxWidth="xs" fullWidth>
        <DialogContent>
          <>
            <Typography gutterBottom textAlign="justify">
              Your resignation Dated{" "}
              <strong>{resignationDate?.format("MMM Do, YYYY") ?? "-"}</strong>{" "}
              has been submitted successfully, as per company exit policy your
              last working day will be{" "}
              <strong>{lastWorkingDay?.format("MMM Do, YYYY") ?? "-"}</strong>,
              subject to acceptance of your resignation by HR / Reporting
              Manager. Please note that , if you will take any leave during
              serving notice, your last working day may get extended by same
              number of working days.
            </Typography>
            <br />
            <Typography textAlign="justify">
              You are advised to get in touch with HR department for further
              updates.
            </Typography>
          </>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              minWidth: "120px",
              fontWeight: 500,
            }}
            color="primary"
            variant="contained"
            onClick={() => {
              navigate(
                `/profile/exit-details${paramId ? `?employeeId=${paramId}` : ""}`,
                { replace: true }
              );
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <GlobalLoader loading={isAdding} />
    </>
  );
};

export default ResignationForm;
