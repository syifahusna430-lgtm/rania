import React from 'react';
import './KasirCart.css';

function KasirCart({
  cart,
  customerName,
  setCustomerName,
  paymentMethod,
  setPaymentMethod,
  updateQuantity,
  removeFromCart,
  clearCart,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatRupiah,
  onCheckout
}) {
  return (
    <div className="kasir-cart">
      <div className="kasir-cart-header">
        <span className="cart-logo">🏺</span>
        <h2>Keranjang Gerabah</h2>
      </div>
      
      {/* Input Nama Pembeli */}
      <div className="customer-input">
        <label>Nama Pembeli:</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Masukkan nama pembeli"
          className="customer-field"
        />
      </div>

      {/* Daftar Item */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-icon">🏺</span>
            <p>Keranjang masih kosong</p>
            <small>Pilih produk gerabah di samping</small>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p className="item-price">{formatRupiah(item.price)}</p>
              </div>
              
              <div className="item-actions">
                <div className="quantity-control">
                  <button 
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    className="qty-btn"
                  >-</button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    className="qty-btn"
                    disabled={item.quantity >= item.stock}
                  >+</button>
                </div>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="btn-remove"
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>
              <div className="item-stock-info">
                Stok tersisa: {item.stock - item.quantity}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ringkasan Harga */}
      {cart.length > 0 && (
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatRupiah(calculateSubtotal())}</span>
          </div>
          <div className="summary-row">
            <span>Pajak (10%):</span>
            <span>{formatRupiah(calculateTax())}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>{formatRupiah(calculateTotal())}</span>
          </div>
        </div>
      )}

      {/* Metode Pembayaran */}
      <div className="payment-method">
        <label>Metode Pembayaran:</label>
        <select 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="payment-select"
        >
          <option value="TUNAI">💵 TUNAI</option>
          <option value="QRIS">📱 QRIS</option>
          <option value="DEBIT">💳 DEBIT</option>
          <option value="KREDIT">💳 KREDIT</option>
        </select>
      </div>

      {/* Tombol Aksi */}
      <div className="cart-actions">
        <button 
          onClick={clearCart} 
          className="btn-clear"
          disabled={cart.length === 0}
        >
          🗑️ Kosongkan Keranjang
        </button>
        <button 
          onClick={onCheckout} 
          className="btn-checkout"
          disabled={cart.length === 0 || !customerName.trim()}
        >
          💰 Bayar Sekarang
        </button>
      </div>
    </div>
  );
}

export default KasirCart;