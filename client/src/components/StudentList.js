import React, { useState, useEffect } from 'react';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const studentsPerPage = 12;

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // Fetch students
        const studentsResponse = await fetch('/api/read');
        const studentsData = await studentsResponse.json() || [];
        
        // Fetch today's attendance
        const today = new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).split(',')[0];
        let todayAttendance = [];
        try {
          const attendanceResponse = await fetch(`/api/attendance/by-date/${today}`);
          todayAttendance = await attendanceResponse.json() || [];
        } catch (attendanceError) {
          console.warn('Failed to fetch today\'s attendance:', attendanceError.message);
        }

        // Enrich students with today's attendance status
        const enrichedStudents = studentsData.map(student => {
          const todayRecord = todayAttendance.find(a => a.register_number === student.register_number);
          const status = todayRecord ? todayRecord.status : 'Absent';
          return {
            ...student,
            lastAttendance: todayRecord ? todayRecord.date : null,
            status
          };
        });

        setStudents(enrichedStudents);
        setError(null);
      } catch (error) {
        console.error('Error fetching students:', error.message);
        setError('Failed to load student data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const getBranchName = (code) => {
    const branches = { 
      'CSE': 'Computer Science', 
      'ECE': 'Electronics & Communication', 
      'MECH': 'Mechanical Engineering', 
      'CIVIL': 'Civil Engineering',
      'EEE': 'Electrical & Electronics',
      'IT': 'Information Technology'
    };
    return branches[code] || code || 'N/A';
  };

  // Filter and search logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.register_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = filterYear === 'all' || 
      student.year_of_study?.toString() === filterYear;
    
    const matchesBranch = filterBranch === 'all' || 
      student.branch?.toLowerCase() === filterBranch.toLowerCase();
    
    const matchesStatus = filterStatus === 'all' || 
      student.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesYear && matchesBranch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  // Statistics
  const totalStudents = students.length;
  const presentCount = students.filter(student => student.status?.toLowerCase() === 'present').length;
  const absentCount = students.filter(student => student.status?.toLowerCase() === 'absent').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Get unique years and branches for filters
  const uniqueYears = [...new Set(students.map(s => s.year_of_study).filter(Boolean))].sort();
  const uniqueBranches = [...new Set(students.map(s => s.branch).filter(Boolean))].sort();

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading student data...</p>
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
                <h1 style={styles.title}>Student Directory</h1>
                <p style={styles.subtitle}>Comprehensive list of all registered students</p>
              </div>
              <div style={styles.viewToggle}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    ...styles.toggleButton,
                    ...(viewMode === 'table' ? styles.activeToggle : {})
                  }}
                >
                  <i className="fas fa-table" style={styles.buttonIcon}></i>
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  style={{
                    ...styles.toggleButton,
                    ...(viewMode === 'cards' ? styles.activeToggle : {})
                  }}
                >
                  <i className="fas fa-th-large" style={styles.buttonIcon}></i>
                  Cards
                </button>
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
                <i className="fas fa-users" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Total Students</p>
                <h3 style={styles.statValue}>{totalStudents}</h3>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                <i className="fas fa-user-check" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Present Today</p>
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
                <p style={styles.statLabel}>Absent Today</p>
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
                <p style={styles.statLabel}>Attendance Rate</p>
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
                <label style={styles.filterLabel}>Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={styles.filterSelect}
                >
                  <option value="all">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Branch</label>
                <select
                  value={filterBranch}
                  onChange={(e) => {
                    setFilterBranch(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={styles.filterSelect}
                >
                  <option value="all">All Branches</option>
                  {uniqueBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
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
                <label style={styles.filterLabel}>&nbsp;</label>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterYear('all');
                    setFilterBranch('all');
                    setFilterStatus('all');
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

        {/* Students Display */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-graduation-cap" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>
                Students
                {filteredStudents.length !== totalStudents && (
                  <span style={styles.resultCount}>({filteredStudents.length} of {totalStudents})</span>
                )}
              </h2>
            </div>
            <div style={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div style={styles.cardContent}>
            {filteredStudents.length === 0 ? (
              <div style={styles.emptyState}>
                <i className="fas fa-user-graduate" style={styles.emptyIcon}></i>
                <p style={styles.emptyTitle}>
                  {searchTerm || filterYear !== 'all' || filterBranch !== 'all' || filterStatus !== 'all'
                    ? 'No students found matching your filters' 
                    : 'No students registered yet'}
                </p>
                <p style={styles.emptySubtitle}>
                  {searchTerm || filterYear !== 'all' || filterBranch !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search criteria or filters' 
                    : 'Students will appear here once they are added to the system'}
                </p>
              </div>
            ) : (
              <>
                {viewMode === 'table' ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.tableHeader}>Student</th>
                          <th style={styles.tableHeader}>Register Number</th>
                          <th style={styles.tableHeader}>Year</th>
                          <th style={styles.tableHeader}>Branch</th>
                          <th style={styles.tableHeader}>Last Attendance</th>
                          <th style={styles.tableHeader}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map((student, index) => (
                          <tr key={student.id || index} style={styles.tableRow}>
                            <td style={styles.tableCell}>
                              <div style={styles.studentInfo}>
                                <div style={styles.avatarCircle}>
                                  <i className="fas fa-user" style={styles.avatarIcon}></i>
                                </div>
                                <div>
                                  <div style={styles.studentName}>{student.name || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={styles.tableCell}>
                              <span style={styles.regNumber}>{student.register_number || 'N/A'}</span>
                            </td>
                            <td style={styles.tableCell}>
                              <span style={styles.yearBadge}>{student.year_of_study || 'N/A'}</span>
                            </td>
                            <td style={styles.tableCell}>
                              <span style={styles.branchText}>{getBranchName(student.branch)}</span>
                            </td>
                            <td style={styles.tableCell}>
                              <div style={styles.dateCell}>
                                <i className="fas fa-calendar" style={styles.cellIcon}></i>
                                {formatDate(student.lastAttendance)}
                              </div>
                            </td>
                            <td style={styles.tableCell}>
                              <span style={{
                                ...styles.statusBadge,
                                backgroundColor: student.status?.toLowerCase() === 'present' ? '#dcfce7' : '#fee2e2',
                                color: student.status?.toLowerCase() === 'present' ? '#16a34a' : '#dc2626'
                              }}>
                                <i className={`fas fa-${student.status?.toLowerCase() === 'present' ? 'check' : 'times'}`} 
                                   style={styles.badgeIcon}></i>
                                {student.status || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.cardsGrid}>
                    {paginatedStudents.map((student, index) => (
                      <div key={student.id || index} style={styles.studentCard}>
                        <div style={styles.studentCardHeader}>
                          <div style={styles.avatarCircle}>
                            <i className="fas fa-user" style={styles.avatarIcon}></i>
                          </div>
                          <div style={styles.studentCardInfo}>
                            <h3 style={styles.cardStudentName}>{student.name || 'N/A'}</h3>
                            <p style={styles.cardRegNumber}>{student.register_number || 'N/A'}</p>
                          </div>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: student.status?.toLowerCase() === 'present' ? '#dcfce7' : '#fee2e2',
                            color: student.status?.toLowerCase() === 'present' ? '#16a34a' : '#dc2626'
                          }}>
                            <i className={`fas fa-${student.status?.toLowerCase() === 'present' ? 'check' : 'times'}`} 
                               style={styles.badgeIcon}></i>
                            {student.status || 'N/A'}
                          </span>
                        </div>
                        
                        <div style={styles.studentCardBody}>
                          <div style={styles.cardDetail}>
                            <i className="fas fa-calendar-alt" style={styles.detailIcon}></i>
                            <div>
                              <p style={styles.detailLabel}>Year of Study</p>
                              <p style={styles.detailValue}>{student.year_of_study || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div style={styles.cardDetail}>
                            <i className="fas fa-graduation-cap" style={styles.detailIcon}></i>
                            <div>
                              <p style={styles.detailLabel}>Branch</p>
                              <p style={styles.detailValue}>{getBranchName(student.branch)}</p>
                            </div>
                          </div>
                          
                          <div style={styles.cardDetail}>
                            <i className="fas fa-clock" style={styles.detailIcon}></i>
                            <div>
                              <p style={styles.detailLabel}>Last Attendance</p>
                              <p style={styles.detailValue}>{formatDate(student.lastAttendance)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
    flexWrap: 'wrap',
    gap: '16px',
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
  viewToggle: {
    display: 'flex',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  toggleButton: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'white',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    borderRight: '1px solid #d1d5db',
  },
  activeToggle: {
    backgroundColor: '#3b82f6',
    color: 'white',
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
    flexWrap: 'wrap',
    gap: '12px',
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
    minWidth: 0, // Prevents fixed width issues
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
    pointerEvents: 'none', // Prevents icon from interfering with input
  },
  searchInput: {
    padding: '12px 16px 12px 40px', // Increased left padding to accommodate icon
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    minWidth: '0', // Allows shrinking
    boxSizing: 'border-box', // Ensures padding doesn't affect width
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
    minWidth: '0', // Allows shrinking
    width: '100%',
    boxSizing: 'border-box', // Ensures padding doesn't affect width
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
    width: '100%', // Ensures button fills the group
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
    verticalAlign: 'middle',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarIcon: {
    fontSize: '16px',
    color: '#2563eb',
  },
  studentName: {
    fontWeight: '600',
    color: '#111827',
    fontSize: '14px',
  },
  regNumber: {
    fontFamily: 'monospace',
    fontWeight: '500',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  yearBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  branchText: {
    color: '#374151',
    fontSize: '13px',
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
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '16px',
  },
  studentCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s',
  },
  studentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  studentCardInfo: {
    flex: 1,
  },
  cardStudentName: {
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
    fontSize: '16px',
  },
  cardRegNumber: {
    color: '#6b7280',
    fontSize: '13px',
    margin: 0,
    fontFamily: 'monospace',
  },
  studentCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  detailIcon: {
    fontSize: '16px',
    color: '#6b7280',
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '500',
    margin: '0 0 2px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontWeight: '500',
    color: '#111827',
    margin: 0,
    fontSize: '14px',
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
    borderColor: '#3b82f6',
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

  .student-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border-color: #d1d5db;
  }

  .clear-button:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  .pagination-button:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  .pagination-number:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  .toggle-button:hover {
    background-color: #f9fafb;
  }

  .toggle-button:last-child {
    border-right: none;
  }

  .search-input:focus,
  .filter-select:focus {
    border-color: #3b82f6;
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
    
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .cards-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .filters-grid {
      grid-template-columns: repeat(2, 1fr); // Two columns on medium screens
    }
    
    .filter-group:nth-child(5) {
      grid-column: span 2; // Make clear button span both columns
    }
    
    .cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }

  @media (min-width: 1025px) {
    .filters-grid {
      grid-template-columns: repeat(5, 1fr); // Five columns on large screens
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default StudentList;