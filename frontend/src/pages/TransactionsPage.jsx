import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { canAccessTransactions, getUserId } from '../utils/auth';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewDetail, setViewDetail] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [formData, setFormData] = useState({
    buyer_name: '',
    items: []
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const cashierId = getUserId();

  useEffect(() => {
    if (!canAccessTransactions()) {
      alert('Akses ditolak');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, []);

  // Fungsi untuk mengekstrak data dari response API
  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.rows && Array.isArray(response.rows)) return response.rows;
    if (response.transactions && Array.isArray(response.transactions)) return response.transactions;
    return [];
  };

  const fetchData = async () => {
    try {
      const [transactionsRes, productsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/products')
      ]);

      console.log('Transactions response:', transactionsRes.data);
      console.log('Products response:', productsRes.data);

      const transactionsData = extractData(transactionsRes.data);
      const productsData = extractData(productsRes.data);

      setTransactions(transactionsData);
      setProducts(productsData);
      
    } catch (error) {
      console.error('Gagal fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetail = async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      console.log('Transaction detail:', response.data);
      return response.data.details || [];
    } catch (error) {
      console.error('Gagal fetch detail:', error);
      return [];
    }
  };

  const addItem = () => {
    if (!selectedProduct) {
      setError('Pilih produk terlebih dahulu');
      return;
    }
    if (quantity < 1) {
      setError('Quantity minimal 1');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));
    
    if (product.stock < quantity) {
      setError(`Stok tidak cukup. Stok tersedia: ${product.stock}`);
      return;
    }

    const existingItem = formData.items.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(item => 
          item.product_id === product.id 
            ? { ...item, qty: item.qty + quantity }
            : item
        )
      });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            product_id: product.id,
            name: product.name,
            price: product.price,
            qty: quantity,
            subtotal: product.price * quantity
          }
        ]
      });
    }

    setSelectedProduct('');
    setQuantity(1);
    setError('');
  };

  const removeItem = (productId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.product_id !== productId)
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.buyer_name.trim()) {
      setError('Nama pembeli harus diisi');
      return;
    }
    
    if (formData.items.length === 0) {
      setError('Minimal 1 produk harus ditambahkan');
      return;
    }

    try {
      await api.post('/transactions', {
        buyer_name: formData.buyer_name,
        items: formData.items.map(item => ({
          product_id: item.product_id,
          qty: item.qty
        }))
      });
      alert('✅ Transaksi berhasil dibuat!');
      setShowForm(false);
      setFormData({ buyer_name: '', items: [] });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal membuat transaksi');
    }
  };

  const handleViewDetail = async (id) => {
    setViewDetail(id);
    const details = await fetchTransactionDetail(id);
    setDetailItems(details);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!Array.isArray(transactions)) {
    console.error('Transactions bukan array:', transactions);
    return <div>Error: Data transaksi tidak valid</div>;
  }

  if (loading) return <div className="loading">Loading...</div>;

  // TAMPILAN DETAIL TRANSAKSI
  if (viewDetail) {
    const transaction = transactions.find(t => t.id === viewDetail);
    if (!transaction) return <div>Transaksi tidak ditemukan</div>;

    return (
      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Detail Transaksi #{transaction.id}</h1>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <p><strong>Tanggal:</strong> {formatDate(transaction.created_at)}</p>
          <p><strong>Pembeli:</strong> {transaction.buyer_name}</p>
          <p><strong>Total:</strong> {formatRupiah(transaction.total)}</p>
        </div>

        <h3>Item yang Dibeli</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>No</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Produk</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Harga</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Qty</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detailItems.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Tidak ada detail</td></tr>
            ) : (
              detailItems.map((item, index) => (
                <tr key={item.id || index}>
                  <td style={{ padding: '12px' }}>{index + 1}</td>
                  <td style={{ padding: '12px' }}>{item.product_name}</td>
                  <td style={{ padding: '12px' }}>{formatRupiah(item.price)}</td>
                  <td style={{ padding: '12px' }}>{item.qty}</td>
                  <td style={{ padding: '12px' }}>{formatRupiah(item.subtotal)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button onClick={() => setViewDetail(null)} style={{ marginTop: '20px' }}>
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h1>💰 Manajemen Transaksi</h1>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setFormData({ buyer_name: '', items: [] });
            setError('');
          }}
          style={{
            padding: '10px 20px',
            background: showForm ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {showForm ? '✕ Batal' : '+ Transaksi Baru'}
        </button>
      </div>

      {showForm && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px' 
        }}>
          <h3 style={{ marginTop: 0 }}>➕ Transaksi Baru</h3>
          
          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '10px', 
              borderRadius: '4px',
              marginBottom: '15px'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nama Pembeli:
              </label>
              <input
                type="text"
                value={formData.buyer_name}
                onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                placeholder="Masukkan nama pembeli"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
            </div>

            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              background: 'white', 
              borderRadius: '4px' 
            }}>
              <h4 style={{ marginTop: 0 }}>Tambah Produk</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatRupiah(product.price)} (Stok: {product.stock})
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  style={{ width: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
                />
                
                <button 
                  type="button" 
                  onClick={addItem}
                  style={{
                    padding: '10px 20px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Tambah
                </button>
              </div>
            </div>

            {formData.items.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Item yang Dipilih</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e9ecef' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Produk</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Harga</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Qty</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Subtotal</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map(item => (
                      <tr key={item.product_id}>
                        <td style={{ padding: '10px' }}>{item.name}</td>
                        <td style={{ padding: '10px' }}>{formatRupiah(item.price)}</td>
                        <td style={{ padding: '10px' }}>{item.qty}</td>
                        <td style={{ padding: '10px' }}>{formatRupiah(item.subtotal)}</td>
                        <td style={{ padding: '10px' }}>
                          <button 
                            type="button" 
                            onClick={() => removeItem(item.product_id)}
                            style={{
                              padding: '5px 10px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                      <td colSpan="3" style={{ padding: '10px', textAlign: 'right' }}>Total:</td>
                      <td style={{ padding: '10px', color: '#27ae60' }}>{formatRupiah(calculateTotal())}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div>
              <button 
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '16px'
                }}
              >
                Simpan Transaksi
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ 
        background: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Pembeli</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Total</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Tanggal</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center' }}>
                  Belum ada transaksi
                </td>
              </tr>
            ) : (
              transactions.map((t, index) => (
                <tr key={t.id} style={{ 
                  borderBottom: '1px solid #dee2e6',
                  background: index % 2 === 0 ? 'white' : '#f8f9fa'
                }}>
                  <td style={{ padding: '15px' }}>#{t.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{t.buyer_name}</td>
                  <td style={{ padding: '15px', color: '#27ae60', fontWeight: 'bold' }}>
                    {formatRupiah(t.total)}
                  </td>
                  <td style={{ padding: '15px' }}>{formatDate(t.created_at)}</td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      onClick={() => handleViewDetail(t.id)}
                      style={{
                        padding: '5px 15px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsPage;