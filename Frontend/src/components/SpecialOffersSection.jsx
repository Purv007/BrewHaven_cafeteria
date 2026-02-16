import React, { useState, useEffect } from 'react';

const SpecialOffersSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredOffer, setHoveredOffer] = useState(null);

  const specialOffers = [
    {
      id: 1,
      title: "Happy Hour Discount",
      description: "Get 25% off all coffee beverages every weekday from 8AM to 10AM",
      discount: "25% OFF",
      icon: "⏰",
      validUntil: "Daily 8AM-10AM",
      category: "Time-based",
      code: "HAPPYHOUR",
      isActive: true
    },
    {
      id: 2,
      title: "Student Discount",
      description: "Show your valid student ID at checkout to get 20% off your entire order",
      discount: "20% OFF",
      icon: "🎓",
      validUntil: "Always Available",
      category: "Education",
      code: "STUDENT20",
      isActive: true
    },

  ];

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

    const element = document.querySelector('#special-offers-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const styles = {
    specialOffersSection: {
      backgroundColor: '#fff',
      padding: '100px 24px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '600px',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
      transition: 'all 0.8s ease-out',
    },
    sectionTitle: {
      fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
      fontWeight: '800',
      color: '#5d4037',
      textAlign: 'center',
      marginBottom: '16px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    sectionSubtitle: {
      fontSize: 'clamp(1rem, 1.5vw, 1.1rem)',
      color: '#6d4c41',
      textAlign: 'center',
      marginBottom: '80px',
      lineHeight: '1.6',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    highlightText: {
      color: '#b8860b',
      fontWeight: '800',
    },
    offersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '32px',
      marginBottom: '60px',
    },
    offerCard: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '32px 24px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      border: '2px solid transparent',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    offerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    offerIcon: {
      fontSize: '2.5rem',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f5f0',
      borderRadius: '50%',
      border: '2px solid #d4af37',
    },
    discountBadge: {
      backgroundColor: '#b8860b',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    offerTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#5d4037',
      marginBottom: '12px',
      lineHeight: '1.3',
    },
    offerDescription: {
      fontSize: '1rem',
      color: '#6d4c41',
      lineHeight: '1.6',
      marginBottom: '16px',
    },
    offerFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.9rem',
    },
    category: {
      color: '#b8860b',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    validUntil: {
      color: '#6d4c41',
      opacity: '0.8',
      fontStyle: 'italic',
    },
    discountCode: {
      backgroundColor: '#f8f5f0',
      color: '#b8860b',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: '600',
      fontFamily: 'monospace',
      border: '1px solid #d4af37',
      marginTop: '12px',
      textAlign: 'center',
    },
    ctaButton: {
      backgroundColor: '#d4af37',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '16px 32px',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 25px rgba(212, 175, 55, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      display: 'block',
      margin: '0 auto',
    },
    decorativeElement: {
      position: 'absolute',
      top: '10%',
      left: '5%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.04) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '15%',
      right: '8%',
      width: '180px',
      height: '180px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.06) 0%, rgba(193, 154, 107, 0.03) 70%, transparent 100%)',
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
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <section id="special-offers-section" style={styles.specialOffersSection}>
      <style>{animationStyles}</style>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>
          Active <span style={styles.highlightText}>Discounts</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          These discounts are automatically applied during checkout when conditions are met.
        </p>
        
        <div style={styles.offersGrid}>
          {specialOffers.map((offer, index) => (
            <div
              key={offer.id}
              style={{
                ...styles.offerCard,
                transform: hoveredOffer === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: hoveredOffer === index 
                  ? '0 20px 60px rgba(0, 0, 0, 0.15)' 
                  : '0 12px 40px rgba(0, 0, 0, 0.08)',
                border: hoveredOffer === index ? '2px solid #d4af37' : '2px solid transparent',
                animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none',
              }}
              onMouseEnter={() => setHoveredOffer(index)}
              onMouseLeave={() => setHoveredOffer(null)}
            >
              <div style={styles.offerHeader}>
                <div style={styles.offerIcon}>
                  {offer.icon}
                </div>
                <div style={styles.discountBadge}>
                  {offer.discount}
                </div>
              </div>
              
              <h3 style={styles.offerTitle}>{offer.title}</h3>
              <p style={styles.offerDescription}>{offer.description}</p>
              
              <div style={styles.offerFooter}>
                <span style={styles.category}>{offer.category}</span>
                <span style={styles.validUntil}>{offer.validUntil}</span>
              </div>
              
              <div style={styles.discountCode}>
                Code: {offer.code}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          style={styles.ctaButton}
          onClick={() => window.location.href = '/menu'}
        >
          Start Shopping
        </button>
      </div>
    </section>
  );
};

export default SpecialOffersSection;
