import { EmployeeDetailsType } from "@/services/User";
import { Controller, FormProvider, UseFormReturn } from "react-hook-form";
import * as Yup from "yup";
import { getValidationSchema } from "./validationSchema";
import FormDatePicker from "@/components/FormDatePicker";
import FormSelectField from "@/components/FormSelectField";
import FormTextField from "@/components/FormTextField";
import FormUrlField from "@/components/FormUrlField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import LabelValue from "@/components/LabelValue";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import DepartmentAutocomplete from "@/pages/Employee/components/DepartmentAutocomplete";
import DesignationAutocomplete from "@/pages/Employee/components/DesignationAutocomplete";
import TeamAutocomplete from "@/pages/Employee/components/TeamAutocomplete";
import BranchSelectField from "@/pages/Profile/components/BranchSelectField";
import EmployeeStatusSelectField from "@/pages/Profile/components/EmployeeStatus";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import RoleIDSelectField from "@/pages/Profile/components/RoleIDSelectField";
import { EMPLOYMENT_STATUS_OPTIONS, permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import {
  Box,
  CircularProgress,
  Stack,
  FormControlLabel,
  Tooltip,
  Divider,
  Switch,
} from "@mui/material";
import moment from "moment";
import ReportingManagerAutocomplete from "../ReportingManagerAutocomplete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  jobTypes,
  backgroundVerificationStatuses,
  criminalVerificationStatuses,
  formatDuration,
} from "./utils";
type FormDataType = Yup.InferType<ReturnType<typeof getValidationSchema>>;

interface props {
  isLoading: boolean;
  currentEmploymentDetails: EmployeeDetailsType | null;
  method: UseFormReturn<FormDataType, undefined>;
  onSubmit: (values: FormDataType) => void;
  isEditable: boolean;
  isEmployeeCodeEditable: boolean;
  hasEmployeePermission: boolean;
  hasRolePermission: boolean;
  isCriminalVerificationCompleted: boolean;
  isUpdating: boolean;
  isFetchingNewEmployeeCode: boolean;
}
const EmploymentForm = ({
  currentEmploymentDetails,
  isEditable,
  isLoading,
  isEmployeeCodeEditable,
  method,
  onSubmit,
  hasEmployeePermission,
  hasRolePermission,
  isCriminalVerificationCompleted,
  isFetchingNewEmployeeCode,
  isUpdating,
}: props) => {
  const { handleSubmit, watch, getValues, control } = method;
  const { EDIT } = permissionValue.EMPLOYMENT_DETAILS;

  return (
    <>
      {isLoading ? (
        <Box
          height={"calc(100vh - 80px)"}
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <CircularProgress />
        </Box>
      ) : !currentEmploymentDetails ? (
        <Stack direction="row" justifyContent="center">
          No Data Found
        </Stack>
      ) : (
        <FormProvider<FormDataType> {...method}>
          <Stack
            component="form"
            autoComplete="off"
            gap={"30px"}
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField
                  label="Employee Code"
                  name="employeeCode"
                  textFormat={!isEditable}
                  disabled={!isEmployeeCodeEditable}
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Email"
                  name="email"
                  textFormat={!isEditable}
                  disabled
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                {!isEditable ? (
                  <LabelValue
                    label="Designation"
                    value={currentEmploymentDetails.designation}
                  />
                ) : (
                  <DesignationAutocomplete required />
                )}
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                {!isEditable ? (
                  <LabelValue
                    label="Department"
                    value={currentEmploymentDetails.departmentName}
                  />
                ) : (
                  <DepartmentAutocomplete required />
                )}
              </FormInputContainer>
              <FormInputContainer>
                {!isEditable ? (
                  <LabelValue
                    label="Team"
                    value={currentEmploymentDetails.teamName}
                  />
                ) : (
                  <TeamAutocomplete required />
                )}
              </FormInputContainer>
              <FormInputContainer>
                {!isEditable ? (
                  <LabelValue
                    label="Reporting Manager"
                    value={currentEmploymentDetails.reportingManagerName}
                  />
                ) : (
                  <ReportingManagerAutocomplete label="Reporting Manager" />
                )}
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormSelectField
                  label="Employment Status"
                  name="employmentStatus"
                  options={EMPLOYMENT_STATUS_OPTIONS}
                  valueKey="id"
                  labelKey="label"
                  textFormat={!isEditable}
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormDatePicker
                  textFormat={!isEditable}
                  label="Joining Date"
                  name="joiningDate"
                  format="MMM Do, YYYY"
                  views={["year", "month", "day"]}
                  openTo="year"
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormSelectField
                  label="Job Type"
                  name="jobType"
                  options={jobTypes}
                  valueKey="id"
                  labelKey="label"
                  textFormat={!isEditable}
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <BranchSelectField isEditable={isEditable} required />
              </FormInputContainer>
              {hasEmployeePermission && (
                <FormInputContainer>
                  <EmployeeStatusSelectField
                    name="employeeStatus"
                    isEditable={isEditable}
                  />
                </FormInputContainer>
              )}
              {hasRolePermission && (
                <FormInputContainer>
                  <RoleIDSelectField isEditable={isEditable} required />
                </FormInputContainer>
              )}
            </FormInputGroup>
            {hasEmployeePermission && (
              <FormInputGroup>
                <FormInputContainer>
                  {isEditable ? (
                    <FormTextField
                      // disabled
                      label="Time Doctor User Id"
                      name="timeDoctorUserId"
                    />
                  ) : (
                    <LabelValue
                      label="Time Doctor User Id"
                      value={currentEmploymentDetails.timeDoctorUserId ?? ""}
                    />
                  )}
                </FormInputContainer>
                <FormInputContainer>
                  {isEditable ? (
                    <Stack direction="row" alignItems="center">
                      <Controller
                        name="isReportingManager"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControlLabel
                            control={
                              <Switch checked={value} onChange={onChange} />
                            }
                            label="Assign Reporting Manager"
                          />
                        )}
                      />
                      <Tooltip title="The Reporting Manager handles leave approvals and views attendance">
                        <InfoOutlinedIcon color="primary" fontSize="small" />
                      </Tooltip>
                    </Stack>
                  ) : (
                    <LabelValue
                      label="Assign Reporting Manager"
                      value={getValues("isReportingManager") ? "Yes" : "No"}
                    />
                  )}
                </FormInputContainer>
              </FormInputGroup>
            )}
            <Divider />
            <FormInputGroup>
              <FormInputContainer md={isEditable ? 6 : 4}>
                <FormSelectField
                  label="Background Verification"
                  name="backgroundVerificationstatus"
                  options={backgroundVerificationStatuses}
                  valueKey="id"
                  labelKey="label"
                  textFormat={!isEditable}
                  disabled={watch("backgroundVerificationstatus") === "2"}
                />
              </FormInputContainer>
              <FormInputContainer md={isEditable ? 6 : 4}>
                <FormSelectField
                  label="Criminal Verification"
                  name="criminalVerification"
                  options={criminalVerificationStatuses}
                  valueKey="id"
                  labelKey="label"
                  textFormat={!isEditable}
                  disabled={isCriminalVerificationCompleted}
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer md={isEditable ? 6 : 4}>
                {!isEditable ? (
                  <LabelValue
                    label="Total Experience"
                    value={formatDuration(
                      currentEmploymentDetails.totalExperienceYear,
                      currentEmploymentDetails.totalExperienceMonth
                    )}
                  />
                ) : (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <FormTextField
                      label="Total Experience Years"
                      name="totalExperienceYears"
                      type="number"
                    />
                    <FormTextField
                      label="Total Experience Months"
                      name="totalExperienceMonths"
                      type="number"
                    />
                  </Box>
                )}
              </FormInputContainer>
              <FormInputContainer md={isEditable ? 6 : 4}>
                {!isEditable ? (
                  <LabelValue
                    label="Relevant Experience"
                    value={formatDuration(
                      currentEmploymentDetails.relevantExperienceYear,
                      currentEmploymentDetails.relevantExperienceMonth
                    )}
                  />
                ) : (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <FormTextField
                      label="Relevant Experience Years"
                      name="relevantExperienceYears"
                      type="number"
                    />
                    <FormTextField
                      label="Relevant Experience Months"
                      name="relevantExperienceMonths"
                      type="number"
                    />
                  </Box>
                )}
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer md={isEditable ? 6 : 4}>
                <FormTextField
                  label="Probation Months"
                  name="probationMonths"
                  type="number"
                  textFormat={!isEditable}
                  disabled={!isEditable}
                />
              </FormInputContainer>
              <FormInputContainer md={isEditable ? 6 : 4}>
                <FormDatePicker
                  textFormat={!isEditable}
                  label="Confirmation Date"
                  name="confirmationDate"
                  format="MMM Do, YYYY"
                  disabled={!isEditable}
                />
              </FormInputContainer>
            </FormInputGroup>
            {currentEmploymentDetails.isProbExtended ? (
              <FormInputGroup>
                <FormInputContainer md={isEditable ? 6 : 4}>
                  <FormDatePicker
                    textFormat={!isEditable}
                    label="Extended Confirmation Date"
                    name="extendedConfirmationDate"
                    format="MMM Do, YYYY"
                    views={["year", "month", "day"]}
                    openTo="year"
                    minDate={moment()}
                  />
                </FormInputContainer>
                <FormInputContainer md={isEditable ? 6 : 4}>
                  <FormTextField
                    label="Probation Extended Weeks"
                    name="probExtendedWeeks"
                    type="number"
                    textFormat={!isEditable}
                  />
                </FormInputContainer>
              </FormInputGroup>
            ) : null}
            <FormInputGroup>
              <FormInputContainer md={isEditable ? 6 : 4}>
                <FormUrlField
                  name="linkedInUrl"
                  label="LinkedIn URL"
                  textFormat={!isEditable}
                />
              </FormInputContainer>
            </FormInputGroup>
            {isEditable && (
              <Box display="flex" gap="15px" justifyContent="center">
                {hasPermission(EDIT) && (
                  <SubmitButton loading={isUpdating}>
                    {isUpdating ? "Updating" : "Update"}
                  </SubmitButton>
                )}
                <ResetButton />
              </Box>
            )}
          </Stack>
        </FormProvider>
      )}
      <GlobalLoader loading={isUpdating || isFetchingNewEmployeeCode} />
    </>
  );
};
export default EmploymentForm;
