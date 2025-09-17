import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  actions?: (item: T, index: number) => ReactNode;
  className?: string;
}

export default function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
  actions,
  className = ''
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4 mb-3">
                {columns.map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      {/* Version desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className={`
                    px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''}
                  `}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  hover:bg-gray-50 transition-all duration-200
                  ${onRowClick ? 'cursor-pointer hover:shadow-sm' : ''}
                `}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {column.render
                      ? column.render(item[column.key as keyof T], item, index)
                      : String(item[column.key as keyof T] || '-')
                    }
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(item, index)}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Version mobile */}
      <div className="lg:hidden">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-4 border-b border-gray-200 last:border-b-0
              ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            `}
            onClick={() => onRowClick?.(item, index)}
          >
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={String(column.key)} className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.title}
                  </span>
                  <div className="text-sm text-gray-900 text-right flex-1 ml-4">
                    {column.render
                      ? column.render(item[column.key as keyof T], item, index)
                      : String(item[column.key as keyof T] || '-')
                    }
                  </div>
                </div>
              ))}
              {actions && (
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  {actions(item, index)}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
