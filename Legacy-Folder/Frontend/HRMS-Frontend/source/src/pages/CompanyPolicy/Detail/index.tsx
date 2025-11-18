import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import DocumentDetails from "@/pages/CompanyPolicy/components/DocumentDetails";
import DocumentHistory from "@/pages/CompanyPolicy/components/DocumentHistory";
import useAsync from "@/hooks/useAsync";
import {
  GetCompanyPolicyResponse,
  getCompanyPolicy,
} from "@/services/CompanyPolicies";
import methods from "@/utils";
import NotFoundPage from "@/pages/NotFoundPage";
import Loader from "@/components/Loader";
import { permissionValue, role } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import { useUserStore } from "@/store";

const Detail = () => {
  const { userData } = useUserStore();
  const { id } = useParams<{ id: string }>();
  const { READ } = permissionValue.COMPANY_POLICY;
  const { data, isLoading } = useAsync<GetCompanyPolicyResponse>({
    requestFn: async (): Promise<GetCompanyPolicyResponse> => {
      return await getCompanyPolicy(id as string);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: hasPermission(READ) ? true : false,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!hasPermission(READ) || !data?.result) {
    return <NotFoundPage />;
  }

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      <DocumentDetails data={data.result} />
      {userData.roleName !== role.EMPLOYEE && <DocumentHistory />}
    </Box>
  );
};

export default Detail;
