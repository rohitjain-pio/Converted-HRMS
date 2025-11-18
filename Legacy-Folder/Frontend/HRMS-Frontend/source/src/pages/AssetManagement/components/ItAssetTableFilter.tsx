import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
} from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import FormTextField from "@/components/FormTextField";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { ItAssetSearchFilter } from "@/services/AssetManagement/types";
import * as Yup from "yup";
import Grid from "@mui/material/Grid2";
import { DEFAULT_IT_ASSET_FILTER } from "@/pages/AssetManagement/constants";
import {
  ASSET_STATUS_OPTIONS,
  ASSET_TYPE_OPTIONS,
} from "@/utils/constants";
import AssetFormSelectField from "@/pages/AssetManagement/components/AssetFormSelectField";
import BranchSelectField from "@/pages//Profile/components/BranchSelectField";

const validationSchema = Yup.object({
  deviceName: Yup.string().nullable().default(null),
  deviceCode: Yup.string().nullable().default(null),
  manufacturer: Yup.string().nullable().default(null),
  status: Yup.string().default(""),
  assetType: Yup.string().default(""),
  model: Yup.string().default(null),
  branchId:Yup.string().default("")
});

export type ItAssetFilterHandle = {
  handleReset: () => void;
};

type ItAssetTableFilterProps = {
  onSearch: (values: ItAssetSearchFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};
type FormValues = Yup.InferType<typeof validationSchema>;

const ItAssetTableFilter = forwardRef<
  ItAssetFilterHandle,
  ItAssetTableFilterProps
>(({ onSearch, setHasActiveFilters }, ref) => {
  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      deviceCode: "",
      status: "",
      assetType: "",
      deviceName: "",
      model: "",
      branchId:"",
      manufacturer:""
    },
  });

  const { reset, handleSubmit } = methods;

  const handleReset = () => {
    reset();
    onSearch(DEFAULT_IT_ASSET_FILTER);
    setHasActiveFilters(false);
  };

  useImperativeHandle(ref, () => ({
    handleReset,
  }));

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const { assetType, status,branchId, ...rest } = values;
    onSearch({
      ...rest,
      assetType: Number(assetType),
      assetStatus: Number(status),
      branch: Number(branchId),
    });
    setHasActiveFilters(true);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormTextField name="deviceName" label="Asset Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormTextField name="deviceCode" label="Asset Number" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormTextField name="manufacturer" label="Brand" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <FormTextField name="model" label="Model Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <AssetFormSelectField
              name="assetType"
              valueKey="id"
              labelKey="label"
              label="Asset Type"
              options={ASSET_TYPE_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <AssetFormSelectField
              name="status"
              label="Status"
              valueKey="id"
              labelKey="label"
              options={ASSET_STATUS_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
           <BranchSelectField isEditable={true} />
          </Grid>

          <Grid size={12} sx={{ pt: 2 }}>
            <Stack direction="row" sx={{ gap: 2, justifyContent: "center" }}>
              <SubmitButton />
              <ResetButton onClick={handleReset} />
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
});

export default ItAssetTableFilter;
