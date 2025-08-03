import React, { useState, useEffect } from 'react';

function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/attendance/all');
        const attendanceData = await response.json() || [];
        // Sort attendance by date in reverse chronological order (latest to earliest)
        const sortedAttendance = attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendance(sortedAttendance);
        setError(null);
      } catch (error) {
        console.error('Error fetching attendance:', error.message);
        setError('Failed to load attendance data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Filter and search logic
  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = 
      record.register_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      record.status?.toLowerCase() === filterStatus.toLowerCase();
    
    const matchesDate = !filterDate || 
      record.date?.split(' ')[0] === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedAttendance = filteredAttendance.slice(startIndex, startIndex + recordsPerPage);

  // Statistics
  const totalRecords = attendance.length;
  const presentCount = attendance.filter(record => record.status?.toLowerCase() === 'present').length;
  const absentCount = attendance.filter(record => record.status?.toLowerCase() === 'absent').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerCard}>
            <div style={styles.headerContent}>
              <div>
                <h1 style={styles.title}>Attendance Records</h1>
                <p style={styles.subtitle}>Complete history of student attendance</p>
              </div>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert}>
            <i className="fas fa-exclamation-circle" style={styles.errorIcon}></i>
            <div>
              <h3 style={styles.errorTitle}>Error</h3>
              <p style={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                <i className="fas fa-list" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Total Records</p>
                <h3 style={styles.statValue}>{totalRecords}</h3>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                <i className="fas fa-user-check" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Present Records</p>
                <h3 style={styles.statValue}>{presentCount}</h3>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                <i className="fas fa-user-times" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Absent Records</p>
                <h3 style={styles.statValue}>{absentCount}</h3>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#f3e8ff', color: '#9333ea'}}>
                <i className="fas fa-chart-pie" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Overall Rate</p>
                <h3 style={styles.statValue}>{attendanceRate}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-filter" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Filters & Search</h2>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Search</label>
                <div style={styles.searchContainer}>
                  <i className="fas fa-search" style={styles.searchIcon}></i>
                  <input
                    type="text"
                    placeholder="Search by name or register number..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={styles.filterSelect}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>&nbsp;</label>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterDate('');
                    setCurrentPage(1);
                  }}
                  style={styles.clearButton}
                >
                  <i className="fas fa-times" style={styles.buttonIcon}></i>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-table" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>
                Attendance Records
                {filteredAttendance.length !== totalRecords && (
                  <span style={styles.resultCount}>({filteredAttendance.length} of {totalRecords})</span>
                )}
              </h2>
            </div>
            <div style={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div style={styles.cardContent}>
            {filteredAttendance.length === 0 ? (
              <div style={styles.emptyState}>
                <i className="fas fa-calendar-times" style={styles.emptyIcon}></i>
                <p style={styles.emptyTitle}>
                  {searchTerm || filterStatus !== 'all' || filterDate 
                    ? 'No records found matching your filters' 
                    : 'No attendance records available'}
                </p>
                <p style={styles.emptySubtitle}>
                  {searchTerm || filterStatus !== 'all' || filterDate 
                    ? 'Try adjusting your search criteria or filters' 
                    : 'Attendance records will appear here once they are recorded'}
                </p>
              </div>
            ) : (
              <>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeader}>Register Number</th>
                        <th style={styles.tableHeader}>Student Name</th>
                        <th style={styles.tableHeader}>Date & Time</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAttendance.map((record, index) => (
                        <tr key={record.id || index} style={styles.tableRow}>
                          <td style={styles.tableCell}>
                            <div style={styles.regNumberCell}>
                              <i className="fas fa-id-card" style={styles.cellIcon}></i>
                              {record.register_number || 'N/A'}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.nameCell}>
                              <i className="fas fa-user" style={styles.cellIcon}></i>
                              {record.name || 'N/A'}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.dateCell}>
                              <i className="fas fa-calendar" style={styles.cellIcon}></i>
                              {formatDateTime(record.date)}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: record.status?.toLowerCase() === 'present' ? '#dcfce7' : '#fee2e2',
                              color: record.status?.toLowerCase() === 'present' ? '#16a34a' : '#dc2626',
                              border: '1px solid transparent' // Consistent border
                            }}>
                              <i className={`fas fa-${record.status?.toLowerCase() === 'present' ? 'check' : 'times'}`} 
                                 style={styles.badgeIcon}></i>
                              {record.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={styles.paginationContainer}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{...styles.paginationButton, ...(currentPage === 1 ? styles.disabledButton : {})}}
                    >
                      <i className="fas fa-chevron-left" style={styles.buttonIcon}></i>
                      Previous
                    </button>
                    
                    <div style={styles.paginationNumbers}>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            style={{
                              ...styles.paginationNumber,
                              ...(currentPage === pageNumber ? styles.activePaginationNumber : {})
                            }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{...styles.paginationButton, ...(currentPage === totalPages ? styles.disabledButton : {})}}
                    >
                      Next
                      <i className="fas fa-chevron-right" style={styles.buttonIcon}></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  content: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    textAlign: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '18px',
    margin: 0,
  },
  header: {
    marginBottom: '32px',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#6b7280',
    margin: 0,
    fontSize: '16px',
  },
  errorAlert: {
    marginBottom: '24px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: '20px',
    marginTop: '2px',
    flexShrink: 0,
  },
  errorTitle: {
    color: '#991b1b',
    fontWeight: '500',
    margin: '0 0 4px 0',
    fontSize: '16px',
  },
  errorMessage: {
    color: '#b91c1c',
    margin: 0,
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '16px',
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'center',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
  },
  iconSize: {
    fontSize: '20px',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  cardHeader: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionIcon: {
    fontSize: '18px',
    color: '#3b82f6',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  resultCount: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#6b7280',
    marginLeft: '8px',
  },
  paginationInfo: {
    color: '#6b7280',
    fontSize: '14px',
  },
  cardContent: {
    padding: '16px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    alignItems: 'end',
    padding: '16px 0',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  filterLabel: {
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '16px',
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '12px 16px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    minWidth: '0',
    boxSizing: 'border-box',
  },
  filterSelect: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    minWidth: '0',
    width: '100%',
    boxSizing: 'border-box',
  },
  clearButton: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    minWidth: '140px',
    width: '100',
    boxSizing: 'border-box',
  },
  buttonIcon: {
    fontSize: '12px',
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  tableHeader: {
    padding: '12px',
    textAlign: 'left',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  },
  tableCell: {
    padding: '12px',
    fontSize: '14px',
    color: '#111827',
  },
  regNumberCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  dateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
  },
  cellIcon: {
    fontSize: '12px',
    color: '#9ca3af',
    width: '12px',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  badgeIcon: {
    fontSize: '10px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#d1d5db',
    marginBottom: '16px',
  },
  emptyTitle: {
    color: '#6b7280',
    fontSize: '18px',
    fontWeight: '500',
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0,
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  paginationButton: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  paginationNumbers: {
    display: 'flex',
    gap: '4px',
  },
  paginationNumber: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  activePaginationNumber: {
    backgroundColor: '#3b82f6',
    border: '1px solid #3b82f6',
    color: 'white',
  },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .table-row:hover {
    background-color: #f9fafb;
  }

  .clear-button:hover {
    background-color: #f3f4f6;
    border: '1px solid #9ca3af';
  }

  .pagination-button:hover:not(:disabled) {
    background-color: #f9fafb;
    border: '1px solid #9ca3af';
  }

  .pagination-number:hover {
    background-color: #f3f4f6;
    border: '1px solid #9ca3af';
  }

  .search-input:focus,
  .filter-select:focus {
    border: '1px solid #3b82f6';
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 640px) {
    .filters-grid {
      grid-template-columns: 1fr; // Stack vertically on small screens
      gap: 16px;
    }
    
    .pagination-container {
      flex-direction: column;
      gap: 16px;
    }
    
    .pagination-numbers {
      order: -1;
    }
    
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .filters-grid {
      grid-template-columns: repeat(2, 1fr); // Two columns on medium screens
    }
    
    .filter-group:nth-child(3) {
      grid-column: span 2; // Make date input span both columns
    }
  }

  @media (min-width: 1025px) {
    .filters-grid {
      grid-template-columns: repeat(4, 1fr); // Four columns on large screens
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default AttendanceList;