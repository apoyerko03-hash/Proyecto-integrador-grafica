export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => <th key={col.accessor}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} onClick={() => onRowClick && onRowClick(row)} className={onRowClick ? 'cursor-pointer' : ''}>
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
