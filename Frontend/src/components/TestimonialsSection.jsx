import React, { useState, useEffect } from 'react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Coffee Enthusiast",
      rating: 5,
      text: "The best coffee I've ever had! The baristas are incredibly skilled and the atmosphere is so welcoming. I come here every morning for my daily dose of happiness.",
      avatar: "👩‍💼",
      location: "Regular Customer"
    },
    {
      name: "Michael Chen",
      role: "Tech Professional",
      rating: 5,
      text: "Perfect spot for working remotely. Great coffee, fast WiFi, and the staff remembers my order. It's become my second office!",
      avatar: "👨‍💻",
      location: "Remote Worker"
    },
    {
      name: "Emma Rodriguez",
      role: "Student",
      rating: 5,
      text: "Love the study-friendly environment and the amazing pastries. The cold brew is my go-to during exam season. Highly recommend!",
      avatar: "👩‍🎓",
      location: "University Student"
    },
    {
      name: "David Thompson",
      role: "Business Owner",
      rating: 5,
      text: "I bring all my clients here for meetings. The professional atmosphere and exceptional service always impress them. Great investment!",
      avatar: "👨‍💼",
      location: "Local Business Owner"
    }
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

    const element = document.querySelector('#testimonials-section');
    if (element) {
      observer.observe(element);
    }

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (element) observer.unobserve(element);
      clearInterval(interval);
    };
  }, [testimonials.length]);

  const getStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const styles = {
    testimonialsSection: {
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
    testimonialCard: {
      backgroundColor: '#fff',
      borderRadius: '24px',
      padding: '48px 40px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative',
      border: '2px solid rgba(212, 175, 55, 0.1)',
    },
    quoteIcon: {
      fontSize: '4rem',
      color: '#d4af37',
      marginBottom: '24px',
      opacity: '0.3',
    },
    testimonialText: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: '#5d4037',
      lineHeight: '1.8',
      marginBottom: '32px',
      fontStyle: 'italic',
      fontWeight: '400',
    },
    customerInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      marginBottom: '24px',
    },
    avatar: {
      fontSize: '3rem',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3e9d2',
      borderRadius: '50%',
      border: '3px solid #d4af37',
    },
    customerDetails: {
      textAlign: 'left',
    },
    customerName: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#5d4037',
      marginBottom: '4px',
    },
    customerRole: {
      fontSize: '0.9rem',
      color: '#b8860b',
      fontWeight: '600',
      marginBottom: '2px',
    },
    customerLocation: {
      fontSize: '0.8rem',
      color: '#6d4c41',
      opacity: '0.8',
    },
    rating: {
      fontSize: '1.5rem',
      color: '#FFD700',
      marginBottom: '16px',
    },
    dotsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '40px',
    },
    dot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#d4af37',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      opacity: '0.4',
    },
    activeDot: {
      opacity: '1',
      transform: 'scale(1.2)',
      backgroundColor: '#b8860b',
    },
    decorativeElement: {
      position: 'absolute',
      top: '15%',
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
      bottom: '20%',
      left: '10%',
      width: '150px',
      height: '150px',
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
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <section id="testimonials-section" style={styles.testimonialsSection}>
      <style>{animationStyles}</style>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>
          What Our <span style={styles.highlightText}>Customers</span> Say
        </h2>
        <p style={styles.sectionSubtitle}>
          Don't just take our word for it. Here's what our valued customers have to say about their experience at Brew Haven.
        </p>
        
        <div style={styles.testimonialCard}>
          <div style={styles.quoteIcon}>"</div>
          <p style={styles.testimonialText}>
            {testimonials[currentTestimonial].text}
          </p>
          
          <div style={styles.rating}>
            {getStars(testimonials[currentTestimonial].rating)}
          </div>
          
          <div style={styles.customerInfo}>
            <div style={styles.avatar}>
              {testimonials[currentTestimonial].avatar}
            </div>
            <div style={styles.customerDetails}>
              <div style={styles.customerName}>
                {testimonials[currentTestimonial].name}
              </div>
              <div style={styles.customerRole}>
                {testimonials[currentTestimonial].role}
              </div>
              <div style={styles.customerLocation}>
                {testimonials[currentTestimonial].location}
              </div>
            </div>
          </div>
        </div>
        
        <div style={styles.dotsContainer}>
          {testimonials.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                ...(index === currentTestimonial && styles.activeDot),
              }}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
