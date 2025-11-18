import { Paper, Stack } from "@mui/material";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
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
import useAsync from "@/hooks/useAsync";
import {
  upsertITAsset,
  UpsertITAssetPayload,
  UpsertITAssetResponse,
} from "@/services/AssetManagement";
import methods from "@/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormTextField from "@/components/FormTextField";
import AssetFormSelectField from "@/pages/AssetManagement/components/AssetFormSelectField";
import FormSelectField from "@/components/FormSelectField";
import BranchSelectField from "@/pages/Profile/components/BranchSelectField";
import FormDatePicker from "@/components/FormDatePicker";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { toast } from "react-toastify";
import { fileValidation } from "@/utils/fileSchema";
import FileUpload from "../CompanyPolicy/components/FileUpload";
import LabelValue from "@/components/LabelValue";

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
    ),
  assetCondition: Yup.string()
    .trim()
    .required("Asset Condition is required")
    .oneOf(
      [...Object.values(AssetCondition).map((value) => String(value))],
      "Please select a valid option"
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
  // note: Yup.string()
  //   .trim()
  //   .defined()
  //   .nullable()
  //   .transform((value, original) => (original === "" ? null : value)),
  // employeeId: Yup.number().nullable(),
  // isAllocated: Yup.boolean().nullable(),
  productFileOriginalName: Yup.mixed<File>()
    // .transform((v) => (v === undefined || v === "" ? null : v))
    .required("File is required")
    /* To allow null as initial value but not let it pass when submitting */
    .nullable()
    .notOneOf([null], "File is required")
    /* */
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
  // note: null,
  // employeeId: null,
  // isAllocated: null,
  productFileOriginalName: null,
  signatureFileOriginalName: null,
};

const AddITAssetPage = () => {
  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: defaultFormValues,
  });

  const { reset, handleSubmit } = method;

  const { execute: add, isLoading: isAdding } = useAsync<
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
      reset();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const {
      branch,
      assetCondition,
      assetStatus,
      assetType,
      purchaseDate,
      warrantyExpires,
      // employeeId,
      productFileOriginalName,
      signatureFileOriginalName,
      specification,
      comments,
      ...rest
    } = values;

    const payload: UpsertITAssetPayload = {
      branch: Number(branch) as BranchLocation,
      assetCondition: Number(assetCondition) as AssetCondition,
      assetStatus: Number(assetStatus) as AssetStatus,
      assetType: Number(assetType) as AssetType,
      purchaseDate: moment(purchaseDate).format("YYYY-MM-DD"),
      warrantyExpires: moment(warrantyExpires).format("YYYY-MM-DD"),
      productFileOriginalName: productFileOriginalName ?? "",
      signatureFileOriginalName: signatureFileOriginalName ?? "",
      specification: specification ?? "",
      comments: comments ?? "",
      ...rest,
      employeeId: "",
      isAllocated: "",
      note: "",
    };

    add(payload);
  };
  const newAssetOptions = ASSET_STATUS_OPTIONS.filter(
    (item) => item.id !== String(AssetStatus.Allocated)
  );
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h3" title="Add Asset" goBack={true} />
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
                <FormTextField name="deviceName" label="Device Name" required />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField name="deviceCode" label="Device Code" required />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  name="serialNumber"
                  label="Serial Number"
                  required
                />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer>
                <FormTextField
                  name="invoiceNumber"
                  label="Invoice Number"
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField
                  name="manufacturer"
                  label="Manufacturer"
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField name="model" label="Model" required />
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
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField name="specification" label="Specifications" />
              </FormInputContainer>
              <FormInputContainer>
                <FormTextField name="comments" label="Comments" />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer>
                <BranchSelectField name="branch" required isEditable />
              </FormInputContainer>
              <FormInputContainer>
                <FormDatePicker
                  name="purchaseDate"
                  label="Purchase Date"
                  format="MMM Do, YYYY"
                  required
                />
              </FormInputContainer>
              <FormInputContainer>
                <FormDatePicker
                  name="warrantyExpires"
                  label="Warranty Expires"
                  format="MMM Do, YYYY"
                  required
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
                  options={newAssetOptions}
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
                  required
                />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer>
                <Stack
                  maxWidth="500px"
                  alignItems="flex-start"
                  useFlexGap
                  gap={1}
                >
                  <LabelValue label="Product Invoice*" value={undefined} />
                  <FileUpload name="productFileOriginalName" />
                </Stack>
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer>
                <Stack
                  maxWidth="500px"
                  alignItems="flex-start"
                  useFlexGap
                  gap={1}
                >
                  <LabelValue
                    label="Acknowledgment/Signature Document"
                    value={undefined}
                  />
                  <FileUpload name="signatureFileOriginalName" />
                </Stack>
              </FormInputContainer>
            </FormInputGroup>

            <Stack direction="row" gap="15px" justifyContent="center">
              <SubmitButton loading={isAdding} />
              <ResetButton />
            </Stack>
          </Stack>
        </FormProvider>
      </Paper>
      <GlobalLoader loading={isAdding} />
    </>
  );
};

export default AddITAssetPage;
