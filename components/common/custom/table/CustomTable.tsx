"use client";

import {
  Pagination,
  type Selection,
  type SortDescriptor,
  type TableContentProps,
} from "@heroui/react";
import { Table } from "@heroui/react/table";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { PAGE_SIZE } from "@/constant/table";
import { ColumnDef } from "@/types/table";

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowId?: (row: T) => string | number;
  tableContentProps?: Omit<TableContentProps, "children">;
  isLoading: boolean;
  count?: number;
  setPage?: Dispatch<SetStateAction<number>>;
  page?: number;
}

export function CustomTable<T>({
  columns,
  data,
  getRowId,
  tableContentProps,
  isLoading,
  count,
  setPage,
  page = 1,
}: Props<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);

  const sortedData = useMemo(() => {
    const sorted = [...data];

    if (!sortDescriptor) {
      return data;
    }

    const col = sortDescriptor.column as keyof T;

    sorted.sort((a, b) => {
      const first = String(a[col]);
      const second = String(b[col]);
      let cmp = first.localeCompare(second);

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }

      return cmp;
    });

    return sorted;
  }, [data, sortDescriptor]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const start = page * PAGE_SIZE + 1;
  const end = Math.min(start + sortedData.length - 1, count ?? 0);

  const showPagination = !!count;

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Table.Row key={`loading-${idx}`}>
        {columns.map((col) => (
          <Table.Cell key={col.id}>
            <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
          </Table.Cell>
        ))}
      </Table.Row>
    ));
  };

  const renderEmptyState = () => (
    <Table.Row>
      <Table.Cell colSpan={columns.length}>
        <div className="py-6 text-center text-sm text-muted">
          No data available
        </div>
      </Table.Cell>
    </Table.Row>
  );

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          selectedKeys={selectedKeys}
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
          aria-label="table"
          {...tableContentProps}
        >
          {/* HEADER */}
          <Table.Header>
            {columns.map((col) => (
              <Table.Column
                key={col.id}
                id={col.id as string}
                allowsSorting={col.sortable}
                isRowHeader={col.isRowHeader}
                className={col.className}
              >
                {col.header}
              </Table.Column>
            ))}
          </Table.Header>

          <Table.Body>
            {isLoading
              ? renderLoadingRows()
              : sortedData.length > 0
                ? sortedData.map((row) => (
                    <Table.Row key={getRowId?.(row)}>
                      {columns.map((col) => (
                        <Table.Cell key={col.id}>{col.cell(row)}</Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : renderEmptyState()}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>

      {showPagination && (
        <Table.Footer>
          <Pagination size="sm">
            <Pagination.Summary>
              {start} to {end} of {count} results
            </Pagination.Summary>

            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 0}
                  onPress={() => setPage?.((p) => Math.max(0, p - 1))}
                >
                  <Pagination.PreviousIcon />
                  Prev
                </Pagination.Previous>
              </Pagination.Item>

              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item key={i}>
                  <Pagination.Link
                    isActive={i === page}
                    onPress={() => setPage?.(i)}
                  >
                    {i + 1}
                  </Pagination.Link>
                </Pagination.Item>
              ))}

              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page >= totalPages - 1}
                  onPress={() =>
                    setPage?.((p) => Math.min(totalPages - 1, p + 1))
                  }
                >
                  Next
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      )}
    </Table>
  );
}
