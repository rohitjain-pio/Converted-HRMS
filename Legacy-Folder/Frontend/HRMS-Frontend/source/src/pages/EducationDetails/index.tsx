import PageHeader from "@/components/PageHeader/PageHeader";
import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Delete } from "@mui/icons-material";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  deleteEducationDetail,
  DeleteEducationDetailApiResponse,
  EducationDetailType,
  getEducationDetails,
  GetEducationDetailsApiResponse,
} from "@/services/EducationDetails";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { useUserStore } from "@/store";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import DataTable from "@/components/DataTable/DataTable";
import { toast } from "react-toastify";
import EducationDetailDialog from "@/pages/EducationDetails/components/EducationDetailDialog/index";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import { useSearchParams } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import ViewDocument from "../ExitEmployee/components/ViewDocument";

const EducationDetails = () => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { EDUCATIONAL_DETAILS, EMPLOYEES } = permissionValue;
  const [educationDetailsData, setEducationDetailsData] = useState<
    EducationDetailType[]
  >([]);
  const [educationDetailToDeleteId, setEducationDetailToDeleteId] = useState<
    number | null
  >(null);

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [isEducationDetailDialogOpen, setIsEducationDetailDialogOpen] =
    useState(false);
  const [educationDetailToEditedId, setEducationDetailToEditedId] = useState<
    number | null
  >(null);
  const [currentQualification, setCurrentQualification] = useState<string>("");

  const headerCells = [
    {
      label: "S.No",
      accessor: "sNo",
      width: "50px",
      renderColumn: (_: EducationDetailType, index: number) => index + 1,
    },
    {
      label: "Qualification",
      accessor: "qualificationName",
      width: "50px",
    },
    {
      label: "Degree",
      accessor: "degreeName",
      width: "50px",
    },
    {
      label: "College/University",
      accessor: "collegeUniversity",
      width: "50px",
    },
    {
      label: "Start Year",
      accessor: "startYear",
      width: "50px",
      renderColumn: (row: EducationDetailType) =>
        moment(row.startYear, "MM-YYYY").format("MMM YYYY"),
    },
    {
      label: "End Year",
      accessor: "endYear",
      width: "50px",
      renderColumn: (row: EducationDetailType) =>
        moment(row.endYear, "MM-YYYY").format("MMM YYYY"),
    },
    {
      label: "Aggregate Percentage",
      accessor: "aggregatePercentage",
      width: "50px",
      renderColumn: (row: EducationDetailType) => `${row.aggregatePercentage}%`,
    },
     ...(hasPermission(EDUCATIONAL_DETAILS.VIEW)
      ? [
          {
            label: "Attachment",
            accessor: "attachment",
            width: "50px",
            renderColumn: (row: EducationDetailType) => (
              <ViewDocument filename={row.fileName} containerType={1} />
            ),
          },
        ]
      : []),
    ...(hasPermission(EDUCATIONAL_DETAILS.EDIT) ||
    hasPermission(EDUCATIONAL_DETAILS.DELETE)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "100px",
            renderColumn: (row: EducationDetailType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(EDUCATIONAL_DETAILS.EDIT) && (
                  <ActionIconButton
                    label="Edit Education"
                    colorType="primary"
                    onClick={() => openEditEducationDetailDialog(row)}
                    icon={<EditIcon />}
                  />
                )}
                {hasPermission(EDUCATIONAL_DETAILS.DELETE) && (
                  <ActionIconButton
                    label="Delete Education"
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

  const openDeleteDialog = (id: number) => {
    setIsConfirmationDialogOpen(true);
    setEducationDetailToDeleteId(id);
  };

  const handleConfirmationDialogClose = () => {
    setIsConfirmationDialogOpen(false);
  };

  const handleEducationDetailDelete = (id: number | null) => {
    try {
      if (!id) {
        throw new Error(
          "The provided id is invalid. Expected a number. Instead got null value"
        );
      }
      removeEducationDetail(id);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.stack);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const openEducationDetailDialog = () => {
    setIsEducationDetailDialogOpen(true);
    setCurrentQualification("");
  };

  const closeEducationDetailDialog = () => {
    setIsEducationDetailDialogOpen(false);
    setEducationDetailToEditedId(null);
    setCurrentQualification("");
    fetchEducationDetails();
  };

  const openEditEducationDetailDialog = (
    educationDetail: EducationDetailType
  ) => {
    setEducationDetailToEditedId(educationDetail.id);
    setIsEducationDetailDialogOpen(true);
    setCurrentQualification(educationDetail.qualificationId.toString());
  };

  const payload = {
    sortColumnName: "qualificationId",
    sortDirection: "desc",
    startIndex: 0,
    pageSize: 0,
    filters: {
      employeeId: employeeId ? +employeeId : +userData.userId,
    },
  };

  const { execute: fetchEducationDetails } =
    useAsync<GetEducationDetailsApiResponse>({
      requestFn: async (): Promise<GetEducationDetailsApiResponse> => {
        return await getEducationDetails(payload);
      },
      onSuccess: ({ data }) => {
        if (data.result) {
          const { eduDocResponseList } = data.result;
          setEducationDetailsData(eduDocResponseList);
        } else {
          setEducationDetailsData([]);
        }
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });

  const { execute: removeEducationDetail } = useAsync<
    DeleteEducationDetailApiResponse,
    number
  >({
    requestFn: async (
      id: number
    ): Promise<DeleteEducationDetailApiResponse> => {
      return await deleteEducationDetail(id);
    },
    onSuccess: () => {
      toast.success("Education detail deleted successfully");
      fetchEducationDetails();
      setIsConfirmationDialogOpen(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchEducationDetails();
  }, [employeeId]);

  const existingQualification = educationDetailsData.map((detail) =>
    detail.qualificationId?.toString()
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
        title="Education Details"
        actionButton={
          hasPermission(EDUCATIONAL_DETAILS.CREATE) && (
            <RoundActionIconButton
              label="Add Education"
              size="small"
              onClick={openEducationDetailDialog}
              icon={<AddIcon />}
            />
          )
        }
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
      />
      <Box>
        <DataTable
          data={educationDetailsData}
          headerCells={headerCells}
          hidePagination
        />
      </Box>
      <ConfirmationDialog
        title="Delete Education Detail"
        content={
          "Are you sure you want to proceed? The selected education detail will be permanently deleted."
        }
        open={isConfirmationDialogOpen}
        onClose={handleConfirmationDialogClose}
        onConfirm={() => handleEducationDetailDelete(educationDetailToDeleteId)}
      />
      <EducationDetailDialog
        open={isEducationDetailDialogOpen}
        onClose={closeEducationDetailDialog}
        mode={educationDetailToEditedId !== null ? "edit" : "add"}
        educationDetailId={
          educationDetailToEditedId !== null
            ? educationDetailToEditedId
            : undefined
        }
        existingQualification={existingQualification as string[]}
        currentQualification={currentQualification as string}
      />
    </>
  );
};

export default EducationDetails;
