import { useState } from 'react';

function DownloadReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadLoading, setDownloadLoading] = useState({ csv: false, pdf: false, word: false });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleDownloadCsv = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    clearMessages();
    setDownloadLoading(prev => ({ ...prev, csv: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/data/download?startDate=${startDate}&endDate=${endDate}&format=csv`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download CSV: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (!contentType?.includes('application/octet-stream') && !contentType?.includes('text/csv')) {
        throw new Error('Invalid file format received from server');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('CSV report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setError(`Failed to download CSV report: ${error.message}`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, csv: false }));
    }
  };

  const handleDownloadPdf = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    clearMessages();
    setDownloadLoading(prev => ({ ...prev, pdf: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/data/download?startDate=${startDate}&endDate=${endDate}&format=pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download PDF: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (!contentType?.includes('application/pdf')) {
        throw new Error('Invalid file format received from server');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${startDate}_to_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(`Failed to download PDF report: ${error.message}`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleDownloadWord = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    clearMessages();
    setDownloadLoading(prev => ({ ...prev, word: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/data/download?startDate=${startDate}&endDate=${endDate}&format=docx`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download Word document: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (!contentType?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        throw new Error('Invalid file format received from server');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${startDate}_to_${endDate}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Word report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading Word:', error);
      setError(`Failed to download Word report: ${error.message}`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, word: false }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const today = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const defaultStartDate = oneMonthAgo.toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerCard}>
            <div style={styles.headerContent}>
              <div>
                <h1 style={styles.title}>Download Reports</h1>
                <p style={styles.subtitle}>Generate and download attendance reports in various formats</p>
              </div>
              
              <div style={styles.quickActions}>
                <button 
                  onClick={() => {
                    setStartDate(defaultStartDate);
                    setEndDate(today);
                  }}
                  style={styles.quickActionButton}
                >
                  <i className="fas fa-calendar-alt" style={styles.buttonIcon}></i>
                  Last Month
                </button>
                <button 
                  onClick={() => {
                    setStartDate(today);
                    setEndDate(today);
                  }}
                  style={styles.quickActionButton}
                >
                  <i className="fas fa-calendar-day" style={styles.buttonIcon}></i>
                  Today Only
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Alert Messages */}
        {error && (
          <div style={styles.errorAlert}>
            <i className="fas fa-exclamation-circle" style={styles.errorIcon}></i>
            <div>
              <h3 style={styles.errorTitle}>Error</h3>
              <p style={styles.errorMessage}>{error}</p>
            </div>
            <button onClick={clearMessages} style={styles.closeButton}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <i className="fas fa-check-circle" style={styles.successIcon}></i>
            <div>
              <h3 style={styles.successTitle}>Success</h3>
              <p style={styles.successMessage}>{success}</p>
            </div>
            <button onClick={clearMessages} style={styles.closeButton}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                <i className="fas fa-file-csv" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>CSV Reports</p>
                <h3 style={styles.statValue}>Range Data</h3>
                <p style={styles.statDescription}>Download attendance data for a date range</p>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#f3e8ff', color: '#9333ea'}}>
                <i className="fas fa-file-pdf" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>PDF Reports</p>
                <h3 style={styles.statValue}>Range Data</h3>
                <p style={styles.statDescription}>Download attendance data for a date range in PDF</p>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                <i className="fas fa-file-word" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Word Reports</p>
                <h3 style={styles.statValue}>Range Data</h3>
                <p style={styles.statDescription}>Download formatted report for a date range</p>
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#f3e8ff', color: '#9333ea'}}>
                <i className="fas fa-calendar-check" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Date Range</p>
                <h3 style={styles.statValueSmall}>
                  {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Not Selected'}
                </h3>
                <p style={styles.statDescription}>Currently selected date range</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation Form */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-download" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Generate Reports</h2>
            </div>
          </div>

          <div style={styles.cardContent}>
            <div style={styles.formGrid}>
              {/* Date Selection Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>
                  <i className="fas fa-calendar" style={styles.formSectionIcon}></i>
                  Select Date Range
                </h3>
                
                <div style={styles.dateInputsGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Start Date</label>
                    <div style={styles.inputContainer}>
                      <i className="fas fa-calendar-alt" style={styles.inputIcon}></i>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={today}
                        style={styles.dateInput}
                      />
                    </div>
                    {startDate ? (
                      <p style={styles.inputHelper}>Selected: {formatDate(startDate)}</p>
                    ) : (
                      <p style={styles.inputHelper}>No date selected</p>
                    )}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>End Date</label>
                    <div style={styles.inputContainer}>
                      <i className="fas fa-calendar-alt" style={styles.inputIcon}></i>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                        max={today}
                        style={styles.dateInput}
                      />
                    </div>
                    {endDate ? (
                      <p style={styles.inputHelper}>Selected: {formatDate(endDate)}</p>
                    ) : (
                      <p style={styles.inputHelper}>No date selected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Actions Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>
                  <i className="fas fa-file-export" style={styles.formSectionIcon}></i>
                  Download Options
                </h3>
                
                <div style={styles.downloadActionsGrid}>
                  {/* CSV Download Card */}
                  <div style={styles.downloadCard}>
                    <div style={styles.downloadCardHeader}>
                      <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                        <i className="fas fa-file-csv" style={styles.smallIcon}></i>
                      </div>
                      <div>
                        <h4 style={styles.downloadCardTitle}>CSV Report</h4>
                        <p style={styles.downloadCardSubtitle}>Comprehensive data export</p>
                      </div>
                    </div>
                    
                    <div style={styles.downloadCardContent}>
                      <ul style={styles.featureList}>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          Date range support
                        </li>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          Excel compatible
                        </li>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          All student records
                        </li>
                      </ul>
                      
                      <button
                        onClick={handleDownloadCsv}
                        disabled={downloadLoading.csv || !startDate || !endDate}
                        style={{
                          ...styles.downloadButton,
                          ...styles.csvButton,
                          ...(downloadLoading.csv || !startDate || !endDate ? styles.disabledButton : {})
                        }}
                      >
                        {downloadLoading.csv ? (
                          <div style={styles.smallSpinner}></div>
                        ) : (
                          <i className="fas fa-download" style={styles.buttonIcon}></i>
                        )}
                        {downloadLoading.csv ? 'Generating...' : 'Download CSV'}
                      </button>
                    </div>
                  </div>

                  {/* PDF Download Card */}
                  <div style={styles.downloadCard}>
                    <div style={styles.downloadCardHeader}>
                      <div style={{...styles.statIcon, backgroundColor: '#f3e8ff', color: '#9333ea'}}>
                        <i className="fas fa-file-pdf" style={styles.smallIcon}></i>
                      </div>
                      <div>
                        <h4 style={styles.downloadCardTitle}>PDF Report</h4>
                        <p style={styles.downloadCardSubtitle}>Formatted data export</p>
                      </div>
                    </div>
                    
                    <div style={styles.downloadCardContent}>
                      <ul style={styles.featureList}>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          Date range support
                        </li>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          Print ready
                        </li>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          All student records
                        </li>
                      </ul>
                      
                      <button
                        onClick={handleDownloadPdf}
                        disabled={downloadLoading.pdf || !startDate || !endDate}
                        style={{
                          ...styles.downloadButton,
                          ...styles.pdfButton,
                          ...(downloadLoading.pdf || !startDate || !endDate ? styles.disabledButton : {})
                        }}
                      >
                        {downloadLoading.pdf ? (
                          <div style={styles.smallSpinner}></div>
                        ) : (
                          <i className="fas fa-download" style={styles.buttonIcon}></i>
                        )}
                        {downloadLoading.pdf ? 'Generating...' : 'Download PDF'}
                      </button>
                    </div>
                  </div>

                  {/* Word Download Card */}
                  <div style={styles.downloadCard}>
                    <div style={styles.downloadCardHeader}>
                      <div style={{...styles.statIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                        <i className="fas fa-file-word" style={styles.smallIcon}></i>
                      </div>
                      <div>
                        <h4 style={styles.downloadCardTitle}>Word Report</h4>
                        <p style={styles.downloadCardSubtitle}>Formatted data export</p>
                      </div>
                    </div>
                    
                    <div style={styles.downloadCardContent}>
                      <ul style={styles.featureList}>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          Date range support
                        </li>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          Professional format
                        </li>
                        <li style={styles.featureItem}>
                          <i className="fas fa-check" style={styles.checkIcon}></i>
                          All student records
                        </li>
                      </ul>
                      
                      <button
                        onClick={handleDownloadWord}
                        disabled={downloadLoading.word || !startDate || !endDate}
                        style={{
                          ...styles.downloadButton,
                          ...styles.wordButton,
                          ...(downloadLoading.word || !startDate || !endDate ? styles.disabledButton : {})
                        }}
                      >
                        {downloadLoading.word ? (
                          <div style={styles.smallSpinner}></div>
                        ) : (
                          <i className="fas fa-download" style={styles.buttonIcon}></i>
                        )}
                        {downloadLoading.word ? 'Generating...' : 'Download Word'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-lightbulb" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Tips & Information</h2>
            </div>
          </div>

          <div style={styles.cardContent}>
            <div style={styles.tipsGrid}>
              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>
                  <i className="fas fa-file-csv" style={styles.tipIconStyle}></i>
                </div>
                <h4 style={styles.tipTitle}>CSV Reports</h4>
                <p style={styles.tipDescription}>
                  Best for data analysis and importing into other systems. Includes all attendance records within the selected date range.
                </p>
              </div>

              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>
                  <i className="fas fa-file-pdf" style={styles.tipIconStyle}></i>
                </div>
                <h4 style={styles.tipTitle}>PDF Reports</h4>
                <p style={styles.tipDescription}>
                  Ideal for formal documentation and sharing. Generates a formatted report for the selected date range.
                </p>
              </div>

              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>
                  <i className="fas fa-file-word" style={styles.tipIconStyle}></i>
                </div>
                <h4 style={styles.tipTitle}>Word Reports</h4>
                <p style={styles.tipDescription}>
                  Perfect for formal documentation and presentations. Generates a formatted report for the selected date range.
                </p>
              </div>

              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>
                  <i className="fas fa-clock" style={styles.tipIconStyle}></i>
                </div>
                <h4 style={styles.tipTitle}>Processing Time</h4>
                <p style={styles.tipDescription}>
                  Large date ranges may take longer to process. Reports are generated in real-time and will download automatically.
                </p>
              </div>
            </div>
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
  },
  quickActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
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
    position: 'relative',
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
    position: 'relative',
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: '20px',
    marginTop: '2px',
    flexShrink: 0,
  },
  successIcon: {
    color: '#22c55e',
    fontSize: '20px',
    marginTop: '2px',
    flexShrink: 0,
  },
  errorTitle: {
    color: '#991b1b',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  successTitle: {
    color: '#166534',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  errorMessage: {
    color: '#b91c1c',
    margin: 0,
  },
  successMessage: {
    color: '#15803d',
    margin: 0,
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px',
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
  },
  iconSize: {
    fontSize: '24px',
  },
  smallIcon: {
    fontSize: '20px',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  statValueSmall: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  statDescription: {
    color: '#9ca3af',
    fontSize: '12px',
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
  cardContent: {
    padding: '24px',
  },
  formGrid: {
    display: 'grid',
    gap: '32px',
  },
  formSection: {
    display: 'grid',
    gap: '20px',
  },
  formSectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  formSectionIcon: {
    fontSize: '18px',
    color: '#3b82f6',
  },
  dateInputsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'grid',
    gap: '8px',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '16px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  dateInput: {
    padding: '12px 40px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    width: '100%',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    outline: 'none',
    backgroundColor: '#fff',
    height: '48px',
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none', // Corrected to camelCase
  },
  inputHelper: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },
  downloadActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  downloadCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#fafafa',
  },
  downloadCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  downloadCardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 2px 0',
  },
  downloadCardSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  downloadCardContent: {
    display: 'grid',
    gap: '16px',
  },
  featureList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    display: 'grid',
    gap: '8px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
  },
  checkIcon: {
    fontSize: '12px',
    color: '#22c55e',
  },
  downloadButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  csvButton: {
    backgroundColor: '#059669',
  },
  pdfButton: {
    backgroundColor: '#9333ea',
  },
  wordButton: {
    backgroundColor: '#dc2626',
  },
  disabledButton: {
    opacity: '0.6',
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
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  tipCard: {
    textAlign: 'center',
    padding: '20px',
  },
  tipIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#f3f4f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  tipIconStyle: {
    fontSize: '20px',
    color: '#6b7280',
  },
  tipTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  tipDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus, select:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  button:hover:not(:disabled) {
    background-color: ${'#047857'} !important; /* Darker shade for csvButton */
  }
  
  button:hover:not(:disabled).pdfButton {
    background-color: ${'#7e22ce'} !important; /* Darker shade for pdfButton */
  }
  
  button:hover:not(:disabled).wordButton {
    background-color: ${'#b91c1c'} !important; /* Darker shade for wordButton */
  }
  
  @media (max-width: 768px) {
    .stats-grid, .download-actions-grid, .tips-grid {
      grid-template-columns: 1fr;
    }
    .date-inputs-grid {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(styleSheet);

export default DownloadReports;