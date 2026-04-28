import type { Key } from "react";

type ColumnHeaderProps = {
  sortDirection?: "ascending" | "descending";
};

export type ColumnDef<T> = {
  id: Key;
  header: React.ReactNode | ((props: ColumnHeaderProps) => React.ReactNode);
  sortable?: boolean;
  isRowHeader?: boolean;
  className?: string;
  cell: (row: T) => React.ReactNode;
};
