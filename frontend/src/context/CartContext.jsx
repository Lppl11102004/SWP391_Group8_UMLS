import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAndReservationApi } from '../api/cartAndReservation';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await cartAndReservationApi.getCart();
      const items = res.data?.data || res.data || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('trống')) {
        setCartItems([]);
      } else {
        console.warn('Error fetching cart:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (bookId) => {
    if (!isAuthenticated || !user?.userId) {
      throw new Error('Vui lòng đăng nhập để thêm vào giỏ mượn');
    }
    await cartAndReservationApi.addToCart(user.userId, bookId);
    await fetchCart();
  };

  const removeFromCart = async (cartId) => {
    await cartAndReservationApi.deleteCartItem(cartId);
    await fetchCart();
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
