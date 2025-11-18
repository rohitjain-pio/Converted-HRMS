import * as Yup from "yup";
import { Moment } from "moment";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { validationSchema } from "./validationSchema";
import { hasPermission } from "@/utils/hasPermission";
import BreadCrumbs from "@/components/@extended/Router";
import FormDatePicker from "@/components/FormDatePicker";
import FormSelectField from "@/components/FormSelectField";
import FormTextField from "@/components/FormTextField";
import PageHeader from "@/components/PageHeader/PageHeader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ReportingManagerAutocomplete from "@/pages/EmploymentDetails/components/ReportingManagerAutocomplete";
import BranchSelectField from "@/pages/Profile/components/BranchSelectField";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import { EMPLOYMENT_STATUS_OPTIONS, permissionValue } from "@/utils/constants";
import { Paper, Box, Divider, Stack } from "@mui/material";
import DepartmentAutocomplete from "../components/DepartmentAutocomplete";
import DesignationAutocomplete from "../components/DesignationAutocomplete";
import TeamAutocomplete from "../components/TeamAutocomplete";
import {
  jobTypes,
  backgroundVerificationStatuses,
  criminalVerificationStatuses,
} from "./util";
type FormDataType = Yup.InferType<typeof validationSchema>;

interface Props {
  method: UseFormReturn<
    {
      firstName: string;
      middleName?: string;
      lastName: string;
      email: string;
      designationId: string;
      departmentId: string;
      teamId: string;
      reportingManagerId: number;
      employmentStatus: string;
      joiningDate: Moment;
      jobType: string;
      branchId: string;
      employeeCode: string;
      timeDoctorUserId: string | null;
      backgroundVerificationstatus: string;
      criminalVerification: string;
      totalExperienceYear: number;
      totalExperienceMonth: number;
      relevantExperienceYear: number;
      relevantExperienceMonth: number;
      probationMonths: number;
    },
    undefined
  >;
  onSubmit: (data: FormDataType) => void;
  isSaving: boolean;
}

const AddEmployeeForm: React.FC<Props> = ({ method, onSubmit, isSaving }) => {
  const { handleSubmit } = method;
  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="Add Employee" goBack={true} />
        <FormProvider<FormDataType> {...method}>
          <Box
            component="form"
            autoComplete="off"
            padding="30px"
            gap="30px"
            display="flex"
            flexDirection="column"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField label="First Name" name="firstName" required />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField label="Middle Name" name="middleName" />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField label="Last Name" name="lastName" required />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField label="Email" name="email" required />
              </FormInputContainer>
              <FormInputContainer>
                <DesignationAutocomplete required />
              </FormInputContainer>
              <FormInputContainer>
                <DepartmentAutocomplete required />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <TeamAutocomplete required />
              </FormInputContainer>
              <FormInputContainer>
                <ReportingManagerAutocomplete
                  label="Reporting Manager"
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormSelectField
                  label="Employment Status"
                  name="employmentStatus"
                  options={EMPLOYMENT_STATUS_OPTIONS}
                  valueKey="id"
                  labelKey="label"
                  required
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormDatePicker
                  label="Joining Date"
                  name="joiningDate"
                  format="MMM Do, YYYY"
                  views={["year", "month", "day"]}
                  openTo="year"
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormSelectField
                  label="Job Type"
                  name="jobType"
                  options={jobTypes}
                  valueKey="id"
                  labelKey="label"
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <BranchSelectField isEditable required />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer>
                <FormTextField
                  label="Employee Code"
                  name="employeeCode"
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  label="Time Doctor User Id"
                  name="timeDoctorUserId"
                />
              </FormInputContainer>
            </FormInputGroup>
            <Divider />
            <FormInputGroup>
              <FormInputContainer md={6}>
                <FormSelectField
                  label="Background Verification"
                  name="backgroundVerificationstatus"
                  options={backgroundVerificationStatuses}
                  valueKey="id"
                  labelKey="label"
                  required
                />
              </FormInputContainer>
              <FormInputContainer md={6}>
                <FormSelectField
                  label="Criminal Verification"
                  name="criminalVerification"
                  options={criminalVerificationStatuses}
                  valueKey="id"
                  labelKey="label"
                  required
                />
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer md={6}>
                <Stack direction="row" gap={2}>
                  <FormTextField
                    label="Total Experience Years"
                    name="totalExperienceYear"
                    type="number"
                    required
                  />
                  <FormTextField
                    label="Total Experience Months"
                    name="totalExperienceMonth"
                    type="number"
                    required
                  />
                </Stack>
              </FormInputContainer>
              <FormInputContainer md={6}>
                <Stack direction="row" gap={2}>
                  <FormTextField
                    label="Relevant Experience Years"
                    name="relevantExperienceYear"
                    type="number"
                    required
                  />
                  <FormTextField
                    label="Relevant Experience Months"
                    name="relevantExperienceMonth"
                    type="number"
                    required
                  />
                </Stack>
              </FormInputContainer>
            </FormInputGroup>
            <FormInputGroup>
              <FormInputContainer md={6}>
                <FormTextField
                  label="Probation Months"
                  name="probationMonths"
                  type="number"
                  required
                />
              </FormInputContainer>
            </FormInputGroup>
            <Stack direction="row" gap="15px" justifyContent="center">
              {hasPermission(permissionValue.EMPLOYEES.CREATE) && (
                <SubmitButton loading={isSaving}>
                  {isSaving ? "Saving" : "Save"}
                </SubmitButton>
              )}
              <ResetButton />
            </Stack>
          </Box>
        </FormProvider>
      </Paper>
    </>
  );
};
export default AddEmployeeForm;
