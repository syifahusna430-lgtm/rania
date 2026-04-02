import React from 'react';
import { useCart } from '../../context/CartContext';  // ✅ Naik 2 level (ke src/)
import './CartDrawer.css';

const CartDrawer = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    clearCart 
  } = useCart();

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Fungsi untuk mendapatkan URL gambar dari backend
  const getImageUrl = (item) => {
    if (item.image_url) {
      return `http://localhost:3000/images/produk/${item.image_url}`;
    }
    return '/images/produk/default.jpg';
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    alert('✅ Checkout berhasil!\nTerima kasih telah berbelanja di Toko Gerabah');
    clearCart();
    setIsCartOpen(false);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>
      
      {/* Drawer */}
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>🛒 Keranjang Belanja</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-icon">🛒</span>
              <p>Keranjang belanja masih kosong</p>
              <small>Silakan pilih produk yang ingin dibeli</small>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                {/* GAMBAR PRODUK */}
                <div className="cart-item-image">
                  <img 
                    src={getImageUrl(item)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/images/produk/default.jpg';
                    }}
                  />
                </div>
                
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">{formatRupiah(item.price)}</p>
                  <p className="cart-item-stock">Stok: {item.stock}</p>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="qty-btn"
                      >-</button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                        disabled={item.quantity >= item.stock}
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="cart-summary">
              <div className="summary-row">
                <span>Total Item:</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Harga:</span>
                <span>{formatRupiah(getCartTotal())}</span>
              </div>
            </div>

            <div className="cart-actions">
              <button onClick={clearCart} className="clear-btn">
                🗑️ Kosongkan
              </button>
              <button onClick={handleCheckout} className="checkout-btn">
                ✅ Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;