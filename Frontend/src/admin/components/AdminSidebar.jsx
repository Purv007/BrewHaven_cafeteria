import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '',
      path: '/admin/dashboard',
      description: 'Overview and statistics'
    },
    {
      title: 'Products',
      icon: '',
      path: '/admin/products',
      description: 'Manage menu items'
    },
    {
      title: 'Orders',
      icon: '',
      path: '/admin/orders',
      description: 'View and manage orders'
    },
    {
      title: 'Users',
      icon: '',
      path: '/admin/users',
      description: 'Customer management'
    },
    {
      title: 'Analytics',
      icon: '',
      path: '/admin/analytics',
      description: 'Sales and performance'
    },
    {
      title: 'Settings',
      icon: '',
      path: '/admin/settings',
      description: 'Admin preferences'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const styles = {
    sidebar: {
      width: collapsed ? '80px' : '280px',
      backgroundColor: '#2c3e50',
      color: '#fff',
      height: '100vh',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      position: 'sticky',
      top: 0
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #34495e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'space-between'
    },
    logo: {
      fontSize: collapsed ? '1.5rem' : '1.8rem',
      fontWeight: '700',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoText: {
      display: collapsed ? 'none' : 'block'
    },
    toggleBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#bdc3c7',
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      display: collapsed ? 'none' : 'block'
    },
    toggleBtnHover: {
      backgroundColor: '#34495e',
      color: '#fff'
    },
    nav: {
      padding: '20px 0'
    },
    menuList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    menuItem: {
      margin: '4px 16px'
    },
    menuLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      color: '#bdc3c7',
      textDecoration: 'none',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    menuLinkHover: {
      backgroundColor: '#34495e',
      color: '#fff',
      transform: 'translateX(8px)'
    },
    menuLinkActive: {
      backgroundColor: '#b8860b',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(184, 134, 11, 0.3)'
    },
    menuIcon: {
      fontSize: '1.3rem',
      minWidth: collapsed ? 'auto' : '24px',
      textAlign: 'center'
    },
    menuText: {
      fontSize: '1rem',
      fontWeight: '500',
      display: collapsed ? 'none' : 'block'
    },
    menuDescription: {
      fontSize: '0.8rem',
      color: '#95a5a6',
      marginTop: '4px',
      display: collapsed ? 'none' : 'block'
    },
    footer: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      padding: '20px',
      borderTop: '1px solid #34495e',
      textAlign: collapsed ? 'center' : 'left'
    },
    footerText: {
      fontSize: '0.8rem',
      color: '#95a5a6',
      display: collapsed ? 'none' : 'block'
    },
    backToSite: {
      color: '#b8860b',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: collapsed ? 'center' : 'flex-start'
    },
    backToSiteHover: {
      color: '#d2b262'
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span></span>
          <span style={styles.logoText}>Admin Panel</span>
        </div>
        <button
          style={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#34495e';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#bdc3c7';
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <ul style={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.path} style={styles.menuItem}>
              <a
                href={item.path}
                style={{
                  ...styles.menuLink,
                  ...(isActive(item.path) ? styles.menuLinkActive : {})
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = '#34495e';
                    e.target.style.color = '#fff';
                    e.target.style.transform = 'translateX(8px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#bdc3c7';
                    e.target.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={styles.menuIcon}>{item.icon}</span>
                <div>
                  <div style={styles.menuText}>{item.title}</div>
                  <div style={styles.menuDescription}>{item.description}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerText}>
          Cafeteria Admin v1.0
        </div>
        <a
          href="/"
          style={styles.backToSite}
          onMouseEnter={(e) => {
            e.target.style.color = '#d2b262';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#b8860b';
          }}
        >
          <span>←</span>
          <span style={styles.backToSiteText}>Back to Site</span>
        </a>
      </div>
    </div>
  );
};

export default AdminSidebar;
