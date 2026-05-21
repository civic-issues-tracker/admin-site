import React from 'react';
import ThemeLoader from './ThemeLoader';

interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean; 
}

const Table = <T extends { id?: string | number }>({ 
  columns, 
  data = [], 
  onRowClick,
  isLoading = false 
}: TableProps<T>) => {


  const showLoader = isLoading || !data || data.length === 0;

  return (
    <div className="w-full overflow-hidden rounded-[2.5rem] border border-secondary/5 bg-tertiary shadow-2xl shadow-secondary/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-175 text-left border-collapse">
          <thead className="bg-secondary/5 border-b border-secondary/5">
            <tr>
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-secondary/5">
            {showLoader ? (
              <tr>
                <td colSpan={columns.length} className="px-8 py-32">
                  <div className="flex justify-center items-center w-full animate-in fade-in duration-300">
                    <ThemeLoader size="md" />
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              /* SHOW DATA */
              data.map((item, rowIndex) => (
                <tr 
                  key={item.id || rowIndex} 
                  onClick={() => onRowClick?.(item)}
                  className={`
                    transition-all duration-200 group
                    ${onRowClick ? 'cursor-pointer hover:bg-primary/5' : ''} 
                  `}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-8 py-5 text-sm font-bold text-secondary/80">
                      {col.render ? (
                        col.render(item)
                      ) : (
                        <span>
                          {String(item[col.key as keyof T] || '')}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              /* ACTUAL EMPTY STATE: Only triggers if loading is false AND data explicitly finished empty */
              <tr>
                <td colSpan={columns.length} className="px-8 py-20 text-center">
                  <p className="font-body uppercase tracking-widest text-[10px] font-black text-secondary/20">
                    No records found
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;