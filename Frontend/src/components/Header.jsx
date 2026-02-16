import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';
import CoffeeLogo from '../assets/favicon.svg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [username, setUsername] = useState("");
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const { token, logout } = useAuth();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Always fetch username from backend
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.name) setUsername(data.user.name);
          else setUsername("");
        })
        .catch(() => setUsername(""));
    } else {
      setUsername("");
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const { cart, cartLoading } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Log cart count for debugging
  console.log('[Header] Cart items:', cart);
  console.log('[Header] Cart count:', cartCount);
  console.log('[Header] Cart loading:', cartLoading);

  const styles = {
    nav: {
      backgroundColor: isHomePage ? 'transparent' : '#fff',
      color: isHomePage ? '#fff' : '#3b2f2f',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: isHomePage ? 'none' : '1px solid rgba(184, 134, 11, 0.2)',
      boxShadow: isHomePage ? 'none' : '0 2px 20px rgba(184, 134, 11, 0.1)',
    },
    brandContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
    },
    logo: {
      width: '42px',
      height: '42px',
      borderRadius: '8px',
      filter: isHomePage ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
    },
    brandText: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: isHomePage ? '#fff' : '#5d4037',
    },
    links: {
      display: 'flex',
      alignItems: 'center',
      gap: '60px',
    },
    link: {
      color: isHomePage ? '#fff' : '#6d4c41',
      textDecoration: 'none',
      fontSize: '18px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      position: 'relative',
      paddingBottom: '4px',
      textShadow: isHomePage ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
    },
    login: {
      backgroundColor: '#b8860b',
      color: '#fff',
      padding: '10px 24px',
      borderRadius: '50px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(184, 134, 11, 0.3)',
    },
    user: {
      fontWeight: 600,
      color: '#3b2f2f',
      fontSize: '17px',
    },
    logoutBtn: {
      backgroundColor: '#b8860b',
      color: '#fff',
      padding: '10px 24px',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(184, 134, 11, 0.3)',
    },
    hamburger: {
      background: 'transparent',
      border: 'none',
      color: '#5d4037',
      fontSize: '28px',
      cursor: 'pointer',
    },
    mobileMenu: {
      backgroundColor: '#fff',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      borderBottom: '1px solid rgba(184, 134, 11, 0.2)',
      boxShadow: '0 2px 20px rgba(184, 134, 11, 0.1)',
    },
    dropdown: {
      position: 'relative',
      display: 'inline-block',
    },
    dropdownContent: {
      display: 'none',
      position: 'absolute',
      backgroundColor: '#fff',
      minWidth: '160px',
      boxShadow: '0 4px 12px rgba(184, 134, 11, 0.2)',
      borderRadius: 12,
      zIndex: 1001,
      right: 0,
      marginTop: 8,
      border: '1px solid rgba(184, 134, 11, 0.2)',
    },
    dropdownContentShow: {
      display: 'block',
    },
    dropdownLink: {
      color: '#3b2f2f',
      padding: '14px 20px',
      textDecoration: 'none',
      display: 'block',
      fontSize: 16,
      borderBottom: '1px solid rgba(184, 134, 11, 0.1)',
      background: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    dropdownLast: {
      borderBottom: 'none',
    },
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef();

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120);
  };

  const renderAuth = () => {
    return username ? (
      <div
        style={styles.dropdown}
        onMouseEnter={handleDropdownEnter}
        onMouseLeave={handleDropdownLeave}
      >
        <span style={styles.user}>
          Hi, {username.split(" ")[0]} &#x25BC;
        </span>
        <div
          style={{ ...styles.dropdownContent, ...(dropdownOpen ? styles.dropdownContentShow : {}) }}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <Link to="/orders" style={styles.dropdownLink}>Orders</Link>
          <Link to="/profile" style={styles.dropdownLink}>Profile</Link>
          <Link to="/settings" style={styles.dropdownLink}>Settings</Link>
          <Link to="/help" style={styles.dropdownLink}>Help</Link>
          <button onClick={handleLogout} style={{ ...styles.dropdownLink, ...styles.dropdownLast, background: 'none', border: 'none', textAlign: 'left' }}>Logout</button>
        </div>
      </div>
    ) : (
      <Link 
        to="/signin" 
        style={{
          ...styles.login,
          backgroundColor: hoveredButton === 'login' ? '#a88c5f' : '#b8860b',
          transform: hoveredButton === 'login' ? 'translateY(-1px)' : 'translateY(0)',
          boxShadow: hoveredButton === 'login' ? '0 4px 8px rgba(184, 134, 11, 0.4)' : '0 2px 4px rgba(184, 134, 11, 0.3)',
        }}
        onMouseEnter={() => setHoveredButton('login')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        Login
      </Link>
    );
  };

  return (
    <header>

      <nav style={styles.nav}>
        <Link to="/" style={styles.brandContainer}>
          <img
            src={CoffeeLogo}
            alt="Brew Haven Coffee Logo"
            style={styles.logo}
          />
          <span style={styles.brandText}>Brew Haven</span>
        </Link>

        {!isMobile && (
          <div style={styles.links}>
            <Link 
              to="/" 
              style={{
                ...styles.link,
                color: hoveredLink === 'home' ? '#b8860b' : (isHomePage ? '#fff' : '#6d4c41')
              }}
              onMouseEnter={() => setHoveredLink('home')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Home
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: hoveredLink === 'home' ? '100%' : '0%',
                height: '3px',
                backgroundColor: '#b8860b',
                transition: 'width 0.4s ease',
                borderRadius: '2px',
              }} />
            </Link>
            <Link 
              to="/menu" 
              style={{
                ...styles.link,
                color: hoveredLink === 'menu' ? '#b8860b' : (isHomePage ? '#fff' : '#6d4c41')
              }}
              onMouseEnter={() => setHoveredLink('menu')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Menu
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: hoveredLink === 'menu' ? '100%' : '0%',
                height: '3px',
                backgroundColor: '#b8860b',
                transition: 'width 0.4s ease',
                borderRadius: '2px',
              }} />
            </Link>
            <Link 
              to="/about" 
              style={{
                ...styles.link,
                color: hoveredLink === 'about' ? '#b8860b' : (isHomePage ? '#fff' : '#6d4c41')
              }}
              onMouseEnter={() => setHoveredLink('about')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              About
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: hoveredLink === 'about' ? '100%' : '0%',
                height: '3px',
                backgroundColor: '#b8860b',
                transition: '0.4s ease',
                borderRadius: '2px',
              }} />
            </Link>
            <Link to="/cart" style={{ ...styles.link, position: 'relative', fontSize: 22, marginLeft: 8, color: isHomePage ? '#fff' : '#6d4c41' }}>
              {cartLoading ? '⏳' : '🛒'}
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: -8, 
                  right: -12, 
                  background: cartLoading ? '#ffa726' : '#ff5858', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  fontSize: 13, 
                  width: 20, 
                  height: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700 
                }}>
                  {cartLoading ? '...' : cartCount}
                </span>
              )}
            </Link>
            {renderAuth()}
          </div>
        )}

        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.hamburger}>
            {menuOpen ? '✖' : '☰'}
          </button>
        )}
      </nav>

              {menuOpen && isMobile && (
          <div style={styles.mobileMenu}>
            <Link to="/" style={{...styles.link, color: '#3b2f2f'}}>Home</Link>
            <Link to="/menu" style={{...styles.link, color: '#3b2f2f'}}>Menu</Link>
            <Link to="/orders" style={{...styles.link, color: '#3b2f2f'}}>Orders</Link>
            <Link to="/about" style={{...styles.link, color: '#3b2f2f'}}>About</Link>
          {username ? (
            <>
              <span style={{...styles.user, color: '#3b2f2f'}}>Hi, {username.split(" ")[0]}</span>
              <button 
                onClick={handleLogout} 
                style={{
                  ...styles.logoutBtn,
                  backgroundColor: hoveredButton === 'mobileLogout' ? '#a88c5f' : '#b8860b',
                  transform: hoveredButton === 'mobileLogout' ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: hoveredButton === 'mobileLogout' ? '0 4px 8px rgba(184, 134, 11, 0.4)' : '0 2px 4px rgba(184, 134, 11, 0.3)',
                }}
                onMouseEnter={() => setHoveredButton('mobileLogout')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/signin" style={styles.login}>Login</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
