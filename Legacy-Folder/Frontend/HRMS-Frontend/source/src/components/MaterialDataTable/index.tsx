import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { MaterialDataTableProps } from "@/components/MaterialDataTable/type";
import { TableBottomToolbar } from "@/components/MaterialDataTable/TableBottomToolBar";

const MaterialDataTable = <T extends object>({
  columns,
  data,
  pagination,
  sorting,
  columnVisibility={},
  totalRecords,
  setPagination,
  setSorting,
  setColumnVisibility=()=>{},
  topToolbar,
  options,
  initialState,
  manualSorting = true,
  manualPagination = true,
  manualFiltering = true,
  columnOrder = [],
  setColumnOrder = () => {},
  enableFilters = false,
  enableDensityToggle = false,
  enableColumnActions = false,
}: MaterialDataTableProps<T>) => {
  const table = useMaterialReactTable<T>({
    columns,
    data,
    manualSorting,
    manualPagination,
    manualFiltering,
    enableFilters,
    enableDensityToggle,
    enableColumnActions,
    enablePinning: true,
    autoResetPageIndex: false,
    enableRowNumbers: true,
    initialState: {
      columnPinning: { right: ["actions"] },
      ...initialState,
    },
    displayColumnDefOptions: {
      "mrt-row-numbers": {
        Header: "S.No",
        header: "S.No",
        size: 20,
        visibleInShowHideMenu: false,
        enableHiding: false,
        enablePinning: true,
      },
    },
    state: {
      columnVisibility,
      pagination,
      sorting,
      columnOrder: columnOrder,
    },

    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    rowCount: totalRecords,
    renderTopToolbarCustomActions: topToolbar,
    
renderBottomToolbarCustomActions:
      options?.renderBottomToolbarCustomActions ??
      (() => (
        <TableBottomToolbar
          totalRecords={totalRecords}
          pagination={pagination}
          setPagination={setPagination}
        />
      )),

    muiPaginationProps: {
      showFirstButton: true,
      showLastButton: true,
      rowsPerPageOptions: [10, 25, 50, 100],
    },

    muiTableHeadRowProps: {
      sx: {
        bgcolor: "#1E75BB",
      },
    },
    muiTableHeadCellProps: {
      sx: (theme) => ({
        color: theme.palette.primary.contrastText,
        textTransform: "inherit",
        "&:not(:last-of-type)": {
          position: "sticky !important",
        },
        "& .Mui-TableHeadCell-Content-Labels": {
          "& .MuiTableSortLabel-icon": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
          "& :hover": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
          "& .Mui-active": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
        },
      }),
    },

    ...options,
  });

  return <MaterialReactTable table={table} />;
};

export default MaterialDataTable;
