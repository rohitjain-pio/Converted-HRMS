import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_TableOptions,
} from "material-react-table";
import { VisibilityState } from "@tanstack/table-core";
import type { OnChangeFn } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

export interface MaterialDataTableProps<T extends object> {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  pagination: MRT_PaginationState;
  columnOrder?: string[];
  setColumnOrder?: Dispatch<SetStateAction<string[]>>;
  sorting: MRT_SortingState;
  columnVisibility?: VisibilityState;
  totalRecords: number;
  setPagination: OnChangeFn<MRT_PaginationState>;
  setSorting: OnChangeFn<MRT_SortingState>;
  setColumnVisibility?: OnChangeFn<VisibilityState>;
  topToolbar?: () => JSX.Element;

  options?: Partial<MRT_TableOptions<T>>;

  initialState?: Partial<{
    columnPinning?: { left?: string[]; right?: string[] };
  }>;
  manualSorting?: boolean;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  enableFilters?: boolean;
  enableDensityToggle?: boolean;
  enableColumnActions?: boolean;
}
