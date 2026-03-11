import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Tentukan status stok
  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Stok Habis', color: '#e74c3c', class: 'habis' };
    if (product.stock < 5) return { text: 'Stok Kritis', color: '#e67e22', class: 'kritis' };
    if (product.stock < 10) return { text: 'Stok Menipis', color: '#f39c12', class: 'menipis' };
    return { text: 'Tersedia', color: '#27ae60', class: 'tersedia' };
  };

  const stockStatus = getStockStatus();

  const handleAddToCart = () => {
    if (product.stock === 0) {
      alert('Maaf, stok produk ini sedang habis');
      return;
    }
    addToCart(product, quantity);
    setShowQuantity(false);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      alert('Maaf, stok produk ini sedang habis');
      return;
    }
    addToCart(product, quantity);
    alert(`✅ ${product.name} ditambahkan ke keranjang!\nSilakan cek keranjang untuk checkout.`);
    setQuantity(1);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={`https://source.unsplash.com/300x200/?pottery,ceramic,clay&sig=${product.id}`} 
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Produk+Gerabah';
          }}
        />
        <span className={`stock-badge ${stockStatus.class}`}>
          {stockStatus.text}
        </span>
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">
          Produk gerabah berkualitas dari pengrajin lokal
        </p>
        
        <div className="product-price-row">
          <span className="product-price">{formatRupiah(product.price)}</span>
          <span className={`product-stock ${product.stock < 10 ? 'low-stock' : ''}`}>
            Stok: {product.stock}
          </span>
        </div>

        {showQuantity ? (
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="qty-btn"
              disabled={product.stock === 0}
            >-</button>
            <span className="quantity">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              className="qty-btn"
              disabled={quantity >= product.stock || product.stock === 0}
            >+</button>
            <button 
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              disabled={product.stock === 0}
            >
              ✅ Tambah
            </button>
            <button 
              onClick={() => setShowQuantity(false)}
              className="cancel-btn"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="product-actions">
            <button 
              className="btn-cart" 
              onClick={() => setShowQuantity(true)}
              disabled={product.stock === 0}
            >
              🛒 Keranjang
            </button>
            <button 
              className="btn-buy" 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              ⚡ Beli Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;