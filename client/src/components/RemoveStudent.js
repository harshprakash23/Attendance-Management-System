import { useState } from 'react';

function RemoveStudent() {
  const [registerNumber, setRegisterNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSearch = async () => {
    if (!registerNumber.trim()) {
      setError('Please enter a register number');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:5000/api/remove/getStudent/${registerNumber}`);
      const data = await response.json();
      
      if (response.ok) {
        setStudent(data);
        setError(null);
      } else {
        throw new Error(data.message || 'Student not found');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setError(error.message || 'Student not found. Please check the register number and try again.');
      setStudent(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:5000/api/remove/delete/${registerNumber}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuccess('Student deleted successfully!');
        setStudent(null);
        setRegisterNumber('');
        setError(null);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.message || 'Error deleting student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getBranchName = (code) => {
    const branches = { 
      'CSE': 'Computer Science Engineering', 
      'ECE': 'Electronics & Communication Engineering', 
      'MECH': 'Mechanical Engineering', 
      'CIVIL': 'Civil Engineering',
      'EEE': 'Electrical & Electronics Engineering',
      'IT': 'Information Technology'
    };
    return branches[code] || code;
  };

  const getYearName = (year) => {
    const years = {
      '1': 'First Year',
      '2': 'Second Year', 
      '3': 'Third Year',
      '4': 'Fourth Year'
    };
    return years[year] || `Year ${year}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerCard}>
            <div style={styles.headerContent}>
              <div style={styles.headerLeft}>
                <div style={styles.headerIcon}>
                  <i className="fas fa-user-minus" style={styles.iconSize}></i>
                </div>
                <div>
                  <h1 style={styles.title}>Remove Student</h1>
                  <p style={styles.subtitle}>Search and remove a student from the attendance system</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div style={styles.errorAlert}>
            <i className="fas fa-exclamation-circle" style={styles.errorIcon}></i>
            <div>
              <h3 style={styles.errorTitle}>Error</h3>
              <p style={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <i className="fas fa-check-circle" style={styles.successIcon}></i>
            <div>
              <h3 style={styles.successTitle}>Success</h3>
              <p style={styles.successMessage}>{success}</p>
            </div>
          </div>
        )}

        {/* Search Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-search" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Search Student</h2>
            </div>
          </div>

          <div style={styles.cardContent}>
            <div style={styles.searchSection}>
              <div style={styles.searchContainer}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Register Number *
                    <div style={styles.inputContainer}>
                      <input
                        type="text"
                        value={registerNumber}
                        onChange={(e) => setRegisterNumber(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={styles.input}
                        placeholder="Enter student register number"
                        disabled={isSearching}
                      />
                      <button
                        onClick={handleSearch}
                        disabled={isSearching || !registerNumber.trim()}
                        style={{
                          ...styles.searchButton,
                          ...(isSearching || !registerNumber.trim() ? styles.searchButtonDisabled : {})
                        }}
                      >
                        {isSearching ? (
                          <>
                            <div style={styles.smallSpinner}></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search" style={styles.buttonIcon}></i>
                            Search
                          </>
                        )}
                      </button>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Details Card */}
        {student && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderContent}>
                <i className="fas fa-user-circle" style={styles.sectionIcon}></i>
                <h2 style={styles.sectionTitle}>Student Details</h2>
              </div>
              <div style={styles.warningBadge}>
                <i className="fas fa-exclamation-triangle" style={styles.warningIcon}></i>
                Deletion Warning
              </div>
            </div>

            <div style={styles.cardContent}>
              <div style={styles.studentDetailsContainer}>
                {/* Student Info */}
                <div style={styles.studentInfo}>
                  <div style={styles.studentHeader}>
                    <div style={styles.studentAvatar}>
                      <i className="fas fa-user" style={styles.avatarIcon}></i>
                    </div>
                    <div style={styles.studentBasicInfo}>
                      <h3 style={styles.studentName}>{student.name}</h3>
                      <p style={styles.studentRegNo}>Register Number: {student.registerNumber || student.register_number}</p>
                    </div>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <div style={styles.detailIcon}>
                        <i className="fas fa-graduation-cap" style={styles.smallIcon}></i>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Year of Study</p>
                        <p style={styles.detailValue}>{getYearName(student.year || student.year_of_study)}</p>
                      </div>
                    </div>

                    <div style={styles.detailItem}>
                      <div style={styles.detailIcon}>
                        <i className="fas fa-code-branch" style={styles.smallIcon}></i>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Branch</p>
                        <p style={styles.detailValue}>{getBranchName(student.branch)}</p>
                      </div>
                    </div>

                    {student.email && (
                      <div style={styles.detailItem}>
                        <div style={styles.detailIcon}>
                          <i className="fas fa-envelope" style={styles.smallIcon}></i>
                        </div>
                        <div>
                          <p style={styles.detailLabel}>Email</p>
                          <p style={styles.detailValue}>{student.email}</p>
                        </div>
                      </div>
                    )}

                    {student.mobile && (
                      <div style={styles.detailItem}>
                        <div style={styles.detailIcon}>
                          <i className="fas fa-phone" style={styles.smallIcon}></i>
                        </div>
                        <div>
                          <p style={styles.detailLabel}>Mobile</p>
                          <p style={styles.detailValue}>{student.mobile}</p>
                        </div>
                      </div>
                    )}

                    {student.dob && (
                      <div style={styles.detailItem}>
                        <div style={styles.detailIcon}>
                          <i className="fas fa-birthday-cake" style={styles.smallIcon}></i>
                        </div>
                        <div>
                          <p style={styles.detailLabel}>Date of Birth</p>
                          <p style={styles.detailValue}>{new Date(student.dob).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    {student.gender && (
                      <div style={styles.detailItem}>
                        <div style={styles.detailIcon}>
                          <i className="fas fa-venus-mars" style={styles.smallIcon}></i>
                        </div>
                        <div>
                          <p style={styles.detailLabel}>Gender</p>
                          <p style={styles.detailValue}>{student.gender}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warning Section */}
                <div style={styles.warningSection}>
                  <div style={styles.warningCard}>
                    <div style={styles.warningHeader}>
                      <i className="fas fa-exclamation-triangle" style={styles.warningHeaderIcon}></i>
                      <h3 style={styles.warningTitle}>Permanent Deletion</h3>
                    </div>
                    <div style={styles.warningContent}>
                      <p style={styles.warningText}>
                        This action will permanently delete the student and all associated attendance records. 
                        This operation cannot be undone.
                      </p>
                      <ul style={styles.warningList}>
                        <li>Student profile will be permanently removed</li>
                        <li>All attendance history will be deleted</li>
                        <li>This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>

                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => {
                        setStudent(null);
                        setRegisterNumber('');
                        setError(null);
                        setSuccess(null);
                      }}
                      style={styles.cancelButton}
                    >
                      <i className="fas fa-times" style={styles.buttonIcon}></i>
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{
                        ...styles.deleteButton,
                        ...(isDeleting ? styles.deleteButtonDisabled : {})
                      }}
                    >
                      {isDeleting ? (
                        <>
                          <div style={styles.smallSpinner}></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash-alt" style={styles.buttonIcon}></i>
                          Delete Student
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '32px 16px',
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSize: {
    fontSize: '28px',
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
  },
  errorMessage: {
    color: '#b91c1c',
    margin: 0,
  },
  successAlert: {
    marginBottom: '24px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  successIcon: {
    color: '#22c55e',
    fontSize: '20px',
    marginTop: '2px',
    flexShrink: 0,
  },
  successTitle: {
    color: '#166534',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  successMessage: {
    color: '#15803d',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '32px',
  },
  cardHeader: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionIcon: {
    fontSize: '24px',
    color: '#3b82f6',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  warningBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  warningIcon: {
    fontSize: '12px',
  },
  cardContent: {
    padding: '32px',
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  searchContainer: {
    maxWidth: '600px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
    minWidth: '120px',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  buttonIcon: {
    fontSize: '14px',
  },
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  studentDetailsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px',
  },
  studentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb',
  },
  studentAvatar: {
    width: '64px',
    height: '64px',
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: '32px',
  },
  studentBasicInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  studentRegNo: {
    color: '#6b7280',
    margin: 0,
    fontSize: '16px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  detailIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  smallIcon: {
    fontSize: '14px',
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '500',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    color: '#111827',
    fontWeight: '500',
    margin: 0,
  },
  warningSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '20px',
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  warningHeaderIcon: {
    color: '#d97706',
    fontSize: '20px',
  },
  warningTitle: {
    color: '#92400e',
    fontWeight: '600',
    margin: 0,
  },
  warningContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  warningText: {
    color: '#92400e',
    margin: 0,
    lineHeight: '1.5',
  },
  warningList: {
    color: '#92400e',
    margin: 0,
    paddingLeft: '20px',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
    minWidth: '140px',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
};

// Add CSS animation for spinner and responsive design
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  @media (max-width: 768px) {
    .studentDetailsContainer {
      grid-template-columns: 1fr !important;
    }
    
    .detailsGrid {
      grid-template-columns: 1fr !important;
    }
    
    .actionButtons {
      flex-direction: column;
    }
    
    .inputContainer {
      flex-direction: column;
      align-items: stretch !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default RemoveStudent;