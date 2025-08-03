import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ onLayoutChange }) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');

  // Handle responsive behavior for mobile detection only
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      onLayoutChange && onLayoutChange({ isMobile: mobile, isCollapsed: false, isOpen: true });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onLayoutChange]);

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
  };

  const navItems = [
    { name: 'Dashboard', icon: 'fas fa-tachometer-alt', href: '/' },
    { name: 'Add Student', icon: 'fas fa-user-plus', href: '/add' },
    { name: 'Remove Student', icon: 'fas fa-user-minus', href: '/remove' },
    { name: 'Mark Attendance', icon: 'fas fa-clipboard-check', href: '/attendance' },
    { name: 'Download Reports', icon: 'fas fa-file-download', href: '/reports' },
    { name: 'Trends', icon: 'fas fa-chart-line', href: '/trends' },
  ];

  return (
    <>
      {/* Font Awesome Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          width: '280px', // Fixed width
          transform: 'translateX(0)', // Always visible
          zIndex: isMobile ? 1000 : 'auto',
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <i className="fas fa-graduation-cap" style={styles.logoIconText}></i>
            </div>
            <div style={styles.logoTextContainer}>
              <h2 style={styles.logoText}>AMS</h2>
              <p style={styles.logoSubtext}>Attendance Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navItems.map((item, index) => {
            const isActive = activeItem === item.name;
            return (
              <Link
                key={index}
                to={item.href}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  justifyContent: 'flex-start',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                }}
                onClick={() => handleNavClick(item.name)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#f8fafc';
                    const icon = e.target.querySelector('.nav-icon');
                    if (icon) icon.style.backgroundColor = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                    const icon = e.target.querySelector('.nav-icon');
                    if (icon) icon.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  className="nav-icon"
                  style={{
                    ...styles.navIcon,
                    backgroundColor: isActive ? '#3b82f6' : 'transparent',
                    color: isActive ? 'white' : '#94a3b8'
                  }}
                >
                  <i className={item.icon}></i>
                </div>
                <span style={{
                  ...styles.navText,
                  color: isActive ? '#1e293b' : '#64748b'
                }}>
                  {item.name}
                </span>
                {isActive && (
                  <div style={styles.activeIndicator}></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={styles.userSection}>
          <div style={styles.userProfile}>
            <div style={styles.userAvatar}>
              <i className="fas fa-user" style={styles.userAvatarIcon}></i>
            </div>
            <div style={styles.userInfo}>
              <h4 style={styles.userName}>Harsh Prakash</h4>
              <p style={styles.userRole}>Administrator</p>
            </div>
          </div>
          <div style={styles.userActions}>
            <button
              style={styles.userActionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e2e8f0';
                e.target.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.color = '#64748b';
              }}
            >
              <i className="fas fa-cog"></i>
            </button>
            <button
              style={styles.userActionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e2e8f0';
                e.target.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.color = '#64748b';
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    backgroundColor: 'white',
    borderRight: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'none', // Removed transition since no collapse
    zIndex: 40,
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    minHeight: '88px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#3b82f6',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoIconText: {
    fontSize: '24px',
    color: 'white',
  },
  logoTextContainer: {
    minWidth: 0,
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 2px 0',
    lineHeight: 1,
  },
  logoSubtext: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    lineHeight: 1,
  },
  nav: {
    flex: 1,
    padding: '16px 0',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    margin: '0 16px 8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.2s',
    position: 'relative',
    minHeight: '48px',
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: '#f1f5f9',
  },
  navIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  navText: {
    fontWeight: '500',
    fontSize: '15px',
    transition: 'color 0.2s',
  },
  activeIndicator: {
    position: 'absolute',
    right: '12px',
    width: '4px',
    height: '20px',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
  },
  userSection: {
    padding: '24px',
    borderTop: '1px solid #f1f5f9',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarIcon: {
    fontSize: '20px',
    color: '#64748b',
  },
  userInfo: {
    minWidth: 0,
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 2px 0',
    lineHeight: 1,
  },
  userRole: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: 1,
  },
  userActions: {
    display: 'flex',
    gap: '8px',
  },
  userActionButton: {
    width: '36px',
    height: '36px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
};

export default Sidebar;