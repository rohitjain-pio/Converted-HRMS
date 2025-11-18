import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store";
import DataTable from "@/components/DataTable/DataTable";
import PageHeader from "@/components/PageHeader/PageHeader";
import {
  UserDocumentType,
  GetUserDocumentListResponse,
  getUserDocumentList,
} from "@/services/Documents";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import AddUserDocumentPopup from "@/pages/Document/components/AddUserDocumentPopup/index";
import { permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import { useSearchParams } from "react-router-dom";
import { getUserDocumentTableHeaders } from "./components/documentHeader";

const Documents = () => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const {  CREATE } = permissionValue.PERSONAL_DETAILS;
  const [data, setData] = useState<UserDocumentType[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUserDocumentId, setSelectedUserDocumentId] =
    useState<number>(0);
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentDocType, setCurrentDocType] = useState<string>("");

  const { execute: fetchDocuments, isLoading } =
    useAsync<GetUserDocumentListResponse>({
      requestFn: async (): Promise<GetUserDocumentListResponse> => {
        return await getUserDocumentList(
          employeeId ? Number(employeeId) : Number(userData.userId)
        );
      },
      onSuccess: ({ data }) => {
        setData(data.result || []);
        setTotalRecords(data.result?.length ?? 0);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });


  useEffect(() => {
    if (userData.userId) {
      fetchDocuments();
    }
  }, [userData]);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedUserDocumentId(0);
    setCurrentDocType("");
    fetchDocuments();
  };

  const handleEditClick = (userDocument: UserDocumentType) => {
    if (userDocument.id) {
      setSelectedUserDocumentId(userDocument.id);
      setIsPopupOpen(true);
      setCurrentDocType(userDocument.documentTypeId as string);
    } else {
      setSelectedUserDocumentId(0);
      setIsPopupOpen(false);
      setCurrentDocType("");
      toast.error("User Document Id not found");
    }
  };
  const headerCells = getUserDocumentTableHeaders(handleEditClick)

  const existingDocTypes = data.map((doc) => doc.documentTypeId?.toString());

  return (
    <>
      <PageHeader
        variant="h4"
        title="Documents"
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
        actionButton={
          hasPermission(CREATE) && (
            <RoundActionIconButton
              label="Add Document"
              size="small"
              onClick={handleOpenPopup}
              icon={<AddIcon />}
            />
          )
        }
      />
      <Box>
        {isLoading ? (
          <Box
            height={"calc(100vh - 80px)"}
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            data={data}
            headerCells={headerCells}
            setStartIndex={setStartIndex}
            setPageSize={setPageSize}
            pageSize={pageSize}
            startIndex={startIndex}
            totalRecords={totalRecords}
            hidePagination={false}
          />
        )}
      </Box>
      <AddUserDocumentPopup
        open={isPopupOpen}
        onClose={handleClosePopup}
        userDocumentId={selectedUserDocumentId}
        existingDocTypes={existingDocTypes as string[]}
        currentDocType={currentDocType as string}
      />
    </>
  );
};

export default Documents;
