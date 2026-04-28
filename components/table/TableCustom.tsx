"use client";

import { ColumnDef } from "@/types/table";
import type { Selection, SortDescriptor } from "@heroui/react";
import { Table } from "@heroui/react/table";
import { useMemo, useState } from "react";

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowId?: (row: T) => string | number;
}

export function TableCustom<T>({ columns, data, getRowId }: Props<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: (columns[0]?.id as string) ?? "",
    direction: "ascending",
  });

  const sortedData = useMemo(() => {
    const sorted = [...data];

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

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          {/* HEADER */}
          <Table.Header>
            {/* selection column */}
            <Table.Column className="pr-0">Select</Table.Column>

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

          {/* BODY */}
          <Table.Body>
            {sortedData.map((row) => (
              <Table.Row key={getRowId?.(row)}>
                {/* selection cell */}
                <Table.Cell className="pr-0">
                  {/* keep your checkbox here */}
                  ...
                </Table.Cell>

                {columns.map((col) => (
                  <Table.Cell key={col.id}>{col.cell(row)}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
