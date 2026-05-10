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


const Table = <T extends { id?: string | number }>({ columns, data, onRowClick }: TableProps<T>) => {
  return (
    <div className="w-full overflow-hidden rounded-4xl border border-secondary/5 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#E5D3B3]/30">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-secondary/60"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary/5">
          {data.map((item, rowIndex) => (
            <tr 
              key={item.id || rowIndex} 
              onClick={() => onRowClick?.(item)}
              className="hover:bg-secondary/2 transition-colors cursor-pointer group"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-xs font-bold text-secondary/80">
                  {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;