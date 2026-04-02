import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // 🔥 PERBAIKAN: Fungsi untuk mendapatkan URL gambar dari BACKEND
  const getImageUrl = () => {
    if (product.image_url) {
      return `http://localhost:3000/images/produk/${product.image_url}`;
    }
    // Fallback ke default di frontend
    return '/images/produk/default.jpg';
  };

  // Tentukan status stok
  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Stok Habis', class: 'habis' };
    if (product.stock < 5) return { text: 'Stok Kritis', class: 'kritis' };
    if (product.stock < 10) return { text: 'Stok Menipis', class: 'menipis' };
    return { text: 'Tersedia', class: 'tersedia' };
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
          src={!imageError ? getImageUrl() : '/images/produk/default.jpg'}
          alt={product.name}
          onError={() => setImageError(true)}
          className="product-img"
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