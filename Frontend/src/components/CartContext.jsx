import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 30000; // 30 seconds cache



  // Load cart from backend with caching
  const loadCartFromBackend = useCallback(async (forceRefresh = false) => {
    if (!token) {
      console.log('[CartContext] No token, clearing cart');
      setCart([]);
      return;
    }

    // Check cache
    const now = Date.now();
    if (!forceRefresh && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('[CartContext] Using cached cart data');
      return;
    }

    try {
      console.log('[CartContext] Loading cart from backend for user:', token ? 'authenticated' : 'guest');
      setCartLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[CartContext] Cart API response status:', response.status);
      
      if (response.ok) {
        const cartData = await response.json();
        console.log('[CartContext] Raw cart data from API:', cartData);
        
        const cleanCart = cartData.items?.map(item => ({
          ...item.productId, // This contains the full product data when populated
          quantity: item.quantity,
          _id: item.productId?._id || item.productId?.id || item.productId
        })) || [];
        
        console.log('[CartContext] Cleaned cart items:', cleanCart);
        console.log('[CartContext] Cart item count:', cleanCart.length);
        console.log('[CartContext] Sample item structure:', cleanCart[0] ? Object.keys(cleanCart[0]) : 'No items');
        
        setCart(cleanCart);
        setLastFetchTime(now);
        console.log('[CartContext] Cart loaded successfully with', cleanCart.length, 'items');
      } else {
        console.log('[CartContext] Cart API returned error status:', response.status);
        const errorText = await response.text();
        console.log('[CartContext] Error response:', errorText);
        setCart([]);
      }
    } catch (error) {
      console.error('[CartContext] Error loading cart:', error);
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  }, [token, lastFetchTime]);

  // Load cart from backend when user logs in
  useEffect(() => {
    console.log('[CartContext] Token changed, current token:', token ? 'exists' : 'null');
    if (token) {
      console.log('[CartContext] User authenticated, loading cart...');
      loadCartFromBackend(true); // Force refresh when token changes
    } else {
      console.log('[CartContext] User not authenticated, clearing cart');
      setCart([]);
    }
  }, [token]);

  // No localStorage saving - everything goes to backend

  // No need for sync useEffect - all operations are immediate backend calls

  // Add product to cart (backend operation)
  const addToCart = useCallback(async (product) => {
    if (!token) {
      console.log('[CartContext] User not authenticated, cannot add to cart');
      return;
    }

    try {
      console.log('[CartContext] Adding product to cart:', product);
      console.log('[CartContext] Product ID:', product._id);
      console.log('[CartContext] Token:', token ? 'Token exists' : 'No token');
      
      // Check if product already exists in cart
      const productId = product._id || product.id;
      console.log('[CartContext] Using product ID:', productId);
      
      const existing = cart.find(item => item._id === productId);
      
      if (existing) {
        console.log('[CartContext] Product already exists, updating quantity');
        // Update quantity
        await updateQuantity(productId, existing.quantity + 1);
      } else {
        console.log('[CartContext] Adding new product to backend');
        // Add new product
        const requestBody = { 
          productId: productId, 
          quantity: 1 
        };
        console.log('[CartContext] Request body:', requestBody);
        
        setCartLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        console.log('[CartContext] Response status:', response.status);
        console.log('[CartContext] Response ok:', response.ok);

        if (response.ok) {
          const responseData = await response.json();
          console.log('[CartContext] Response data:', responseData);
          
          // Reload cart from backend to get updated state
          await loadCartFromBackend(true); // Force refresh
          console.log('[CartContext] Product added to cart successfully');
          return true; // Indicate success
        } else {
          const errorData = await response.text();
          console.error('[CartContext] Failed to add product to cart:', response.status);
          console.error('[CartContext] Error response:', errorData);
          return false; // Indicate failure
        }
      }
    } catch (error) {
      console.error('[CartContext] Error adding product to cart:', error);
    } finally {
      setCartLoading(false);
    }
  }, [token, cart, loadCartFromBackend]);

  // Remove product from cart (backend operation)
  const removeFromCart = useCallback(async (productId) => {
    if (!token) {
      console.log('[CartContext] User not authenticated, cannot remove from cart');
      return;
    }

    try {
      setCartLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Reload cart from backend to get updated state
        await loadCartFromBackend(true); // Force refresh
        console.log('[CartContext] Product removed from cart successfully');
      } else {
        console.error('[CartContext] Failed to remove product from cart:', response.status);
      }
    } catch (error) {
      console.error('[CartContext] Error removing product from cart:', error);
    } finally {
      setCartLoading(false);
    }
  }, [token, loadCartFromBackend]);

  // Update quantity (backend operation)
  const updateQuantity = async (productId, quantity) => {
    if (!token) {
      console.log('[CartContext] User not authenticated, cannot update quantity');
      return;
    }

    try {
      setCartLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        // Reload cart from backend to get updated state
        await loadCartFromBackend(true); // Force refresh
        console.log('[CartContext] Quantity updated successfully');
      } else {
        console.error('[CartContext] Failed to update quantity:', response.status);
      }
    } catch (error) {
      console.error('[CartContext] Error updating quantity:', error);
    } finally {
      setCartLoading(false);
    }
  };

  // Clear cart (backend operation)
  const clearCart = async () => {
    if (!token) {
      console.log('[CartContext] User not authenticated, cannot clear cart');
      return;
    }

    try {
      setCartLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://cafeteria1-vodr.onrender.com'}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCart([]);
        console.log('[CartContext] Cart cleared from backend successfully');
      } else {
        console.error('[CartContext] Failed to clear cart from backend:', response.status);
      }
    } catch (error) {
      console.error('[CartContext] Error clearing cart from backend:', error);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <CartContext.Provider value={useMemo(() => ({ 
      cart, 
      cartLoading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      refreshCart: loadCartFromBackend 
    }), [cart, cartLoading, addToCart, removeFromCart, updateQuantity, clearCart, loadCartFromBackend])}>
      {children}
    </CartContext.Provider>
  );
}; 
