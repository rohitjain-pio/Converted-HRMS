import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import FormTextField from "@/components/FormTextField";
import FormSelectField from "@/components/FormSelectField";
import ResetButton from "@/components/ResetButton/ResetButton";
import PageHeader from "@/components/PageHeader/PageHeader";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import {
  AddressType,
  PersonalDetailsType,
  UpdateUserProfileResponse,
  updateUserProfile,
} from "@/services/User";
import AddressFields from "@/pages/Profile/components/AddressFields";
import { useUserStore } from "@/store";
import useAsync from "@/hooks/useAsync";
import methods, { apiMsgs } from "@/utils";
import FormBlocker from "@/components/FormBlocker";
import Documents from "@/pages/Document";
import FormDatePicker from "@/components/FormDatePicker";
import moment, { Moment } from "moment";
import { hasPermission } from "@/utils/hasPermission";
import { FEATURE_FLAGS, permissionValue } from "@/utils/constants";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import ProfilePicture from "@/pages/Profile/components/ProfilePicture";
import { regex } from "@/utils/regexPattern";
import FormPhoneField from "@/components/FormPhoneField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { useNavigate, useSearchParams } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import { useProfileStore } from "@/store/useProfileStore";
import { getFullName } from "@/utils/getFullName";
import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import LabelValue from "@/components/LabelValue";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

const {
  phone,
  allZeros,
  email,
  name,
  nameMaxLength_35,
  nameMaxLength_50,
  nameMaxLength_250,
  notOnlyNumbers,
  minCharactersExist,
  allowOnlyAlphabets,
} = regex;

const INDIA_COUNTRY_ID = 101;

const addressSchema = Yup.object().shape({
  countryId: Yup.number()
    .transform((value) => (!isNaN(value) ? Number(value) : 0))
    .required("Country is required")
    .notOneOf([0], "Please select a valid option"),
  stateId: Yup.number()
    .transform((value) => (!isNaN(value) ? Number(value) : 0))
    .required("State is required")
    .notOneOf([0], "Please select a valid option"),
  cityId: Yup.number()
    .transform((value) => (!isNaN(value) ? Number(value) : 0))
    .required("City is required")
    .notOneOf([0], "Please select a valid option"),
  line1: Yup.string()
    .max(nameMaxLength_250.number, nameMaxLength_250.message)
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      const sanitizedValue = value.replace(/\n/g, "");
      return notOnlyNumbers.pattern.test(sanitizedValue);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .required("Street 1 is required"),
  line2: Yup.string()
    .max(nameMaxLength_250.number, nameMaxLength_250.message)
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      const sanitizedValue = value.replace(/\n/g, "");
      return notOnlyNumbers.pattern.test(sanitizedValue);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    }),
  pincode: Yup.string()
    .required("Postal code is required")
    .when("countryId", {
      is: (countryId: string) => Number(countryId) === INDIA_COUNTRY_ID,
      then: (schema) =>
        schema
          .length(6, "Postal code must be exactly 6 digits")
          .matches(/^\d{6}$/, "Postal code must contain only numeric values"),
      otherwise: (schema) =>
        schema
          .matches(/^[\d-]+$/, "Only numbers and hyphens are allowed")
          .max(15, ({ max }) => `This field cannot exceed ${max} characters`),
    }),
});

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
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
    .required("First name is required."),
  middleName: Yup.string()
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
    .max(nameMaxLength_35.number, nameMaxLength_35.message),
  lastName: Yup.string()
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
    .required("Last name is required."),
  fatherName: Yup.string()
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
    .required("Father name is required."),
  profilePictureLocation: Yup.string(),
  bloodGroup: Yup.string(),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.mixed<Moment>()
    .required("Date of birth is required")
    .test({
      name: "is-valid",
      message: "Invalid Date",
      test: (dob) => moment.isMoment(dob),
    })
    .test({
      name: "is-past",
      message: "Date of birth must be in the past",
      test: (dob) =>
        moment.isMoment(dob) ? dob.isSameOrBefore(moment(), "day") : false,
    }),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
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
  alternatePhone: Yup.string()
    .trim()
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
  emergencyContactPerson: Yup.string()
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
    .required("Emergency contact person is required"),
  emergencyContactNo: Yup.string()
    .trim()
    .required("Emergency contact number is required")
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
  personalEmail: Yup.string()
    .trim()
    .required("Email is required")
    .matches(email.pattern, email.message)
    .min(8, "Email must be at least 8 characters long.")
    .max(50, "Email cannot exceed 50 characters."),
  nationality: Yup.string()
    .trim()
    .test(allowOnlyAlphabets.key, allowOnlyAlphabets.message, (value) => {
      if (!value) return true;
      return allowOnlyAlphabets.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_50.number, nameMaxLength_50.message)
    .required("Nationality is required"),
  maritalStatus: Yup.string().required("Marital status is required"),
  permanentAddress: addressSchema,
  currentAddress: addressSchema,
});

type FormDataType = Yup.InferType<typeof validationSchema>;

const bloodGroups = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const allowedBloodGroups = bloodGroups.map((b) => b.value);

const genders = [
  { value: 1, label: "Male" },
  { value: 2, label: "Female" },
  { value: 3, label: "Other" },
];

const maritalStatuses = [
  { value: 1, label: "Single" },
  { value: 2, label: "Married" },
  { value: 3, label: "Other" },
];

interface PersonalDetailsProps {
  data: PersonalDetailsType | undefined;
  fetchUserProfile: (params?: void | undefined) => Promise<void>;
  canInitiateNewResignation: boolean;
}

const PersonalDetails = ({
  data,
  fetchUserProfile,
  canInitiateNewResignation,
}: PersonalDetailsProps) => {
  const { userData } = useUserStore();
  const { profileData } = useProfileStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { PERSONAL_DETAILS, EMPLOYEES } = permissionValue;
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const currentAddress = data?.address as AddressType;
  const permanentAddress = data?.permanentAddress as AddressType;
  const navigate = useNavigate();

  const [avatarConfig, setAvatarConfig] = useState<{
    userName: string;
    imageUrl: string;
  } | null>(null);

  const [openResignationDialog, setOpenResignationDialog] = useState(false);

  const targetId = employeeId ?? String(userData.userId);
  const isOwnProfile = targetId === String(userData.userId);

  const enableExitEmployee = useFeatureFlag(FEATURE_FLAGS.enableExitEmployee);

  useEffect(() => {
    if (!employeeId) {
      setAvatarConfig({
        userName: profileData.userName,
        imageUrl: profileData.profileImageUrl,
      });
    } else {
      if (data) {
        setAvatarConfig({
          userName: getFullName({
            firstName: data.firstName,
            lastName: data.lastName,
          }),
          imageUrl: data.fileName || "",
        });
      }
    }
  }, [employeeId, data, profileData]);

  const defaultBloodGroup = useMemo(() => {
    if (typeof data?.bloodGroup !== "string") {
      return "";
    }

    const normalized = data.bloodGroup.replace(/\s+/g, "").toUpperCase();
    return allowedBloodGroups.includes(normalized) ? normalized : "";
  }, [data]);

  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: data?.firstName,
      middleName: data?.middleName,
      lastName: data?.lastName,
      fatherName: data?.fatherName,
      personalEmail: data?.personalEmail,
      dob: data?.dob ? moment(data?.dob, "YYYY-MM-DD") : undefined,
      gender: data?.gender === 0 ? "" : data?.gender?.toString(),
      phone: parsePhone(data?.phone as string),
      alternatePhone: parsePhone(data?.alternatePhone as string),
      bloodGroup: defaultBloodGroup,
      maritalStatus:
        data?.maritalStatus === 0 ? "" : data?.maritalStatus?.toString(),
      nationality: data?.nationality,
      emergencyContactPerson: data?.emergencyContactPerson,
      emergencyContactNo: parsePhone(data?.emergencyContactNo as string),
      permanentAddress: {
        countryId: permanentAddress?.countryId,
        stateId: permanentAddress?.stateId,
        cityId: permanentAddress?.cityId,
        line1: permanentAddress?.line1,
        line2: permanentAddress?.line2,
        pincode: permanentAddress?.pincode ?? "",
      },
      currentAddress: {
        countryId: currentAddress?.countryId,
        stateId: currentAddress?.stateId,
        cityId: currentAddress?.cityId,
        line1: currentAddress?.line1,
        line2: currentAddress?.line2,
        pincode: currentAddress?.pincode ?? "",
      },
    },
  });

  function parsePhone(phoneNumber: string) {
    if (typeof phoneNumber !== "string") {
      return "";
    }

    const trimmed = phoneNumber.trim();

    if (trimmed === "") {
      return "";
    }

    const countryCodeUS = "+1";
    const countryCodeIN = "+91";

    let countryCode = countryCodeIN;
    let numberPart = trimmed;

    if (trimmed.startsWith(countryCodeUS)) {
      countryCode = countryCodeUS;
      numberPart = trimmed.substring(countryCodeUS.length).trim();
    } else if (trimmed.startsWith(countryCodeIN)) {
      countryCode = countryCodeIN;
      numberPart = trimmed.substring(countryCodeIN.length).trim();
    }

    numberPart = numberPart.replace(/\s+/g, "");

    return `${countryCode} ${numberPart}`;
  }

  const { execute: updateUserDetails, isLoading: isSaving } = useAsync<
    UpdateUserProfileResponse,
    PersonalDetailsType
  >({
    requestFn: async (
      payload: PersonalDetailsType
    ): Promise<UpdateUserProfileResponse> => {
      return await updateUserProfile(payload);
    },
    onSuccess: () => {
      toast.success(apiMsgs.Success.updatingData("Personal details"));
      fetchUserProfile();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: false,
  });

  const handleSubmit = (values: FormDataType) => {
    const payload: PersonalDetailsType = {
      id: employeeId ? +employeeId : +userData.userId,
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      fatherName: values.fatherName,
      personalEmail: values.personalEmail,
      dob: moment(values.dob).format("YYYY-MM-DD"),
      gender: +values.gender,
      phone: values.phone,
      alternatePhone: values.alternatePhone,
      bloodGroup: values.bloodGroup || "",
      maritalStatus: +values.maritalStatus,
      nationality: values.nationality,
      emergencyContactPerson: values.emergencyContactPerson,
      emergencyContactNo: values.emergencyContactNo,
      address: {
        id: currentAddress.id,
        addressType: currentAddress.addressType,
        countryId: +values.currentAddress.countryId,
        stateId: +values.currentAddress.stateId,
        cityId: +values.currentAddress.cityId,
        line1: values.currentAddress.line1,
        line2: values.currentAddress.line2,
        pincode: values.currentAddress.pincode,
      },
      permanentAddress: {
        id: permanentAddress.id,
        addressType: permanentAddress.addressType,
        countryId: +values.permanentAddress.countryId,
        stateId: +values.permanentAddress.stateId,
        cityId: +values.permanentAddress.cityId,
        line1: values.permanentAddress.line1,
        line2: values.permanentAddress.line2,
        pincode: values.permanentAddress.pincode,
      },
    };
    updateUserDetails(payload);
  };

  const handleEdit = () => {
    setIsEditable((preVal) => !preVal);
    method.reset();
  };

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
        title="Personal Details"
        variant="h3"
        actionButton={
          hasPermission(PERSONAL_DETAILS.EDIT) && (
            <RoundActionIconButton
              label={isEditable ? "Cancel" : "Edit Personal Details"}
              size="small"
              onClick={handleEdit}
              icon={isEditable ? <CloseIcon /> : <EditIcon />}
              color={isEditable ? "error" : "primary"}
            />
          )
        }
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
      />
      {avatarConfig && (
        <Box sx={{ pt: 2 }}>
          <Stack gap={1}>
            <ProfilePicture
              userName={avatarConfig.userName}
              profileImageUrl={avatarConfig.imageUrl}
              editable={isEditable}
              size={120}
              fetchUserProfile={fetchUserProfile}
            />
            <Typography variant="subtitle1" fontSize={"22px"} color="#273a50">
              {avatarConfig.userName}
            </Typography>
            <Stack direction={{ md: "row" }} gap={2}>
              {currentAddress?.cityName && currentAddress?.stateName && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <PlaceIcon sx={{ fontSize: "1rem", color: "#1E75BB" }} />
                  <Typography variant="subtitle2" color="#4b535b">
                    {currentAddress.cityName}, {currentAddress.stateName}
                  </Typography>
                </Stack>
              )}
              {data?.phone && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <PhoneIcon sx={{ fontSize: "1rem", color: "#1E75BB" }} />
                  <Typography
                    component={Link}
                    variant="subtitle2"
                    color="#4b535b"
                    href={`tel:${data?.phone}`}
                  >
                    {data?.phone}
                  </Typography>
                </Stack>
              )}
              {data?.email && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <MailIcon sx={{ fontSize: "1rem", color: "#1E75BB" }} />
                  <Typography
                    component={Link}
                    href={`mailto:${data.email}`}
                    variant="subtitle2"
                    color="#4b535b"
                  >
                    {data.email}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
          <Divider sx={{ pt: 2, borderBottomWidth: 2 }} />
        </Box>
      )}
      <FormProvider<FormDataType> {...method}>
        <Box
          component="form"
          autoComplete="off"
          onSubmit={method.handleSubmit(handleSubmit)}
          paddingY="30px"
          gap="30px"
          display="flex"
          flexDirection="column"
        >
          <FormInputGroup>
            <FormInputContainer>
              <FormTextField
                label="First Name"
                name="firstName"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormTextField
                label="Middle Name"
                name="middleName"
                textFormat={!isEditable}
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormTextField
                label="Last Name"
                name="lastName"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
          </FormInputGroup>
          <FormInputGroup>
            <FormInputContainer>
              <Box sx={{ minWidth: 150, width: "100%" }}>
                {!isEditable ? (
                  <LabelValue label="Email" value={data?.email} />
                ) : (
                  <TextField
                    label="Email*"
                    value={data?.email}
                    variant="outlined"
                    rows={5}
                    sx={{ width: "100%" }}
                    disabled
                  />
                )}
              </Box>
            </FormInputContainer>
            <FormInputContainer>
              <FormDatePicker
                label="Date of Birth"
                name="dob"
                format="MMM Do, YYYY"
                views={["year", "month", "day"]}
                openTo="year"
                yearsOrder="desc"
                maxDate={moment()}
                required
                textFormat={!isEditable}
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormSelectField
                label="Gender"
                name="gender"
                options={genders}
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
          </FormInputGroup>
          <FormInputGroup>
            <FormInputContainer>
              <FormSelectField
                label="Blood Group"
                name="bloodGroup"
                options={bloodGroups}
                textFormat={!isEditable}
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormSelectField
                label="Marital Status"
                name="maritalStatus"
                options={maritalStatuses}
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormTextField
                label="Nationality"
                name="nationality"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
          </FormInputGroup>
          <FormInputGroup>
            <FormInputContainer>
              <FormTextField
                label="Father Name"
                name="fatherName"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormPhoneField
                name="phone"
                label="Phone Number"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormPhoneField
                name="alternatePhone"
                label="Alternate Phone Number"
                textFormat={!isEditable}
              />
            </FormInputContainer>
          </FormInputGroup>
          <FormInputGroup>
            <FormInputContainer>
              <FormTextField
                name="emergencyContactPerson"
                label="Emergency Contact Person"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormPhoneField
                name="emergencyContactNo"
                label="Emergency Contact Number"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormTextField
                label="Secondary Email"
                name="personalEmail"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
          </FormInputGroup>
          <AddressFields isEditable={isEditable} />
          {isEditable && (
            <Box display="flex" gap="15px" justifyContent="center">
              <SubmitButton loading={isSaving}>
                {isSaving ? "Saving" : "Save"}
              </SubmitButton>
              <ResetButton />
            </Box>
          )}
          {isEditable && <FormBlocker />}
        </Box>
      </FormProvider>
      <Documents />
      {enableExitEmployee && (
        <>
          <PageHeader
            variant="h4"
            title="Resignation"
            containerStyles={{ paddingX: 0 }}
            hideBorder
          />
          <Typography>
            Click{" "}
            <Typography
              component={Link}
              onClick={(e) => {
                e.preventDefault();

                if (canInitiateNewResignation) {
                  setOpenResignationDialog(true);
                } else {
                  const to = isOwnProfile
                    ? "/profile/exit-details"
                    : `/profile/exit-details?employeeId=${targetId}`;
                  navigate(to);
                }
              }}
              sx={{
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Here
            </Typography>{" "}
            to get Resignation Form
          </Typography>
        </>
      )}

      <ConfirmationDialog
        title="Are you sure you want to resign?"
        content="Submitting your resignation will start the exit process, including notice period calculation and final approvals."
        open={openResignationDialog}
        onClose={() => {
          setOpenResignationDialog(false);
        }}
        onConfirm={() => {
          navigate(
            isOwnProfile ? "/resignation-form" : `/resignation-form/${targetId}`
          );
        }}
        cancelBtnLabel="Cancel"
        confirmBtnLabel="Confirm"
        confirmBtnColor="primary"
      />
      <GlobalLoader loading={isSaving} />
    </>
  );
};

export default PersonalDetails;
