import React, { useEffect } from 'react';
import { useCart } from './CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';

// Add CSS for spinner animation
const addSpinnerStyles = () => {
  if (!document.getElementById('cart-spinner-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'cart-spinner-styles';
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

const Cart = () => {
  const { cart, cartLoading, updateQuantity, removeFromCart, clearCart, refreshCart } = useCart();
  
  // Add spinner styles when component mounts
  useEffect(() => {
    addSpinnerStyles();
  }, []);
  
  // Safe cart data handling
  const safeCart = cart || [];
  const total = safeCart.reduce((sum, item) => {
    const price = Number(item?.price) || 0;
    const quantity = Number(item?.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const navigate = useNavigate();

  // Log cart data for debugging
  console.log('[Cart Component] Cart data:', safeCart); 

  
  console.log('[Cart Component] Cart loading:', cartLoading);
  console.log('[Cart Component] Total items:', safeCart.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0));
  console.log('[Cart Component] Total price:', total);
  console.log('[Cart Component] User token:', localStorage.getItem('token') ? 'present' : 'absent');

  return (
    <>
      <Header />
      <section style={{ backgroundColor: '#faf8f3', minHeight: '100vh' }}>
        <div className="menu-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
          <h1 className="menu-title">Your Cart</h1>
          <p style={{ 
            textAlign: 'center', 
            color: '#b8860b', 
            fontSize: '0.9em', 
            marginTop: '-20px', 
            marginBottom: '20px',
            fontStyle: 'italic'
          }}>
            
          </p>
          

          
          <div style={{ 
            position: 'absolute', 
            top: '2rem', 
            right: '2rem',
            display: 'flex',
            gap: '12px'
          }}>
            <button 
              onClick={async () => await refreshCart()}
              style={{ 
                background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.13)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #45a049 0%, #4CAF50 100%)';
                e.target.style.transform = 'translateY(-2px) scale(1.04)';
                e.target.style.boxShadow = '0 6px 18px rgba(76, 175, 80, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.13)';
              }}
            >
              🔄 Refresh
            </button>
            {safeCart.length > 0 && (
              <button 
                onClick={async () => await clearCart()}
                style={{ 
                  background: 'linear-gradient(90deg, #bfa77a 0%, #a88c5f 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(191, 167, 122, 0.13)',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #a88c5f 0%, #bfa77a 100%)';
                  e.target.style.transform = 'translateY(-2px) scale(1.04)';
                  e.target.style.boxShadow = '0 6px 18px rgba(191, 167, 122, 0.18)';
              }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #bfa77a 0%, #a88c5f 100%)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 2px 8px rgba(191, 167, 122, 0.13)';
                }}
              >
                🗑️ Clear Cart
              </button>
            )}
          </div>
          {cartLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '1.2em', color: '#b8860b', marginBottom: '16px' }}>🔄 Updating your cart...</div>
              <div style={{ color: '#888', fontSize: '1em' }}>Please wait while we update your items...</div>
              <div style={{ marginTop: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #b8860b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
              </div>
            </div>
          ) : safeCart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '1.2em' }}>Your cart is empty.</p>
          ) : (
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {safeCart.map(item => (
                <div key={item._id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 24, 
                background: '#fff', 
                borderRadius: 12, 
                boxShadow: '0 2px 8px rgba(59,47,47,0.06)', 
                padding: 16,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.02)';
                e.target.style.boxShadow = '0 8px 25px rgba(59,47,47,0.15)';
                e.target.style.border = '1px solid rgba(184, 134, 11, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(59,47,47,0.06)';
                e.target.style.border = '1px solid transparent';
              }}>
                  <img 
                    src={`/${item?.image?.split('/').pop() || 'default-avatar.svg'}?t=${Date.now()}`} 
                    alt={item?.name || 'Product'} 
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 18 }} 
                    onError={(e) => {
                      e.target.src = '/menu-images/default-avatar.svg';
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1em', color: '#3b2f2f' }}>{item?.name || 'Unknown Product'}</h3>
                    <div style={{ color: '#b8860b', fontWeight: 600 }}>₹{Number(item?.price) || 0}</div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={async () => await updateQuantity(item._id, Math.max(1, (Number(item?.quantity) || 0) - 1))} style={{ 
                        marginRight: 8, 
                        padding: '2px 10px',
                        backgroundColor: '#d2b262',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}>-</button>
                      <span style={{ fontWeight: 600 }}>{Number(item?.quantity) || 0}</span>
                      <button onClick={async () => await updateQuantity(item._id, (Number(item?.quantity) || 0) + 1)} style={{ 
                        marginLeft: 8, 
                        padding: '2px 10px',
                        backgroundColor: '#d2b262',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}>+</button>
                                          <button onClick={async () => await removeFromCart(item._id)} style={{ 
                      marginLeft: 18, 
                      color: '#fff', 
                      backgroundColor: '#d2b262', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: '4px 14px', 
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}>Remove</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#3b2f2f', fontSize: '1.1em', marginLeft: 18 }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 0)}</div>
                </div>
              ))}
              
              {/* Clear All Button */}
              <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 16 }}>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                    transition: 'all 0.3s ease',
                    margin: '0 auto'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(90deg, #ee5a52 0%, #ff6b6b 100%)';
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ee5a52 100%)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
                  }}
                >
                  Clear All Items
                </button>
              </div>
              
              {/* Cart Summary */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '16px',
                padding: '24px',
                marginTop: '32px',
                border: '2px solid rgba(184, 134, 11, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid rgba(184, 134, 11, 0.2)'
                }}>
                  <span style={{ fontSize: '1.1em', fontWeight: '600', color: '#6d4c41' }}>
                    Total Items: {safeCart.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)}
                  </span>
                  <span style={{ fontSize: '1.1em', fontWeight: '600', color: '#6d4c41' }}>
                    Items in Cart: {safeCart.length}
                  </span>
                </div>
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: '1.5em', 
                  fontWeight: '800', 
                  color: '#b8860b',
                  textShadow: '0 2px 4px rgba(184, 134, 11, 0.2)'
                }}>
                  Total: ₹{total.toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                <button
                  onClick={() => navigate('/menu')}
                  style={{
                    backgroundColor: '#d2b262',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(210, 178, 98, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c19a4a';
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 6px 20px rgba(210, 178, 98, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#d2b262';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(210, 178, 98, 0.3)';
                  }}
                >
                  Back to Menu
                </button>
                
                <button
                  className="menu-order-btn"
                  style={{ 
                    fontSize: '1.1em', 
                    padding: '0.8em 2.2em',
                    backgroundColor: '#d2b262',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/checkout')}
                  disabled={safeCart.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart; 
