import { useState, useEffect } from 'react';
import axios from 'axios';

function MarkAttendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if unmounted
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students
        const studentsResponse = await axios.get('http://localhost:5000/api/read');
        const studentsData = studentsResponse.data || [];
        console.log('Fetched students:', studentsData);
        if (isMounted) setStudents(studentsData);

        // Fetch existing attendance using the correct endpoint
        let existingAttendance = [];
        try {
          const attendanceResponse = await axios.get(`http://localhost:5000/api/attendance/by-date/${date}`);
          existingAttendance = attendanceResponse.data || [];
          console.log('Fetched attendance:', existingAttendance); // Debug log with full data
        } catch (attendanceError) {
          console.warn('Attendance fetch failed, using default values:', attendanceError.message);
        }

        if (isMounted && studentsData && Array.isArray(studentsData)) {
          const initialAttendance = {};
          studentsData.forEach(student => {
            const existingRecord = existingAttendance.find(a => a.register_number === student.register_number);
            initialAttendance[student.register_number] = existingRecord?.status?.toUpperCase() || 'ABSENT'; // Normalize to uppercase
            console.log(`Mapping ${student.register_number}: ${initialAttendance[student.register_number]}`); // Debug mapping
          });
          if (isMounted) {
            setAttendance(initialAttendance);
            setHasExistingAttendance(existingAttendance.length > 0);
          }
        }
        if (isMounted) setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) setError('Failed to load data. Please check your connection and try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();

    // Cleanup function to prevent state updates on unmount
    return () => {
      isMounted = false;
    };
  }, [date]); // Dependency on date only

  const handleAttendanceChange = (registerNumber, checked) => {
    setAttendance(prev => ({
      ...prev,
      [registerNumber]: checked ? 'PRESENT' : 'ABSENT' // Use uppercase to match normalized data
    }));
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setFilterValue('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const attendanceData = Object.keys(attendance).map(registerNumber => ({
        registerNumber,
        date,
        status: attendance[registerNumber]
      }));
      
      console.log('Submitting attendance data:', attendanceData);
      
      await axios.post('http://localhost:5000/api/attendance', { attendance: attendanceData });
      setSuccess('Attendance ' + (hasExistingAttendance ? 'updated' : 'submitted') + ' successfully!');
      setHasExistingAttendance(true);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error submitting attendance:', error.response?.data || error);
      setError('Error submitting attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAllPresent = () => {
    const newAttendance = {};
    filteredStudents.forEach(student => {
      newAttendance[student.register_number] = 'PRESENT';
    });
    setAttendance(prev => ({ ...prev, ...newAttendance }));
  };

  const markAllAbsent = () => {
    const newAttendance = {};
    filteredStudents.forEach(student => {
      newAttendance[student.register_number] = 'ABSENT';
    });
    setAttendance(prev => ({ ...prev, ...newAttendance }));
  };

  const filteredStudents = filter === 'all' ? students :
    filter === 'year' ? students.filter(s => s.year_of_study === parseInt(filterValue)) :
    students.filter(s => s.branch === filterValue);

  const total = filteredStudents.length;
  const present = filteredStudents.filter(student => attendance[student.register_number] === 'PRESENT').length;
  const absent = total - present;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div key={date} style={styles.container}> {/* Force re-render on date change */}
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerCard}>
            <div style={styles.headerContent}>
              <div>
                <h1 style={styles.title}>Mark Attendance</h1>
                <p style={styles.subtitle}>Record student attendance for {formatDate(date)}</p>
              </div>
              
              <div style={styles.headerActions}>
                <div style={styles.dateContainer}>
                  <label style={styles.dateLabel}>
                    <i className="fas fa-calendar" style={styles.dateIcon}></i>
                    Date:
                  </label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>
                
                <div style={styles.filterContainer}>
                  <select value={filter} onChange={handleFilterChange} style={styles.filterSelect}>
                    <option value="all">All Students</option>
                    <option value="year">Filter by Year</option>
                    <option value="branch">Filter by Branch</option>
                  </select>
                  
                  {filter === 'year' && (
                    <select value={filterValue} onChange={e => setFilterValue(e.target.value)} style={styles.filterSelect}>
                      <option value="">Select Year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </select>
                  )}
                  
                  {filter === 'branch' && (
                    <select value={filterValue} onChange={e => setFilterValue(e.target.value)} style={styles.filterSelect}>
                      <option value="">Select Branch</option>
                      <option value="CSE">Computer Science</option>
                      <option value="ECE">Electronics & Communication</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                      <option value="EEE">Electrical & Electronics</option>
                      <option value="IT">Information Technology</option>
                    </select>
                  )}
                </div>
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

        {/* Success Alert */}
        {success && (
          <div style={styles.successAlert}>
            <i className="fas fa-check-circle" style={styles.successIcon}></i>
            <div>
              <h3 style={styles.successTitle}>Success</h3>
              <p style={styles.successMessage}>{success}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                <i className="fas fa-users" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Total Students</p>
                <h3 style={styles.statValue}>{total}</h3>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                <i className="fas fa-user-check" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Present</p>
                <h3 style={styles.statValue}>{present}</h3>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                <i className="fas fa-user-times" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Absent</p>
                <h3 style={styles.statValue}>{absent}</h3>
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
                <h3 style={styles.statValue}>{percentage}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-tools" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Bulk Actions</h2>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.bulkActions}>
              <button 
                onClick={markAllPresent} 
                style={{...styles.bulkButton, ...styles.presentButton}}
                disabled={isSubmitting}
              >
                <i className="fas fa-check" style={styles.buttonIcon}></i>
                Mark All Present
              </button>
              <button 
                onClick={markAllAbsent} 
                style={{...styles.bulkButton, ...styles.absentButton}}
                disabled={isSubmitting}
              >
                <i className="fas fa-times" style={styles.buttonIcon}></i>
                Mark All Absent
              </button>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-graduation-cap" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>
                Students {filter !== 'all' && filterValue && `(${filteredStudents.length} filtered)`}
              </h2>
            </div>
            <div style={styles.attendanceProgress}>
              <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${percentage}%`,
                      backgroundColor: percentage >= 80 ? '#22c55e' : 
                                     percentage >= 60 ? '#eab308' : '#ef4444'
                    }}
                  ></div>
                </div>
                <span style={styles.percentageText}>{percentage}%</span>
              </div>
            </div>
          </div>

          <div style={styles.cardContent}>
            {filteredStudents.length === 0 ? (
              <div style={styles.emptyState}>
                <i className="fas fa-user-slash" style={styles.emptyIcon}></i>
                <p style={styles.emptyTitle}>No students found</p>
                <p style={styles.emptySubtitle}>
                  {filter !== 'all' ? 'Try adjusting your filter settings' : 'No students are registered yet'}
                </p>
              </div>
            ) : (
              <div style={styles.studentsGrid}>
                {filteredStudents.map((student, index) => (
                  <div key={`${student.register_number}-${index}`} style={styles.studentCard}>
                    <div style={styles.studentHeader}>
                      <div style={styles.studentInfo}>
                        <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb', width: '40px', height: '40px'}}>
                          <i className="fas fa-user" style={styles.smallIcon}></i>
                        </div>
                        <div>
                          <h3 style={styles.studentName}>{student.name || 'N/A'}</h3>
                          <p style={styles.studentRegNo}>{student.register_number || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div style={styles.attendanceToggleContainer}>
                        <label style={styles.attendanceToggle}>
                          <input
                            type="checkbox"
                            checked={attendance[student.register_number] === 'PRESENT'}
                            onChange={e => handleAttendanceChange(student.register_number, e.target.checked)}
                            style={styles.toggleInput}
                          />
                          <span 
                            style={{
                              ...styles.attendanceSlider,
                              backgroundColor: attendance[student.register_number] === 'PRESENT' ? '#16a34a' : '#dc2626'
                            }}
                          ></span>
                        </label>
                        <span style={{
                          ...styles.statusText,
                          color: attendance[student.register_number] === 'PRESENT' ? '#16a34a' : '#dc2626'
                        }}>
                          {attendance[student.register_number]}
                        </span>
                      </div>
                    </div>

                    <div style={styles.studentDetails}>
                      <div style={styles.detailItem}>
                        <p style={styles.detailLabel}>Year of Study</p>
                        <p style={styles.detailValue}>{student.year_of_study || 'N/A'}</p>
                      </div>
                      <div style={styles.detailItem}>
                        <p style={styles.detailLabel}>Branch</p>
                        <p style={styles.detailValue}>{getBranchName(student.branch)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        <div style={styles.submitSection}>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || filteredStudents.length === 0}
            style={{
              ...styles.submitButton,
              ...(isSubmitting || filteredStudents.length === 0 ? styles.disabledButton : {})
            }}
          >
            {isSubmitting ? (
              <>
                <div style={styles.smallSpinner}></div>
                {hasExistingAttendance ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <i className="fas fa-save" style={styles.buttonIcon}></i>
                {hasExistingAttendance ? 'Update Attendance' : 'Submit Attendance'}
              </>
            )}
          </button>
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
    padding: '16px',
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
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '18px',
    margin: 0,
  },
  header: {
    marginBottom: '24px',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '16px',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#6b7280',
    margin: 0,
    fontSize: '14px',
  },
  headerActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dateLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
    color: '#374151',
    fontSize: '14px',
  },
  dateIcon: {
    color: '#6b7280',
    fontSize: '16px',
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  filterContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '120px',
  },
  errorAlert: {
    marginBottom: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: '16px',
    marginTop: '2px',
    flexShrink: 0,
  },
  errorTitle: {
    color: '#991b1b',
    fontWeight: '500',
    margin: '0 0 4px 0',
    fontSize: '14px',
  },
  errorMessage: {
    color: '#b91c1c',
    margin: 0,
    fontSize: '12px',
  },
  successAlert: {
    marginBottom: '16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  successIcon: {
    color: '#16a34a',
    fontSize: '16px',
    marginTop: '2px',
    flexShrink: 0,
  },
  successTitle: {
    color: '#166534',
    fontWeight: '500',
    margin: '0 0 4px 0',
    fontSize: '14px',
  },
  successMessage: {
    color: '#15803d',
    margin: 0,
    fontSize: '12px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '12px',
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'center',
  },
  statIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
  },
  iconSize: {
    fontSize: '18px',
  },
  smallIcon: {
    fontSize: '14px',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  statValue: {
    fontSize: '24px',
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
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  cardContent: {
    padding: '16px',
  },
  bulkActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  bulkButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  presentButton: {
    backgroundColor: '#16a34a',
  },
  absentButton: {
    backgroundColor: '#dc2626',
  },
  buttonIcon: {
    fontSize: '12px',
  },
  attendanceProgress: {
    display: 'flex',
    alignItems: 'center',
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
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: '12px',
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
    padding: '12px',
    transition: 'all 0.2s',
    backgroundColor: '#fafafa',
  },
  studentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  studentName: {
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
    fontSize: '14px',
  },
  studentRegNo: {
    color: '#6b7280',
    fontSize: '12px',
    margin: 0,
  },
  attendanceToggleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  attendanceToggle: {
    position: 'relative',
    display: 'inline-block',
    width: '48px',
    height: '24px',
    cursor: 'pointer',
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  attendanceSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: '0',
    bottom: 0,
    transition: '0.4s',
    borderRadius: '24px',
    '&:before': {
      position: 'absolute',
      content: '""',
      height: '20px',
      width: '20px',
      left: '2px',
      bottom: '2px',
      backgroundColor: 'white',
      transition: '0.4s',
      borderRadius: '50%',
    }
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  studentDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  detailItem: {
    minWidth: 0,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: '10px',
    fontWeight: '500',
    margin: '0 0 2px 0',
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
  submitSection: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '16px',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};

// Add CSS keyframes for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .attendance-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + .attendance-slider:before {
    transform: translateX(26px);
  }
  
  .student-card:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
  }
  
  .bulk-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  @media (min-width: 640px) {
    .header-content {
      flex-direction: row;
      align-items: center;
    }
    .header-actions {
      flex-direction: row;
      align-items: center;
    }
    .filter-container {
      align-items: center;
    }
    .statsGrid {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .studentsGrid {
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
  }
  
  @media (min-width: 1024px) {
    .content {
      padding: '32px';
    }
    .headerCard {
      padding: '24px';
    }
    .cardHeader {
      padding: '24px';
    }
    .cardContent {
      padding: '24px';
    }
    .statsGrid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
    .statValue {
      font-size: 36px;
    }
    .submitButton {
      padding: '16px 32px';
      font-size: 16px';
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default MarkAttendance;