import { matchPath, Outlet, useLocation, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader/PageHeader";
import { Paper, Tab, Tabs } from "@mui/material";
import { NavLink } from "react-router-dom";
import BreadCrumbs from "@/components/@extended/Router";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  AssetData,
  getAssetById,
  GetAssetByIdResponse,
} from "@/services/AssetManagement";
import { useEffect, useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";

function useRouteMatch(patterns: readonly string[]) {
  const { pathname } = useLocation();

  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) {
      return possibleMatch;
    }
  }

  return null;
}

export type AssetDetailsOutletContext = {
  assetData: AssetData | null;
  fetchAssetById: () => void;
  isLoading: boolean;
  isEditable: boolean;
};

const AssetDetailsLayout = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const [assetData, setAssetData] = useState<AssetData | null>(null);

  const routeMatch = useRouteMatch([
    "/IT-assets/:assetId/general",
    "/IT-assets/:assetId/history",
  ]);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const currentTab = routeMatch?.pattern?.path;
  const handleEdit = () => {
    setIsEditable((preVal) => !preVal);
  };
  const tabs = [
    { label: "General", to: "general" },
    { label: "History", to: "history" },
  ];

  useEffect(() => {
    setIsEditable(false);
  }, [currentTab]);

  const { execute: fetchAssetById, isLoading } = useAsync<GetAssetByIdResponse>(
    {
      requestFn: async (): Promise<GetAssetByIdResponse> => {
        return await getAssetById(Number(assetId || 0));
      },
      onSuccess: ({ data }) => {
        setAssetData(data.result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: true,
    }
  );

  const pageTitle = useMemo(() => {
    const deviceName = assetData?.deviceName ?? "";
    const deviceCode = assetData?.deviceCode ?? "";

    return deviceName
      ? deviceCode
        ? `${deviceName} (${deviceCode})`
        : deviceName
      : null;
  }, [assetData]);

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h3"
          title={pageTitle ?? "Unnamed Device"}
          sx={
            !pageTitle ? { color: "text.secondary", fontStyle: "italic" } : {}
          }
          actionButton={
            currentTab == "/IT-assets/:assetId/general" && (
              <RoundActionIconButton
                label={isEditable ? "Cancel" : "Edit Asset Details"}
                size="small"
                onClick={handleEdit}
                icon={isEditable ? <CloseIcon /> : <EditIcon />}
                color={isEditable ? "error" : "primary"}
              />
            )
          }
        />
        <Tabs value={currentTab}>
          {tabs.map((tab) => (
            <Tab
              key={tab.to}
              label={tab.label}
              value={`/IT-assets/:assetId/${tab.to}`}
              component={NavLink}
              to={tab.to}
            />
          ))}
        </Tabs>
        <Outlet
          context={{ assetData, fetchAssetById, isLoading, isEditable }}
        />
      </Paper>
    </>
  );
};

export default AssetDetailsLayout;
