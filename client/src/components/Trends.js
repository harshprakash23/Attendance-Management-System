Trends.js

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Import the Filler plugin
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Register the Filler plugin
);

function Trends() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('percentage');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const attendanceResponse = await axios.get('http://localhost:5000/api/attendance/all');
        const attendanceData = attendanceResponse.data || [];
        setAttendanceRecords(attendanceData);

        const studentsResponse = await axios.get('http://localhost:5000/api/read');
        const studentsData = studentsResponse.data || [];
        setStudents(studentsData);

        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load trends data. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Filter data based on date range
  const getFilteredData = () => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return attendanceRecords.filter(record => new Date(record.date) >= cutoffDate);
  };

  // Process attendance data by date
  const processAttendanceData = () => {
    const filteredRecords = getFilteredData();
    const dateMap = {};

    filteredRecords.forEach(record => {
      if (!dateMap[record.date]) {
        dateMap[record.date] = { present: 0, absent: 0, total: 0 };
      }
      if (record.status?.toLowerCase() === 'present') {
        dateMap[record.date].present += 1;
      } else {
        dateMap[record.date].absent += 1;
      }
      dateMap[record.date].total += 1;
    });

    const processedData = Object.entries(dateMap)
      .map(([date, counts]) => ({
        date,
        present: counts.present,
        absent: counts.absent,
        total: counts.total,
        percentage: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return processedData;
  };

  const attendanceTrends = processAttendanceData();

  // Calculate statistics
  const calculateStats = () => {
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status?.toLowerCase() === 'present').length;
    const absentCount = totalRecords - presentCount;
    const overallPercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    const avgAttendance = attendanceTrends.length > 0
      ? Math.round(attendanceTrends.reduce((sum, day) => sum + day.percentage, 0) / attendanceTrends.length)
      : 0;

    const bestDay = attendanceTrends.reduce((best, current) =>
      current.percentage > (best?.percentage || 0) ? current : best, null);

    const worstDay = attendanceTrends.reduce((worst, current) =>
      current.percentage < (worst?.percentage || 100) ? current : worst, null);

    return {
      totalRecords,
      presentCount,
      absentCount,
      overallPercentage,
      avgAttendance,
      bestDay,
      worstDay
    };
  };

  const stats = calculateStats();

  // Chart configurations
  const trendsData = {
    labels: attendanceTrends.map(r => formatDate(r.date)),
    datasets: [{
      label: 'Attendance Percentage',
      data: attendanceTrends.map(r => r.percentage),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const barData = {
    labels: attendanceTrends.map(r => formatDate(r.date)),
    datasets: [
      {
        label: 'Present',
        data: attendanceTrends.map(r => r.present),
        backgroundColor: '#16a34a',
        borderRadius: 4,
      },
      {
        label: 'Absent',
        data: attendanceTrends.map(r => r.absent),
        backgroundColor: '#dc2626',
        borderRadius: 4,
      }
    ]
  };

  const doughnutData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [stats.presentCount, stats.absentCount],
      backgroundColor: ['#16a34a', '#dc2626'],
      borderWidth: 0,
      cutout: '60%',
    }]
  };

  // Branch-wise analysis
  const getBranchAnalysis = () => {
    const branchMap = {};
    students.forEach(student => {
      const branch = student.branch || 'Unknown';
      if (!branchMap[branch]) {
        branchMap[branch] = { total: 0, present: 0 };
      }
      branchMap[branch].total += 1;

      const studentAttendance = attendanceRecords.filter(r =>
        r.student_id === student.id && r.status?.toLowerCase() === 'present'
      ).length;
      branchMap[branch].present += studentAttendance;
    });

    return Object.entries(branchMap).map(([branch, data]) => ({
      branch,
      total: data.total,
      present: data.present,
      percentage: data.total > 0 ? Math.round((data.present / (data.total * attendanceTrends.length || 1)) * 100) : 0
    }));
  };

  const branchAnalysis = getBranchAnalysis();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f3f4f6',
          borderColor: '#e5e7eb'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#f3f4f6',
          borderColor: '#e5e7eb'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        },
        beginAtZero: true
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading trends data...</p>
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
                <h1 style={styles.title}>Attendance Trends & Analytics</h1>
                <p style={styles.subtitle}>Comprehensive insights into attendance patterns and performance</p>
              </div>
              <div style={styles.headerActions}>
                <div style={styles.filterContainer}>
                  <label style={styles.filterLabel}>
                    <i className="fas fa-calendar-alt" style={styles.filterIcon}></i>
                    Time Period:
                  </label>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 2 weeks</option>
                    <option value="30">Last 30 days</option>
                    <option value="60">Last 2 months</option>
                    <option value="90">Last 3 months</option>
                  </select>
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

        {/* Stats Overview */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                <i className="fas fa-chart-line" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Average Attendance</p>
                <h3 style={styles.statValue}>{stats.avgAttendance}%</h3>
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                <i className="fas fa-calendar-check" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Total Records</p>
                <h3 style={styles.statValue}>{stats.totalRecords}</h3>
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#fef3c7', color: '#d97706'}}>
                <i className="fas fa-trophy" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Best Day</p>
                <h3 style={styles.statValueSmall}>
                  {stats.bestDay ? `${stats.bestDay.percentage}%` : 'N/A'}
                </h3>
                <p style={styles.statSubtext}>
                  {stats.bestDay ? formatDate(stats.bestDay.date) : ''}
                </p>
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={{...styles.statIcon, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                <i className="fas fa-exclamation-triangle" style={styles.iconSize}></i>
              </div>
              <div>
                <p style={styles.statLabel}>Lowest Day</p>
                <h3 style={styles.statValueSmall}>
                  {stats.worstDay ? `${stats.worstDay.percentage}%` : 'N/A'}
                </h3>
                <p style={styles.statSubtext}>
                  {stats.worstDay ? formatDate(stats.worstDay.date) : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div style={styles.chartsRow}>
          {/* Attendance Trends Chart */}
          <div style={{...styles.chartCard, flex: '2'}}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderContent}>
                <i className="fas fa-chart-line" style={styles.sectionIcon}></i>
                <h2 style={styles.sectionTitle}>Attendance Trends Over Time</h2>
              </div>
              <div style={styles.chartControls}>
                <span style={styles.chartInfo}>
                  Showing last {dateRange} days
                </span>
              </div>
            </div>
            <div style={styles.cardContent}>
              {attendanceTrends.length > 0 ? (
                <div style={styles.chartContainer}>
                  <Line data={trendsData} options={chartOptions} />
                </div>
              ) : (
                <div style={styles.emptyChart}>
                  <i className="fas fa-chart-line" style={styles.emptyChartIcon}></i>
                  <p style={styles.emptyChartText}>No attendance data available for the selected period</p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Distribution */}
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderContent}>
                <i className="fas fa-chart-pie" style={styles.sectionIcon}></i>
                <h2 style={styles.sectionTitle}>Overall Distribution</h2>
              </div>
            </div>
            <div style={styles.cardContent}>
              {stats.totalRecords > 0 ? (
                <div style={styles.doughnutContainer}>
                  <div style={styles.chartContainer}>
                    <Doughnut
                      data={doughnutData}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              padding: 20
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div style={styles.doughnutCenter}>
                    <span style={styles.doughnutPercentage}>{stats.overallPercentage}%</span>
                    <span style={styles.doughnutLabel}>Overall</span>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyChart}>
                  <i className="fas fa-chart-pie" style={styles.emptyChartIcon}></i>
                  <p style={styles.emptyChartText}>No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={styles.chartsRow}>
          {/* Daily Breakdown */}
          <div style={{...styles.chartCard, flex: '2'}}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderContent}>
                <i className="fas fa-chart-bar" style={styles.sectionIcon}></i>
                <h2 style={styles.sectionTitle}>Daily Present vs Absent</h2>
              </div>
            </div>
            <div style={styles.cardContent}>
              {attendanceTrends.length > 0 ? (
                <div style={styles.chartContainer}>
                  <Bar data={barData} options={chartOptions} />
                </div>
              ) : (
                <div style={styles.emptyChart}>
                  <i className="fas fa-chart-bar" style={styles.emptyChartIcon}></i>
                  <p style={styles.emptyChartText}>No daily breakdown data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Branch Analysis */}
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderContent}>
                <i className="fas fa-graduation-cap" style={styles.sectionIcon}></i>
                <h2 style={styles.sectionTitle}>Branch-wise Performance</h2>
              </div>
            </div>
            <div style={styles.cardContent}>
              {branchAnalysis.length > 0 ? (
                <div style={styles.branchList}>
                  {branchAnalysis.map((branch, index) => (
                    <div key={index} style={styles.branchItem}>
                      <div style={styles.branchHeader}>
                        <span style={styles.branchName}>{branch.branch}</span>
                        <span style={styles.branchPercentage}>{branch.percentage}%</span>
                      </div>
                      <div style={styles.branchProgressBar}>
                        <div
                          style={{
                            ...styles.branchProgressFill,
                            width: `${branch.percentage}%`,
                            backgroundColor: branch.percentage >= 80 ? '#16a34a' :
                                           branch.percentage >= 60 ? '#eab308' : '#dc2626'
                          }}
                        ></div>
                      </div>
                      <div style={styles.branchStats}>
                        <span style={styles.branchStat}>
                          {branch.total} students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyChart}>
                  <i className="fas fa-graduation-cap" style={styles.emptyChartIcon}></i>
                  <p style={styles.emptyChartText}>No branch data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Trends Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderContent}>
              <i className="fas fa-table" style={styles.sectionIcon}></i>
              <h2 style={styles.sectionTitle}>Recent Daily Records</h2>
            </div>
          </div>
          <div style={styles.cardContent}>
            {attendanceTrends.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>Date</th>
                      <th style={styles.tableHeader}>Present</th>
                      <th style={styles.tableHeader}>Absent</th>
                      <th style={styles.tableHeader}>Total</th>
                      <th style={styles.tableHeader}>Percentage</th>
                      <th style={styles.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceTrends.slice(-10).reverse().map((record, index) => (
                      <tr key={`${record.date}-${index}`} style={styles.tableRow}>
                        <td style={styles.tableCell}>{formatFullDate(record.date)}</td>
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
                        <td style={styles.tableCell}>{record.total}</td>
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
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: record.percentage >= 80 ? '#dcfce7' :
                                           record.percentage >= 60 ? '#fef3c7' : '#fee2e2',
                            color: record.percentage >= 80 ? '#166534' :
                                  record.percentage >= 60 ? '#92400e' : '#991b1b'
                          }}>
                            {record.percentage >= 80 ? 'Excellent' :
                             record.percentage >= 60 ? 'Good' : 'Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <i className="fas fa-table" style={styles.emptyIcon}></i>
                <p style={styles.emptyTitle}>No recent records found</p>
                <p style={styles.emptySubtitle}>Daily attendance records will appear here once data is available</p>
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
    maxWidth: '1400px',
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
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
    color: '#374151',
  },
  filterIcon: {
    color: '#6b7280',
  },
  filterSelect: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px',
    transition: 'box-shadow 0.2s',
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    flexShrink: '0',
  },
  iconSize: {
    fontSize: '24px',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  statValueSmall: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  statSubtext: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
  chartsRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    flex: '1',
    minWidth: '400px',
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
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  chartControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chartInfo: {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  cardContent: {
    padding: '24px',
  },
  chartContainer: {
    position: 'relative',
    height: '300px',
    width: '100%',
  },
  doughnutContainer: {
    position: 'relative',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doughnutCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    marginTop: '-20px',
  },
  doughnutPercentage: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    display: 'block',
  },
  doughnutLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  emptyChart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    color: '#9ca3af',
  },
  emptyChartIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyChartText: {
    fontSize: '16px',
    margin: 0,
    textAlign: 'center',
  },
  branchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  branchItem: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  branchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  branchName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  branchPercentage: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  branchProgressBar: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  branchProgressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease-in-out',
  },
  branchStats: {
    display: 'flex',
    gap: '12px',
    fontSize: '14px',
    color: '#6b7280',
  },
  branchStat: {
    fontWeight: '500',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#f9fafb',
  },
  tableHeader: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
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
    width: '100px',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease-in-out',
  },
  percentageText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#9ca3af',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    .chartsRow {
      flex-direction: column;
    }
    .chartCard {
      min-width: 100% !important;
    }
    .tableContainer {
      overflow-x: auto;
    }
    .tableCell, .tableHeader {
      font-size: 12px !important;
      padding: 8px !important;
    }
    .progressBar {
      width: 80px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Trends;

