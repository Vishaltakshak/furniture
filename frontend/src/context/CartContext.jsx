import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DUMMY_PRODUCTS } from '@/data/products';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
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

  // Fallback helper to simulate cart operations locally
  const updateLocalCart = (newItems) => {
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newCart = { items: newItems, total };
    setCart(newCart);
    localStorage.setItem('localCart', JSON.stringify(newCart));
    return newCart;
  };

  useEffect(() => {
    // Load local cart if backend fails initial load or just as persisted state
    const saved = localStorage.getItem('localCart');
    if (saved && (!cart.items.length || cart.items.length === 0)) {
       try {
         setCart(JSON.parse(saved));
       } catch (e) { console.error("Failed to parse local cart", e);}
    }
  }, []); // Run once on mount

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        currentCartId = await createCart();
      }
      if (currentCartId) {
         const response = await axios.post(`${API}/cart/${currentCartId}/add`, {
            product_id: productId,
            quantity
          });
        setCart(response.data);
      } else {
         throw new Error("No backend cart");
      }
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback: Add to local cart
      const product = DUMMY_PRODUCTS.find(p => p.id === productId);
      if (product) {
          const existingItem = cart.items.find(i => i.product_id === productId);
          let newItems;
          if (existingItem) {
              newItems = cart.items.map(i => 
                  i.product_id === productId ? { ...i, quantity: i.quantity + quantity } : i
              );
          } else {
              newItems = [...cart.items, {
                  product_id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  quantity
              }];
          }
          updateLocalCart(newItems);
          return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
        if (!cartId) throw new Error("No cart ID");
      const response = await axios.post(`${API}/cart/${cartId}/remove?product_id=${productId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error removing from cart:', error);
      const newItems = cart.items.filter(i => i.product_id !== productId);
      updateLocalCart(newItems);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
        if (!cartId) throw new Error("No cart ID");
      const response = await axios.post(`${API}/cart/${cartId}/update`, {
        product_id: productId,
        quantity
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error updating cart:', error);
      if (quantity <= 0) {
          const newItems = cart.items.filter(i => i.product_id !== productId);
          updateLocalCart(newItems);
      } else {
          const newItems = cart.items.map(i => 
              i.product_id === productId ? { ...i, quantity } : i
          );
          updateLocalCart(newItems);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
    localStorage.removeItem('localCart');
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
