import React from 'react';

interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

/**
 * A reusable, high-fidelity Table component styled for the የኛ Fix Admin Dashboard.
 * It uses the brand's tertiary background and secondary color accents.
 */
const Table = <T extends { id?: string | number }>({ columns, data, onRowClick }: TableProps<T>) => {
  return (
    <div className="w-full overflow-hidden rounded-[2.5rem] border border-secondary/5 bg-tertiary shadow-2xl shadow-secondary/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header section with specialized spacing and tracking */}
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

          {/* Table body with custom hover states and transitions */}
          <tbody className="divide-y divide-secondary/5">
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr 
                  key={item.id || rowIndex} 
                  onClick={() => onRowClick?.(item)}
                  className={`
                    transition-all duration-200 group
                    ${onRowClick ? 'cursor-pointer hover:bg-primary/50' : ''}
                  `}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-8 py-5 text-sm font-bold text-secondary/80">
                      {col.render ? (
                        col.render(item)
                      ) : (
                        <span className="text-secondary/80">
                          {String(item[col.key as keyof T] || '')}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              /* Simple fallback for empty data within the table structure */
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