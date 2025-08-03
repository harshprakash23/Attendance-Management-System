import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState({ percentage: 0, present: 0, absent: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students
        const studentsResponse = await fetch('/api/read');
        const studentsData = await studentsResponse.json() || [];
        console.log('Fetched students:', JSON.stringify(studentsData, null, 2));

        // Fetch today's attendance
        const today = new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).split(',')[0];
        console.log('Today (IST):', today);
        let todayAttendance = [];
        try {
          const attendanceResponse = await fetch(`/api/attendance/by-date/${today}`);
          todayAttendance = await attendanceResponse.json() || [];
          console.log('Today Attendance:', JSON.stringify(todayAttendance, null, 2));
        } catch (attendanceError) {
          console.warn('Failed to fetch today’s attendance:', attendanceError.message);
        }

        // Enrich students with today's attendance status
        const enrichedStudents = studentsData.map(student => {
          const todayRecord = todayAttendance.find(a => a.register_number === student.register_number);
          const status = todayRecord ? todayRecord.status : 'Absent'; // Default to Absent if no record
          return {
            ...student,
            lastAttendance: todayRecord ? todayRecord.date : null,
            status
          };
        });

        setStudents(enrichedStudents);

        // Fetch all attendance records for recent records
        const allAttendanceResponse = await fetch('/api/attendance/all');
        const allAttendanceData = await allAttendanceResponse.json() || [];
        console.log('All Attendance Records:', JSON.stringify(allAttendanceData, null, 2));

        const allRecords = processAttendanceData(enrichedStudents, allAttendanceData);
        const limitedRecords = allRecords.slice(0, 5);
        setAttendanceRecords(limitedRecords);

        // Calculate today's stats
        const todayStats = todayAttendance.reduce(
          (acc, record) => {
            if (record.status && record.status.toLowerCase() === 'present') {
              acc.present += 1;
            } else {
              acc.absent += 1;
            }
            return acc;
          },
          { present: 0, absent: 0, total: enrichedStudents.length }
        );
        const percentage = todayStats.total > 0 ? Math.round((todayStats.present / todayStats.total) * 100) : 0;
        setTodayRecord({ date: today, present: todayStats.present, absent: todayStats.absent, percentage });

        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const processAttendanceData = (students, data) => {
    const records = {};
    data.forEach(record => {
      if (!record.date) return;
      const dateKey = record.date.split(' ')[0];
      if (!records[dateKey]) {
        records[dateKey] = { present: 0, absent: 0, total: students.length };
      }
      if (record.status && record.status.toLowerCase() === 'present') {
        records[dateKey].present += 1;
      } else {
        records[dateKey].absent += 1;
      }
    });
    return Object.entries(records)
      .map(([date, counts], index) => ({
        date,
        present: counts.present,
        absent: counts.absent,
        percentage: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0,
        key: `${date}-${index}`
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

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

  const filteredStudents = students.filter(student =>
    student?.register_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Get current date and time
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <div style={styles.headerCard}>
            <div style={styles.headerContent}>
              <div>
                <h1 style={styles.title}>Student Attendance Dashboard</h1>
                <p style={styles.subtitle}>Manage and monitor student attendance records</p>
                <p style={styles.dateText}>{currentDate} IST</p>
              </div>
              
              <div style={styles.headerActions}>
                <div style={styles.searchContainer}>
                  <i className="fas fa-search" style={styles.searchIcon}></i>
                  <input
                    type="text"
                    placeholder="Search by name or register number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div style={styles.errorAlert}>
            <i className="fas fa-exclamation-circle" style={styles.errorIcon}></i>
            <div>
              <h3 style={styles.errorTitle}>Error</h3>
              <p style={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                <i className="fas fa-users" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Total Students</p>
                <h3 style={styles.statValue}>{students.length}</h3>
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
                <h3 style={styles.statValue}>{todayRecord.present}</h3>
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
                <h3 style={styles.statValue}>{todayRecord.absent}</h3>
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
                <h3 style={styles.statValue}>{todayRecord.percentage}%</h3>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-graduation-cap" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>
                Students {searchTerm && `(${filteredStudents.length} found)`}
              </h2>
            </div>
            <Link to="/students/all" style={styles.viewAllButton}>
              <i className="fas fa-eye" style={styles.buttonIcon}></i>
              View All Students
            </Link>
          </div>

          <div style={styles.cardContent}>
            {filteredStudents.length === 0 ? (
              <div style={styles.emptyState}>
                <i className="fas fa-user" style={styles.emptyIcon}></i>
                <p style={styles.emptyTitle}>
                  {searchTerm ? 'No students found matching your search' : 'No students registered yet'}
                </p>
                <p style={styles.emptySubtitle}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Students will appear here once they are added to the system'}
                </p>
              </div>
            ) : (
              <div style={styles.studentsGrid}>
                {filteredStudents.slice(0, 6).map((student) => (
                  <div key={`${student.id}-${student.register_number}`} style={styles.studentCard}>
                    <div style={styles.studentHeader}>
                      <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                        <i className="fas fa-user" style={styles.smallIcon}></i>
                      </div>
                      <div>
                        <h3 style={styles.studentName}>{student.name || 'N/A'}</h3>
                        <p style={styles.studentRegNo}>{student.register_number || 'N/A'}</p>
                      </div>
                    </div>

                    <div style={styles.studentDetails}>
                      <div>
                        <p style={styles.detailLabel}>Year of Study</p>
                        <p style={styles.detailValue}>{student.year_of_study || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Branch</p>
                        <p style={styles.detailValue}>{getBranchName(student.branch)}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Current Attendance</p>
                        <p style={styles.detailValue}>{formatDate(student.lastAttendance)}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Status</p>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: student.status.toLowerCase() === 'present' ? '#dcfce7' : 
                                         student.status.toLowerCase() === 'absent' ? '#fee2e2' : '#f3f4f6',
                          color: student.status.toLowerCase() === 'present' ? '#16a34a' : 
                                student.status.toLowerCase() === 'absent' ? '#dc2626' : '#374151'
                        }}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-chart-line" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Recent Attendance Records</h2>
            </div>
            <Link to="/attendance/all" style={styles.viewAllButton}>
              <i className="fas fa-eye" style={styles.buttonIcon}></i>
              View All Records
            </Link>
          </div>

          <div style={styles.cardContent}>
            {attendanceRecords.length === 0 ? (
              <div style={styles.emptyState}>
                <i className="fas fa-calendar" style={styles.emptyIcon}></i>
                <p style={styles.emptyTitle}>No attendance records found</p>
                <p style={styles.emptySubtitle}>Records will appear here once attendance is taken</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>Date</th>
                      <th style={styles.tableHeader}>Present</th>
                      <th style={styles.tableHeader}>Absent</th>
                      <th style={styles.tableHeader}>Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record.key} style={styles.tableRow}>
                        <td style={styles.tableCell}>{formatDate(record.date)}</td>
                        <td style={styles.tableCell}>
                          <span style={{...styles.badge, backgroundColor: '#dcfce7', color: '#166534'}}>
                            {record.present}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b'}}>
                            {record.absent}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.progressContainer}>
                            <div style={styles.progressBar}>
                              <div 
                                style={{
                                  ...styles.progressFill,
                                  width: `${record.percentage}%`,
                                  backgroundColor: record.percentage >= 80 ? '#22c55e' : 
                                                 record.percentage >= 60 ? '#eab308' : '#ef4444'
                                }}
                              ></div>
                            </div>
                            <span style={styles.percentageText}>{record.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
    flexDirection: 'column',
    gap: '24px',
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
  dateText: {
    color: '#6b7280',
    margin: '0 0 8px 0',
    fontSize: '14px',
  },
  headerActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '320px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '16px',
  },
  searchInput: {
    padding: '12px 16px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    width: '100%',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    outline: 'none',
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
  smallIcon: {
    fontSize: '16px',
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
  viewAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  cardContent: {
    padding: '16px',
  },
  tableContainer: {
    overflowX: 'auto',
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
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  tableCell: {
    padding: '12px',
    fontSize: '14px',
    color: '#111827',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressBar: {
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    height: '6px',
    width: '80px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  percentageText: {
    fontWeight: '500',
    color: '#111827',
    minWidth: '2rem',
    fontSize: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px',
  },
  emptyIcon: {
    fontSize: '32px',
    color: '#d1d5db',
    marginBottom: '12px',
  },
  emptyTitle: {
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0,
  },
  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  studentCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    transition: 'all 0.2s',
    backgroundColor: '#fafafa',
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  studentName: {
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
    fontSize: '16px',
  },
  studentRegNo: {
    color: '#6b7280',
    fontSize: '12px',
    margin: 0,
  },
  studentDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: '10px',
    fontWeight: '500',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontWeight: '500',
    color: '#111827',
    margin: 0,
    fontSize: '12px',
    wordBreak: 'break-word',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
};

// Add CSS keyframes for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .student-card:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .view-all-button:hover {
    color: #1d4ed8;
  }

  @media (min-width: 640px) {
    .header-content {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .header-actions {
      flex-direction: row;
      align-items: center;
    }
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .students-grid {
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .content {
      padding: '32px';
    }
    .header-card {
      padding: '24px';
    }
    .card-header {
      padding: '24px';
    }
    .card-content {
      padding: '24px';
    }
    .stat-value {
      font-size: '36px';
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default Dashboard;