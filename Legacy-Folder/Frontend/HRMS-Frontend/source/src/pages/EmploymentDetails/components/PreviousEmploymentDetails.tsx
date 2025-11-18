import { Delete, KeyboardArrowDown } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import moment from "moment";
import { useEffect, useState } from "react";
import { EmploymentPanelProps } from "..";
import { useUserStore } from "@/store";
import {
  DeletePreviousEmployerApiResponse,
  DeletePreviousEmployerDocumentApiResponse,
  DeleteProfessionalReferenceApiResponse,
  EmployerDocument,
  GetPreviousEmployersApiResponse,
  PreviousEmployer,
  ProfessionalReference,
} from "@/services/EmploymentDetails";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import useAsync from "@/hooks/useAsync";
import {
  deletePreviousEmployer,
  deletePreviousEmployerDocument,
  deleteProfessionalReference,
  getPreviousEmployers,
} from "@/services/EmploymentDetails/employmentDetailsService";
import methods from "@/utils";
import PageHeader from "@/components/PageHeader/PageHeader";
import LabelValue from "@/components/LabelValue";
import DataTable from "@/components/DataTable/DataTable";
import DocumentDialog from "@/pages/EmploymentDetails/components/DocumentDialog";
import PreviousEmployerDialog from "@/pages/EmploymentDetails/components/PreviousEmployerDialog/index";
import ProfessionalReferenceDialog from "@/pages/EmploymentDetails/components/ProfessionalReferenceDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { toast } from "react-toastify";
import ReferenceMultiform from "@/pages/EmploymentDetails/components/ReferenceMultiform/index";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSearchParams } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";

type PreviousEmployerProps = EmploymentPanelProps;

const PreviousEmploymentDetails = (props: PreviousEmployerProps) => {
  const { expanded, onAccordionToggle } = props;
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { PREVIOUS_EMPLOYER, PROFESSIONAL_REFERENCE, EMPLOYEES } =
    permissionValue;

  const [previousEmployersData, setPreviousEmployersData] = useState<
    PreviousEmployer[]
  >([]);
  const [isPreviousEmployerDialogOpen, setIsPreviousEmployerDialogOpen] =
    useState(false);

  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedPreviousEmployerId, setSelectedPreviousEmployerId] = useState<
    number | null
  >(null);
  const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);

  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: "employer" | "document" | "reference";
  } | null>(null);

  const [itemToEdit, setItemToEdit] = useState<{
    id: number;
    type: "employer" | "reference";
  } | null>(null);

  const [isReferenceMultiformDialogOpen, setIsReferenceMultiformDialogOpen] =
    useState(false);

  const [
    existingPreviousEmployerDocuments,
    setExistingPreviousEmployerDocuments,
  ] = useState<string[]>([]);

  const [professionalReferencesLength, setProfessionalReferencesLength] =
    useState(0);

  const employerDocumentTableHeaderCells = [
    {
      label: "S.No",
      accessor: "sNo",
      width: "50px",
      renderColumn: (_: EmployerDocument, index: number) => index + 1,
    },
    {
      label: "Document Name",
      accessor: "documentName",
      width: "50px",
    },
    {
      label: "Attachment",
      accessor: "attachment",
      width: "50px",
      renderColumn: (row: EmployerDocument) => (
        <ViewDocument
          filename={row.fileName}
          containerType={2}
          hasPreviewPermission={hasPermission(PREVIOUS_EMPLOYER.VIEW)}
        />
      ),
    },
    ...(hasPermission(PREVIOUS_EMPLOYER.DELETE)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "100px",
            renderColumn: (row: EmployerDocument) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {/* <ActionIconButton
              label="Edit"
              colorType="primary"
              icon={<EditIcon />}
            /> */}
                <ActionIconButton
                  label="Delete Document"
                  colorType="error"
                  icon={<Delete />}
                  onClick={() => openConfirmationDialog(row.id, "document")}
                />
              </Box>
            ),
          },
        ]
      : []),
  ];

  const professionalReferenceTableHeaderCells = [
    {
      label: "S.No",
      accessor: "sNo",
      width: "50px",
      renderColumn: (_: ProfessionalReference, index: number) => index + 1,
    },
    {
      label: "Full Name",
      accessor: "fullName",
      width: "50px",
    },
    {
      label: "Email",
      accessor: "email",
      width: "50px",
    },
    {
      label: "Designation",
      accessor: "designation",
      width: "50px",
    },
    {
      label: "Contact Number",
      accessor: "contactNumber",
      width: "50px",
    },
    ...(hasPermission(PROFESSIONAL_REFERENCE.EDIT) ||
    hasPermission(PROFESSIONAL_REFERENCE.DELETE)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "100px",
            renderColumn: (row: ProfessionalReference) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(PROFESSIONAL_REFERENCE.EDIT) && (
                  <ActionIconButton
                    label="Edit Reference"
                    colorType="primary"
                    icon={<EditIcon />}
                    onClick={() => {
                      setItemToEdit({ id: row.id, type: "reference" });
                      setIsReferenceDialogOpen(true);
                    }}
                  />
                )}
                {hasPermission(PROFESSIONAL_REFERENCE.DELETE) && (
                  <ActionIconButton
                    label="Delete Reference"
                    colorType="error"
                    icon={<Delete />}
                    onClick={() => openConfirmationDialog(row.id, "reference")}
                  />
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  const openPreviousEmployerDialog = () => {
    setIsPreviousEmployerDialogOpen(true);
  };

  const closePreviousEmployerDialog = () => {
    fetchPreviousEmployers();
    setIsPreviousEmployerDialogOpen(false);
    setItemToEdit(null);
  };

  const openDocumentDialog = (
    previousEmployerId: number,
    previousEmployerDocumentList: EmployerDocument[]
  ) => {
    setSelectedPreviousEmployerId(previousEmployerId);
    setIsDocumentDialogOpen(true);
    setExistingPreviousEmployerDocuments(
      previousEmployerDocumentList.map((doc) =>
        doc.employerDocumentTypeId.toString()
      )
    );
  };

  const closeDocumentDialog = () => {
    setSelectedPreviousEmployerId(null);
    setIsDocumentDialogOpen(false);
    setExistingPreviousEmployerDocuments([]);
    fetchPreviousEmployers();
  };

  const openReferenceMultiformDialog = (
    previousEmployerId: number,
    professionalReferences: ProfessionalReference[]
  ) => {
    setSelectedPreviousEmployerId(previousEmployerId);
    setIsReferenceMultiformDialogOpen(true);
    setProfessionalReferencesLength(professionalReferences.length);
  };

  const closeReferenceMultiformDialog = () => {
    setSelectedPreviousEmployerId(null);
    setIsReferenceMultiformDialogOpen(false);
    fetchPreviousEmployers();
  };

  const closeReferenceDialog = () => {
    setIsReferenceDialogOpen(false);
    fetchPreviousEmployers();
    setItemToEdit(null);
  };

  const openConfirmationDialog = (
    id: number,
    type: "employer" | "document" | "reference"
  ) => {
    setIsConfirmationDialogOpen(true);
    setItemToDelete({ id, type });
  };

  const closeConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = (
    itemToDelete: {
      id: number;
      type: "employer" | "document" | "reference";
    } | null
  ) => {
    if (!itemToDelete) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    const { id, type } = itemToDelete;

    if (type === "employer") {
      removePreviousEmployer(id);
    } else if (type === "document") {
      removePreviousEmployerDocument(id);
    } else if (type === "reference") {
      removeProfessionalReference(id);
    }
  };

  const { execute: fetchPreviousEmployers } =
    useAsync<GetPreviousEmployersApiResponse>({
      requestFn: async (): Promise<GetPreviousEmployersApiResponse> => {
        return await getPreviousEmployers({
          sortColumnName: "endDate",
          sortDirection: "desc",
          startIndex: 0,
          pageSize: 0,
          filters: {
            employeeId: employeeId ? +employeeId : +userData.userId,
            employerName: "",
            documentName: "",
          },
        });
      },
      onSuccess: ({ data }) => {
        const { previousEmployerList } = data.result;
        setPreviousEmployersData(previousEmployerList);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });

  const { execute: removePreviousEmployer } = useAsync<
    DeletePreviousEmployerApiResponse,
    number
  >({
    requestFn: async (
      id: number
    ): Promise<DeletePreviousEmployerApiResponse> => {
      return await deletePreviousEmployer(id);
    },
    onSuccess: () => {
      toast.success("Previous Employer deleted successfully");
      fetchPreviousEmployers();
      closeConfirmationDialog();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: removeProfessionalReference } = useAsync<
    DeleteProfessionalReferenceApiResponse,
    number
  >({
    requestFn: async (
      id: number
    ): Promise<DeleteProfessionalReferenceApiResponse> => {
      return await deleteProfessionalReference(id);
    },
    onSuccess: () => {
      toast.success("Professional reference deleted successfully");
      fetchPreviousEmployers();
      closeConfirmationDialog();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: removePreviousEmployerDocument } = useAsync<
    DeletePreviousEmployerDocumentApiResponse,
    number
  >({
    requestFn: async (
      id: number
    ): Promise<DeletePreviousEmployerDocumentApiResponse> => {
      return await deletePreviousEmployerDocument(id);
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");
      fetchPreviousEmployers();
      closeConfirmationDialog();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchPreviousEmployers();
  }, [employeeId]);

  if (
    employeeId &&
    userData.userId != employeeId &&
    !hasPermission(EMPLOYEES.READ)
  ) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={onAccordionToggle("previousEmployment")}
        disableGutters
        sx={{ border: "1px solid rgba(0  0  0 / .125)" }}
        slotProps={{ transition: { unmountOnExit: true, mountOnEnter: true } }}
      >
        <AccordionSummary
          expandIcon={<KeyboardArrowDown />}
          sx={{ backgroundColor: "rgba(0  0  0 / .03)" }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Box flexGrow={1}>
              <Typography>Previous Employment Details</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails
          sx={{ borderTop: "1px solid rgba(0  0  0 / .125)", padding: "16px" }}
        >
          <>
            <Stack spacing={3}>
              {hasPermission(PREVIOUS_EMPLOYER.CREATE) && (
                <Stack direction="row" justifyContent="flex-end">
                  <RoundActionIconButton
                    label="Add new employer"
                    size="medium"
                    onClick={() => {
                      openPreviousEmployerDialog();
                    }}
                    icon={<AddIcon />}
                  />
                </Stack>
              )}
              {previousEmployersData.length ? (
                previousEmployersData.map(
                  ({
                    id,
                    employerName,
                    designation,
                    startDate,
                    endDate,
                    documents,
                    professionalReferences,
                  }) => (
                    <Paper elevation={3} sx={{ padding: "16px" }}>
                      <Box>
                        <PageHeader
                          variant="h4"
                          title={employerName}
                          actionButton={
                            <Stack direction="row" gap={1}>
                              {hasPermission(PREVIOUS_EMPLOYER.EDIT) && (
                                <RoundActionIconButton
                                  label="Edit"
                                  size="small"
                                  onClick={() => {
                                    setItemToEdit({ id, type: "employer" });
                                    setIsPreviousEmployerDialogOpen(true);
                                  }}
                                  icon={<EditIcon />}
                                />
                              )}
                              {hasPermission(PREVIOUS_EMPLOYER.DELETE) && (
                                <RoundActionIconButton
                                  label="Delete"
                                  size="small"
                                  onClick={() =>
                                    openConfirmationDialog(id, "employer")
                                  }
                                  icon={<DeleteIcon />}
                                  color="error"
                                />
                              )}
                            </Stack>
                          }
                          containerStyles={{ paddingX: 0, paddingTop: 0 }}
                        />
                        <Box paddingY="30px">
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <LabelValue
                                label="Employer Name"
                                value={employerName}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <LabelValue
                                label="Designation"
                                value={designation}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <LabelValue
                                label="Start Date"
                                value={moment(startDate, "YYYY-MM-DD").format(
                                  "MMM Do, YYYY"
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <LabelValue
                                label="End Date"
                                value={moment(endDate, "YYYY-MM-DD").format(
                                  "MMM Do, YYYY"
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                        <PageHeader
                          title="Documents"
                          actionButton={
                            hasPermission(PREVIOUS_EMPLOYER.CREATE) && (
                              <RoundActionIconButton
                                label="Add Document"
                                size="small"
                                onClick={() =>
                                  openDocumentDialog(id, documents)
                                }
                                icon={<AddIcon />}
                              />
                            )
                          }
                          containerStyles={{ paddingX: 0 }}
                        />
                        <DataTable
                          data={documents}
                          headerCells={employerDocumentTableHeaderCells}
                          hidePagination
                        />
                        {hasPermission(PROFESSIONAL_REFERENCE.READ) && (
                          <>
                            <PageHeader
                              title="Professional References"
                              actionButton={
                                hasPermission(PROFESSIONAL_REFERENCE.CREATE) &&
                                professionalReferences.length < 3 && (
                                  <RoundActionIconButton
                                    label="Add Reference"
                                    size="small"
                                    onClick={() =>
                                      openReferenceMultiformDialog(
                                        id,
                                        professionalReferences
                                      )
                                    }
                                    icon={<AddIcon />}
                                  />
                                )
                              }
                              containerStyles={{ paddingX: 0 }}
                            />
                            <DataTable
                              data={professionalReferences}
                              headerCells={
                                professionalReferenceTableHeaderCells
                              }
                              hidePagination
                            />
                          </>
                        )}
                      </Box>
                    </Paper>
                  )
                )
              ) : (
                <Stack direction="row" justifyContent="center">
                  No data available. Please add a previous employer.
                </Stack>
              )}
            </Stack>
          </>
        </AccordionDetails>
      </Accordion>
      <PreviousEmployerDialog
        open={isPreviousEmployerDialogOpen}
        onClose={closePreviousEmployerDialog}
        mode={itemToEdit && itemToEdit.type === "employer" ? "edit" : "add"}
        previousEmployerId={
          itemToEdit && itemToEdit.type === "employer"
            ? itemToEdit.id
            : undefined
        }
      />
      {selectedPreviousEmployerId ? (
        <DocumentDialog
          open={isDocumentDialogOpen}
          onClose={closeDocumentDialog}
          previousEmployerId={selectedPreviousEmployerId}
          existingDocuments={existingPreviousEmployerDocuments}
        />
      ) : null}
      {itemToEdit && itemToEdit.type === "reference" ? (
        <ProfessionalReferenceDialog
          open={isReferenceDialogOpen}
          onClose={closeReferenceDialog}
          professionalReferenceId={
            itemToEdit && itemToEdit.type === "reference"
              ? itemToEdit.id
              : undefined
          }
        />
      ) : null}
      {itemToDelete && isConfirmationDialogOpen ? (
        <ConfirmationDialog
          title={`Delete ${
            itemToDelete.type === "employer"
              ? "Previous Employer"
              : itemToDelete.type === "reference"
                ? "Professional Reference"
                : "Document"
          }`}
          content={
            "Are you sure you want to proceed? The selected item will be permanently deleted."
          }
          open={isConfirmationDialogOpen}
          onClose={closeConfirmationDialog}
          onConfirm={() => handleConfirmDelete(itemToDelete)}
        />
      ) : null}
      {selectedPreviousEmployerId ? (
        <ReferenceMultiform
          open={isReferenceMultiformDialogOpen}
          onClose={closeReferenceMultiformDialog}
          previousEmployerId={selectedPreviousEmployerId}
          professionalReferencesLength={professionalReferencesLength}
        />
      ) : null}
    </>
  );
};

export default PreviousEmploymentDetails;
