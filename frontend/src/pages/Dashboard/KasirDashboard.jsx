import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axios';
import './Dashboard.css';

function KasirDashboard({ userData }) {
  const [stats, setStats] = useState({
    todayTransactions: 0,
    todayRevenue: 0,
    totalProducts: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKasirData();
  }, []);

  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    return [];
  };

  const fetchKasirData = async () => {
    try {
      const [productsRes, transactionsRes] = await Promise.all([
        api.get('/products'),
        api.get('/transactions')
      ]);

      const products = extractData(productsRes.data);
      const transactions = extractData(transactionsRes.data);

      // Filter transaksi hari ini
      const today = new Date().toDateString();
      const todayTransactions = transactions.filter(t => 
        new Date(t.created_at).toDateString() === today
      );

      const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);

      setStats({
        totalProducts: products.length,
        todayTransactions: todayTransactions.length,
        todayRevenue: todayRevenue
      });

      setRecentTransactions(transactions.slice(0, 5));
      setPopularProducts(products.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetch kasir data:', error);
      
      // Data dummy
      setStats({
        totalProducts: 10,
        todayTransactions: 0,
        todayRevenue: 0
      });
      
      setPopularProducts([
        { id: 1, name: 'Vas Bunga Besar', price: 50000, stock: 20 },
        { id: 2, name: 'Vas Motif Jawa', price: 60000, stock: 15 },
        { id: 3, name: 'Piring Hias Klasik', price: 30000, stock: 30 }
      ]);
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

  if (loading) return <div className="loading">Loading kasir data...</div>;

  return (
    <div className="kasir-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Kasir</h1>
        <p>Selamat datang, <strong>{userData.name}</strong> (Kasir)</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/transactions')}>
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Transaksi Hari Ini</h3>
            <p className="stat-number">{stats.todayTransactions}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <h3>Pendapatan Hari Ini</h3>
            <p className="stat-number">{formatRupiah(stats.todayRevenue)}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/products')}>
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Produk</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
      </div>

      <div className="quick-transaction">
        <button onClick={() => navigate('/transactions/create')} className="btn-transaction">
          ➕ Buat Transaksi Baru
        </button>
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
                <th>Waktu</th>
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
                    <td>{new Date(t.created_at).toLocaleTimeString('id-ID')}</td>
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
          <h3>🔥 Produk Populer</h3>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th>Stok</th>
              </tr>
            </thead>
            <tbody>
              {popularProducts.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{formatRupiah(p.price)}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="view-all" onClick={() => navigate('/products')}>
            Lihat Semua →
          </button>
        </div>
      </div>
    </div>
  );
}

export default KasirDashboard;