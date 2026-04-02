import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axios';
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
  const { addToCart, getCartCount } = useCart();
  const cartCount = getCartCount();

  useEffect(() => {
    fetchPembeliData();
  }, []);

  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    return [];
  };

  const fetchPembeliData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      const productsData = extractData(productsRes.data);
      const categoriesData = extractData(categoriesRes.data);

      setProducts(productsData);
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (product) => {
    if (product.image_url) {
      return `http://localhost:3000/images/produk/${product.image_url}`;
    }
    return '/images/produk/default.jpg';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Habis', color: '#e74c3c' };
    if (stock < 5) return { text: 'Hampir Habis', color: '#f39c12' };
    if (stock < 10) return { text: 'Menipis', color: '#f39c12' };
    return { text: 'Tersedia', color: '#27ae60' };
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      alert('Maaf, stok produk ini sedang habis');
      return;
    }
    addToCart(product, 1);
    alert(`✅ ${product.name} ditambahkan ke keranjang!`);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id === parseInt(selectedCategory);
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loading-spinner"></div>
        <p>Loading produk...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ color: '#8B5A2B', margin: 0 }}>🏺 Toko Gerabah</h1>
          <p style={{ color: '#C49A6C', margin: '5px 0 0' }}>
            Selamat berbelanja, <strong>{userData.name}</strong>!
          </p>
        </div>
        <button 
          onClick={() => navigate('/cart')}
          style={{
            background: '#8B5A2B',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            position: 'relative'
          }}
        >
          🛒 Keranjang
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 2,
            padding: '12px 20px',
            border: '2px solid #E6CCB2',
            borderRadius: '30px',
            fontSize: '1rem'
          }}
        />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: '2px solid #E6CCB2',
            borderRadius: '30px',
            fontSize: '1rem',
            background: 'white'
          }}
        >
          <option value="all">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '30px'
      }}>
        <div style={{ 
          flex: 1, 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #E6CCB2'
        }}>
          <div style={{ fontSize: '2rem' }}>📦</div>
          <h2 style={{ margin: '10px 0', color: '#8B5A2B' }}>{filteredProducts.length}</h2>
          <p style={{ margin: 0, color: '#C49A6C' }}>Total Produk</p>
        </div>
        <div style={{ 
          flex: 1, 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #E6CCB2'
        }}>
          <div style={{ fontSize: '2rem' }}>📁</div>
          <h2 style={{ margin: '10px 0', color: '#8B5A2B' }}>{categories.length}</h2>
          <p style={{ margin: 0, color: '#C49A6C' }}>Kategori</p>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px' }}>
          <p>Tidak ada produk yang ditemukan</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '25px'
        }}>
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                border: '1px solid #E6CCB2'
              }}>
                <div style={{ height: '200px', overflow: 'hidden', background: '#f5f5f5' }}>
                  <img 
                    src={getImageUrl(product)}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/images/produk/default.jpg'; }}
                  />
                </div>
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px', color: '#5D3A1A' }}>{product.name}</h3>
                  <p style={{ color: '#8B5A2B', fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
                    {formatRupiah(product.price)}
                  </p>
                  <p style={{ margin: '5px 0', color: '#C49A6C' }}>Stok: {product.stock}</p>
                  <p style={{ margin: '5px 0' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: stockStatus.color,
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {stockStatus.text}
                    </span>
                  </p>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: product.stock === 0 ? '#E6CCB2' : '#8B5A2B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      marginTop: '10px'
                    }}
                  >
                    {product.stock === 0 ? 'Stok Habis' : '🛒 Beli'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <p>⚠️ {error}</p>
          <button onClick={fetchPembeliData} style={{
            padding: '8px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}

export default PembeliDashboard;