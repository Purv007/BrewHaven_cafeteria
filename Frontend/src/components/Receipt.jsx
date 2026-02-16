import React from 'react';

const Receipt = ({ order, payment, discounts = [], emailSent = false, estDelivery, username, handlePrint, navigate }) => {
  if (!order) return null;

  const { _id, items = [], address = '', phone = '', createdAt = new Date(), total, subtotal, discounts: orderDiscounts, gstAmount } = order;
  
  // Calculate totals - only use discounts that were actually applied during checkout
  const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Only show discounts if they were actually applied during checkout
  const actualDiscounts = discounts.filter(discount => discount.amount > 0);
  const totalDiscounts = actualDiscounts.reduce((sum, discount) => sum + discount.amount, 0);
  
  // Use the final total from the order (which already includes applied discounts)
  const finalTotal = total || itemsTotal;

  return (
    <div className="receipt" style={{ 
      background: '#fffaf5', 
      borderRadius: 12, 
      padding: 24, 
      boxShadow: '0 1px 6px rgba(59,47,47,0.08)', 
      marginBottom: 24,
      border: '1px solid #e2c48d'
    }}>
      <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 12, fontSize: '1.3em' }}>Receipt</h2>
      
      {/* Receipt Header */}
      <div className="receipt-header" style={{ 
        textAlign: 'center', 
        marginBottom: 20, 
        paddingBottom: 15, 
        borderBottom: '2px solid #e2c48d' 
      }}>
        <h3 style={{ color: '#b8860b', margin: '0 0 8px 0', fontSize: '1.4em' }}>☕ Cafeteria</h3>
        <div style={{ color: '#666', fontSize: '0.9em' }}>Order Receipt</div>
        <div style={{ color: '#666', fontSize: '0.9em', marginTop: 4 }}>Order #{_id.slice(-6).toUpperCase()}</div>
        <div style={{ color: '#666', fontSize: '0.9em', marginTop: 4 }}>
          {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Items List */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ color: '#3b2f2f', marginBottom: 12, fontSize: '1.1em', borderBottom: '1px solid #e0c9a6', paddingBottom: 8 }}>Items Ordered:</h4>
        {items && items.length > 0 ? (
          <>
            {items.map(item => (
              <div key={item.productId} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 12, 
                flexWrap: 'wrap',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/images/${item.image}`} 
                  alt={item.name} 
                  style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#3b2f2f' }}>{item.name}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600, color: '#b8860b', textAlign: 'right' }}>
                  ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
            Order details loading...
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="price-breakdown" style={{ 
        background: '#fff', 
        borderRadius: 8, 
        padding: 16, 
        border: '1px solid #e2c48d',
        marginBottom: 20
      }}>
        <h4 style={{ color: '#3b2f2f', marginBottom: 12, fontSize: '1.1em' }}>Price Breakdown:</h4>
        
        {/* Subtotal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#5d4037' }}>Subtotal:</span>
          <span style={{ color: '#5d4037', fontWeight: 600 }}>₹{itemsTotal.toFixed(2)}</span>
        </div>

        {/* Discounts */}
        {totalDiscounts > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#b8860b' }}>Total Discounts:</span>
              <span style={{ color: '#b8860b', fontWeight: 600 }}>-₹{totalDiscounts.toFixed(2)}</span>
            </div>
            
            {/* Individual Discounts */}
            {actualDiscounts && actualDiscounts.length > 0 && (
              <div style={{ marginLeft: 20, marginBottom: 8 }}>
                {actualDiscounts.map((discount, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: 4,
                    fontSize: '0.9em'
                  }}>
                    <span style={{ color: '#666' }}>• {discount.name}</span>
                    <span style={{ color: '#b8860b' }}>-₹{discount.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#5d4037' }}>Subtotal after Discounts:</span>
              <span style={{ color: '#5d4037', fontWeight: 600 }}>₹{(itemsTotal - totalDiscounts).toFixed(2)}</span>
            </div>
          </>
        )}

        {/* GST */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#e65100' }}>GST (18%):</span>
          <span style={{ color: '#e65100', fontWeight: 600 }}>₹{gstAmount ? gstAmount.toFixed(2) : ((itemsTotal - totalDiscounts) * 0.18).toFixed(2)}</span>
        </div>

        {/* Final Total */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 12,
          paddingTop: 12,
          borderTop: '2px solid #e2c48d',
          fontSize: '1.2em',
          fontWeight: 700
        }}>
          <span style={{ color: '#b8860b' }}>Final Total:</span>
          <span style={{ color: '#b8860b' }}>₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Customer Information */}
      <div className="customer-info" style={{ 
        background: '#fff', 
        borderRadius: 8, 
        padding: 16, 
        border: '1px solid #e2c48d',
        marginBottom: 20
      }}>
        <h4 style={{ color: '#3b2f2f', marginBottom: 12, fontSize: '1.1em' }}>Customer Information:</h4>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#5d4037' }}>Name:</span> {localStorage.getItem('username') || 'Customer'}
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#5d4037' }}>Delivery Address:</span> {address}
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#5d4037' }}>Phone:</span> {phone}
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#5d4037' }}>Estimated Delivery:</span> {new Date(new Date(createdAt).getTime() + 40 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Payment Information */}
      {payment && (
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: 16, 
          border: '1px solid #e2c48d'
        }}>
          <h4 style={{ color: '#3b2f2f', marginBottom: 12, fontSize: '1.1em' }}>Payment Information:</h4>
          <div style={{ 
            padding: 12, 
            background: (payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash') ? '#e8f4f8' : '#e8f5e8', 
            borderRadius: 8, 
            border: `1px solid ${(payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash') ? '#2196f3' : '#4caf50'}` 
          }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#5d4037' }}>Payment Status:</span>
              {(() => {
                if (payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash') {
                  return <span style={{ color: '#b8860b' }}> Cash on Delivery (Unpaid)</span>;
                } else if (payment.success) {
                  return <span style={{ color: 'green' }}> ✅ Paid</span>;
                } else {
                  return <span style={{ color: 'red' }}> Not Paid</span>;
                }
              })()}
            </div>
            {payment.method !== 'cash' && payment.paymentMethodId !== 'pm_demo_cash' && payment.transactionId && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#5d4037' }}>Transaction ID:</span> {payment.transactionId}
              </div>
            )}
            {(payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash') ? (
              <div>
                <span style={{ fontWeight: 600, color: '#5d4037' }}>Amount to Pay:</span> ₹{payment.amount} <span style={{ color: '#b8860b', fontSize: '0.9em' }}>(Pay on delivery)</span>
              </div>
            ) : (
              <div>
                <span style={{ fontWeight: 600, color: '#5d4037' }}>Amount Paid:</span> ₹{payment.amount}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email confirmation status */}
      <div style={{ color: '#388e3c', marginBottom: 18, fontWeight: 500 }} className="order-success-hide-print">
        {(() => {
          if (payment?.method === 'cash' || payment?.paymentMethodId === 'pm_demo_cash') {
            // For cash on delivery, always show email sent
            return emailSent ? (
              <span>✅ Order confirmation email sent to your email!</span>
            ) : (
              <span>📧 Sending order confirmation email...</span>
            );
          } else {
            // For card/UPI, check payment success
            if (payment?.success) {
              return emailSent ? (
                <span>✅ Order confirmation email sent to your email!</span>
              ) : (
                <span>📧 Sending order confirmation email...</span>
              );
            } else {
              return <span>📧 Order confirmation email will be sent after payment</span>;
            }
          }
        })()}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }} className="order-success-hide-print">
        <button 
          onClick={handlePrint} 
          style={{ 
            background: '#fff', 
            color: '#b8860b', 
            border: '1px solid #b8860b', 
            borderRadius: 8, 
            padding: '10px 22px', 
            fontWeight: 600, 
            fontSize: 15, 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#b8860b';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#fff';
            e.target.style.color = '#b8860b';
          }}
        >
                     Print/Download Receipt
        </button>
        <button 
          onClick={() => navigate('/menu')} 
          style={{ 
            background: '#b8860b', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '10px 22px', 
            fontWeight: 600, 
            fontSize: 15, 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#d2b262';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#b8860b';
            e.target.style.transform = 'translateY(0)';
          }}
        >
                     Back to Menu
        </button>
      </div>

             {/* Print Styles */}
       <style>{`
          @media print {
            .receipt {
              background: white !important;
              box-shadow: none !important;
              border: 1px solid #000 !important;
              margin: 0 !important;
              padding: 20px !important;
              width: 100% !important;
              max-width: none !important;
            }
            
            .receipt-header {
              border-bottom: 2px solid #000 !important;
            }
            
            .price-breakdown {
              border: 1px solid #000 !important;
              background: white !important;
            }
            
            .customer-info {
              border: 1px solid #000 !important;
              background: white !important;
            }
            
            h1, h2, h3, h4 {
              color: black !important;
            }
            
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            
            .order-success-hide-print {
              display: none !important;
            }
          }
        `}</style>
     </div>
   );
 };

 export default Receipt;
