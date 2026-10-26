import './Table.css';
import { useState } from 'react';
import RowDetailModal from './RowDetailModal';
import ApproveButton from './ActionButtons/ApproveButton';
import EditButton from './ActionButtons/EditButton';
import RemoveButton from './ActionButtons/RemoveButton';


export default function Table({ tableName, data = [] }) {

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const DEFAULT_PAGE_SIZE = 10;

  
  const [atPage, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [goToPage, setGoToPage] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const getPageCount = () => (Math.ceil(data.length /pageSize) || 1);

  const formatHeader = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatItem = (item) => {
    if (item !== null && typeof item === 'object') {
      return JSON.stringify(item);
    }
    return String(item ?? '');
  };

  const renderBadge = (key, val) => {
    const str = String(val).toLowerCase();
    const isStatus = key.toLowerCase().includes('status');
    const isRole = key.toLowerCase().includes('role');

    if (isStatus || isRole) {
      return <span className={`badge badge--${str}`}>{String(val)}</span>;
    }
    return null;
  };

  const renderCell = (key, value) => {
    if (value === null || value === undefined) return <span style={{ color: '#aaa' }}>—</span>;

    const badge = renderBadge(key, value);
    if (badge) return badge;

    if (Array.isArray(value)) {
      return (
        <ul className="table-list-cell">
          {value.map((item, i) => (
            <li key={i}>{formatItem(item)}</li>
          ))}
        </ul>
      );
    }

    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('joined') || key.toLowerCase().includes('login')) {
      if (typeof value === 'string' && value.includes('T')) {
        return value.replace('T', ' ').slice(0, 19);
      }
    }

    return String(value);
  };

  return (
   
    <div className="table-container">
      <div className="table-container__header-bar">
        <h2 className="table-container__title">{tableName}</h2>
        <span className="table-container__count-badge">Displayed records from {(atPage-1)*pageSize+1} to {Math.min((atPage)*pageSize, data.length)} (out of{data.length})</span>
      </div>
      <div  className="table-container__control" >
        <input id='search' type='search' placeholder='Search...'>
        </input>

        <select >
          {headers.map((element) => <option>{formatHeader(element)}</option>)}
        </select>

        <select >
          <option>Latest</option>
          <option>Oldest</option>
          <option>A-Z</option>
          <option>Z-A</option>
        </select>
            <select
    aria-label="Line per page"
    value={pageSize}
    onChange={(e) => {
      setPageSize(Number(e.target.value));
      setPage(1);
    }}  >
        <option value={10}>10 lines per page</option>
        <option value={20}>20 lines per page</option>
        <option value={50}>50 lines per page</option>
    </select>
      </div>
 
      <div className="table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{formatHeader(header)}</th>
              ))}
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="table-empty">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((element, rowIndex) => (
                <tr key={element.id ?? rowIndex}   className="table-row--clickable"  onClick={() => setSelectedRow(element)}>
                  {headers.map((column) => (
                    <td key={column}>{renderCell(column, element[column])}</td>
                  ))}
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {["Instructor Applications", "Courses Moderation"].includes(tableName) && <ApproveButton/>}
                      {["Courses Moderation", "Registered Users"].includes(tableName) && <EditButton/> }  {/* truyen tham so (onclick , ... vao EditButton de thuc hien action) */}
                      {["Courses Moderation", "Registered Users", "Instructor Applications", "All Reported Items" ].includes(tableName) && <RemoveButton/>} 
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className='table-pagination'>
            <span>Page {atPage} / {getPageCount()} </span>
      </div>
      
      { <div className='paging-selection'>
        <button onClick={() => setPage(1)} disabled={atPage==1}> .
        </button>
        <button onClick={() => setPage(atPage - 1)} disabled={atPage==1} > Back </button>
        <button onClick={() => setPage(atPage + 1)} disabled={atPage==getPageCount()} > Next </button>
        <button onClick={() => setPage(getPageCount())} disabled={atPage==getPageCount()}> .
        </button>
        <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(Number(goToPage));
              setGoToPage('');  }}
        >
            <input
              type="number"
              placeholder="Page..."
              min={1}
              max={getPageCount()}
              step={1}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
            />
            <button type="submit">Go to</button>
          </form>
      </div> }

{selectedRow && (
  <RowDetailModal
    title={`${tableName} #${selectedRow.id ?? ''}`}
    row={selectedRow}
    exclude={['password']}
    onClose={() => setSelectedRow(null)}
  ></RowDetailModal>)}
    </div>
  );
}
