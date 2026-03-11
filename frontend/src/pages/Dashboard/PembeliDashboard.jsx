import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import './Dashboard.css';

function PembeliDashboard({ userData }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { notification, closeNotification } = useCart();

  const fetchPembeliData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching pembeli data...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Anda belum login. Silakan login ulang.');
        setLoading(false);
        return;
      }

      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);

      // Proses data products
      let productsData = [];
      if (Array.isArray(productsRes.data)) {
        productsData = productsRes.data;
      } else if (productsRes.data?.data && Array.isArray(productsRes.data.data)) {
        productsData = productsRes.data.data;
      }

      // Proses data categories
      let categoriesData = [];
      if (Array.isArray(categoriesRes.data)) {
        categoriesData = categoriesRes.data;
      } else if (categoriesRes.data?.data && Array.isArray(categoriesRes.data.data)) {
        categoriesData = categoriesRes.data.data;
      }

      setProducts(productsData);
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Gagal mengambil data. Pastikan backend menyala.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPembeliData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id === parseInt(selectedCategory);
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRefresh = () => {
    fetchPembeliData();
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading produk...</p>
      </div>
    );
  }

  return (
    <div className="pembeli-dashboard">
      {/* Notifikasi */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={closeNotification} className="close-notif">✕</button>
        </div>
      )}

      {/* Header dengan tombol refresh */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div className="dashboard-header" style={{ marginBottom: 0 }}>
          <h1>🏺 Toko Gerabah</h1>
          <p>Selamat berbelanja, <strong>{userData.name}</strong>!</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="refresh-btn"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Pesan error */}
      {error && (
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Search dan Filter */}
      {!error && (
        <>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Total Produk:</span>
              <span className="stat-value">{filteredProducts.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Kategori:</span>
              <span className="stat-value">{categories.length}</span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>Tidak ada produk yang ditemukan</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PembeliDashboard;