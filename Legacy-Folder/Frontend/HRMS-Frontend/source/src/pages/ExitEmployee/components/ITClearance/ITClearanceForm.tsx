import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import {
  ASSET_CONDITION_OPTIONS,
  defaultValues,
  FormValues,
  status,
} from "./utils";
import { schema } from "./validationSchema";
import { ITClearanceDetails } from "@/services/EmployeeExitAdmin";
import { yupResolver } from "@hookform/resolvers/yup";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import ViewDocument from "../ViewDocument";
import FormSelectField from "@/components/FormSelectField";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import { useEffect } from "react";
import { AssetCondition } from "@/utils/constants";

type ItClearanceFormProps = {
  editable: boolean | undefined;
  itClearanceDetails: ITClearanceDetails | null;

  isFetchingDetails: boolean;
  isUpsertingDetails: boolean;
  onSubmit: (data: FormValues) => void;
};

export default function ItClearanceForm({
  editable,
  itClearanceDetails,
  isFetchingDetails,
  isUpsertingDetails,
  onSubmit,
}: ItClearanceFormProps) {
  const method = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });
  const { handleSubmit,reset } = method;
    useEffect(() => {
      if (itClearanceDetails) {
        const assetCondition = Object.values(AssetCondition).includes(
          itClearanceDetails.assetCondition as AssetCondition
        )
          ? String(itClearanceDetails.assetCondition)
          : "";
  
        const { accessRevoked, assetReturned, note, itClearanceCertification } =
          itClearanceDetails;
  
        reset({
          accessRevoked,
          assetReturned,
          assetCondition,
          note,
          itClearanceCertification,
        });
      }
    }, [itClearanceDetails]);
  return (
    <>
      <FormProvider<FormValues> {...method}>
        <Box
          component="form"
          autoComplete="off"
          display="flex"
          flexDirection="column"
          gap="30px"
          paddingY="30px"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInputGroup>
            <FormInputContainer>
              <FormSelectField
                label="Access Revoked"
                name="accessRevoked"
                options={status}
                valueKey="id"
                labelKey="label"
                required
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormSelectField
                label="Asset Returned"
                name="assetReturned"
                options={status}
                valueKey="id"
                labelKey="label"
                required
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormSelectField
                label="Submitted Asset Condition"
                name="assetCondition"
                options={ASSET_CONDITION_OPTIONS}
                valueKey="id"
                labelKey="label"
                required
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>
          <FormInputGroup>
            <FormInputContainer>
              <FormSelectField
                label="Issue No Due Certificate"
                name="itClearanceCertification"
                options={status}
                valueKey="id"
                labelKey="label"
                required
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer md={8}>
              <FormTextField
                multiline
                name="note"
                label="Comment"
                maxLength={600}
                placeholder="Add your comments"
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <Box display="flex" justifyContent="center" flexDirection="column">
              <FileUpload name="itAttachment" />
            </Box>
            {itClearanceDetails?.attachmentUrl && (
              <Box display="flex" justifyContent="center">
                <ViewDocument
                  filename={itClearanceDetails.attachmentUrl}
                  containerType={1}
                />
              </Box>
            )}
          </Box>
          <Box display="flex" gap="15px" justifyContent="center">
            <SubmitButton loading={isUpsertingDetails}>
              {isUpsertingDetails ? "Submitting" : "Submit"}
            </SubmitButton>
            <ResetButton />
          </Box>
        </Box>
      </FormProvider>
      <GlobalLoader loading={isUpsertingDetails || isFetchingDetails} />
    </>
  );
}
