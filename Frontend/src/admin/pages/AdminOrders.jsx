import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminHeader from '../components/AdminHeader.jsx';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        console.log('No admin token found, redirecting to login');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Show success message
        console.log(`Order ${orderId} status updated to ${newStatus}`);
        // Refresh orders list
        fetchOrders();
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id?.includes(searchTerm) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate if order is ready for delivery (40 minutes after placement)
  const isOrderReadyForDelivery = (orderCreatedAt) => {
    const orderTime = new Date(orderCreatedAt);
    const currentTime = new Date();
    const timeDiff = currentTime - orderTime;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    return minutesDiff >= 40;
  };

  // Get delivery status text and color
  const getDeliveryStatus = (order) => {
    if (order.status === 'delivered') {
      return { text: 'Delivered', color: '#28a745' };
    }
    if (order.status === 'cancelled') {
      return { text: 'Cancelled', color: '#dc3545' };
    }
    if (isOrderReadyForDelivery(order.createdAt)) {
      return { text: 'Ready for Delivery', color: '#ff6b35' };
    }
    const orderTime = new Date(order.createdAt);
    const currentTime = new Date();
    const timeDiff = currentTime - orderTime;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    const remainingMinutes = Math.max(0, 40 - minutesDiff);
    return { text: `${remainingMinutes}m remaining`, color: '#ffc107' };
  };

  const statusOptions = ['all', 'pending', 'processing', 'delivered', 'cancelled'];
  const statusColors = {
    pending: '#ffc107',
    processing: '#17a2b8',
    delivered: '#28a745',
    cancelled: '#dc3545'
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
    searchInputFocus: {
      borderColor: '#b8860b'
    },
    statusSelect: {
      padding: '12px 16px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: '#fff',
      outline: 'none',
      cursor: 'pointer'
    },
    ordersTable: {
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
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      display: 'inline-block',
      minWidth: '80px',
      textAlign: 'center'
    },
    orderId: {
      fontFamily: 'monospace',
      backgroundColor: '#f8f9fa',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem'
    },
    customerInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    customerName: {
      fontWeight: '500',
      color: '#2c3e50'
    },
    customerEmail: {
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    orderItems: {
      maxWidth: '200px'
    },
    itemList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    item: {
      fontSize: '0.8rem',
      color: '#495057',
      marginBottom: '2px'
    },
    totalAmount: {
      fontWeight: '600',
      color: '#b8860b',
      fontSize: '1rem'
    },
    orderDate: {
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    actionButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.8rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginRight: '8px',
      marginBottom: '4px'
    },
    actionButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    viewButton: {
      backgroundColor: '#17a2b8',
      color: '#fff'
    },
    viewButtonHover: {
      backgroundColor: '#138496'
    },
    statusButton: {
      backgroundColor: '#6c757d',
      color: '#fff'
    },
    statusButtonHover: {
      backgroundColor: '#5a6268'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    orderDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    detailGroup: {
      marginBottom: '16px'
    },
    detailLabel: {
      fontSize: '0.9rem',
      fontWeight: '500',
      color: '#6c757d',
      marginBottom: '4px'
    },
    detailValue: {
      fontSize: '1rem',
      color: '#2c3e50',
      fontWeight: '500'
    },
    itemsSection: {
      marginBottom: '20px'
    },
    itemsTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '12px'
    },
    itemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    itemName: {
      fontWeight: '500',
      color: '#2c3e50'
    },
    itemPrice: {
      color: '#b8860b',
      fontWeight: '600'
    },
    statusSection: {
      marginBottom: '20px'
    },
    statusTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '12px'
    },
    statusButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    statusUpdateButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '30px'
    },
    closeButton: {
      backgroundColor: '#6c757d',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    closeButtonHover: {
      backgroundColor: '#5a6268'
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
        
        <h1 style={styles.pageTitle}>Orders Management</h1>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.statusSelect}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div style={styles.ordersTable}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Order ID</th>
                <th style={styles.tableHeaderCell}>Customer</th>
                <th style={styles.tableHeaderCell}>Items</th>
                <th style={styles.tableHeaderCell}>Total</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Delivery Status</th>
                <th style={styles.tableHeaderCell}>Date</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
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
                  <td style={styles.tableCell}>
                    <span style={styles.orderId}>#{order._id?.slice(-6)}</span>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <div style={styles.customerInfo}>
                      <div style={styles.customerName}>{order.customerName || 'N/A'}</div>
                      <div style={styles.customerEmail}>{order.customerEmail || 'N/A'}</div>
                    </div>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <div style={styles.orderItems}>
                      <ul style={styles.itemList}>
                        {order.items?.slice(0, 2).map((item, index) => (
                          <li key={index} style={styles.item}>
                            {item.name} x{item.quantity}
                          </li>
                        ))}
                        {order.items?.length > 2 && (
                          <li style={styles.item}>+{order.items.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <span style={styles.totalAmount}>₹{order.totalAmount || 0}</span>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: statusColors[order.status] || '#6c757d',
                        color: '#fff'
                      }}
                    >
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getDeliveryStatus(order).color,
                        color: '#fff',
                        fontSize: '0.8rem'
                      }}
                    >
                      {getDeliveryStatus(order).text}
                    </span>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <div style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button
                        style={{ ...styles.actionButton, ...styles.viewButton }}
                        onClick={() => openOrderModal(order)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#138496';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#17a2b8';
                        }}
                      >
                        View
                      </button>
                      
                      {/* Delivery Button */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          style={{
                            ...styles.actionButton,
                            backgroundColor: isOrderReadyForDelivery(order.createdAt) ? '#28a745' : '#6c757d',
                            color: '#fff',
                            marginLeft: '8px'
                          }}
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          disabled={!isOrderReadyForDelivery(order.createdAt)}
                          onMouseEnter={(e) => {
                            if (isOrderReadyForDelivery(order.createdAt)) {
                              e.target.style.backgroundColor = '#218838';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isOrderReadyForDelivery(order.createdAt)) {
                              e.target.style.backgroundColor = '#28a745';
                            }
                          }}
                        >
                          {isOrderReadyForDelivery(order.createdAt) ? 'Deliver Now' : 'Wait'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>
                📦 Order Details
                <span style={styles.orderId}>#{selectedOrder._id?.slice(-6)}</span>
              </h2>
              
              <div style={styles.orderDetails}>
                <div>
                  <div style={styles.detailGroup}>
                    <div style={styles.detailLabel}>Customer Name</div>
                    <div style={styles.detailValue}>{selectedOrder.customerName || 'N/A'}</div>
                  </div>
                  <div style={styles.detailGroup}>
                    <div style={styles.detailLabel}>Email</div>
                    <div style={styles.detailValue}>{selectedOrder.customerEmail || 'N/A'}</div>
                  </div>
                  <div style={styles.detailGroup}>
                    <div style={styles.detailLabel}>Phone</div>
                    <div style={styles.detailValue}>{selectedOrder.customerPhone || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <div style={styles.detailGroup}>
                    <div style={styles.detailLabel}>Order Date</div>
                    <div style={styles.detailValue}>
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={styles.detailGroup}>
                    <div style={styles.detailLabel}>Total Amount</div>
                    <div style={styles.detailValue}>₹{selectedOrder.totalAmount || 0}</div>
                  </div>
                  <div style={styles.detailGroup}>
                    <div style={styles.detailLabel}>Current Status</div>
                    <div style={styles.detailValue}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusColors[selectedOrder.status] || '#6c757d',
                          color: '#fff'
                        }}
                      >
                        {selectedOrder.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={styles.itemsSection}>
                <h3 style={styles.itemsTitle}>Order Items</h3>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemPrice}>
                      ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              
              <div style={styles.statusSection}>
                <h3 style={styles.statusTitle}>Update Status</h3>
                <div style={styles.statusButtons}>
                  {['pending', 'processing', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      style={{
                        ...styles.statusUpdateButton,
                        backgroundColor: status === selectedOrder.status ? statusColors[status] : '#6c757d',
                        color: '#fff'
                      }}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      onMouseEnter={(e) => {
                        if (status !== selectedOrder.status) {
                          e.target.style.backgroundColor = statusColors[status];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (status !== selectedOrder.status) {
                          e.target.style.backgroundColor = '#6c757d';
                        }
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={styles.modalActions}>
                <button
                  style={styles.closeButton}
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5a6268';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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

export default AdminOrders;
