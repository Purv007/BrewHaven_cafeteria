import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Header from './Header.jsx';
import Receipt from './Receipt.jsx';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { token } = useAuth();
  const order = location.state?.order;
  const payment = location.state?.payment;
  const discounts = location.state?.discounts || [];
  const [emailSent, setEmailSent] = useState(false);

  // Debug: Log what we received
  console.log('OrderSuccess received order:', order);
  console.log('OrderSuccess received payment:', payment);
  console.log('OrderSuccess received discounts:', discounts);

  // Debug: Log payment data
  console.log('OrderSuccess received payment data:', payment);
  console.log('OrderSuccess received discounts:', discounts);
  console.log('Payment method check:', {
    method: payment?.method,
    paymentMethodId: payment?.paymentMethodId,
    isCash: payment?.method === 'cash' || payment?.paymentMethodId === 'pm_demo_cash'
  });

  // Personalized thank you
  const username = localStorage.getItem('username') || 'Customer';

  if (!order) {
    setTimeout(() => navigate('/'), 1000);
    return (
      <div className="menu-container" style={{ textAlign: 'center', padding: 40 }}>
        <h2 style={{ color: '#b8860b' }}>No order found. Redirecting...</h2>
      </div>
    );
  }

  // Safely destructure order with fallbacks
  const { _id, items = [], address = '', phone = '', createdAt = new Date() } = order || {};
  const estDelivery = new Date(new Date(createdAt).getTime() + 40 * 60000); // +40 min

  // Demo mode: simulate email sending
  React.useEffect(() => {
    if (!emailSent && payment) {
      // For cash on delivery, always send email. For card/UPI, only if payment successful
      if (payment.method === 'cash' || payment.success) {
        // Simulate email sending in demo mode
        setTimeout(() => {
          setEmailSent(true);
          console.log('Demo: Order confirmation email would be sent!');
        }, 2000);
      }
    }
  }, [emailSent, payment]);

  // Print/download receipt - print only the receipt content
  const handlePrint = () => {
    // Create a new window with only the receipt content
    const printWindow = window.open('', '_blank');
    const receiptElement = document.querySelector('.receipt');
    
    if (receiptElement) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .receipt { background: white; border: 1px solid #000; padding: 20px; }
            .receipt-header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 15px; }
            .price-breakdown { border: 1px solid #000; background: white; }
            .customer-info { border: 1px solid #000; background: white; }
            h1, h2, h3, h4 { color: black; margin: 8px 0; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${receiptElement.outerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };



  return (
    <>
      <Header className="order-success-hide-print" />
      <section style={{ backgroundColor: '#faf8f3', minHeight: '100vh' }}>
        <div className="menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 className="order-success-hide-print" style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 18, fontSize: '2em', textAlign: 'center' }}>Thank you, {username.split(' ')[0]}! 🎉</h1>
        <div className="order-success-hide-print" style={{ color: '#b8860b', fontSize: 18, marginBottom: 18 }}>Order #{_id ? _id.slice(-6).toUpperCase() : 'N/A'}</div>
        <Receipt
          order={order}
          payment={payment}
          discounts={discounts}
          emailSent={emailSent}
          estDelivery={estDelivery}
          username={username}
          handlePrint={handlePrint}
          navigate={navigate}
        />
        </div>
        <style>{`
          @media (max-width: 900px) {
            .menu-container { padding: 20px 2px !important; }
            .menu-title, h1 { font-size: 1.3em !important; }
          }
          @media (max-width: 600px) {
            .menu-container { padding: 8px 12px !important; }
            .menu-title, h1 { font-size: 1.1em !important; }
            h2 { font-size: 1em !important; }
            input, button, textarea { font-size: 15px !important; }
          }
          @media (max-width: 480px) {
            .menu-container { padding: 2px 12px !important; }
            .menu-title, h1 { font-size: 1em !important; }
            h2 { font-size: 0.95em !important; }
            input, button, textarea { font-size: 14px !important; }
          }
          

        `}</style>
      </div>
    </section>
    </>
  );
};

export default OrderSuccess; 
