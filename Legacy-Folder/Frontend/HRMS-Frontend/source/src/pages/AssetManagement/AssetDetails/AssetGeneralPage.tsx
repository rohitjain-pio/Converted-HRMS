import { useOutletContext } from "react-router-dom";
import { AssetDetailsOutletContext } from "@/pages/AssetManagement/AssetDetails/AssetDetailsLayout";
import ITAssetForm from "@/pages/AssetManagement/components/ITAssetForm";

const AssetGeneralPage = () => {
  const { assetData, fetchAssetById ,isLoading,isEditable } =
    useOutletContext<AssetDetailsOutletContext>();

  return (
    <>
      <ITAssetForm
        mode="edit"
        assetData={assetData}
        getLoading={isLoading}
        fetchAssetById={fetchAssetById}
        isEditable={isEditable}
      />
    </>
  );
};

export default AssetGeneralPage;
