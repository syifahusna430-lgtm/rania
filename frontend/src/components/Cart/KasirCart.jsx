import React from 'react';
import './KasirCart.css';

function KasirCart({
  cart,
  customerName,
  setCustomerName,
  customerType,
  setCustomerType,
  paymentMethod,
  setPaymentMethod,
  updateQuantity,
  removeFromCart,
  clearCart,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  paymentAmount,
  setPaymentAmount,
  formatRupiah,
  onCheckout
}) {
  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseInt(paymentAmount) || 0;
    return paid - total;
  };

  return (
    <div className="kasir-cart-simple">
      <h2>CURRENT ORDER</h2>
      
      {/* Customer Type Tabs */}
      <div className="customer-tabs">
        <button 
          onClick={() => setCustomerType('Guest')}
          className={`tab-btn ${customerType === 'Guest' ? 'active' : ''}`}
        >
          Guest
        </button>
        <button 
          onClick={() => setCustomerType('Member')}
          className={`tab-btn ${customerType === 'Member' ? 'active' : ''}`}
        >
          Member
        </button>
      </div>

      {/* Optional Name Input */}
      <div className="name-input">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Name (optional)"
          className="name-field"
        />
      </div>

      {/* Cart Items List */}
      <div className="cart-items-simple">
        {cart.length === 0 ? (
          <p className="empty-cart-text">No items in order</p>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="cart-item-simple">
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-price">{formatRupiah(item.price)}</span>
              </div>
              <div className="item-controls">
                <button onClick={() => updateQuantity(index, item.quantity - 1)} className="qty-btn">-</button>
                <span className="item-qty">{item.quantity}</span>
                <button onClick={() => updateQuantity(index, item.quantity + 1)} className="qty-btn">+</button>
                <button onClick={() => removeFromCart(index)} className="remove-item-btn">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="order-summary-simple">
        <div className="summary-line">
          <span>Subtotal</span>
          <span>{formatRupiah(calculateSubtotal())}</span>
        </div>
        <div className="summary-line total-line">
          <span>TOTAL</span>
          <span>{formatRupiah(calculateTotal())}</span>
        </div>
        <div className="summary-line">
          <span>Amount / Bayar</span>
          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="0"
            className="payment-input-simple"
          />
        </div>
        {paymentAmount && parseInt(paymentAmount) >= calculateTotal() && (
          <div className="summary-line change-line">
            <span>Kembalian</span>
            <span>{formatRupiah(calculateChange())}</span>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="payment-methods-simple">
        <button 
          onClick={() => setPaymentMethod('TUNAI')}
          className={`payment-btn-simple ${paymentMethod === 'TUNAI' ? 'active' : ''}`}
        >
          Tunai
        </button>
        <button 
          onClick={() => setPaymentMethod('QRIS')}
          className={`payment-btn-simple ${paymentMethod === 'QRIS' ? 'active' : ''}`}
        >
          QRIS
        </button>
        <button 
          onClick={() => setPaymentMethod('TRANSFER')}
          className={`payment-btn-simple ${paymentMethod === 'TRANSFER' ? 'active' : ''}`}
        >
          Transfer
        </button>
      </div>

      {/* Process Button */}
      <button 
        onClick={onCheckout}
        className="process-btn"
        disabled={cart.length === 0}
      >
        PROSES TRANSAKSI
      </button>

      {/* Clear Cart Button (Optional) */}
      {cart.length > 0 && (
        <button onClick={clearCart} className="clear-cart-btn">
          Kosongkan
        </button>
      )}
    </div>
  );
}

export default KasirCart;