import { UserGuide } from "@/services/UserGuide";
import { USER_GUIDE_STATUS_LABEL } from "@/utils/constants";
import { formatUtcToLocal } from "@/utils/date";
import { MRT_ColumnDef } from "material-react-table";
import { useMemo } from "react";
import Stack from "@mui/material/Stack";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const useTableColumns = ({
  onDeleteClick,
}: {
  onDeleteClick: (userGuideId: number) => void;
}) => {
  const columns = useMemo<MRT_ColumnDef<UserGuide>[]>(
    () => [
      {
        header: "Menu",
        accessorKey: "menuName",
        size: 150,
      },
      {
        header: "Title",
        accessorKey: "title",
        size: 250,
      },
      {
        header: "Status",
        id: "status",
        accessorFn: (originalRow) =>
          USER_GUIDE_STATUS_LABEL[originalRow.status],
        size: 150,
      },
      {
        header: "Created On",
        id: "createdOn",
        accessorFn: (originalRow) => {
          const { createdOn } = originalRow;

          if (createdOn && typeof createdOn === "string") {
            return formatUtcToLocal(createdOn, { format: "MMM Do, YYYY" });
          }

          return null;
        },
        size: 150,
      },
      {
        header: "Created By",
        accessorKey: "createdBy",
        enableSorting: false,
        size: 250,
      },
      {
        header: "Last Updated On",
        id: "modifiedOn",
        accessorFn: (originalRow) => {
          const { modifiedOn } = originalRow;

          if (modifiedOn && typeof modifiedOn === "string") {
            return formatUtcToLocal(modifiedOn, { format: "MMM Do, YYYY" });
          }

          return null;
        },
        size: 150,
      },
      {
        header: "Last Updated By",
        accessorKey: "modifiedBy",
        enableSorting: false,
        size: 150,
      },
      {
        header: "Actions",
        visibleInShowHideMenu: false,
        id: "actions",
        size: 120,
        enableSorting: false,
        enablePinning: true,
        accessorFn: (row) => {
          const userGuideId = row?.id;

          return (
            <Stack
              role="group"
              aria-label="Action buttons"
              direction="row"
              gap="10px"
            >
              <ActionIconButton
                component={Link}
                to={`${userGuideId}/edit`}
                label="Edit"
                icon={<EditIcon />}
              />
              <ActionIconButton
                onClick={() => onDeleteClick(userGuideId)}
                colorType="error"
                label="Delete"
                icon={<DeleteIcon />}
              />
            </Stack>
          );
        },
      },
    ],
    []
  );

  return columns;
};
