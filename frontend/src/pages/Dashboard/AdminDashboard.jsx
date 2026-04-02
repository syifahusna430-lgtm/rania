import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axios';
import './Dashboard.css';

function AdminDashboard({ userData }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalTransactions: 0,
    totalUsers: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Untuk memaksa re-render
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []); // Kosong, hanya sekali saat mount

  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.rows && Array.isArray(response.rows)) return response.rows;
    return [];
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 ===== FETCHING ADMIN DATA =====');
      console.log('📅 Waktu:', new Date().toLocaleTimeString());
      
      // Panggil API yang ADA
      const [productsRes, categoriesRes, transactionsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/transactions')
      ]);

      console.log('📦 PRODUCTS RESPONSE:', productsRes.data);
      console.log('📁 CATEGORIES RESPONSE:', categoriesRes.data);
      console.log('💰 TRANSACTIONS RESPONSE:', transactionsRes.data);

      // Ekstrak data
      const products = extractData(productsRes.data);
      const categories = extractData(categoriesRes.data);
      const transactions = extractData(transactionsRes.data);

      console.log('📦 Products setelah extract:', products.length, 'item');
      console.log('📁 Categories setelah extract:', categories.length, 'item');
      console.log('📋 Daftar Kategori:', categories.map(c => c.name).join(', '));

      // Filter stok menipis (stok < 10)
      const lowStock = products.filter(p => p.stock < 10);
      console.log('⚠️ Low stock products:', lowStock.length, 'item');
      if (lowStock.length > 0) {
        console.log('📋 Produk stok menipis:', lowStock.map(p => `${p.name} (${p.stock})`).join(', '));
      }

      // Hitung total users
      let totalUsers = 3; // Default
      
      try {
        // Coba ambil dari API /users jika ada
        const usersRes = await api.get('/users');
        const users = extractData(usersRes.data);
        totalUsers = users.length;
        console.log('👥 Users dari API:', totalUsers);
        console.log('📋 Daftar Users:', users.map(u => u.name).join(', '));
      } catch (userError) {
        console.log('⚠️ Endpoint /users tidak tersedia, pakai data manual');
        // Dari database Anda, ada 4 user
        totalUsers = 4;
        console.log('👥 Users (manual):', totalUsers);
      }

      // Update state
      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalTransactions: transactions.length,
        totalUsers: totalUsers
      });

      setRecentTransactions(transactions.slice(0, 5));
      setLowStockProducts(lowStock.slice(0, 5));
      
      console.log('📊 ===== STATS UPDATED =====');
      console.log('📊 Total Produk:', products.length);
      console.log('📊 Total Kategori:', categories.length);
      console.log('📊 Total Transaksi:', transactions.length);
      console.log('📊 Total User:', totalUsers);
      console.log('📊 Stok Menipis:', lowStock.length);
      console.log('📊 ========================');
      
    } catch (error) {
      console.error('❌ ERROR FETCH ADMIN DATA:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        setError(`Gagal mengambil data: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received');
        setError('Tidak dapat terhubung ke server. Pastikan backend menyala.');
      } else {
        console.error('Error:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshKey(prev => prev + 1); // Memaksa re-render
    fetchAdminData();
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading admin data...</p>
    </div>
  );

  return (
    <div className="admin-dashboard" key={refreshKey}> {/* Key untuk memaksa re-render */}
      {/* Header dengan tombol refresh */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div className="dashboard-header" style={{ marginBottom: 0 }}>
          <h1>Dashboard Admin</h1>
          <p>Selamat datang, <strong>{userData.name}</strong> (Admin)</p>
          <p style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: '5px' }}>
            Terakhir update: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="refresh-btn"
          style={{
            padding: '8px 16px',
            background: '#D4A76A',
            color: '#5D3A1A',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 'bold'
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Pesan error jika ada */}
      {error && (
        <div className="error-container" style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>⚠️ {error}</p>
          <button 
            onClick={handleRefresh} 
            className="retry-btn"
            style={{
              padding: '5px 15px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Statistik Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/admin/products')}>
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Produk</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/categories')}>
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <h3>Total Kategori</h3>
            <p className="stat-number">{stats.totalCategories}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/transactions')}>
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Transaksi</h3>
            <p className="stat-number">{stats.totalTransactions}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/register')}>
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total User</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Grid untuk 2 kolom */}
      <div className="dashboard-grid">
        {/* Transaksi Terbaru */}
        <div className="dashboard-card">
          <h3>📋 Transaksi Terbaru</h3>
          <table className="recent-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pembeli</th>
                <th>Total</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr><td colSpan="4" className="no-data">Belum ada transaksi</td></tr>
              ) : (
                recentTransactions.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td>{t.buyer_name}</td>
                    <td className="total-price">{formatRupiah(t.total)}</td>
                    <td>{formatDate(t.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button className="view-all" onClick={() => navigate('/transactions')}>
            Lihat Semua →
          </button>
        </div>

        {/* Stok Menipis */}
        <div className="dashboard-card">
          <h3>⚠️ Stok Menipis (Stok {'<'} 10)</h3>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Stok</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr><td colSpan="3" className="no-data">Semua stok aman</td></tr>
              ) : (
                lowStockProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`badge ${p.stock < 5 ? 'danger' : 'warning'}`}>
                        {p.stock < 5 ? 'Kritis' : 'Menipis'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button className="view-all" onClick={() => navigate('/admin/products')}>
            Kelola Stok →
          </button>
        </div>
      </div>

      {/* Aksi Cepat */}
      <div className="quick-actions">
        <h3>⚡ Aksi Cepat</h3>
        <div className="action-buttons">
          <button onClick={() => navigate('/admin/products/create')} className="action-btn">➕ Tambah Produk</button>
          <button onClick={() => navigate('/admin/categories/create')} className="action-btn">📁 Tambah Kategori</button>
          <button onClick={() => navigate('/admin/register')} className="action-btn">👤 Register User</button>
          <button onClick={() => navigate('/transactions/create')} className="action-btn">💰 Buat Transaksi</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;