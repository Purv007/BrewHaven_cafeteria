import React, { useState, useEffect } from 'react';

const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  const businessHours = [
    { day: 'Monday - Friday', hours: '7:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '8:00 AM - 9:00 PM' },
    { day: 'Sunday', hours: '8:00 AM - 6:00 PM' }
  ];

  const contactInfo = [
    { icon: '', label: 'Address', value: '123 Coffee Street, Brew District, City 12345' },
    { icon: '', label: 'Phone', value: '+91 9898104059' },
    { icon: '', label: 'Email', value: 'brewhaven30@gmail.com' },
    { icon: '', label: 'Website', value: 'www.brewhaven.com' }
  ];

  const amenities = [
    { icon: '', label: 'Free WiFi', description: 'High-speed internet for work and study' },
    { icon: '', label: 'Power Outlets', description: 'Plenty of charging stations' },
    { icon: '', label: 'Free Parking', description: 'Convenient parking available' },
    { icon: '', label: 'Accessible', description: 'Wheelchair accessible entrance' },
    { icon: '', label: 'Pet Friendly', description: 'Well-behaved pets welcome' },
    { icon: '', label: 'Non-Smoking', description: 'Clean, fresh air environment' }
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

    const element = document.querySelector('#contact-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const styles = {
    contactSection: {
      backgroundColor: '#f8f5f0',
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
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '60px',
      marginBottom: '60px',
    },
    infoCard: {
      backgroundColor: '#fff',
      borderRadius: '24px',
      padding: '40px 32px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      border: '2px solid rgba(212, 175, 55, 0.1)',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#5d4037',
      marginBottom: '32px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    },
    cardIcon: {
      fontSize: '2rem',
      color: '#b8860b',
    },
    contactList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    contactItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: '#f8f5f0',
      borderRadius: '12px',
    },
    contactIcon: {
      fontSize: '1.5rem',
      color: '#b8860b',
      flexShrink: 0,
      marginTop: '2px',
    },
    contactDetails: {
      flex: 1,
    },
    contactLabel: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#b8860b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px',
    },
    contactValue: {
      fontSize: '1rem',
      color: '#5d4037',
      lineHeight: '1.5',
    },
    hoursList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    hoursItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    },
    hoursItemLast: {
      borderBottom: 'none',
    },
    day: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#5d4037',
    },
    hours: {
      fontSize: '1rem',
      color: '#b8860b',
      fontWeight: '600',
    },
    amenitiesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '24px',
    },
    amenity: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#f8f5f0',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
    },
    amenityIcon: {
      fontSize: '1.5rem',
      color: '#b8860b',
    },
    amenityInfo: {
      flex: 1,
    },
    amenityLabel: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#5d4037',
      marginBottom: '4px',
    },
    amenityDescription: {
      fontSize: '0.8rem',
      color: '#6d4c41',
      lineHeight: '1.4',
    },

    decorativeElement: {
      position: 'absolute',
      top: '10%',
      right: '8%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '15%',
      left: '10%',
      width: '180px',
      height: '180px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.08) 0%, rgba(193, 154, 107, 0.04) 70%, transparent 100%)',
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
    <section id="contact-section" style={styles.contactSection}>
      <style>{animationStyles}</style>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>
          Visit <span style={styles.highlightText}>Brew Haven</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Come experience the perfect blend of comfort, quality, and community. We're here to serve you the best coffee in town.
        </p>
        
        <div style={styles.contentGrid}>
          {/* Contact Information */}
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              Contact Us
            </h3>
            <ul style={styles.contactList}>
              {contactInfo.map((info, index) => (
                <li key={index} style={styles.contactItem}>
                  <span style={styles.contactIcon}>{info.icon}</span>
                  <div style={styles.contactDetails}>
                    <div style={styles.contactLabel}>{info.label}</div>
                    <div style={styles.contactValue}>{info.value}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Hours */}
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              Business Hours
            </h3>
            <ul style={styles.hoursList}>
              {businessHours.map((schedule, index) => (
                <li 
                  key={index} 
                  style={index === businessHours.length - 1 ? { ...styles.hoursItem, ...styles.hoursItemLast } : styles.hoursItem}
                >
                  <span style={styles.day}>{schedule.day}</span>
                  <span style={styles.hours}>{schedule.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Amenities */}
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              Amenities
            </h3>
            <div style={styles.amenitiesGrid}>
              {amenities.map((amenity, index) => (
                <div key={index} style={styles.amenity}>
                  <span style={styles.amenityIcon}>{amenity.icon}</span>
                  <div style={styles.amenityInfo}>
                    <div style={styles.amenityLabel}>{amenity.label}</div>
                    <div style={styles.amenityDescription}>{amenity.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        

      </div>
    </section>
  );
};

export default ContactSection;
