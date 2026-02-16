import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';

const Checkout = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // Discount states
  const [studentId, setStudentId] = useState('');
  const [isStudentDiscountApplied, setIsStudentDiscountApplied] = useState(false);
  const [studentDiscountError, setStudentDiscountError] = useState('');
  const [discounts, setDiscounts] = useState([]);
  
  // Calculate base total
  const baseTotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // Calculate discounts
  useEffect(() => {
    const newDiscounts = [];
    
    // Happy Hour Discount (25% off coffee beverages during 8AM-10AM on weekdays)
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1-5 = Monday-Friday
    const isWeekday = currentDay >= 1 && currentDay <= 5;
    const isHappyHour = isWeekday && currentHour >= 8 && currentHour < 10;
    
    if (isHappyHour) {
      const coffeeItems = cart.filter(item => 
        item.category === 'Coffee' || 
        item.name.toLowerCase().includes('coffee') ||
        item.name.toLowerCase().includes('espresso') ||
        item.name.toLowerCase().includes('latte') ||
        item.name.toLowerCase().includes('cappuccino') ||
        item.name.toLowerCase().includes('mocha') ||
        item.name.toLowerCase().includes('americano')
      );
      
      if (coffeeItems.length > 0) {
        const coffeeTotal = coffeeItems.reduce((sum, item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return sum + (price * quantity);
        }, 0);
        
        const happyHourDiscount = coffeeTotal * 0.25;
        newDiscounts.push({
          name: 'Happy Hour Discount',
          description: '25% off coffee beverages (8AM-10AM)',
          amount: happyHourDiscount,
          code: 'HAPPYHOUR'
        });
      }
    }
    
    // Student Discount (20% off entire order) - Only for exact STUDENT20 coupon code
    if (isStudentDiscountApplied && studentId.toUpperCase() === 'STUDENT20') {
      const studentDiscount = baseTotal * 0.20;
      newDiscounts.push({
        name: 'Student Discount',
        description: '20% off with STUDENT20 coupon code',
        amount: studentDiscount,
        code: 'STUDENT20'
      });
    }
    
    setDiscounts(newDiscounts);
  }, [cart, baseTotal, isStudentDiscountApplied, studentId]);

  // Calculate final total
  const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  const subtotalAfterDiscounts = baseTotal - totalDiscounts;
  const gstAmount = subtotalAfterDiscounts * 0.18; // 18% GST
  const finalTotal = subtotalAfterDiscounts + gstAmount;

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState('details'); // 'details' or 'payment'
  const [orderData, setOrderData] = useState(null);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // UPI form state
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');

  // Add error states for each field
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');
  const [cvvError, setCvvError] = useState('');
  const [cardholderNameError, setCardholderNameError] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [upiNameError, setUpiNameError] = useState('');



  const handleStudentDiscount = () => {
    if (studentId.trim()) {
      // Check if student ID is exactly the STUDENT20 coupon code
      if (studentId.toUpperCase() === 'STUDENT20') {
        setIsStudentDiscountApplied(true);
        setStudentDiscountError(''); // Clear previous error
      } else {
        setIsStudentDiscountApplied(false);
        setStudentDiscountError('Please enter the exact coupon code: STUDENT20');
      }
    } else {
      setIsStudentDiscountApplied(false);
      setStudentDiscountError('');
    }
  };



  const themeInputStyle = {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: '1px solid #b8860b',
    backgroundColor: '#fffaf5',
    color: '#3b2f2f',
    marginBottom: 18,
    fontSize: 15
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setError('');
    
    // Phone validation: must be 10 digits
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setLoading(true);
    try {
      const items = cart
        .filter(item => item._id || item.id) // Filter out items without valid ID
        .map(item => ({
          productId: item._id || item.id, // Use _id if available, otherwise use id
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));
      console.log('Order payload items:', items); // Debug: ensure productId is present
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items, address, phone })
      });
      
      const data = await res.json();
      if (res.ok) {
        // Store order data for payment processing (order not saved yet)
        setOrderData(data.orderData);
        setPaymentStep('payment');
      } else {
        setError(data.error || 'Failed to validate order.');
      }
    } catch (err) {
      setError('Failed to validate order. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate payment details based on method
    if (paymentMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        setError('Please fill in all card details.');
        setLoading(false);
        return;
      }
      
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid card number.');
        setLoading(false);
        return;
      }
      
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setError('Please enter a valid expiry date (MM/YY).');
        setLoading(false);
        return;
      }
      
      if (!/^\d{3,4}$/.test(cvv)) {
        setError('Please enter a valid CVV (3-4 digits).');
        setLoading(false);
        return;
      }
      
      // Check if card is expired
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        setError('Card has expired. Please use a valid card.');
        setLoading(false);
        return;
      }
    }
    
    if (paymentMethod === 'upi') {
      if (!upiId || !upiName) {
        setError('Please fill in all UPI details.');
        setLoading(false);
        return;
      }
      
      // UPI ID validation (format: name@upi)
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upiId)) {
        setError('Please enter a valid UPI ID (e.g., name@upi).');
        setLoading(false);
        return;
      }
      
      if (upiName.length < 2) {
        setError('Please enter a valid name.');
        setLoading(false);
        return;
      }
    }
    
    // Handle cash on delivery differently
    if (paymentMethod === 'cash') {
      try {
        // Extract userId from token
        let userId = null;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.userId || payload.id || null;
            console.log('Token payload:', payload);
            console.log('Extracted userId:', userId);
          } catch (e) {
            console.error('Error parsing token:', e);
            setError('Authentication error. Please try logging in again.');
            setLoading(false);
            return;
          }
        }

        if (!userId) {
          setError('User ID not found. Please try logging in again.');
          setLoading(false);
          return;
        }

        // For cash orders, create the order directly without payment processing
        const orderPayload = {
          items: cart.map(item => ({
            productId: item._id || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          total: finalTotal,
          subtotal: baseTotal,
          discounts: totalDiscounts,
          gstAmount: gstAmount,
          address: address,
          phone: phone,
          paymentMethod: 'cash'
        };

        console.log('Cash order payload:', orderPayload);
        console.log('Sending request to:', `${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/orders`);
        console.log('Request headers:', {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        // Create order directly
        const orderRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        });

        const orderData = await orderRes.json();
        console.log('Order creation response:', { status: orderRes.status, orderData });

        if (orderRes.ok) {
          // Get the actual order object from response with fallback
          const actualOrder = orderData.order || orderData.orderData || orderData;
          
          // Generate a unique order ID if none exists
          const orderId = actualOrder._id || actualOrder.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          console.log('Generated order ID:', orderId);
          console.log('Actual order object:', actualOrder);
          
          // Prepare payment data for cash on delivery
          const paymentForSuccess = {
            method: 'cash',
            paymentMethodId: 'pm_demo_cash',
            success: true,
            amount: finalTotal,
            transactionId: null
          };

          console.log('Cash payment data for success page:', paymentForSuccess);

          // Send order confirmation email
          try {
            const emailResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/send-order-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: orderId,
                items: cart
                  .filter(item => item._id || item.id)
                  .map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                  })),
                total: finalTotal,
                subtotal: baseTotal,
                discounts: totalDiscounts,
                gstAmount: gstAmount,
                address: address,
                phone: phone,
                payment: paymentForSuccess
              })
            });
            
            if (emailResponse.ok) {
              const emailData = await emailResponse.json();
              console.log('✅ Order confirmation email sent successfully:', emailData);
            } else {
              const emailError = await emailResponse.json();
              console.error('❌ Order confirmation email failed:', emailError);
              // Don't block the user flow, but log the error
            }
          } catch (emailErr) {
            console.error('❌ Order confirmation email request failed:', emailErr);
            // Don't block the user flow, but log the error
          }

          // Clear cart and navigate to success
          for (const item of cart) {
            const itemId = item._id || item.id;
            if (itemId) {
              await removeFromCart(itemId);
            }
          }

          navigate('/order-success', { 
            state: { 
              order: { 
                _id: orderId,
                total: finalTotal,
                subtotal: baseTotal,
                discounts: totalDiscounts,
                gstAmount: gstAmount,
                items: cart.map(item => ({
                  productId: item._id || item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image
                })),
                address: address,
                phone: phone,
                createdAt: new Date()
              }, 
              payment: paymentForSuccess,
              discounts: discounts
            } 
          });
          return;
        } else {
          setError(orderData.error || 'Failed to create order. Please try again.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Cash order creation error:', err);
        setError('Failed to create cash order. Please try again.');
        setLoading(false);
        return;
      }
    }
    
    // Process payment with backend for card/UPI
    try {
      // Extract userId from token
      let userId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || payload.id || null;
          console.log('Token payload:', payload);
          console.log('Extracted userId:', userId);
        } catch (e) {
          console.error('Error parsing token:', e);
          setError('Authentication error. Please try logging in again.');
          setLoading(false);
          return;
        }
      }

      if (!userId) {
        setError('User ID not found. Please try logging in again.');
        setLoading(false);
        return;
      }

      const paymentPayload = { 
        paymentMethodId: paymentMethod === 'card' ? 'pm_demo_card' : 'pm_demo_upi',
        amount: finalTotal, // Use finalTotal for payment (includes GST)
        orderData: {
          userId: userId,
          items: cart.map(item => ({
            productId: item._id || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          total: finalTotal, // Use finalTotal (includes GST)
          subtotal: baseTotal,
          discounts: totalDiscounts,
          gstAmount: gstAmount,
          address: address,
          phone: phone,
          createdAt: new Date()
        },
        paymentDetails: paymentMethod === 'upi' ? { upiId, upiName } : {},
        discounts: discounts // Include discounts in payment payload
      };
      
      console.log('Payment payload:', paymentPayload);
      console.log('orderData validation:', {
        hasUserId: !!paymentPayload.orderData.userId,
        hasItems: !!paymentPayload.orderData.items && paymentPayload.orderData.items.length > 0,
        hasTotal: !!paymentPayload.orderData.total,
        hasAddress: !!paymentPayload.orderData.address,
        hasPhone: !!paymentPayload.orderData.phone
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentPayload)
      });
      
      const data = await res.json();
      console.log('Payment response:', { status: res.status, data });
      
      if (res.ok && (data.success || data.orderId || data.order)) {
        // Prepare payment data for email and OrderSuccess page
        const paymentForSuccess = {
          method: paymentMethod, // 'card' or 'upi'
          paymentMethodId: paymentMethod === 'card' ? 'pm_demo_card' : 'pm_demo_upi',
          success: data.success,
          amount: data.amount,
          transactionId: data.transactionId
        };
        
        console.log('Payment data being sent to email and OrderSuccess:', paymentForSuccess);
        
        // Send order confirmation email
        try {
          const emailResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/send-order-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              orderId: data.orderId, // Use the orderId returned from successful payment
              items: cart
                .filter(item => item._id || item.id)
                .map(item => ({
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image
                })),
              total: finalTotal, // Use finalTotal (includes GST)
              subtotal: baseTotal,
              discounts: totalDiscounts,
              gstAmount: gstAmount,
              address: address,
              phone: phone,
              payment: paymentForSuccess // Use the properly formatted payment data
            })
          });
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            console.log('✅ Order confirmation email sent successfully:', emailData);
          } else {
            const emailError = await emailResponse.json();
            console.error('❌ Order confirmation email failed:', emailError);
            // Don't block the user flow, but log the error
          }
        } catch (emailErr) {
          // Optionally log or show a message, but don't block the user
          console.error('❌ Order confirmation email request failed:', emailErr);
        }

        // Clear cart and navigate to success
        for (const item of cart) {
          const itemId = item._id || item.id;
          if (itemId) {
            await removeFromCart(itemId);
          }
        }
        
        // Get order ID from response (handle different response structures)
        const orderId = data.orderId || data.order?._id || data.orderId || data.id;
        
        if (!orderId) {
          console.error('No order ID in response:', data);
          setError('Order created but no order ID received. Please contact support.');
          setLoading(false);
          return;
        }
        
        navigate('/order-success', { 
          state: { 
            order: { 
              _id: orderId,
              total: finalTotal,
              subtotal: baseTotal,
              discounts: totalDiscounts,
              gstAmount: gstAmount,
              items: cart
                .filter(item => item._id || item.id)
                .map(item => ({
                  productId: item._id || item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image
                })),
              address: address,
              phone: phone,
              createdAt: new Date()
            },
            payment: paymentForSuccess,
            discounts: discounts
          } 
        });
      } else {
        console.error('Payment failed:', { status: res.status, data });
        setError(data.error || data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment processing failed. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Real-time validation handlers
  const validateAddress = (value) => {
    if (!value.trim()) setAddressError('Address is required.');
    else setAddressError('');
  };
  const validatePhone = (value) => {
    if (!/^\d{10}$/.test(value)) setPhoneError('Please enter a valid 10-digit phone number.');
    else setPhoneError('');
  };
  const validateCardNumber = (value) => {
    if (value.replace(/\s/g, '').length < 16) setCardNumberError('Card number must be 16 digits.');
    else setCardNumberError('');
  };
  const validateExpiryDate = (value) => {
    if (!value.trim()) {
      setExpiryDateError('Expiry date is required.');
      return;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(value)) {
      setExpiryDateError('Format must be MM/YY (e.g., 12/25)');
      return;
    }
    
    const [month, year] = value.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Validate month range (01-12)
    if (monthNum < 1 || monthNum > 12) {
      setExpiryDateError('Month must be between 01-12');
      return;
    }
    
    // Validate year (current year to current year + 10)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const maxYear = currentYear + 10;
    
    if (yearNum < currentYear || yearNum > maxYear) {
      setExpiryDateError(`Year must be between ${currentYear}-${maxYear}`);
      return;
    }
    
    // Check if card is expired
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < (currentDate.getMonth() + 1))) {
      setExpiryDateError('Card has expired. Please use a valid card.');
      return;
    }
    
    setExpiryDateError('');
  };
  const validateCvv = (value) => {
    if (!/^\d{3,4}$/.test(value)) setCvvError('CVV must be 3-4 digits.');
    else setCvvError('');
  };
  const validateCardholderName = (value) => {
    if (value.trim().length < 2) setCardholderNameError('Name is too short.');
    else setCardholderNameError('');
  };
  const validateUpiId = (value) => {
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(value)) setUpiIdError('Invalid UPI ID (e.g., name@upi).');
    else setUpiIdError('');
  };
  const validateUpiName = (value) => {
    if (value.trim().length < 2) setUpiNameError('Name is too short.');
    else setUpiNameError('');
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#b8860b', fontSize: 22, marginTop: 60 }}>
    <div className="spinner" style={{ margin: '0 auto 18px', width: 48, height: 48, border: '6px solid #f3e9d2', borderTop: '6px solid #b8860b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    Processing...
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>{error}</div>;

  return (
    <>
      <Header />
      <section style={{ backgroundColor: '#faf8f3', minHeight: '100vh' }}>
        <div className="menu-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      <h1 className="menu-title" style={{ fontSize: '2em', textAlign: 'center', marginBottom: 24 }}>Checkout</h1>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 18, fontSize: '1.3em' }}>Order Summary</h2>
        {cart.map(item => (
          <div key={item._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 16, background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(59,47,47,0.06)', padding: 10, flexWrap: 'wrap' }}>
                            <img src={`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/images/${item.image}`} alt={item.name} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, marginRight: 14 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ color: '#b8860b' }}>₹{Number(item.price) || 0} x {Number(item.quantity) || 0}</div>
            </div>
            <div style={{ fontWeight: 700, color: '#3b2f2f' }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 0)}</div>
          </div>
        ))}
        
        {/* Subtotal */}
        <div style={{ textAlign: 'right', fontSize: '1.1em', fontWeight: 600, color: '#5d4037', marginTop: 18, padding: '12px 16px', background: '#f8f5f0', borderRadius: 8 }}>
          Subtotal: ₹{baseTotal.toFixed(2)}
        </div>

        {/* Price Breakdown - Always Visible */}
        <div style={{ marginTop: 20, padding: 15, background: '#fffaf5', borderRadius: 12, border: '1px solid #e2c48d' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 12 }}>Price Breakdown</h3>
          <div style={{ borderTop: '1px solid #e2c48d', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#5d4037' }}>Subtotal:</span>
              <span style={{ color: '#5d4037' }}>₹{baseTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#e65100' }}>GST (18%):</span>
              <span style={{ color: '#e65100' }}>₹{(baseTotal * 0.18).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1em', fontWeight: 700, color: '#b8860b' }}>
              <span>Total (with GST):</span>
              <span>₹{(baseTotal * 1.18).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div style={{ marginTop: 20, padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e2c48d', boxShadow: '0 2px 8px rgba(59,47,47,0.06)' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 16, fontSize: '1.2em' }}>Available Discounts</h3>
          
          {/* Happy Hour Status */}
          <div style={{ marginBottom: 16, padding: 12, background: '#f8f5f0', borderRadius: 8, border: '1px solid #d4af37' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#5d4037' }}>Happy Hour Discount</span>
                <div style={{ fontSize: '0.9em', color: '#6d4c41', marginTop: 4 }}>
                  {(() => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentDay = now.getDay();
                    const isWeekday = currentDay >= 1 && currentDay <= 5;
                    const isHappyHour = isWeekday && currentHour >= 8 && currentHour < 10;
                    
                    if (isHappyHour) {
                      return 'Happy Hour is NOW LIVE! (25% off coffee beverages)';
                    } else if (isWeekday && currentHour < 8) {
                      return 'Happy Hour starts at 8:00 AM (25% off coffee beverages)';
                    } else if (isWeekday && currentHour >= 10) {
                      return 'Happy Hour ended at 10:00 AM. Come back tomorrow!';
                    } else {
                      return 'Happy Hour available on weekdays 8:00 AM - 10:00 AM';
                    }
                  })()}
                </div>
              </div>
              {(() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentDay = now.getDay();
                const isWeekday = currentDay >= 1 && currentDay <= 5;
                const isHappyHour = isWeekday && currentHour >= 8 && currentHour < 10;
                
                if (isHappyHour) {
                  return <span style={{ color: '#4caf50', fontWeight: 600 }}>ACTIVE</span>;
                } else {
                  return <span style={{ color: '#9e9e9e', fontWeight: 600 }}>INACTIVE</span>;
                }
              })()}
            </div>
          </div>

          {/* Student Discount Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#5d4037' }}>
              Student Discount (20% off entire order)
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                placeholder="Enter STUDENT20 coupon code"
                value={studentId}
                onChange={(e) => { 
                  setStudentId(e.target.value); 
                  setStudentDiscountError(''); // Clear error when typing
                }}
                style={{
                  ...themeInputStyle,
                  marginBottom: 0,
                  flex: 1
                }}
              />
              <button
                type="button"
                onClick={handleStudentDiscount}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: '1px solid #b8860b',
                  background: isStudentDiscountApplied ? '#b8860b' : '#fff',
                  color: isStudentDiscountApplied ? '#fff' : '#b8860b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {isStudentDiscountApplied ? 'Applied ✓' : 'Apply Discount'}
              </button>
            </div>
            <div style={{ fontSize: '0.9em', color: '#6d4c41', marginTop: 8 }}>
              Use coupon code STUDENT20 to get 20% off your entire order
            </div>
            {studentDiscountError && <div style={{ color: 'red', marginTop: 8 }}>{studentDiscountError}</div>}
          </div>



        </div>

        {/* Display Applied Discounts */}
        {discounts.length > 0 && (
          <div style={{ marginTop: 20, padding: 15, background: '#fffaf5', borderRadius: 12, border: '1px solid #e2c48d' }}>
            <h3 style={{ color: '#3b2f2f', marginBottom: 12 }}>Applied Discounts</h3>
            {discounts.map((discount, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#b8860b' }}>{discount.name}</span>
                  <div style={{ fontSize: '0.9em', color: '#6d4c41' }}>{discount.description}</div>
                </div>
                <span style={{ color: '#3b2f2f', fontWeight: 600 }}>-₹{discount.amount.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e2c48d', marginTop: 12, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#5d4037' }}>Subtotal:</span>
                <span style={{ color: '#5d4037' }}>₹{baseTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#b8860b' }}>Total Discounts:</span>
                <span style={{ color: '#b8860b' }}>-₹{totalDiscounts.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#5d4037' }}>Subtotal after Discounts:</span>
                <span style={{ color: '#5d4037' }}>₹{subtotalAfterDiscounts.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#e65100' }}>GST (18%):</span>
                <span style={{ color: '#e65100' }}>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2em', fontWeight: 700, color: '#b8860b' }}>
                <span>Final Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {paymentStep === 'details' ? (
          <>
            <form onSubmit={handleSubmitDetails} style={{ marginTop: 36 }}>
              <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 18, fontSize: '1.3em' }}>Delivery Information</h2>
              <input
                type="text"
                placeholder="Delivery Address"
                value={address}
                onChange={e => { setAddress(e.target.value); validateAddress(e.target.value); }}
                onBlur={e => validateAddress(e.target.value)}
                required
                style={themeInputStyle}
              />
              {addressError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{addressError}</div>}
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => { setPhone(e.target.value); validatePhone(e.target.value); }}
                onBlur={e => validatePhone(e.target.value)}
                required
                style={{ ...themeInputStyle, marginBottom: 24 }}
              />
              {phoneError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{phoneError}</div>}
              {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
                <button
                  type="button"
                  className="pill"
                  onClick={() => navigate('/cart')}
                  style={{
                    flex: 1,
                    padding: '0.8em 1.8em',
                    borderRadius: 999,
                    border: '1.5px solid #b8860b',
                    background: '#fff',
                    color: '#b8860b',
                    fontSize: '1em',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="menu-order-btn"
                  style={{
                    flex: 2,
                    fontSize: '1.1em',
                    padding: '0 2.2em',
                    borderRadius: 999,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#d2b262',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(210, 178, 98, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = '#b8860b';
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 6px 20px rgba(210, 178, 98, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#d2b262';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(210, 178, 98, 0.3)';
                  }}
                  disabled={loading || !!addressError || !!phoneError || !address || !phone}
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={handlePayment} style={{ marginTop: 36 }}>
            <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 18, fontSize: '1.3em' }}>Payment Method</h2>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontWeight: 600 }}>Credit/Debit Card</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontWeight: 600 }}>UPI Payment</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontWeight: 600 }}>💵 Cash on Delivery</span>
              </label>
            </div>

            {paymentMethod === 'card' && (
              <div style={{ background: '#fffaf5', padding: 20, borderRadius: 12, border: '1px solid #e2c48d' }}>
                <h3 style={{ color: '#3b2f2f', marginBottom: 16 }}>Card Details</h3>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={e => { setCardNumber(formatCardNumber(e.target.value)); validateCardNumber(formatCardNumber(e.target.value)); }}
                  onBlur={e => validateCardNumber(e.target.value)}
                  maxLength="19"
                  style={themeInputStyle}
                />
                {cardNumberError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{cardNumberError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={e => { setExpiryDate(formatExpiryDate(e.target.value)); validateExpiryDate(formatExpiryDate(e.target.value)); }}
                      onBlur={e => validateExpiryDate(e.target.value)}
                      maxLength="5"
                      style={{
                        ...themeInputStyle,
                        border: expiryDateError ? '1px solid #f44336' : '1px solid #b8860b',
                        backgroundColor: expiryDateError ? '#fff5f5' : '#fffaf5'
                      }}
                    />
                    {expiryDateError && <div style={{ color: '#f44336', fontSize: '0.85em', marginTop: 4, marginBottom: 8 }}>{expiryDateError}</div>}
                    {!expiryDateError && expiryDate && (
                      <div style={{ color: '#4caf50', fontSize: '0.85em', marginTop: 4, marginBottom: 8 }}>
                        ✓ Valid expiry date
                      </div>
                    )}
                    {!expiryDate && (
                      <div style={{ color: '#666', fontSize: '0.8em', marginTop: 4, marginBottom: 8 }}>
                        Format: MM/YY (e.g., 12/25)
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={e => { setCvv(e.target.value.replace(/\D/g, '').substring(0, 3)); validateCvv(e.target.value); }}
                    onBlur={e => validateCvv(e.target.value)}
                    maxLength="3"
                    style={themeInputStyle}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardholderName}
                  onChange={e => { setCardholderName(e.target.value); validateCardholderName(e.target.value); }}
                  onBlur={e => validateCardholderName(e.target.value)}
                  style={themeInputStyle}
                />
                {cardholderNameError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{cardholderNameError}</div>}
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div style={{ background: '#fffaf5', padding: 20, borderRadius: 12, border: '1px solid #e2c48d' }}>
                <h3 style={{ color: '#3b2f2f', marginBottom: 16 }}>UPI Details</h3>
                <input
                  type="text"
                  placeholder="UPI ID (e.g., name@upi)"
                  value={upiId}
                  onChange={e => { setUpiId(e.target.value.toLowerCase()); validateUpiId(e.target.value.toLowerCase()); }}
                  onBlur={e => validateUpiId(e.target.value)}
                  style={themeInputStyle}
                />
                {upiIdError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{upiIdError}</div>}
                <input
                  type="text"
                  placeholder="Full Name"
                  value={upiName}
                  onChange={e => { setUpiName(e.target.value); validateUpiName(e.target.value); }}
                  onBlur={e => validateUpiName(e.target.value)}
                  style={themeInputStyle}
                />
                {upiNameError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{upiNameError}</div>}
                <div style={{ background: '#e8f5e8', padding: 12, borderRadius: 8, border: '1px solid #4caf50', marginTop: 12 }}>
                  <small style={{ color: '#2e7d32' }}>
                    <strong>Note:</strong> You'll receive a UPI payment request on your phone. Please complete the payment to confirm your order.
                  </small>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div style={{ background: '#fffaf5', padding: 20, borderRadius: 12, border: '1px solid #e2c48d', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💵</div>
                <p style={{ color: '#666', margin: 0 }}>Pay with cash when your order is delivered</p>
              </div>
            )}

            {error && <div style={{ color: 'red', marginBottom: 12, marginTop: 16 }}>{error}</div>}
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="pill"
                onClick={() => setPaymentStep('details')}
                style={{
                  flex: 1,
                  padding: '0.8em 1.8em',
                  borderRadius: 999,
                  border: '1.5px solid #b8860b',
                  background: '#fff',
                  color: '#b8860b',
                  fontSize: '1em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="menu-order-btn"
                style={{ 
                  flex: 2, 
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
                disabled={loading ||
                  (paymentMethod === 'card' && (!!cardNumberError || !!expiryDateError || !!cvvError || !!cardholderNameError || !cardNumber || !expiryDate || !cvv || !cardholderName)) ||
                  (paymentMethod === 'upi' && (!!upiIdError || !!upiNameError || !upiId || !upiName))}
              >
                {loading ? 'Processing Payment...' : 'Complete Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .menu-container { padding: 20px 2px !important; }
          .menu-title { font-size: 1.3em !important; }
        }
        @media (max-width: 600px) {
          .menu-container { padding: 8px 0 !important; }
          .menu-title { font-size: 1.1em !important; }
          h2 { font-size: 1em !important; }
          input, button, textarea { font-size: 15px !important; }
        }
        @media (max-width: 480px) {
          .menu-container { padding: 2px 0 !important; }
          .menu-title { font-size: 1em !important; }
          h2 { font-size: 0.95em !important; }
          input, button, textarea { font-size: 14px !important; }
        }
        button.pill {
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 0.95em;
          border: 1px solid #b8860b;
          background: #fff;
          color: #b8860b;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        button.pill:hover {
          background: #b8860b;
          color: #fff;
          border-color: #b8860b;
          box-shadow: 0 2px 8px rgba(184, 134, 11, 0.12);
          transform: translateY(-2px) scale(1.03);
        }
        
        .menu-order-btn {
          background: linear-gradient(90deg, #d2b262 0%, #b8860b 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(210, 178, 98, 0.3);
        }
        
        .menu-order-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #b8860b 0%, #d2b262 100%);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(210, 178, 98, 0.4);
        }
        
        .menu-order-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
    </section>
    </>
  );
};

export default Checkout; 
