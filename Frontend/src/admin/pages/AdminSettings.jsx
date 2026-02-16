import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminHeader from '../components/AdminHeader.jsx';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    maintenanceMode: false,
    autoBackup: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for now
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setMessage('Settings saved successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear admin tokens from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Redirect to admin login page
    navigate('/admin/login');
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    main: {
      flex: 1,
      padding: '20px'
    },
    pageTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: '30px'
    },
    settingsSection: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '20px',
      borderBottom: '2px solid #b8860b',
      paddingBottom: '10px'
    },
    settingItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #e9ecef'
    },
    settingLabel: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#2c3e50'
    },
    settingDescription: {
      fontSize: '0.9rem',
      color: '#6c757d',
      marginTop: '4px'
    },
    toggleSwitch: {
      position: 'relative',
      display: 'inline-block',
      width: '50px',
      height: '24px'
    },
    toggleInput: {
      opacity: 0,
      width: 0,
      height: 0
    },
    toggleSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ccc',
      transition: '0.3s',
      borderRadius: '24px'
    },
    toggleSliderBefore: {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '3px',
      bottom: '3px',
      backgroundColor: 'white',
      transition: '0.3s',
      borderRadius: '50%'
    },
    toggleSliderActive: {
      backgroundColor: '#b8860b'
    },
    toggleSliderActiveBefore: {
      transform: 'translateX(26px)'
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '20px'
    },
    saveButtonHover: {
      backgroundColor: '#218838'
    },
    saveButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed'
    },
    message: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.9rem'
    },
    messageSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    messageError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.main}>
        <AdminHeader onLogout={handleLogout} />
        
        <h1 style={styles.pageTitle}>Admin Settings</h1>

        {message && (
          <div style={{
            ...styles.message,
            ...(message.includes('successfully') ? styles.messageSuccess : styles.messageError)
          }}>
            {message}
          </div>
        )}

        {/* Notification Settings */}
        <div style={styles.settingsSection}>
          <h2 style={styles.sectionTitle}>Notification Settings</h2>
          
          <div style={styles.settingItem}>
            <div>
              <div style={styles.settingLabel}>Email Notifications</div>
              <div style={styles.settingDescription}>Receive email alerts for important events</div>
            </div>
            <label style={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                style={styles.toggleInput}
              />
              <span style={{
                ...styles.toggleSlider,
                ...(settings.emailNotifications ? styles.toggleSliderActive : {})
              }}>
                <span style={{
                  ...styles.toggleSliderBefore,
                  ...(settings.emailNotifications ? styles.toggleSliderActiveBefore : {})
                }}></span>
              </span>
            </label>
          </div>

          <div style={styles.settingItem}>
            <div>
              <div style={styles.settingLabel}>Order Alerts</div>
              <div style={styles.settingDescription}>Get notified when new orders are placed</div>
            </div>
            <label style={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.orderAlerts}
                onChange={(e) => handleSettingChange('orderAlerts', e.target.checked)}
                style={styles.toggleInput}
              />
              <span style={{
                ...styles.toggleSlider,
                ...(settings.orderAlerts ? styles.toggleSliderActive : {})
              }}>
                <span style={{
                  ...styles.toggleSliderBefore,
                  ...(settings.orderAlerts ? styles.toggleSliderActiveBefore : {})
                }}></span>
              </span>
            </label>
          </div>

          <div style={styles.settingItem}>
            <div>
              <div style={styles.settingLabel}>Low Stock Alerts</div>
              <div style={styles.settingDescription}>Receive notifications for low inventory items</div>
            </div>
            <label style={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.lowStockAlerts}
                onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
                style={styles.toggleInput}
              />
              <span style={{
                ...styles.toggleSlider,
                ...(settings.lowStockAlerts ? styles.toggleSliderActive : {})
              }}>
                <span style={{
                  ...styles.toggleSliderBefore,
                  ...(settings.lowStockAlerts ? styles.toggleSliderActiveBefore : {})
                }}></span>
              </span>
            </label>
          </div>
        </div>

        {/* System Settings */}
        <div style={styles.settingsSection}>
          <h2 style={styles.sectionTitle}>System Settings</h2>
          
          <div style={styles.settingItem}>
            <div>
              <div style={styles.settingLabel}>Maintenance Mode</div>
              <div style={styles.settingDescription}>Enable maintenance mode to restrict access</div>
            </div>
            <label style={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                style={styles.toggleInput}
              />
              <span style={{
                ...styles.toggleSlider,
                ...(settings.maintenanceMode ? styles.toggleSliderActive : {})
              }}>
                <span style={{
                  ...styles.toggleSliderBefore,
                  ...(settings.maintenanceMode ? styles.toggleSliderActiveBefore : {})
                }}></span>
              </span>
            </label>
          </div>

          <div style={styles.settingItem}>
            <div>
              <div style={styles.settingLabel}>Auto Backup</div>
              <div style={styles.settingDescription}>Automatically backup data daily</div>
            </div>
            <label style={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                style={styles.toggleInput}
              />
              <span style={{
                ...styles.toggleSlider,
                ...(settings.autoBackup ? styles.toggleSliderActive : {})
              }}>
                <span style={{
                  ...styles.toggleSliderBefore,
                  ...(settings.autoBackup ? styles.toggleSliderActiveBefore : {})
                }}></span>
              </span>
            </label>
          </div>
        </div>

        <button
          style={{
            ...styles.saveButton,
            ...(loading ? styles.saveButtonDisabled : {})
          }}
          onClick={handleSaveSettings}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#218838';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#28a745';
            }
          }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;




