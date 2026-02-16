import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminHeader from '../components/AdminHeader.jsx';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        console.log('No admin token found, redirecting to login');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      gap: '20px',
      flexWrap: 'wrap'
    },
    searchSection: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInput: {
      padding: '12px 16px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '1rem',
      minWidth: '300px',
      outline: 'none',
      transition: 'border-color 0.3s ease'
    },
    usersTable: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #dee2e6'
    },
    tableHeaderCell: {
      padding: '16px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#495057',
      fontSize: '0.9rem',
      borderBottom: '1px solid #dee2e6'
    },
    tableRow: {
      borderBottom: '1px solid #f1f3f4',
      transition: 'background-color 0.2s ease'
    },
    tableRowHover: {
      backgroundColor: '#f8f9fa'
    },
    tableCell: {
      padding: '16px',
      fontSize: '0.9rem',
      color: '#495057',
      borderBottom: '1px solid #f1f3f4'
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
      alignItems: 'center',
      gap: '12px'
    },
    userName: {
      fontWeight: '500',
      color: '#2c3e50'
    },
    userEmail: {
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    joinDate: {
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #b8860b',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    noData: {
      textAlign: 'center',
      color: '#6c757d',
      padding: '40px',
      fontSize: '1.1rem'
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <AdminSidebar />
        <div style={styles.main}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.main}>
        <AdminHeader onLogout={handleLogout} />
        
        <h1 style={styles.pageTitle}>Users Management</h1>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = '#b8860b';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dee2e6';
              }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div style={styles.usersTable}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>User</th>
                <th style={styles.tableHeaderCell}>Email</th>
                <th style={styles.tableHeaderCell}>Phone</th>
                <th style={styles.tableHeaderCell}>Join Date</th>
                <th style={styles.tableHeaderCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr
                    key={user._id}
                    style={styles.tableRow}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div style={styles.userName}>{user.name || 'N/A'}</div>
                          <div style={styles.userEmail}>ID: {user._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      {user.email || 'N/A'}
                    </td>
                    
                    <td style={styles.tableCell}>
                      {user.phone || 'N/A'}
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.joinDate}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        backgroundColor: '#d4edda',
                        color: '#155724'
                      }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.tableCell}>
                    <div style={styles.noData}>
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminUsers;
