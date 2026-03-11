import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axios';
import './Dashboard.css';

function AdminDashboard({ userData }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalTransactions: 0,
    totalUsers: 3  // Default dari database kamu (Rania, Lala, Cila)
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    return [];
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin data...');
      
      // Hanya panggil endpoint yang ADA di backend kamu
      const [productsRes, categoriesRes, transactionsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/transactions')
      ]);

      console.log('Products:', productsRes.data);
      console.log('Categories:', categoriesRes.data);
      console.log('Transactions:', transactionsRes.data);

      const products = extractData(productsRes.data);
      const categories = extractData(categoriesRes.data);
      const transactions = extractData(transactionsRes.data);

      // Filter stok menipis (stok < 10)
      const lowStock = products.filter(p => p.stock < 10);

      // Total Users dari database kamu ada 3 (Rania, Lala, Cila)
      const totalUsers = 3;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalTransactions: transactions.length,
        totalUsers: totalUsers
      });

      setRecentTransactions(transactions.slice(0, 5));
      setLowStockProducts(lowStock.slice(0, 5));
      
      console.log('Stats updated:', {
        products: products.length,
        categories: categories.length,
        transactions: transactions.length,
        users: totalUsers
      });
      
    } catch (error) {
      console.error('Error fetch admin data:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        alert(`Gagal mengambil data: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        alert('Tidak dapat terhubung ke server. Pastikan backend menyala.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading admin data...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang, <strong>{userData.name}</strong> (Admin)</p>
      </div>

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

      <div className="dashboard-grid">
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