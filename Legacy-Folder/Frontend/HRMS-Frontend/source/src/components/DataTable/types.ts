export type Order = "asc" | "desc";

interface ObjectType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface TableColumn {
  label: string;
  accessor: string;
  enableSorting?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderColumn?: (row: any, index: number) => React.ReactNode;
  width?: string;
  maxLength?: number;
}

export interface DataTableHeaderProps {
  order: Order;
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  headerCells: TableColumn[];
}

export interface DataTableProps {
  data: ObjectType[];
  headerCells: TableColumn[];
  setSortColumnName?: (columnName: string) => void;
  setSortDirection?: (direction: string) => void;
  setStartIndex?: (startIndex: number) => void;
  setPageSize?: (pageSize: number) => void;
  pageSize?: number;
  startIndex?: number;
  totalRecords?: number;
  hidePagination?: boolean;
}
