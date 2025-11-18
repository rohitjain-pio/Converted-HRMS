import { AssetCondition } from '@/utils/constants';
import * as Yup from 'yup'

export const schema = Yup.object().shape({
  accessRevoked: Yup.boolean().defined().required("Access revoked is required"),
  assetReturned: Yup.boolean().defined().required("Asset returned is required"),
  assetCondition: Yup.string()
    .required("Asset condition is required")
    .oneOf(["1", "2", "3"], "Asset condition is required"),
  note: Yup.string()
    .defined()
    .when("assetCondition", {
      is: (assetCondition: string) =>
        assetCondition &&
        (assetCondition === String(AssetCondition.missing) ||
          assetCondition === String(AssetCondition.damaged)),
      then: (schema) => schema.required("Required"),
      otherwise: (schema) => schema,
    }),
  itClearanceCertification: Yup.boolean().defined().required("Required"),
  itAttachment: Yup.mixed<File | string>()
    .nullable()
    .test("fileSize", "File size should not exceed 5 MB", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .notRequired(),
});
