import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminHeader from '../components/AdminHeader.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        console.log('No admin token found, redirecting to login');
        navigate('/admin/login');
        return;
      }

      // Fetch dashboard statistics
      const statsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else if (statsResponse.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }

      // Fetch recent orders
      const ordersResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/admin/recent-orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      transition: 'all 0.3s ease'
    },
    statCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    statIcon: {
      fontSize: '2.5rem',
      marginBottom: '16px'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#6c757d',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    section: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      marginBottom: '30px'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    ordersTable: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #dee2e6'
    },
    tableHeaderCell: {
      padding: '12px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#495057',
      fontSize: '0.9rem'
    },
    tableRow: {
      borderBottom: '1px solid #dee2e6',
      transition: 'background-color 0.2s ease'
    },
    tableRowHover: {
      backgroundColor: '#f8f9fa'
    },
    tableCell: {
      padding: '12px',
      fontSize: '0.9rem',
      color: '#495057'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '500',
      textTransform: 'uppercase'
    },
    statusPending: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    statusProcessing: {
      backgroundColor: '#cce5ff',
      color: '#004085'
    },
    statusCompleted: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    statusCancelled: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
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

  const getStatusBadgeStyle = (status) => {
    const baseStyle = styles.statusBadge;
    switch (status?.toLowerCase()) {
      case 'pending':
        return { ...baseStyle, ...styles.statusPending };
      case 'processing':
        return { ...baseStyle, ...styles.statusProcessing };
      case 'completed':
      case 'delivered':
        return { ...baseStyle, ...styles.statusCompleted };
      case 'cancelled':
        return { ...baseStyle, ...styles.statusCancelled };
      default:
        return { ...baseStyle, ...styles.statusPending };
    }
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
        
        <h1 style={styles.pageTitle}>Dashboard Overview</h1>

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={styles.statIcon}>📦</div>
            <div style={styles.statValue}>{stats.totalOrders}</div>
            <div style={styles.statLabel}>Total Orders</div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={styles.statIcon}>☕</div>
            <div style={styles.statValue}>{stats.totalProducts}</div>
            <div style={styles.statLabel}>Total Products</div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statValue}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statValue}>₹{stats.totalRevenue?.toLocaleString() || 0}</div>
            <div style={styles.statLabel}>Total Revenue</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            📋 Recent Orders
          </h2>
          
          {recentOrders.length > 0 ? (
            <table style={styles.ordersTable}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Order ID</th>
                  <th style={styles.tableHeaderCell}>Customer</th>
                  <th style={styles.tableHeaderCell}>Items</th>
                  <th style={styles.tableHeaderCell}>Total</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={styles.tableCell}>#{order._id?.slice(-6)}</td>
                    <td style={styles.tableCell}>{order.customerName || 'N/A'}</td>
                    <td style={styles.tableCell}>{order.items?.length || 0} items</td>
                    <td style={styles.tableCell}>₹{order.totalAmount || 0}</td>
                    <td style={styles.tableCell}>
                      <span style={getStatusBadgeStyle(order.status)}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.noData}>
              No recent orders found
            </div>
          )}
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

export default AdminDashboard;
