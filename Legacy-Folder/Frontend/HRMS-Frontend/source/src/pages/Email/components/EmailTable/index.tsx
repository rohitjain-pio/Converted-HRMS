import { useEffect, useRef, useState } from "react";
import { Box, Paper } from "@mui/material";

import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import useAsync from "@/hooks/useAsync";
import {
  deleteTemplate,
  getNotifictionTemplateList,
  getTemplateName,
  toggleNotificationTemplateStatus,
} from "@/services/Notification/notificationService";
import {
  deleteTemplateResponse,
  EmailTemplate,
  EmailTemplateName,
  getNotifcationArgs,
  GetNotificationListResponse,
  getTemplateNameList,
  NotificationTemplateSerachFilter,
  ToggleEmailStatus,
} from "@/services/Notification/type";
import methods from "@/utils";
import { FilterFormHandle, initialPagination } from "@/utils/constants";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { VisibilityState } from "@tanstack/table-core";
import { mapSortingToApiParams } from "@/utils/helpers";
import { useTableColumns } from "./useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolbar from "./TableTopToolbaar";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const EmailTable = () => {
  const [emailRows, setEmailRows] = useState<EmailTemplate[]>([]);
  const [filteredRows, setFilteredRows] = useState<EmailTemplate[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [templateTypeList, setTemplateTypeList] = useState<EmailTemplateName[]>(
    []
  );
  const [templateNameFilter, setTemplateNameFilter] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState<number | null>(
    null
  );
  const [senderNameFilter, setSenderNameFilter] = useState("");
  const [senderEmailFilter, setSenderEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<FilterFormHandle>(null);
  const [emailToBeDeleted, setEmailToBeDeleted] = useState<number | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const handleConfirmDelete = () => {
    deleteEmail(Number(emailToBeDeleted));
  };

  const openConfirmationDialog = (emailId: number) => {
    setEmailToBeDeleted(emailId);
    setIsConfirmationDialogOpen(true);
  };

  const closeConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
    setEmailToBeDeleted(null);
  };
  useAsync<GetNotificationListResponse, getNotifcationArgs>({
    requestFn: async (): Promise<GetNotificationListResponse> => {
      return await getNotifictionTemplateList({
        ...mapSortingToApiParams(sorting),
        pageSize: 1000,
        startIndex: 0,
        filters: {
          templateName: "",
          templateType: null,
          senderName: "",
          senderEmail: "",
          status: 0,
        },
        sortColumnDirection: "",
      });
    },
    onSuccess: ({ data }) => {
      const { result } = data;
      setEmailRows(result.emailTemplates);
      setTotalRecords(result.totalRecords || 0);
    },
    autoExecute: true,
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: toggleEmailStatus } = useAsync<ToggleEmailStatus, number>({
    requestFn: async (id: number): Promise<ToggleEmailStatus> => {
      return await toggleNotificationTemplateStatus(id);
    },
    onSuccess: (_, id) => {
      setEmailRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: row.status === 1 ? 0 : 1 } : row
        )
      );
      applyFilters(emailRows);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: deleteEmail } = useAsync<deleteTemplateResponse, number>({
    requestFn: async (id: number): Promise<ToggleEmailStatus> => {
      return await deleteTemplate(id);
    },
    onSuccess: () => {
      toast.success("Email Template Deleted Successfully");
      setIsConfirmationDialogOpen(false)
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useAsync<getTemplateNameList>({
    requestFn: async (): Promise<getTemplateNameList> => {
      return await getTemplateName();
    },
    onSuccess: ({ data }) => {
      setTemplateTypeList(data.result);
    },
    autoExecute: true,
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const applyFilters = (dataToFilter: EmailTemplate[]) => {
    if (!dataToFilter || dataToFilter.length === 0) {
      setFilteredRows([]);
      setTotalRecords(0);
      return;
    }

    const filtered = dataToFilter.filter((row) => {
      const matchesTemplateName =
        !templateNameFilter ||
        row.templateName
          ?.toLowerCase()
          .includes(templateNameFilter.toLowerCase());
      const matchesTemplateType =
        !templateTypeFilter || row.type === templateTypeFilter;
      const matchesSenderName =
        !senderNameFilter ||
        row.senderName?.toLowerCase().includes(senderNameFilter.toLowerCase());
      const matchesSenderEmail =
        !senderEmailFilter ||
        row.senderEmail
          ?.toLowerCase()
          .includes(senderEmailFilter.toLowerCase());

      const matchesStatus =
        statusFilter === null
          ? row.status === 1 || row.status === 0
          : statusFilter === 2
            ? row.status === null
            : row.status === statusFilter;

      return (
        matchesTemplateName &&
        matchesTemplateType &&
        matchesSenderName &&
        matchesSenderEmail &&
        matchesStatus
      );
    });

    const sorted = filtered.sort((a, b) => {
      const dateA = a.modifiedOn ? new Date(a.modifiedOn).getTime() : 0;
      const dateB = b.modifiedOn ? new Date(b.modifiedOn).getTime() : 0;
      return dateB - dateA; 
    });

    setFilteredRows(sorted);
    setTotalRecords(sorted.length);
  };

  useEffect(() => {
    applyFilters(emailRows);
    const active =
      templateNameFilter !== "" ||
      templateTypeFilter !== null ||
      senderNameFilter !== "" ||
      senderEmailFilter !== "" ||
      statusFilter !== null;
    setHasActiveFilters(active);
  }, [
    emailRows,
    templateNameFilter,
    templateTypeFilter,
    senderNameFilter,
    senderEmailFilter,
    statusFilter,
  ]);

  const handleSearch = ({
    templateName,
    templateType,
    senderName,
    senderEmail,
    status,
  }: NotificationTemplateSerachFilter) => {
    setTemplateNameFilter(templateName);
    setTemplateTypeFilter(templateType);
    setSenderNameFilter(senderName);
    setSenderEmailFilter(senderEmail);
    setStatusFilter(status ?? null);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
    setTemplateNameFilter("");
    setTemplateTypeFilter(null);
    setSenderNameFilter("");
    setSenderEmailFilter("");
    setStatusFilter(null);
    setHasActiveFilters(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleCheckboxChange = (id: number) => {
    toggleEmailStatus(id);
  };

  const columns = useTableColumns({
    templateTypeList,
    handleCheckboxChange,
    openConfirmationDialog,
  });

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3} sx={{ padding: 2 }}>
        <PageHeader
          variant="h2"
          hideBorder={true}
          title="Email and Notification"
          actionButton={null}
        />
        <Box sx={{ marginTop: 2 }}>
          <MaterialDataTable<EmailTemplate>
            columns={columns}
            data={filteredRows}
            pagination={pagination}
            sorting={sorting}
            columnVisibility={columnVisibility}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            setColumnVisibility={setColumnVisibility}
            manualPagination={false}
            manualSorting={false}
            topToolbar={() => (
              <TableTopToolbar
                hasActiveFilters={hasActiveFilters}
                setShowFilters={setShowFilters}
                showFilters={showFilters}
                handleFilterFormReset={handleFilterFormReset}
                handleSearch={handleSearch}
                filterFormRef={filterFormRef}
                templateTypeList={templateTypeList}
              />
            )}
          />
        </Box>
        <ConfirmationDialog
          title="Delete Email Template"
          content="Are you sure you want to proceed? The selected item will be permanently deleted."
          open={isConfirmationDialogOpen}
          onClose={closeConfirmationDialog}
          onConfirm={() => handleConfirmDelete()}
        />
      </Paper>
    </>
  );
};
export default EmailTable;
