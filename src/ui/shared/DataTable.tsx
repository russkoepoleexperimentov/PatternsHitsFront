import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  title: string;
  render: (record: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T | ((record: T) => string);
  pageSize?: number;
  onRowClick?: (record: T) => void;
  emptyText?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  pageSize = 10,
  onRowClick,
  emptyText = 'Нет данных',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = useMemo(
    () => data.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [data, currentPage, pageSize],
  );

  const getKey = (record: T): string => {
    if (typeof rowKey === 'function') return rowKey(record);
    return String(record[rowKey]);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-12 text-gray-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${col.className ?? ''}`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.map((record) => (
              <tr
                key={getKey(record)}
                onClick={() => onRowClick?.(record)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`whitespace-nowrap px-4 py-3 text-sm text-gray-700 ${col.className ?? ''}`}>
                    {col.render(record)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Показано {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, data.length)} из {data.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
