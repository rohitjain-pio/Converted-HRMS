import { Box, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import PageHeader from "@/components/PageHeader/PageHeader";
import DataTable from "@/components/DataTable/DataTable";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useUserStore } from "@/store";
import { toast } from "react-toastify";
import {
  CertificateType,
  DeleteCertificateArgs,
  deleteCertificateDetail,
  DeleteCertificateDetailApiResponse,
  getCertificateList,
  GetCertificateListResponse,
} from "@/services/Certificates";
import AddCertificate from "@/pages/Certificates/components/AddCertificate";
import ViewCertificateDocument from "@/pages/Certificates/components/ViewCertificateDocument";
import { Delete } from "@mui/icons-material";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import { formatDate } from "@/utils/formatDate";
import { useSearchParams } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";

const Certificates = () => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { CERTIFICATION_DETAILS, EMPLOYEES } = permissionValue;
  const [data, setData] = useState<CertificateType[]>([]);
  const [sortColumnName, setSortColumnName] =
    useState<string>("certificateName");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<number>(0);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [certificateDetailToDeleteId, setCertificateDetailToDeleteId] =
    useState<number | null>(null);
  const [currentCertificate, setCurrentCertificate] = useState<string>("");

  const { execute: fetchCertificates, isLoading } =
    useAsync<GetCertificateListResponse>({
      requestFn: async (): Promise<GetCertificateListResponse> => {
        return await getCertificateList({
          sortColumnName,
          sortDirection,
          startIndex,
          pageSize,
          filters: {
            employeeId: employeeId ? +employeeId : +userData.userId,
          },
        });
      },
      onSuccess: ({ data }) => {
        setData(data.result?.userCertificateResponseList || []);
        setTotalRecords(data.result?.totalRecords || 0);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });

  const { execute: removeCertificateDetail } = useAsync<
    DeleteCertificateDetailApiResponse,
    DeleteCertificateArgs
  >({
    requestFn: async (
      args: DeleteCertificateArgs
    ): Promise<DeleteCertificateDetailApiResponse> => {
      return await deleteCertificateDetail(args);
    },
    onSuccess: () => {
      toast.success("Certificate detail deleted successfully");
      fetchCertificates();
      setIsConfirmationDialogOpen(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const headerCells = [
    {
      label: "S.No",
      accessor: "sNo",
      width: "50px",
      renderColumn: (_row: CertificateType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
    },
    {
      label: "Certificate Name",
      accessor: "certificateName",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: CertificateType) => (
        <TruncatedText
          text={row.certificateName}
          tooltipTitle={row.certificateName}
          maxLength={20}
        />
      ),
    },
    {
      label: "Expiry Date",
      accessor: "certificateExpiry",
      width: "125px",
      renderColumn: (row: CertificateType) =>
        row.certificateExpiry ? formatDate(row.certificateExpiry) : "",
    },
    {
      label: "Attachment",
      accessor: "attachment",
      width: "50px",
      renderColumn: (row: CertificateType) => (
        <ViewCertificateDocument
          fileName={row.fileName || ""}
          hasPermission={hasPermission(CERTIFICATION_DETAILS.VIEW)}
        />
      ),
    },
    ...(hasPermission(CERTIFICATION_DETAILS.EDIT) ||
    hasPermission(CERTIFICATION_DETAILS.DELETE)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "100px",
            renderColumn: (row: CertificateType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(CERTIFICATION_DETAILS.EDIT) && (
                  <ActionIconButton
                    label="Edit Certificate"
                    colorType="primary"
                    icon={<EditIcon />}
                    onClick={() => handleEditClick(row)}
                  />
                )}
                {hasPermission(CERTIFICATION_DETAILS.DELETE) && (
                  <ActionIconButton
                    label="Delete Certificate"
                    colorType="error"
                    onClick={() => openDeleteDialog(row.id)}
                    icon={<Delete />}
                  />
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (userData.userId) {
      fetchCertificates();
    }
  }, [
    userData,
    sortColumnName,
    sortDirection,
    startIndex,
    pageSize,
    employeeId,
  ]);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedCertificateId(0);
    setCurrentCertificate("");
    fetchCertificates();
  };

  const handleEditClick = (certificate: CertificateType) => {
    if (certificate) {
      setSelectedCertificateId(certificate.id);
      setIsPopupOpen(true);
      setCurrentCertificate(certificate.certificateName);
    } else {
      setSelectedCertificateId(0);
      setIsPopupOpen(false);
      setCurrentCertificate("");
      toast.error("Certificate Id not found");
    }
  };

  const openDeleteDialog = (id: number) => {
    setIsConfirmationDialogOpen(true);
    setCertificateDetailToDeleteId(id);
  };

  const handleConfirmationDialogClose = () => {
    setIsConfirmationDialogOpen(false);
  };

  const handleCertificateDetailDelete = (id: number | null) => {
    try {
      if (!id) {
        throw new Error(
          "The provided id is invalid. Expected a number. Instead got null value"
        );
      }
      const payload = {
        id,
        isArchived: true,
      };
      removeCertificateDetail(payload);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.stack);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const existingCertificates = data.map(
    (certificate) => certificate.certificateName
  );

  if (
    employeeId &&
    userData.userId != employeeId &&
    !hasPermission(EMPLOYEES.READ)
  ) {
    return <NotFoundPage />;
  }

  return (
    <>
      <PageHeader
        variant="h3"
        title="Certificate Details"
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
        actionButton={
          hasPermission(CERTIFICATION_DETAILS.CREATE) && (
            <RoundActionIconButton
              label="Add Certificate"
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
        title="Delete Certificate Detail"
        content={
          "Are you sure you want to proceed? The selected certificate detail will be deleted."
        }
        open={isConfirmationDialogOpen}
        onClose={handleConfirmationDialogClose}
        onConfirm={() =>
          handleCertificateDetailDelete(certificateDetailToDeleteId)
        }
      />
      <AddCertificate
        open={isPopupOpen}
        onClose={handleClosePopup}
        certificateId={selectedCertificateId}
        existingCertificates={existingCertificates}
        currentCertificate={currentCertificate}
      />
    </>
  );
};

export default Certificates;
