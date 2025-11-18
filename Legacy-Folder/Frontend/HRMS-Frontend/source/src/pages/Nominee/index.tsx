import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import {
  deleteNominee,
  DeleteNomineeApiResponse,
  getNomineeList,
  GetNomineeListResponse,
  NomineeSearchFilter,
  NomineeType,
} from "@/services/Nominee";
import PageHeader from "@/components/PageHeader/PageHeader";
import DataTable from "@/components/DataTable/DataTable";
import FilterForm from "@/pages/Nominee/components/FilterForm";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import AddNomineePopup from "@/pages/Nominee/components/AddNomineePopup/index";
import { useUserStore } from "@/store";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import AddIcon from "@mui/icons-material/Add";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import { useSearchParams } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import { getNomineeTableHeaders } from "./components/nomineeTableHeader";

const Nominee = () => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { NOMINEE_DETAILS, EMPLOYEES } = permissionValue;
  const [data, setData] = useState<NomineeType[]>([]);
  const [sortColumnName, setSortColumnName] = useState<string>("nomineeName");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [nomineeName, setNomineeName] = useState<string | undefined>("");
  const [relationshipId, setRelationshipId] = useState<
    number | string | undefined
  >(0);
  const [others, setOthers] = useState<string | undefined>("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedNomineeId, setSelectedNomineeId] = useState<number>(0);
  const [selectedNomineePercentage, setSelectedNomineePercentage] =
    useState<number>(0);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [nomineeToDeleteId, setNomineeToDeleteId] = useState<number | null>(
    null
  );

  const { execute: fetchNominees, isLoading } =
    useAsync<GetNomineeListResponse>({
      requestFn: async (): Promise<GetNomineeListResponse> => {
        return await getNomineeList({
          sortColumnName,
          sortDirection,
          startIndex,
          pageSize,
          filters: {
            nomineeName,
            relationshipId: Number(relationshipId),
            employeeId: employeeId
              ? Number(employeeId)
              : Number(userData.userId),
            others,
          },
        });
      },
      onSuccess: ({ data }) => {
        setData(data.result?.nomineeList || []);
        setTotalRecords(data.result?.totalRecords || 0);
        setTotalPercentage(data.result?.totalPercentage || 0);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });

  const { execute: removeNominee } = useAsync<DeleteNomineeApiResponse, number>(
    {
      requestFn: async (id: number): Promise<DeleteNomineeApiResponse> => {
        return await deleteNominee(id);
      },
      onSuccess: () => {
        toast.success("Nominee deleted successfully");
        fetchNominees();
        setIsConfirmationDialogOpen(false);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    }
  );

  const handleSearch = async ({
    nomineeName,
    relationshipId,
    others,
  }: NomineeSearchFilter) => {
    setNomineeName(nomineeName);
    setRelationshipId(relationshipId || 0);
    setOthers(others);
    setStartIndex(1);
  };

  useEffect(() => {
    if (userData.userId) {
      fetchNominees();
    }
  }, [
    userData,
    sortColumnName,
    sortDirection,
    startIndex,
    pageSize,
    nomineeName,
    relationshipId,
    others,
    employeeId,
  ]);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedNomineeId(0);
    setSelectedNomineePercentage(0);
    fetchNominees();
  };

  const handleEditClick = (nominee: NomineeType) => {
    if (nominee.id) {
      setSelectedNomineeId(nominee.id);
      setSelectedNomineePercentage(nominee.percentage);
      setIsPopupOpen(true);
    } else {
      setSelectedNomineeId(0);
      setSelectedNomineePercentage(0);
      setIsPopupOpen(false);
      toast.error("Nominee Id not found");
    }
  };

  const openDeleteDialog = (id: number) => {
    setIsConfirmationDialogOpen(true);
    setNomineeToDeleteId(id);
  };

  const handleConfirmationDialogClose = () => {
    setIsConfirmationDialogOpen(false);
  };

  const handleNomineeDelete = (id: number | null) => {
    try {
      if (!id) {
        throw new Error(
          "The provided id is invalid. Expected a number. Instead got null value"
        );
      }
      removeNominee(id);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.stack);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (
    employeeId &&
    userData.userId != employeeId &&
    !hasPermission(EMPLOYEES.READ)
  ) {
    return <NotFoundPage />;
  }
  const headerCells = getNomineeTableHeaders(
    startIndex,
    pageSize,
    handleEditClick,
    openDeleteDialog
  );
  return (
    <>
      <PageHeader
        variant="h3"
        title="Nominee Details"
        actionButton={
          <FilterForm
            onSearch={handleSearch}
            addIcon={
              hasPermission(NOMINEE_DETAILS.CREATE) && (
                <RoundActionIconButton
                  label={
                    totalPercentage >= 100
                      ? "Total percentage cannot exceed 100%"
                      : "Add a new nominee"
                  }
                  size="small"
                  onClick={handleOpenPopup}
                  icon={<AddIcon />}
                  disabled={totalPercentage >= 100}
                />
              )
            }
          />
        }
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
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
            setSortColumnName={setSortColumnName}
            setSortDirection={setSortDirection}
            setStartIndex={setStartIndex}
            startIndex={startIndex}
            setPageSize={setPageSize}
            pageSize={pageSize}
            totalRecords={totalRecords}
          />
        )}
      </Box>
      <ConfirmationDialog
        title="Delete Nominee"
        content={
          "Are you sure you want to proceed? The selected nominee will be permanently deleted."
        }
        open={isConfirmationDialogOpen}
        onClose={handleConfirmationDialogClose}
        onConfirm={() => handleNomineeDelete(nomineeToDeleteId)}
      />
      <AddNomineePopup
        open={isPopupOpen}
        onClose={handleClosePopup}
        nomineeId={selectedNomineeId}
        totalPercentage={totalPercentage}
        nomineePercentage={selectedNomineePercentage}
      />
    </>
  );
};

export default Nominee;
