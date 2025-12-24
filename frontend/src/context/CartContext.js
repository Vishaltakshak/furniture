import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartId, setCartId] = useState(() => localStorage.getItem('cartId'));
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await axios.get(`${API}/cart/${id}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Create new cart if not found
      if (error.response?.status === 404) {
        localStorage.removeItem('cartId');
        setCartId(null);
        createCart();
      }
    }
  }, []);

  const createCart = async () => {
    try {
      const response = await axios.post(`${API}/cart/create`);
      const newCartId = response.data.id;
      setCartId(newCartId);
      localStorage.setItem('cartId', newCartId);
      setCart(response.data);
      return newCartId;
    } catch (error) {
      console.error('Error creating cart:', error);
    }
  };

  useEffect(() => {
    if (cartId) {
      fetchCart(cartId);
    } else {
      createCart();
    }
  }, [cartId, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        currentCartId = await createCart();
      }
      const response = await axios.post(`${API}/cart/${currentCartId}/add`, {
        product_id: productId,
        quantity
      });
      setCart(response.data);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/cart/${cartId}/remove?product_id=${productId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/cart/${cartId}/update`, {
        product_id: productId,
        quantity
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartId,
      cartItemCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
