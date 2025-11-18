import { useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Stack, Switch } from "@mui/material";
import { Link } from "react-router-dom";
import {
  EMAIL_TYPE_LABELS,
  EmailTemplateStatus,
  EmailType,
} from "@/utils/constants";
import EditIcon from "@mui/icons-material/Edit";

import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { EmailTemplate, EmailTemplateName } from "@/services/Notification";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDate } from "@/utils/formatDate";

type UseTableColumnsProps = {
  templateTypeList: EmailTemplateName[];
  handleCheckboxChange: (id: number) => void;
  openConfirmationDialog: (emailId: number) => void;
};

export const useTableColumns = ({
  templateTypeList,
  handleCheckboxChange,
  openConfirmationDialog,
}: UseTableColumnsProps) => {
  const columns = useMemo<MRT_ColumnDef<EmailTemplate>[]>(
    () => [
      { header: "Template Name", accessorKey: "templateName", size: 200 },
      {
        header: "Template Type",
        accessorKey: "type",
        size: 210,

        Cell: ({ row }) => {
          return EMAIL_TYPE_LABELS[row.original.type as EmailType];
        },
      },
      {
        header: "Subject",
        accessorKey: "subject",
        size: 250,
        Cell: ({ row }) => (
          <TruncatedText
            text={row.original.subject}
            tooltipTitle={row.original.subject}
            maxLength={30}
          />
        ),
      },
      { header: "Sender", accessorKey: "senderName", size: 200 },
      {
        header: "Sender Email",
        accessorKey: "senderEmail",
        size: 200,
        Cell: ({ row }) => (
          <TruncatedText
            text={row.original.senderEmail}
            tooltipTitle={row.original.senderEmail}
            maxLength={30}
          />
        ),
      },
      {
        header: "Created On",
        accessorKey: "createdOn",
        size: 200,
        Cell: ({ row }) => formatDate(row.original.createdOn),
      },
      {
        header: "Modified On",
        accessorKey: "modifiedOn",
        size: 200,
        Cell: ({ row }) =>
          row.original.modifiedOn ? formatDate(row.original.modifiedOn) : "N/A",
      },

      {
        header: "Actions",
        id: "actions",
        size: 120,
        enablePinning: true,
        enableSorting: false,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            {row.original.status !== null && (
              <Switch
                checked={row.original.status === EmailTemplateStatus.Active}
                onChange={() => handleCheckboxChange(row.original.id)}
                color="primary"
              />
            )}
            <ActionIconButton
              label="Edit Email Template"
              colorType="primary"
              as={Link}
              icon={<EditIcon />}
              to={`/settings/email-and-notification/edit/${row.original.id}`}
            />
            {row.original.status == 0 && (
              <ActionIconButton
                label="Delete EmailTemplate"
                size="small"
                onClick={() => openConfirmationDialog(Number(row.original.id))}
                icon={<DeleteIcon />}
                colorType="error"
              />
            )}
          </Stack>
        ),
      },
    ],
    [templateTypeList]
  );

  return columns;
};
