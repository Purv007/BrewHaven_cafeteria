import React, { useState, useEffect } from 'react';

const AdminHeader = ({ onLogout }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (user) {
      setAdminUser(JSON.parse(user));
    }
  }, []);

  const styles = {
    header: {
      backgroundColor: '#fff',
      padding: '16px 24px',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    welcomeText: {
      fontSize: '1.1rem',
      color: '#2c3e50',
      fontWeight: '500'
    },
    adminName: {
      color: '#b8860b',
      fontWeight: '600'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    notificationBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      position: 'relative',
      transition: 'all 0.3s ease'
    },
    notificationBtnHover: {
      backgroundColor: '#f8f9fa'
    },
    notificationBadge: {
      position: 'absolute',
      top: '0',
      right: '0',
      backgroundColor: '#e74c3c',
      color: '#fff',
      fontSize: '0.7rem',
      padding: '2px 6px',
      borderRadius: '10px',
      minWidth: '18px',
      textAlign: 'center'
    },
    notificationsPanel: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: '#fff',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      minWidth: '300px',
      maxHeight: '400px',
      overflow: 'hidden',
      zIndex: 1000
    },
    notificationsHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa'
    },
    notificationsTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2c3e50',
      margin: 0
    },
    notificationsList: {
      maxHeight: '300px',
      overflowY: 'auto'
    },
    notificationItem: {
      padding: '16px 20px',
      borderBottom: '1px solid #f1f3f4',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    notificationItemHover: {
      backgroundColor: '#f8f9fa'
    },
    notificationText: {
      fontSize: '0.9rem',
      color: '#2c3e50',
      marginBottom: '4px'
    },
    notificationTime: {
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    noNotifications: {
      padding: '20px',
      textAlign: 'center',
      color: '#6c757d',
      fontSize: '0.9rem'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      backgroundColor: '#b8860b',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '1.2rem',
      fontWeight: '600'
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    userName: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#2c3e50'
    },
    userRole: {
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    logoutBtn: {
      backgroundColor: '#e74c3c',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    logoutBtnHover: {
      backgroundColor: '#c0392b',
      transform: 'translateY(-1px)'
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={styles.header}>
      <div style={styles.leftSection}>
        <div style={styles.welcomeText}>
          Welcome back, <span style={styles.adminName}>{adminUser?.name || 'Admin'}</span>! 👋
        </div>
      </div>

      <div style={styles.rightSection}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            style={styles.notificationBtn}
            onClick={() => setShowNotifications(!showNotifications)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            🔔
            {notifications.length > 0 && (
              <span style={styles.notificationBadge}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={styles.notificationsPanel}>
              <div style={styles.notificationsHeader}>
                <h3 style={styles.notificationsTitle}>Notifications</h3>
              </div>
              
              {notifications.length > 0 ? (
                <div style={styles.notificationsList}>
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      style={styles.notificationItem}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={styles.notificationText}>
                        {notification.message}
                      </div>
                      <div style={styles.notificationTime}>
                        {notification.time}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noNotifications}>
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {getInitials(adminUser?.name)}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{adminUser?.name || 'Admin User'}</div>
            <div style={styles.userRole}>Administrator</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          style={styles.logoutBtn}
          onClick={onLogout}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#c0392b';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#e74c3c';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;
