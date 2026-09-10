import { cls } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import {
   type ContextProp,
   type FillerRowProps,
   type ItemProps,
   TableVirtuoso,
   type TableProps as VirtuosoTableProps,
} from "react-virtuoso";
import "./Table.css";

export interface TableColumn<Row> {
   id: string;
   header: React.ReactNode;
   headerProps?: Omit<React.ComponentPropsWithoutRef<"th">, "children">;
   compare?: (a: Row, b: Row) => number;
}

export interface TableSort {
   columnId: string;
   direction: "asc" | "desc";
}

export interface TableVirtualization {
   scrollParent: HTMLElement | null;
}

type RowProps = Omit<React.ComponentPropsWithoutRef<"tr">, "children">;
type NativeTableProps = Omit<React.ComponentPropsWithoutRef<"table">, "children">;

export interface TableProps<Row> extends NativeTableProps {
   rows: readonly Row[];
   rowKey: (row: Row) => React.Key;
   columns: readonly TableColumn<Row>[];
   renderCells: (row: Row) => React.ReactNode;
   rowProps?: (row: Row) => RowProps;
   defaultSort?: TableSort;
   emptyContent?: React.ReactNode;
   virtualize?: false | TableVirtualization;
}

interface TableContext<Row> {
   tableProps: NativeTableProps;
   rowProps?: (row: Row) => RowProps;
   columnCount: number;
   emptyContent?: React.ReactNode;
}

function VirtualTable<Row>({ context, style, ...props }: VirtuosoTableProps & ContextProp<TableContext<Row>>) {
   return <table {...context.tableProps} {...props} style={{ ...context.tableProps.style, ...style }} />;
}

function VirtualTableRow<Row>({ context, item, style, ...props }: ItemProps<Row> & ContextProp<TableContext<Row>>) {
   const rowProps = context.rowProps?.(item);
   return <tr {...rowProps} {...props} style={{ ...rowProps?.style, ...style }} />;
}

function VirtualEmpty<Row>({ context }: ContextProp<TableContext<Row>>) {
   return (
      <tbody>
         {context.emptyContent != null && (
            <tr>
               <td colSpan={context.columnCount}>{context.emptyContent}</td>
            </tr>
         )}
      </tbody>
   );
}

function VirtualFiller<Row>({ context, height }: FillerRowProps & ContextProp<TableContext<Row>>) {
   return (
      <tr className="table-filler">
         <td colSpan={context.columnCount} style={{ height, padding: 0, border: 0 }} />
      </tr>
   );
}

const VirtualComponents = {
   Table: VirtualTable,
   TableRow: VirtualTableRow,
   EmptyPlaceholder: VirtualEmpty,
   FillerRow: VirtualFiller,
};

export function Table<Row>({
   rows,
   rowKey,
   columns,
   renderCells,
   rowProps,
   defaultSort,
   emptyContent,
   virtualize = false,
   className,
   ...nativeProps
}: TableProps<Row>): React.ReactNode {
   const [sort, setSort] = useState<TableSort | undefined>(defaultSort);
   function toggleSort(columnId: string): void {
      setSort((previous) => {
         if (previous?.columnId !== columnId) {
            return { columnId, direction: "asc" };
         }
         return previous.direction === "asc" ? { columnId, direction: "desc" } : undefined;
      });
   }
   const sortColumn = columns.find((column) => column.id === sort?.columnId && column.compare);
   // Game-state updates can mutate row data without changing the array identity.
   const sortedRows = [...rows];
   if (sortColumn?.compare && sort) {
      const compare = sortColumn.compare;
      const direction = sort.direction === "asc" ? 1 : -1;
      sortedRows.sort((a, b) => direction * compare(a, b));
   }
   const columnCount = Math.max(
      1,
      columns.reduce((count, column) => count + (column.headerProps?.colSpan ?? 1), 0),
   );
   const header = (
      <tr>
         {columns.map((column) => {
            const direction = sortColumn?.id === column.id ? sort?.direction : undefined;
            return (
               <th key={column.id} {...column.headerProps}>
                  {column.compare ? (
                     <div
                        className={cls("row fstart g0 pointer", direction ? "text-primary" : null)}
                        onClick={() => toggleSort(column.id)}
                     >
                        <div>{column.header}</div>
                        <div className={cls("mi sm", direction ? null : "text-dimmed")}>
                           {direction === "asc" ? "north" : direction === "desc" ? "south" : "swap_vert"}
                        </div>
                     </div>
                  ) : (
                     column.header
                  )}
               </th>
            );
         })}
      </tr>
   );
   const tableProps = { ...nativeProps, className: cls("data-table", className) };

   if (virtualize && virtualize.scrollParent) {
      return (
         <TableVirtuoso<Row, TableContext<Row>>
            data={sortedRows}
            computeItemKey={(_, row) => rowKey(row)}
            components={VirtualComponents}
            context={{ tableProps, rowProps, columnCount, emptyContent }}
            customScrollParent={virtualize.scrollParent}
            fixedHeaderContent={() => header}
            itemContent={(_, row) => renderCells(row)}
         />
      );
   }

   return (
      <table {...tableProps}>
         <thead>{header}</thead>
         <tbody>
            {sortedRows.map((row) => (
               <tr {...rowProps?.(row)} key={rowKey(row)}>
                  {renderCells(row)}
               </tr>
            ))}
            {sortedRows.length === 0 && emptyContent != null && (
               <tr>
                  <td colSpan={columnCount}>{emptyContent}</td>
               </tr>
            )}
         </tbody>
      </table>
   );
}
