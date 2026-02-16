import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './Header.jsx';

const Footer = lazy(() => import('./Footer'));

const About = () => {
  const [isVisible, setIsVisible] = useState(true); // Set to true immediately

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector('#about-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const styles = {
    section: {
      backgroundColor: '#faf8f3',
      minHeight: '100vh',
      padding: '120px 24px 80px',
      position: 'relative',
      overflow: 'hidden',
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
    hero: {
      textAlign: 'center',
      marginBottom: '80px',
    },
    title: {
      fontSize: 'clamp(3rem, 5vw, 4rem)',
      fontWeight: '800',
      color: '#5d4037',
      marginBottom: '24px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
      color: '#6d4c41',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    highlightText: {
      color: '#b8860b',
      fontWeight: '800',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '60px',
      marginBottom: '80px',
    },
    contentCard: {
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(212, 175, 55, 0.1)',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    },
    contentCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
      borderColor: '#d2b262',
    },
    cardIcon: {
      fontSize: '3rem',
      marginBottom: '24px',
      color: '#b8860b',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#3b2f2f',
      marginBottom: '16px',
    },
    cardText: {
      fontSize: '1rem',
      color: '#6d4c41',
      lineHeight: '1.6',
    },
    storySection: {
      backgroundColor: '#fff',
      padding: '60px 40px',
      borderRadius: '24px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(212, 175, 55, 0.1)',
      marginBottom: '80px',
    },
    storyTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#5d4037',
      textAlign: 'center',
      marginBottom: '40px',
    },
    storyContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '40px',
      alignItems: 'center',
    },
    storyText: {
      fontSize: '1.1rem',
      color: '#6d4c41',
      lineHeight: '1.8',
      textAlign: 'justify',
    },
    storyImage: {
      width: '100%',
      maxWidth: '400px',
      height: '300px',
      objectFit: 'cover',
      borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    },
    valuesSection: {
      textAlign: 'center',
      marginBottom: '80px',
    },
    valuesTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#5d4037',
      marginBottom: '40px',
    },
    valuesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '40px',
    },
    valueCard: {
      backgroundColor: '#fff',
      padding: '32px 24px',
      borderRadius: '20px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
      border: '2px solid rgba(212, 175, 55, 0.1)',
      transition: 'all 0.3s ease',
    },
    valueCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
      borderColor: '#d2b262',
    },
    valueIcon: {
      fontSize: '2.5rem',
      marginBottom: '20px',
      color: '#b8860b',
    },
    valueTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#3b2f2f',
      marginBottom: '12px',
    },
    valueText: {
      fontSize: '0.95rem',
      color: '#6d4c41',
      lineHeight: '1.6',
    },
    contactSection: {
      backgroundColor: '#fff',
      padding: '60px 40px',
      borderRadius: '24px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(212, 175, 55, 0.1)',
      textAlign: 'center',
    },
    contactTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#5d4037',
      marginBottom: '40px',
    },
    contactInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '40px',
      marginBottom: '40px',
    },
    contactItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    },
    contactIcon: {
      fontSize: '2rem',
      color: '#b8860b',
    },
    contactLabel: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#3b2f2f',
    },
    contactValue: {
      fontSize: '1rem',
      color: '#6d4c41',
    },
    decorativeElement: {
      position: 'absolute',
      top: '15%',
      left: '5%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '20%',
      right: '8%',
      width: '180px',
      height: '180px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.08) 0%, rgba(193, 154, 107, 0.04) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 6s ease-in-out infinite reverse',
    },
  };

  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
  `;

  return (
    <>
      <Header />
      <section id="about-section" style={styles.section}>
        <style>{animationStyles}</style>
        
        {/* Decorative elements */}
        <div style={styles.decorativeElement}></div>
        <div style={styles.decorativeElement2}></div>
      
      <div style={styles.container}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.title}>
            About <span style={styles.highlightText}>Cafeteria</span>
          </h1>
          <p style={styles.subtitle}>
            Where every cup tells a story, and every moment becomes a memory worth savoring.
          </p>
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          <div 
            style={styles.contentCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.borderColor = '#d2b262';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
            }}
          >
            <div style={styles.cardIcon}>☕</div>
            <h3 style={styles.cardTitle}>Our Coffee</h3>
            <p style={styles.cardText}>
              We source the finest coffee beans from around the world, carefully roasted to perfection 
              to deliver that rich, aromatic experience you deserve.
            </p>
          </div>

          <div 
            style={styles.contentCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.borderColor = '#d2b262';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
            }}
          >
            <div style={styles.cardIcon}>🌟</div>
            <h3 style={styles.cardTitle}>Our Mission</h3>
            <p style={styles.cardText}>
              To create a warm, welcoming space where people can connect, relax, and enjoy 
              exceptional coffee and food in a comfortable atmosphere.
            </p>
          </div>

          <div 
            style={styles.contentCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.borderColor = '#d2b262';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
            }}
          >
            <div style={styles.cardIcon}>❤️</div>
            <h3 style={styles.cardTitle}>Our Community</h3>
            <p style={styles.cardText}>
              We're more than just a cafe - we're a gathering place for friends, families, 
              and coffee enthusiasts who share our passion for quality and connection.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div style={styles.storySection}>
          <h2 style={styles.storyTitle}>Our Story</h2>
          <div style={styles.storyContent}>
            <div>
              <p style={styles.storyText}>
                Founded in 2020, Cafeteria began as a small dream in the heart of our city. 
                What started as a simple coffee cart has grown into a beloved community hub 
                where people come to work, meet, and create memories.
              </p>
              <p style={styles.storyText}>
                Our journey has been driven by a simple belief: that great coffee has the 
                power to bring people together. Every cup we serve is crafted with care, 
                using traditional methods combined with modern innovation.
              </p>
              <p style={styles.storyText}>
                Today, we're proud to serve our community with not just exceptional coffee, 
                but also a warm, inviting atmosphere that feels like home.
              </p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop" 
              alt="Our Coffee Story" 
              style={styles.storyImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Coffee+Story';
              }}
            />
          </div>
        </div>

        {/* Values Section */}
        <div style={styles.valuesSection}>
          <h2 style={styles.valuesTitle}>Our Values</h2>
          <div style={styles.valuesGrid}>
            <div 
              style={styles.valueCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.borderColor = '#d2b262';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
              }}
            >
              <div style={styles.valueIcon}>🌱</div>
              <h3 style={styles.valueTitle}>Sustainability</h3>
              <p style={styles.valueText}>
                We're committed to eco-friendly practices and supporting sustainable coffee farming.
              </p>
            </div>

            <div 
              style={styles.valueCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.borderColor = '#d2b262';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
              }}
            >
              <div style={styles.valueIcon}>🤝</div>
              <h3 style={styles.valueTitle}>Community</h3>
              <p style={styles.valueText}>
                Building strong relationships with our customers and local community is our priority.
              </p>
            </div>

            <div 
              style={styles.valueCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.borderColor = '#d2b262';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
              }}
            >
              <div style={styles.valueIcon}>✨</div>
              <h3 style={styles.valueTitle}>Quality</h3>
              <p style={styles.valueText}>
                We never compromise on quality, from our coffee beans to our customer service.
              </p>
            </div>

            <div 
              style={styles.valueCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.borderColor = '#d2b262';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
              }}
            >
              <div style={styles.valueIcon}>💡</div>
              <h3 style={styles.valueTitle}>Innovation</h3>
              <p style={styles.valueText}>
                Constantly exploring new flavors and techniques to enhance your coffee experience.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div style={styles.contactSection}>
          <h2 style={styles.contactTitle}>Visit Us</h2>
          <div style={styles.contactInfo}>
                         <div style={styles.contactItem}>
               <div style={styles.contactIcon}>📍</div>
               <div style={styles.contactLabel}>Address</div>
               <div style={styles.contactValue}>123 Coffee Street, Brew City</div>
             </div>
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>🕒</div>
              <div style={styles.contactLabel}>Hours</div>
              <div style={styles.contactValue}>7:00 AM - 10:00 PM Daily</div>
            </div>
                         <div style={styles.contactItem}>
               <div style={styles.contactIcon}>📞</div>
               <div style={styles.contactLabel}>Phone</div>
               <div style={styles.contactValue}>+91 7383631474</div>
             </div>
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>✉️</div>
              <div style={styles.contactLabel}>Email</div>
              <div style={styles.contactValue}>brewhaven30@gmail.com</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    {/* Footer */}
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#b8860b' }}>Loading...</div>}>
      <Footer />
    </Suspense>
  </>
);
};

export default About;
