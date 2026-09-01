"use client";

import React from "react";
import { TableRowSkeleton } from "./Skeleton";

export interface TableColumn<T> {
  header: string;
  key: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
  keyExtractor?: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyText = "No records found.",
  keyExtractor,
  onRowClick,
  className = "",
}: TableProps<T>) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-subtle ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <>
                <TableRowSkeleton columns={columns.length} />
                <TableRowSkeleton columns={columns.length} />
                <TableRowSkeleton columns={columns.length} />
              </>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 px-4 text-center text-xs sm:text-sm text-slate-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => {
                const rowKey = keyExtractor ? keyExtractor(item, rowIdx) : rowIdx;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`py-3 px-4 text-slate-800 text-xs sm:text-sm ${
                          col.className || ""
                        }`}
                      >
                        {col.render
                          ? col.render(item, rowIdx)
                          : item[col.key] !== undefined
                          ? String(item[col.key])
                          : "-"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
