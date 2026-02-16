import React, { useState, useEffect } from 'react';

const NewsletterSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    // Trigger animation when component comes into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector('#newsletter-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      setEmail('');
      // In a real app, you would send this to your backend
      console.log('Newsletter subscription:', email);
    }
  };

  const styles = {
    newsletterSection: {
      background: 'linear-gradient(135deg, #5d4037 0%, #8d6e63 100%)',
      padding: '100px 24px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '500px',
      color: '#fff',
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
      transition: 'all 0.8s ease-out',
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
      fontWeight: '800',
      color: '#fff',
      marginBottom: '24px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    highlightText: {
      color: '#d4af37',
      fontWeight: '800',
    },
    sectionSubtitle: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: '#f3e9d2',
      marginBottom: '40px',
      lineHeight: '1.6',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    benefitsList: {
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      marginBottom: '48px',
      flexWrap: 'wrap',
    },
    benefit: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1rem',
      color: '#f3e9d2',
    },
    benefitIcon: {
      fontSize: '1.2rem',
      color: '#d4af37',
    },
    formContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '40px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '32px',
    },
    form: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emailInput: {
      flex: '1',
      minWidth: '280px',
      padding: '16px 24px',
      borderRadius: '50px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      fontSize: '1rem',
      color: '#5d4037',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    subscribeButton: {
      backgroundColor: isButtonHovered ? '#b8860b' : '#d4af37',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '16px 32px',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      boxShadow: isButtonHovered ? '0 8px 30px rgba(212, 175, 55, 0.6)' : '0 6px 25px rgba(212, 175, 55, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      transform: isButtonHovered ? 'translateY(-3px)' : 'translateY(0)',
      whiteSpace: 'nowrap',
    },
    successMessage: {
      backgroundColor: 'rgba(76, 175, 80, 0.9)',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '16px',
      fontSize: '1rem',
      fontWeight: '600',
      marginTop: '24px',
      animation: 'slideIn 0.5s ease-out',
    },
    privacyNote: {
      fontSize: '0.9rem',
      color: '#f3e9d2',
      opacity: '0.8',
      marginTop: '24px',
      lineHeight: '1.5',
    },
    decorativeElement: {
      position: 'absolute',
      top: '15%',
      right: '10%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '20%',
      left: '8%',
      width: '150px',
      height: '150px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.12) 0%, rgba(193, 154, 107, 0.06) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 6s ease-in-out infinite reverse',
    },
  };

  // Add CSS animations
  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <section id="newsletter-section" style={styles.newsletterSection}>
      <style>{animationStyles}</style>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>
          Stay in the <span style={styles.highlightText}>Loop</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Subscribe to our newsletter and be the first to know about new menu items, exclusive offers, and coffee brewing tips.
        </p>
        
        <div style={styles.benefitsList}>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>🎯</span>
            <span>Exclusive Offers</span>
          </div>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>☕</span>
            <span>New Menu Items</span>
          </div>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>💡</span>
            <span>Brewing Tips</span>
          </div>
        </div>
        
        <div style={styles.formContainer}>
          {!isSubscribed ? (
            <form style={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.emailInput}
                required
              />
              <button
                type="submit"
                style={styles.subscribeButton}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
              >
                Subscribe Now
              </button>
            </form>
          ) : (
            <div style={styles.successMessage}>
              🎉 Thank you for subscribing! You'll receive our updates soon.
            </div>
          )}
        </div>
        
        <p style={styles.privacyNote}>
          We respect your privacy. Unsubscribe at any time. No spam, just coffee love! ☕
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
