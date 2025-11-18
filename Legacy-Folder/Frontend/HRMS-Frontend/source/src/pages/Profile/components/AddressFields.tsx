import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { useFormContext } from "react-hook-form";
import FormTextField from "@/components/FormTextField";
import PageHeader from "@/components/PageHeader/PageHeader";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import CountrySelectField from "@/pages/Profile/components/CountrySelectField";
import CitySelectField from "@/pages/Profile/components/CitySelectField";
import StateSelectField from "@/pages/Profile/components/StateSelectField";

const addressTypes = [
  { value: 2, label: "Current Address", name: "currentAddress" },
  { value: 1, label: "Permanent Address", name: "permanentAddress" },
];

interface AddressFieldsProps {
  isEditable?: boolean;
}

const AddressFields = ({ isEditable }: AddressFieldsProps) => {
  const { watch, setValue } = useFormContext();

  const handleCopyAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      const currentAddress = watch("currentAddress");
      setValue("permanentAddress", currentAddress, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  return (
    <Box>
      {addressTypes.map(({ label, name }) => (
        <>
          <PageHeader
            title={label}
            variant="h5"
            containerStyles={{ paddingX: 0, paddingBottom: "10px" }}
            actionButton={
              isEditable &&
              name === "permanentAddress" && (
                <FormControlLabel
                  control={<Checkbox onChange={handleCopyAddressChange} />}
                  label="Copy current address to permanent address"
                />
              )
            }
          />
          <FormInputGroup sx={{ mt: "10px" }}>
            <FormInputContainer>
              <FormTextField
                name={`${name}.line1`}
                label="Street 1"
                textFormat={!isEditable}
                multiline

                rows={2}
                required
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormTextField
                name={`${name}.line2`}
                label="Street 2"
                textFormat={!isEditable}
                multiline

                rows={2}
              />
            </FormInputContainer>
            <CountrySelectField addressType={name} isEditable={isEditable} />
            <StateSelectField addressType={name} isEditable={isEditable} />
            <CitySelectField addressType={name} isEditable={isEditable} />
            <FormInputContainer>
              <FormTextField
                name={`${name}.pincode`}
                label="Postal Code"
                textFormat={!isEditable}
                required
              />
            </FormInputContainer>
          </FormInputGroup>
        </>
      ))}
    </Box>
  );
};

export default AddressFields;
