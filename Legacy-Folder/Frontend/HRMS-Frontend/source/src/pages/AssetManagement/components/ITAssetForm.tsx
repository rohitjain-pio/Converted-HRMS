import {
  AssetData,
  upsertITAsset,
  UpsertITAssetPayload,
  UpsertITAssetResponse,
} from "@/services/AssetManagement";
import { Box, Stack, Typography } from "@mui/material";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import * as Yup from "yup";

import {
  ASSET_CONDITION_OPTIONS,
  ASSET_STATUS_OPTIONS,
  ASSET_TYPE_OPTIONS,
  AssetCondition,
  AssetStatus,
  AssetType,
  BranchLocation,
} from "@/utils/constants";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { toast } from "react-toastify";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormTextField from "@/components/FormTextField";
import AssetFormSelectField from "@/pages/AssetManagement/components/AssetFormSelectField";
import BranchSelectField from "@/pages/Profile/components/BranchSelectField";
import FormDatePicker from "@/components/FormDatePicker";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useEffect, useState } from "react";
import AssetUserAutocomplete from "@/pages/AssetManagement/components/AssetUserAutocomplete";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import LabelValue from "@/components/LabelValue";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";
import { fileValidation } from "@/utils/fileSchema";
interface ValidationContext {
  isDisabled: boolean;
}
const schema = Yup.object().shape({
  deviceName: Yup.string().trim().required("Device Name is required"),
  deviceCode: Yup.string().trim().required("Device Code is required"),
  serialNumber: Yup.string().trim().required("Serial Number is required"),
  invoiceNumber: Yup.string().trim().required("Invoice Number is required"),
  manufacturer: Yup.string().trim().required("Manufacturer is required"),
  model: Yup.string().trim().required("Model is required"),
  assetType: Yup.string()
    .trim()
    .required("Asset Type is required")
    .oneOf(
      [...Object.values(AssetType).map((value) => String(value))],
      "Please select a valid option"
    ),
  assetStatus: Yup.string()
    .trim()
    .required("Asset Status is required")
    .oneOf(
      [...Object.values(AssetStatus).map((value) => String(value))],
      "Please select a valid option"
    )
    .test(
      "status-assetUser",
      "Cannot allocate a retired asset",
      function (value) {
        const { employeeId } = this.parent;
        const { isDisabled } = this.options.context as ValidationContext;
        if (isDisabled) {
          return true;
        }
        if (value === String(AssetStatus.Retired) && employeeId) {
          return false;
        }
        return true;
      }
    ),
  assetCondition: Yup.string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      "condition-inventory-missing",
      "Asset cannot be allocated because it is currently marked as missing in inventory.",
      function (value) {
        if (!value) return true;
        const { assetStatus, employeeId } = this.parent;
        const { isDisabled } = this.options.context as ValidationContext;
        if (isDisabled) {
          return true;
        }
        if (!employeeId) return true;
        if (
          assetStatus === String(AssetStatus.InInventory) &&
          value === String(AssetCondition.missing)
        ) {
          return false;
        }
        return true;
      }
    )
    .test(
      "condition-inventory-damaged",
      "Asset cannot be allocated because it is currently marked as damaged in inventory.",
      function (value) {
        if (!value) return true;
        const { isDisabled } = this.options.context as ValidationContext;
        if (isDisabled) return true;
        const { assetStatus, employeeId } = this.parent;
        if (!employeeId) return true;
        if (
          assetStatus === String(AssetStatus.InInventory) &&
          value === String(AssetCondition.damaged)
        ) {
          return false;
        }
        return true;
      }
    ),

  branch: Yup.string()
    .trim()
    .required("Branch is required")
    .oneOf(
      [...Object.values(BranchLocation).map((value) => String(value))],
      "Please select a valid option"
    ),
  purchaseDate: Yup.mixed<moment.Moment>()
    .defined()
    .nullable()
    .test("required", "Purchase Date is required", (purchaseDate) => {
      if (!purchaseDate) {
        return false;
      }
      return true;
    })
    .test("is-valid", "Invalid Date", (purchaseDate) => {
      if (!purchaseDate) {
        return true;
      }
      return moment.isMoment(purchaseDate) && moment(purchaseDate).isValid();
    }),

  warrantyExpires: Yup.mixed<moment.Moment>()
    .defined()
    .nullable()
    .test("required", "Warranty Expiry Date is required", (warrantyExpires) => {
      if (!warrantyExpires) {
        return false;
      }
      return true;
    })
    .test("is-valid", "Invalid Date", (warrantyExpires) => {
      if (!warrantyExpires) {
        return true;
      }
      return (
        moment.isMoment(warrantyExpires) && moment(warrantyExpires).isValid()
      );
    })
    .test(
      "after-purchase-date",
      "Warranty Expires Date cannot be before Purchase Date",
      function (warrantyExpires) {
        const { purchaseDate } = this.parent;
        if (!warrantyExpires || !purchaseDate) return true;
        return moment(warrantyExpires).isSameOrAfter(
          moment(purchaseDate),
          "day"
        );
      }
    ),

  specification: Yup.string()
    .trim()
    .defined()
    .nullable()
    .transform((value, original) => (original === "" ? null : value)),
  comments: Yup.string()
    .trim()
    .defined()
    .nullable()
    .transform((value, original) => (original === "" ? null : value)),
  note: Yup.string()
    .trim()
    .defined()
    .nullable()
    .transform((value, original) => (original === "" ? null : value)),
  employeeId: Yup.number().nullable(),
  productFileOriginalName: Yup.mixed<File>()
    .nullable()
    .defined()
    .test("fileValidation", fileValidation),
  signatureFileOriginalName: Yup.mixed<File>()
    .nullable()
    .defined()
    .test("fileValidation", fileValidation),
});

type FormValues = Yup.InferType<typeof schema>;

const defaultFormValues: FormValues = {
  deviceName: "",
  deviceCode: "",
  serialNumber: "",
  invoiceNumber: "",
  manufacturer: "",
  model: "",
  assetType: "",
  assetStatus: "",
  assetCondition: "",
  branch: "",
  purchaseDate: null,
  warrantyExpires: null,
  specification: "",
  comments: "",
  note: null,
  employeeId: null,
  productFileOriginalName: null,
  signatureFileOriginalName: null,
};

type ITAssetFormProps = {
  mode: "add" | "edit" | "read";
  assetData?: AssetData | null;
  fetchAssetById: () => void;
  getLoading: boolean;
  isEditable: boolean;
};

const ITAssetForm = ({
  mode,
  assetData,
  fetchAssetById,
  getLoading,
  isEditable,
}: ITAssetFormProps) => {
  const [originalAssetStatus, setOriginalAssetStatus] = useState<string | null>(
    null
  );
  const [originalAssetCondition, setOriginalAssetCondition] = useState<
    string | null
  >(null);

  const { execute: upsert, isLoading } = useAsync<
    UpsertITAssetResponse,
    UpsertITAssetPayload
  >({
    requestFn: async (
      args: UpsertITAssetPayload
    ): Promise<UpsertITAssetResponse> => {
      return await upsertITAsset(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      if (mode === "add") {
        reset();
      } else if (mode === "edit") {
        fetchAssetById();
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const isDisabled = originalAssetStatus === String(AssetStatus.Allocated);
  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: defaultFormValues,
    context: { isDisabled },
  });
  const { reset, handleSubmit, control } = method;
  const currentAssetStatus = useWatch({ control, name: "assetStatus" });
  const currentAssetCondition = useWatch({ control, name: "assetCondition" });
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const {
      branch,
      assetCondition,
      assetStatus,
      assetType,
      purchaseDate,
      warrantyExpires,
      employeeId,
      note,
      specification,
      comments,
      productFileOriginalName,
      signatureFileOriginalName,
      ...rest
    } = values;
    let isAllocatedValue = null;
    if (
      (originalAssetStatus === String(AssetStatus.InInventory) ||
        originalAssetStatus === String(AssetStatus.Retired)) &&
      employeeId
    ) {
      isAllocatedValue = true;
    } else if (
      originalAssetStatus === String(AssetStatus.Allocated) &&
      (String(assetStatus) === String(AssetStatus.Retired) ||
        String(assetStatus) === String(AssetStatus.InInventory))
    ) {
      isAllocatedValue = false;
    }

    const payload: UpsertITAssetPayload = {
      ...(mode === "edit" ? { id: assetData?.id } : {}),
      branch: Number(branch) as BranchLocation,
      assetCondition: Number(assetCondition) as AssetCondition,
      assetStatus: Number(assetStatus) as AssetStatus,
      assetType: Number(assetType) as AssetType,
      purchaseDate: moment(purchaseDate).format("YYYY-MM-DD"),
      warrantyExpires: moment(warrantyExpires).format("YYYY-MM-DD"),
      note: note ?? "",
      specification: specification ?? "",
      comments: comments ?? "",
      productFileOriginalName: productFileOriginalName ?? "",
      signatureFileOriginalName: signatureFileOriginalName ?? "",
      employeeId: Number(employeeId),
      isAllocated: isAllocatedValue ?? "",
      ...rest,
    };

    upsert(payload);
  };

  useEffect(() => {
    method.reset();
  }, [isEditable]);
  const assetStatusOption =
    assetData?.assetStatus === AssetStatus.Allocated
      ? ASSET_STATUS_OPTIONS
      : ASSET_STATUS_OPTIONS.filter(
          (item) => item.id !== String(AssetStatus.Allocated)
        );

  useEffect(() => {
    if (mode === "edit" && assetData) {
      const newDefaultValues: FormValues = {
        deviceName: assetData?.deviceName ?? "",
        deviceCode: assetData?.deviceCode ?? "",
        serialNumber: assetData?.serialNumber ?? "",
        invoiceNumber: assetData?.invoiceNumber ?? "",
        manufacturer: assetData?.manufacturer ?? "",
        model: assetData?.model ?? "",
        assetType: String(assetData?.assetType ?? ""),
        assetStatus: String(assetData?.assetStatus ?? ""),
        assetCondition: String(assetData?.assetCondition ?? ""),
        branch: String(assetData?.branch ?? ""),
        purchaseDate: assetData?.purchaseDate
          ? moment(assetData.purchaseDate, "YYYY-MM-DD")
          : null,
        warrantyExpires: assetData?.warrantyExpires
          ? moment(assetData.warrantyExpires, "YYYY-MM-DD")
          : null,
        specification: assetData?.specification ?? "",
        comments: assetData?.comments ?? "",
        employeeId: assetData.custodian?.employeeId
          ? assetData.custodian.employeeId
          : null,
        note: null,
        productFileOriginalName: null,
        signatureFileOriginalName: null,
      };
      reset(newDefaultValues);
      setOriginalAssetStatus(String(assetData.assetStatus));
      setOriginalAssetCondition(String(assetData.assetCondition));
    }
  }, [mode, assetData]);

  const showNote =
    currentAssetStatus !== originalAssetStatus ||
    currentAssetCondition !== originalAssetCondition;

  return (
    <FormProvider<FormValues> {...method}>
      <Stack
        component="form"
        autoComplete="off"
        padding="30px"
        gap="30px"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInputGroup>
          <FormInputContainer>
            <FormTextField
              name="deviceName"
              label="Device Name"
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormTextField
              name="deviceCode"
              label="Device Code"
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormTextField
              name="serialNumber"
              label="Serial Number"
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
        </FormInputGroup>

        <FormInputGroup>
          <FormInputContainer>
            <FormTextField
              name="invoiceNumber"
              label="Invoice Number"
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormTextField
              name="manufacturer"
              label="Manufacturer"
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormTextField
              name="model"
              label="Model"
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
        </FormInputGroup>

        <FormInputGroup>
          <FormInputContainer>
            <AssetFormSelectField
              name="assetType"
              valueKey="id"
              labelKey="label"
              label="Asset Type"
              options={ASSET_TYPE_OPTIONS}
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormTextField
              name="specification"
              label="Specifications"
              textFormat={!isEditable}
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormTextField
              name="comments"
              label="Comments"
              textFormat={!isEditable}
            />
          </FormInputContainer>
        </FormInputGroup>

        <FormInputGroup>
          <FormInputContainer>
            <BranchSelectField name="branch" required isEditable={isEditable} />
          </FormInputContainer>
          <FormInputContainer>
            <FormDatePicker
              name="purchaseDate"
              label="Purchase Date"
              format="MMM Do, YYYY"
              textFormat={!isEditable}
              required
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormDatePicker
              name="warrantyExpires"
              label="Warranty Expires"
              format="MMM Do, YYYY"
              required
              textFormat={!isEditable}
            />
          </FormInputContainer>
        </FormInputGroup>

        <FormInputGroup>
          <FormInputContainer>
            <FormSelectField
              name="assetStatus"
              label="Asset Status"
              valueKey="id"
              labelKey="label"
              options={assetStatusOption}
              textFormat={!isEditable}
              required
            />
          </FormInputContainer>
          <FormInputContainer>
            <FormSelectField
              name="assetCondition"
              valueKey="id"
              labelKey="label"
              label="Asset Condition"
              options={ASSET_CONDITION_OPTIONS}
              textFormat={!isEditable}
              required
            />
          </FormInputContainer>
          <FormInputContainer>
            {isEditable ? (
              <>
                <AssetUserAutocomplete
                  label={"Select Employee"}
                  name="employeeId"
                  disabled={isDisabled}
                />
                {isDisabled &&
                  (currentAssetStatus === String(AssetStatus.Retired) ||
                    currentAssetStatus === String(AssetStatus.InInventory)) && (
                    <Typography
                      variant="body1"
                      color="error"
                      style={{ marginTop: "8px", textAlign: "center" }}
                    >
                      This will deallocate the asset.
                    </Typography>
                  )}
              </>
            ) : (
              <LabelValue
                label={"Employee Name"}
                value={
                  assetData?.custodian?.fullName
                    ? `${assetData.custodian.fullName} (${assetData.custodian.email})`
                    : "Unallocated"
                }
              />
            )}
          </FormInputContainer>
        </FormInputGroup>
        {showNote && (
          <FormInputGroup>
            <FormInputContainer md={24}>
              <FormTextField
                multiline
                name="note"
                maxLength={600}
                label={"Please enter reason for status or condition change...."}
                textFormat={!isEditable}
              />
            </FormInputContainer>
          </FormInputGroup>
        )}

        <FormInputGroup>
          <FormInputContainer>
            <Stack maxWidth="500px" alignItems="flex-start" useFlexGap gap={1}>
              <LabelValue label="Product Invoice" value={undefined} />
              <Stack direction="row" gap={1} alignItems="center">
                {isEditable ? (
                  <Box>
                    <FileUpload name="productFileOriginalName" />
                  </Box>
                ) : assetData?.productFileOriginalName ? (
                  <Typography sx={{ color: "#4b535b" }}>
                    {assetData.productFileOriginalName}
                  </Typography>
                ) : (
                  <Typography sx={{ color: "text.secondary" }}>
                    No file uploaded
                  </Typography>
                )}
                {assetData?.productFileName && (
                  <Box>
                    <ViewDocument
                      filename={assetData.productFileName}
                      containerType={1}
                    />
                  </Box>
                )}
              </Stack>
            </Stack>
          </FormInputContainer>
        </FormInputGroup>

        <FormInputGroup>
          <FormInputContainer>
            <Stack maxWidth="500px" alignItems="flex-start" useFlexGap gap={1}>
              <LabelValue
                label="Acknowledgment/Signature Document"
                value={undefined}
              />
              <Stack direction="row" gap={1} alignItems="center">
                {isEditable ? (
                  <Box>
                    <FileUpload name="signatureFileOriginalName" />
                  </Box>
                ) : assetData?.signatureFileOriginalName ? (
                  <Typography sx={{ color: "#4b535b" }}>
                    {assetData.signatureFileOriginalName}
                  </Typography>
                ) : (
                  <Typography sx={{ color: "text.secondary" }}>
                    No file uploaded
                  </Typography>
                )}
                {assetData?.signatureFileName && (
                  <Box>
                    <ViewDocument
                      filename={assetData.signatureFileName}
                      containerType={1}
                    />
                  </Box>
                )}
              </Stack>
            </Stack>
          </FormInputContainer>
        </FormInputGroup>

        {isEditable && (
          <Stack direction="row" gap="15px" justifyContent="center">
            <SubmitButton loading={isLoading} />
            <ResetButton />
          </Stack>
        )}
      </Stack>
      <GlobalLoader loading={isLoading || getLoading} />
    </FormProvider>
  );
};

export default ITAssetForm;
