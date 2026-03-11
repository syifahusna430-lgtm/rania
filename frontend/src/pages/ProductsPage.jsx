import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { isAdmin } from '../utils/auth';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category_id: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      alert('Akses ditolak. Halaman ini hanya untuk admin');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, []);

  // Fungsi untuk mengekstrak data dari response API
  const extractData = (response) => {
    if (!response) return [];
    
    // Jika response adalah array langsung
    if (Array.isArray(response)) return response;
    
    // Jika response punya property data yang array
    if (response.data && Array.isArray(response.data)) return response.data;
    
    // Jika response punya property rows (untuk PostgreSQL)
    if (response.rows && Array.isArray(response.rows)) return response.rows;
    
    // Jika response punya property products
    if (response.products && Array.isArray(response.products)) return response.products;
    
    console.warn('Struktur response tidak dikenal:', response);
    return [];
  };

  // Fungsi untuk format harga (tampilan dengan titik)
  const formatPriceInput = (value) => {
    if (!value) return '';
    // Hapus semua karakter non-digit
    const number = value.replace(/[^\d]/g, '');
    // Format dengan titik setiap 3 digit dari belakang
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handler untuk input harga
  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    // Hanya ambil angka saja untuk disimpan di state
    const numberValue = rawValue.replace(/[^\d]/g, '');
    setFormData({...formData, price: numberValue});
  };

  // Handler untuk input stok (tetap number)
  const handleStockChange = (e) => {
    setFormData({...formData, stock: e.target.value});
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);

      console.log('Products response:', productsRes.data);
      console.log('Categories response:', categoriesRes.data);

      // Ekstrak data dengan fungsi di atas
      const productsData = extractData(productsRes.data);
      const categoriesData = extractData(categoriesRes.data);

      setProducts(productsData);
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Gagal fetch data:', error);
      
      // Data dummy sesuai database kamu
      setProducts([
        { id: 1, name: 'Vas Bunga Besar', price: 50000, stock: 20, category_id: 1 },
        { id: 2, name: 'Vas Motif Jawa', price: 60000, stock: 15, category_id: 1 },
        { id: 3, name: 'Piring Hias Klasik', price: 30000, stock: 30, category_id: 2 },
        { id: 4, name: 'Piring Motif Bunga', price: 35000, stock: 25, category_id: 2 },
        { id: 5, name: 'Guci Besar Antik', price: 150000, stock: 10, category_id: 3 },
        { id: 6, name: 'Guci Kecil Antik', price: 100000, stock: 12, category_id: 3 },
        { id: 7, name: 'Kendi Air Tradisional', price: 40000, stock: 20, category_id: 4 },
        { id: 8, name: 'Kendi Mini', price: 30000, stock: 25, category_id: 4 },
        { id: 9, name: 'Patung Tanah Liat', price: 80000, stock: 15, category_id: 5 },
        { id: 10, name: 'Patung Mini Hias', price: 50000, stock: 18, category_id: 5 }
      ]);
      
      setCategories([
        { id: 1, name: 'Vas' },
        { id: 2, name: 'Piring' },
        { id: 3, name: 'Guci' },
        { id: 4, name: 'Kendi' },
        { id: 5, name: 'Patung' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // KONVERSI DATA SEBELUM DIKIRIM KE BACKEND
      const dataToSend = {
        name: formData.name,
        // Pastikan price adalah integer (tanpa titik)
        price: parseInt(formData.price) || 0,
        // Pastikan stock adalah integer
        stock: parseInt(formData.stock) || 0,
        // Pastikan category_id adalah integer
        category_id: parseInt(formData.category_id)
      };

      console.log('Data yang dikirim ke backend:', dataToSend);

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, dataToSend);
        alert('✅ Produk berhasil diupdate');
      } else {
        await api.post('/products', dataToSend);
        alert('✅ Produk berhasil ditambahkan');
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '', category_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error detail:', error.response?.data);
      alert('❌ Gagal: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('✅ Produk berhasil dihapus');
      fetchData();
    } catch (error) {
      alert('❌ Gagal menghapus: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Validasi apakah products adalah array
  if (!Array.isArray(products)) {
    console.error('Products bukan array:', products);
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h2>Error: Data produk tidak valid</h2>
        <button onClick={() => window.location.reload()}>Muat Ulang</button>
      </div>
    );
  }

  if (loading) return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <div className="loading-spinner"></div>
      <p>Loading produk...</p>
    </div>
  );

  // TAMPILAN DETAIL PRODUK
  if (viewDetail) {
    const product = products.find(p => p.id === viewDetail);
    if (!product) return <div>Produk tidak ditemukan</div>;
    
    const category = categories.find(c => c.id === product.category_id);
    
    return (
      <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Detail Produk</h1>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p><strong>ID:</strong> {product.id}</p>
          <p><strong>Nama Produk:</strong> {product.name}</p>
          <p><strong>Harga:</strong> {formatRupiah(product.price)}</p>
          <p><strong>Stok:</strong> {product.stock}</p>
          <p><strong>Kategori:</strong> {category?.name || '-'}</p>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setViewDetail(null)}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h1>📦 Manajemen Produk</h1>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '', category_id: '' });
            setShowForm(!showForm);
          }}
          style={{
            padding: '10px 20px',
            background: showForm ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {showForm ? '✕ Batal' : '+ Tambah Produk'}
        </button>
      </div>

      {/* FORM TAMBAH/EDIT PRODUK */}
      {showForm && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px' 
        }}>
          <h3 style={{ marginTop: 0 }}>
            {editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Nama Produk */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nama Produk:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama produk"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
            </div>

            {/* Harga - DIPERBAIKI */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Harga (Rp):
              </label>
              <input
                type="text"
                value={formData.price ? formatPriceInput(formData.price) : ''}
                onChange={handlePriceChange}
                placeholder="Contoh: 45000"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                ⓘ Masukkan angka tanpa titik (contoh: 45000). Akan diformat otomatis.
              </small>
            </div>

            {/* Stok */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Stok:
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={handleStockChange}
                placeholder="Masukkan stok"
                required
                min="0"
                step="1"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
            </div>

            {/* Kategori */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Kategori:
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tombol Submit */}
            <div>
              <button 
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '16px'
                }}
              >
                {editingProduct ? 'Update' : 'Simpan'}
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

      {/* TABEL PRODUK */}
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
              <th style={{ padding: '15px', textAlign: 'left' }}>Nama Produk</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Harga</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Stok</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Kategori</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center' }}>
                  Belum ada produk
                </td>
              </tr>
            ) : (
              products.map((prod, index) => {
                const category = categories.find(c => c.id === prod.category_id);
                return (
                  <tr key={prod.id} style={{ 
                    borderBottom: '1px solid #dee2e6',
                    background: index % 2 === 0 ? 'white' : '#f8f9fa'
                  }}>
                    <td style={{ padding: '15px' }}>{prod.id}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{prod.name}</td>
                    <td style={{ padding: '15px', color: '#27ae60', fontWeight: 'bold' }}>
                      {formatRupiah(prod.price)}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: prod.stock < 10 ? '#f8d7da' : '#d4edda',
                        color: prod.stock < 10 ? '#721c24' : '#155724',
                        fontWeight: 'bold'
                      }}>
                        {prod.stock}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>{category?.name || '-'}</td>
                    <td style={{ padding: '15px' }}>
                      <button 
                        onClick={() => setViewDetail(prod.id)}
                        style={{
                          padding: '5px 10px',
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        Detail
                      </button>
                      <button 
                        onClick={() => {
                          setEditingProduct(prod);
                          setFormData({
                            name: prod.name,
                            price: prod.price.toString(),
                            stock: prod.stock.toString(),
                            category_id: prod.category_id.toString()
                          });
                          setShowForm(true);
                        }}
                        style={{
                          padding: '5px 10px',
                          background: '#f39c12',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(prod.id)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsPage;