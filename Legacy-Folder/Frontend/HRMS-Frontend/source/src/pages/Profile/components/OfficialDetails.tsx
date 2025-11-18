import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, CircularProgress, Divider } from "@mui/material";
import FormTextField from "@/components/FormTextField";
import ResetButton from "@/components/ResetButton/ResetButton";
import PageHeader from "@/components/PageHeader/PageHeader";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormBlocker from "@/components/FormBlocker";
import FormDatePicker from "@/components/FormDatePicker";
import moment from "moment";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { regex } from "@/utils/regexPattern";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import {
  getOfficialDetailById,
  GetOfficialDetailByIdResponse,
  OfficialDetailsType,
  updateOfficialDetail,
  UpdateOfficialDetailArgs,
  UpdateOfficialDetailResponse,
} from "@/services/OfficialDetails";
import methods from "@/utils";
import { hasPermission } from "@/utils/hasPermission";
import { toast } from "react-toastify";
import { useUserStore } from "@/store";
import { permissionValue } from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";

const status = [
  { id: false, label: "No" },
  { id: true, label: "Yes" },
];

const {
  allowOnlyAlphaNumerics,
  nameMaxLength_20,
  notOnlyNumbers,
  validAdhaar,
  minCharactersExist,
  nameMaxLength_50,
  validBankName,
} = regex;

const validationSchema = Yup.object().shape({
  panNumber: Yup.string()
    .required("PAN number is required.")
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "PAN Card must have 5 uppercase letters, 4 digits, and 1 uppercase letter (e.g., ABCDE1234F)."
    ),
  adharNumber: Yup.string()
    .required("Aadhar number is required.")
    .test(validAdhaar.key, validAdhaar.message, (value) => {
      if (!value) return true;
      const digitsOnly = value.replace(/[\s-]/g, "");
      return digitsOnly ? validAdhaar.pattern.test(digitsOnly) : false;
    })
    .max(nameMaxLength_20.number, nameMaxLength_20.message),
  passportNo: Yup.string()
    .defined()
    .max(nameMaxLength_20.number, nameMaxLength_20.message)
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      return notOnlyNumbers.pattern.test(value);
    })
    .test(
      allowOnlyAlphaNumerics.key,
      allowOnlyAlphaNumerics.message,
      (value) => {
        if (!value) return true;
        return allowOnlyAlphaNumerics.pattern.test(value);
      }
    ),
  passportExpiry: Yup.mixed<moment.Moment>()
    .nullable()
    .when("passportNo", {
      is: (passportNo: string | undefined) => !!passportNo,
      then: (schema) =>
        schema.required("Expiry date is required").test({
          name: "no-past-dates",
          message: "Expiry date cannot be in the past",
          test: (passportExpiry) =>
            moment.isMoment(passportExpiry)
              ? passportExpiry.isSameOrAfter(moment(), "day")
              : typeof passportExpiry === "undefined"
                ? true
                : false,
        }),
      otherwise: (schema) => schema,
    }),
  hasPF: Yup.boolean().required("Has pf is required."),
  pfNumber: Yup.string()
    .defined()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .test(
      allowOnlyAlphaNumerics.key,
      allowOnlyAlphaNumerics.message,
      (value) => {
        if (!value) return true;
        return allowOnlyAlphaNumerics.pattern.test(value);
      }
    )
    .min(5, ({ min }) => `This field must be at least ${min} characters.`)
    .max(25, ({ max }) => `This field cannot exceed ${max} characters.`),
  pfDate: Yup.mixed<moment.Moment>().nullable(),
  uanNo: Yup.string()
    .defined()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .matches(/^\d+$/, "Only numbers are allowed.")
    .min(8, ({ min }) => `This field must be at least ${min} characters.`)
    .max(15, ({ max }) => `This field cannot exceed ${max} characters.`),
  bankAccount: Yup.string()
    .required("Bank account number is required.")
    .matches(/^\d+$/, "Only numbers are allowed.")
    .min(7, ({ min }) => `This field must be at least ${min} characters.`)
    .max(18, ({ max }) => `This field cannot exceed ${max} characters.`),
  bankName: Yup.string()
    .required("Bank name is required.")
    .test("is-valid-bank-name", validBankName.message, (value) => {
      if (!value) return true;
      return validBankName.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_50.number, nameMaxLength_50.message),
  branchName: Yup.string()
    .required("Branch name is required.")
    .test("is-valid-branch-name", validBankName.message, (value) => {
      if (!value) return true;
      return validBankName.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_50.number, nameMaxLength_50.message),
  ifscCode: Yup.string()
    .required("IFSC code is required.")
    .test(
      allowOnlyAlphaNumerics.key,
      allowOnlyAlphaNumerics.message,
      (value) => {
        if (!value) return true;
        return allowOnlyAlphaNumerics.pattern.test(value);
      }
    )
    .min(8, ({ min }) => `This field must be at least ${min} characters.`)
    .max(15, ({ max }) => `This field cannot exceed ${max} characters.`),
  hasESI: Yup.boolean().required("Has ESI is required."),
  esiNo: Yup.string()
    .defined()
    .when("hasESI", {
      is: true,
      then: (schema) =>
        schema
          .required("ESI number is required.")
          .test("allow-only-numbers", "Only numbers are allowed.", (value) => {
            if (!value) return true;
            return /^\d+$/.test(value);
          })
          .min(
            15,
            ({ min }) => `This field must be at least ${min} characters.`
          )
          .max(20, ({ max }) => `This field cannot exceed ${max} characters.`),
      otherwise: (schema) => schema,
    }),
});

type FormDataType = Yup.InferType<typeof validationSchema>;

const OfficialDetails = () => {
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [officialDetails, setOfficialDetails] =
    useState<OfficialDetailsType | null>(null);
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { OFFICIAL_DETAILS, EMPLOYEES } = permissionValue;

  const { execute: fetchOfficialDetails, isLoading } =
    useAsync<GetOfficialDetailByIdResponse>({
      requestFn: async (): Promise<GetOfficialDetailByIdResponse> => {
        return await getOfficialDetailById(employeeId || userData.userId);
      },
      onSuccess: ({ data }) => {
        setOfficialDetails(data.result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { execute: update, isLoading: isUpdating } = useAsync<
    UpdateOfficialDetailResponse,
    UpdateOfficialDetailArgs
  >({
    requestFn: async (
      args: UpdateOfficialDetailArgs
    ): Promise<UpdateOfficialDetailResponse> => {
      return await updateOfficialDetail(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      fetchOfficialDetails();
      setIsEditable(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    if (hasPermission(OFFICIAL_DETAILS.READ)) {
      fetchOfficialDetails();
    }
  }, [employeeId]);

  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      panNumber: "",
      adharNumber: "",
      pfNumber: "",
      hasPF: undefined,
      pfDate: null,
      uanNo: "",
      passportNo: "",
      passportExpiry: null,
      bankAccount: "",
      bankName: "",
      branchName: "",
      ifscCode: "",
      hasESI: undefined,
      esiNo: "",
    },
  });

  useEffect(() => {
    if (officialDetails) {
      reset({
        panNumber: officialDetails.panNumber,
        adharNumber: officialDetails.adharNumber
          ? officialDetails.adharNumber.replace(/[\s-]/g, "")
          : "",
        pfNumber: officialDetails.pfNumber || "",
        esiNo: officialDetails.esiNo || "",
        hasESI: officialDetails.hasESI,
        hasPF: officialDetails.hasPF,
        uanNo: officialDetails.uanNo || "",
        bankName: officialDetails.bankName,
        bankAccount: officialDetails.accountNo,
        ifscCode: officialDetails.ifscCode,
        branchName: officialDetails.branchName || "",
        passportExpiry: officialDetails.passportExpiry
          ? moment(officialDetails.passportExpiry)
          : null,
        passportNo: officialDetails.passportNo || "",
        pfDate: officialDetails.pfDate ? moment(officialDetails.pfDate) : null,
      });
    }
  }, [officialDetails]);

  const { watch, handleSubmit, reset, setValue } = method;

  const hasPassport = !!watch("passportNo");
  const hasESI = !!watch("hasESI");
  const hasPF = !!watch("hasPF");

  const handleEdit = () => {
    setIsEditable((preVal) => !preVal);
    reset();
  };

  const onSubmit = (values: FormDataType) => {
    update({
      id: employeeId ? +employeeId : +userData.userId,
      panNumber: values.panNumber,
      adharNumber: values.adharNumber,
      pfNumber: values.pfNumber,
      uanNo: values.uanNo,
      esiNo: values.esiNo,
      hasESI: values.hasESI,
      hasPF: values.hasPF,
      passportNo: values.passportNo,
      passportExpiry: values.passportExpiry
        ? values.passportExpiry.format("YYYY-MM-DD")
        : null,
      pfDate: values.pfDate ? values.pfDate.format("YYYY-MM-DD") : null,
      bankDetails: {
        employeeId: employeeId ? +employeeId : +userData.userId,
        accountNo: values.bankAccount,
        bankName: values.bankName,
        ifscCode: values.ifscCode,
        branchName: values.branchName,
      },
    });
  };

  useEffect(() => {
    if (!hasPassport) {
      setValue("passportExpiry", null, {
        shouldValidate: true,
      });
    }
  }, [hasPassport]);

  useEffect(() => {
    if (!hasESI) {
      setValue("esiNo", "", { shouldValidate: true });
    }
  }, [hasESI]);

  useEffect(() => {
    if (!hasPF) {
      setValue("pfDate", null);
      setValue("pfNumber", "");
      setValue("uanNo", "");
    }
  }, [hasPF]);

  if (
    employeeId &&
    userData.userId != employeeId &&
    !hasPermission(EMPLOYEES.READ)
  ) {
    return <NotFoundPage />;
  }

  return (
    <>
      <PageHeader
        variant="h3"
        title="Official Details"
        actionButton={
          hasPermission(OFFICIAL_DETAILS.EDIT) && (
            <RoundActionIconButton
              label={isEditable ? "Cancel" : "Edit Official Details"}
              size="small"
              onClick={handleEdit}
              icon={isEditable ? <CloseIcon /> : <EditIcon />}
              color={isEditable ? "error" : "primary"}
            />
          )
        }
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
      />
      {!isLoading ? (
        <FormProvider<FormDataType> {...method}>
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
              <FormInputContainer>
                <FormTextField
                  label="PAN Number"
                  name="panNumber"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Aadhar Number"
                  name="adharNumber"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Passport Number"
                  name="passportNo"
                  textFormat={!isEditable}
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormDatePicker
                  label="Passport Expiry"
                  name="passportExpiry"
                  format="MMM Do, YYYY"
                  views={["year", "month", "day"]}
                  openTo="year"
                  yearsOrder="asc"
                  minDate={moment()}
                  textFormat={!isEditable}
                  disabled={!hasPassport}
                />
              </FormInputContainer>
            </FormInputGroup>
            <Divider />
            <FormInputGroup>
              <FormInputContainer>
                <FormSelectField
                  label="Has PF"
                  name="hasPF"
                  options={status}
                  valueKey="id"
                  labelKey="label"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  name="pfNumber"
                  label="PF Number"
                  textFormat={!isEditable}
                  disabled={!hasPF}
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormDatePicker
                  label="PF Start Date"
                  name="pfDate"
                  format="MMM Do, YYYY"
                  views={["year", "month", "day"]}
                  openTo="year"
                  yearsOrder="desc"
                  textFormat={!isEditable}
                  disabled={!hasPF}
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField
                  name="uanNo"
                  label="UAN Number"
                  textFormat={!isEditable}
                  disabled={!hasPF}
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormSelectField
                  label="Has ESI"
                  name="hasESI"
                  options={status}
                  valueKey="id"
                  labelKey="label"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  name="esiNo"
                  label="ESI Number"
                  textFormat={!isEditable}
                  disabled={!hasESI}
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField
                  label="Bank Account Number"
                  name="bankAccount"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Bank Name"
                  name="bankName"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Branch Name"
                  name="branchName"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField
                  label="IFSC Code"
                  name="ifscCode"
                  textFormat={!isEditable}
                  required
                />
              </FormInputContainer>
            </FormInputGroup>
            {isEditable && (
              <Box display="flex" gap="15px" justifyContent="center">
                <SubmitButton loading={isUpdating}>
                  {isUpdating ? "Updating" : "Update"}
                </SubmitButton>
                <ResetButton />
              </Box>
            )}
            {isEditable && <FormBlocker />}
          </Box>
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
      <GlobalLoader loading={isUpdating} />
    </>
  );
};

export default OfficialDetails;
