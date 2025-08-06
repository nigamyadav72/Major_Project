import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cartAPI } from '@/api/services';

interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_price: number;
  product_image?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      console.log('Cart API response:', response.data);
      
      // Handle the actual API response structure
      const items = response.data.items || [];
      console.log('Cart items:', items);
      setCartItems(items);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      
      // If it's an authentication error, set empty cart but don't show error
      if (error.response?.status === 401) {
        console.log('User not authenticated, setting empty cart');
        setCartItems([]);
      } else {
        // For other errors, still set empty cart
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    try {
      const response = await cartAPI.add(productId, quantity);
      console.log('Add to cart response:', response.data);
      await refreshCart();
      return response.data;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      // Re-throw the error so the component can handle it
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to add item to cart');
      }
    }
  }, [refreshCart]);

  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    try {
      await cartAPI.update(itemId, quantity);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  }, [refreshCart]);

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      await cartAPI.remove(itemId);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clear();
      await refreshCart();
    } catch (error) {
      throw error;
    }
  }, [refreshCart]);

  // Memoize computed values to prevent unnecessary re-renders
  const cartCount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0), 
    [cartItems]
  );

  const cartTotal = useMemo(() => 
    cartItems.reduce((sum, item) => sum + (Number(item.product_price) * item.quantity), 0), 
    [cartItems]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    cartItems,
    cartCount,
    cartTotal,
    loading,
    refreshCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }), [cartItems, cartCount, cartTotal, loading, refreshCart, addToCart, updateCartItem, removeFromCart, clearCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}; 