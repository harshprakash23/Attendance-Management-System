import { useState } from 'react';

function AddStudent() {
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    year: '',
    branch: '',
    dob: '',
    gender: '',
    community: '',
    minority: 'No',
    bloodGroup: '',
    aadhar: '',
    mobile: '',
    email: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/form/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message || 'Student added successfully!');
        setError(null);
        setFormData({
          name: '',
          registerNumber: '',
          year: '',
          branch: '',
          dob: '',
          gender: '',
          community: '',
          minority: 'No',
          bloodGroup: '',
          aadhar: '',
          mobile: '',
          email: ''
        });
      } else {
        throw new Error(data.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setError(error.message || 'Failed to add student. Please try again.');
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerCard}>
            <div style={styles.headerContent}>
              <div style={styles.headerLeft}>
                <div style={styles.headerIcon}>
                  <i className="fas fa-user-plus" style={styles.iconSize}></i>
                </div>
                <div>
                  <h1 style={styles.title}>Add New Student</h1>
                  <p style={styles.subtitle}>Register a new student in the attendance system</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div style={styles.errorAlert}>
            <i className="fas fa-exclamation-circle" style={styles.alertIcon}></i>
            <div>
              <h3 style={styles.alertTitle}>Error</h3>
              <p style={styles.alertMessage}>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <i className="fas fa-check-circle" style={styles.alertIcon}></i>
            <div>
              <h3 style={styles.alertTitle}>Success</h3>
              <p style={styles.alertMessage}>{success}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-edit" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Student Information</h2>
            </div>
          </div>

          <div style={styles.cardContent}>
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Personal Information Section */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeading}>
                  <i className="fas fa-user" style={styles.sectionHeadingIcon}></i>
                  Personal Information
                </h3>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      style={styles.input}
                      placeholder="e.g., John Doe"
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Register Number *</label>
                    <input 
                      type="text" 
                      name="registerNumber" 
                      value={formData.registerNumber} 
                      onChange={handleChange} 
                      style={styles.input}
                      placeholder="e.g., 2023CSE001"
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Birth *</label>
                    <input 
                      type="date" 
                      name="dob" 
                      value={formData.dob} 
                      onChange={handleChange} 
                      style={styles.input}
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Gender *</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange} 
                      style={styles.select}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Blood Group</label>
                    <select 
                      name="bloodGroup" 
                      value={formData.bloodGroup} 
                      onChange={handleChange} 
                      style={styles.select}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Aadhar Number</label>
                    <input 
                      type="text" 
                      name="aadhar" 
                      value={formData.aadhar} 
                      onChange={handleChange} 
                      style={styles.input}
                      placeholder="e.g., 1234-5678-9012"
                      maxLength="12"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeading}>
                  <i className="fas fa-graduation-cap" style={styles.sectionHeadingIcon}></i>
                  Academic Information
                </h3>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Year of Study *</label>
                    <select 
                      name="year" 
                      value={formData.year} 
                      onChange={handleChange} 
                      style={styles.select}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Branch *</label>
                    <select 
                      name="branch" 
                      value={formData.branch} 
                      onChange={handleChange} 
                      style={styles.select}
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="CSE">Computer Science Engineering</option>
                      <option value="ECE">Electronics & Communication</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                      <option value="EEE">Electrical & Electronics</option>
                      <option value="IT">Information Technology</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Community</label>
                    <select 
                      name="community" 
                      value={formData.community} 
                      onChange={handleChange} 
                      style={styles.select}
                    >
                      <option value="">Select Community</option>
                      <option value="OC">OC (Open Category)</option>
                      <option value="BC">BC (Backward Class)</option>
                      <option value="MBC">MBC (Most Backward Class)</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Minority Status</label>
                    <select 
                      name="minority" 
                      value={formData.minority} 
                      onChange={handleChange} 
                      style={styles.select}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeading}>
                  <i className="fas fa-phone" style={styles.sectionHeadingIcon}></i>
                  Contact Information
                </h3>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Mobile Number *</label>
                    <input 
                      type="tel" 
                      name="mobile" 
                      value={formData.mobile} 
                      onChange={handleChange} 
                      style={styles.input}
                      placeholder="e.g., 9876543210"
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      style={styles.input}
                      placeholder="e.g., john.doe@example.com"
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={styles.submitSection}>
                <button 
                  type="submit" 
                  style={{
                    ...styles.submitButton,
                    ...(isSubmitting ? styles.submitButtonDisabled : {})
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div style={styles.smallSpinner}></div>
                      Adding Student...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus" style={styles.buttonIcon}></i>
                      Add Student
                    </>
                  )}
                </button>
              </div>
            </form>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '20px 0',
  },
  content: {
    maxWidth: '900px',
    width: '100%',
    padding: '0 16px',
  },
  header: {
    marginBottom: '24px',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    padding: '24px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSize: {
    fontSize: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    color: '#64748b',
    margin: 0,
    fontSize: '16px',
  },
  errorAlert: {
    marginBottom: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  successAlert: {
    marginBottom: '16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  alertIcon: {
    color: '#dc2626',
    fontSize: '18px',
    flexShrink: 0,
  },
  alertTitle: {
    color: '#991b1b',
    fontWeight: '600',
    margin: '0 0 4px 0',
    fontSize: '16px',
  },
  alertMessage: {
    color: '#b91c1c',
    margin: 0,
    fontSize: '14px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6',
  },
  cardHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionIcon: {
    fontSize: '22px',
    color: '#3b82f6',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  cardContent: {
    padding: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeading: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionHeadingIcon: {
    fontSize: '18px',
    color: '#64748b',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    margin: 0,
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    backgroundColor: '#f9fafb',
    height: '40px',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    backgroundColor: '#f9fafb',
    height: '40px',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '1em',
  },
  submitSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  buttonIcon: {
    fontSize: '16px',
  },
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus, select:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
  }
  
  button:hover:not(:disabled) {
    background-color: #2563eb !important;
    transform: translateY(-1px) !important;
  }
  
  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    .submit-section {
      justify-content: center;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AddStudent;