import React, { createContext, useState, useContext, useEffect } from 'react';

// Buat Context
const CartContext = createContext();

// Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Load keranjang dari localStorage saat pertama kali
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Gagal load keranjang:', error);
      }
    }
  }, []);

  // Simpan keranjang ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fungsi untuk mendapatkan URL gambar dari backend
  const getImageUrl = (product) => {
    if (product.image_url) {
      return `http://localhost:3000/images/produk/${product.image_url}`;
    }
    return '/images/produk/default.jpg';
  };

  // Tambah item ke keranjang
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Cek apakah produk sudah ada di keranjang
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // Cek stok
        if (existingItem.quantity + quantity > product.stock) {
          showNotification(`Stok ${product.name} hanya tersisa ${product.stock}`, 'error');
          return prevItems;
        }
        
        // Update quantity
        const updatedItems = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        showNotification(`Jumlah ${product.name} ditambahkan`, 'success');
        return updatedItems;
      } else {
        // Tambah item baru
        if (quantity > product.stock) {
          showNotification(`Stok ${product.name} hanya tersisa ${product.stock}`, 'error');
          return prevItems;
        }
        
        showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
        return [...prevItems, { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          quantity,
          stock: product.stock,
          image_url: product.image_url, // 🔥 TAMBAHKAN INI - SIMPAN URL GAMBAR
          image: getImageUrl(product)    // 🔥 TAMBAHKAN INI - URL LENGKAP
        }];
      }
    });
  };

  // Hapus item dari keranjang
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const removedItem = prevItems.find(item => item.id === productId);
      if (removedItem) {
        showNotification(`${removedItem.name} dihapus dari keranjang`, 'info');
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  // Update quantity item
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          if (newQuantity > item.stock) {
            showNotification(`Stok ${item.name} hanya tersisa ${item.stock}`, 'error');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Kosongkan keranjang
  const clearCart = () => {
    setCartItems([]);
    showNotification('Keranjang dikosongkan', 'info');
  };

  // Hitung total harga
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Hitung jumlah item
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Tampilkan notifikasi
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Tutup notifikasi
  const closeNotification = () => {
    setNotification({ show: false, message: '', type: '' });
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      notification,
      closeNotification
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook untuk menggunakan CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};