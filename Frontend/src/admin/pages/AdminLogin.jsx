import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#faf8f3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    formContainer: {
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(212, 175, 55, 0.1)',
      width: '100%',
      maxWidth: '400px'
    },
    title: {
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: '700',
      color: '#5d4037',
      marginBottom: '8px'
    },
    subtitle: {
      textAlign: 'center',
      fontSize: '1rem',
      color: '#6d4c41',
      marginBottom: '32px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#3b2f2f'
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '2px solid rgba(212, 175, 55, 0.2)',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#d2b262',
      boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)'
    },
    button: {
      backgroundColor: '#b8860b',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '14px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px'
    },
    buttonHover: {
      backgroundColor: '#d2b262',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(184, 134, 11, 0.3)'
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    },
    error: {
      color: '#d32f2f',
      fontSize: '0.9rem',
      textAlign: 'center',
      padding: '8px',
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
      borderRadius: '6px'
    },
    backLink: {
      textAlign: 'center',
      marginTop: '20px'
    },
    backButton: {
      color: '#b8860b',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    backButtonHover: {
      color: '#d2b262'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>Access your cafeteria dashboard</p>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="admin@cafeteria.com"
              onFocus={(e) => {
                e.target.style.borderColor = '#d2b262';
                e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your password"
              onFocus={(e) => {
                e.target.style.borderColor = '#d2b262';
                e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#d2b262';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#b8860b';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.backLink}>
          <a href="/" style={styles.backButton}>← Back to Cafeteria</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
