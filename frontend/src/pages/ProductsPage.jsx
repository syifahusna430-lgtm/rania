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
    category_id: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      alert('Akses ditolak. Halaman ini hanya untuk admin');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, []);

  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.rows && Array.isArray(response.rows)) return response.rows;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      const productsData = extractData(productsRes.data);
      const categoriesData = extractData(categoriesRes.data);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Gagal fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPriceInput = (value) => {
    if (!value) return '';
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Tidak Tersedia', class: 'out-of-stock', badgeClass: 'danger' };
    if (stock < 5) return { text: 'Hampir Habis', class: 'almost-out', badgeClass: 'warning' };
    if (stock < 10) return { text: 'Menipis', class: 'low', badgeClass: 'warning' };
    return { text: 'Tersedia', class: 'available', badgeClass: 'success' };
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    const numberValue = rawValue.replace(/[^\d]/g, '');
    setFormData({ ...formData, price: numberValue });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('File harus berupa gambar!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB!');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (!formData.name.trim()) {
        alert('Nama produk harus diisi!');
        setUploading(false);
        return;
      }
      if (!formData.price || parseInt(formData.price) <= 0) {
        alert('Harga harus diisi dengan angka valid!');
        setUploading(false);
        return;
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        alert('Stok harus diisi!');
        setUploading(false);
        return;
      }
      if (!formData.category_id) {
        alert('Kategori harus dipilih!');
        setUploading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', parseInt(formData.price) || 0);
      formDataToSend.append('stock', parseInt(formData.stock) || 0);
      formDataToSend.append('category_id', parseInt(formData.category_id));
      formDataToSend.append('description', formData.description || '');
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('✅ Produk berhasil diupdate');
      } else {
        await api.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('✅ Produk berhasil ditambahkan');
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '', category_id: '', description: '', image: null });
      setImagePreview(null);
      fetchData();
    } catch (error) {
      console.error('Error detail:', error.response?.data);
      if (error.response?.data?.message) {
        alert('❌ Gagal: ' + error.response.data.message);
      } else {
        alert('❌ Gagal: ' + (error.message || 'Server error'));
      }
    } finally {
      setUploading(false);
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

  const getImageUrl = (product) => {
    if (product.image_url) {
      return `http://localhost:3000/images/produk/${product.image_url}`;
    }
    return '/images/produk/default.jpg';
  };

  if (!Array.isArray(products)) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#e74c3c' }}>Error: Data produk tidak valid</h2>
        <button onClick={() => window.location.reload()}>Muat Ulang</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5E6D3' }}>
        <div className="loading-spinner"></div>
        <p>Loading produk...</p>
      </div>
    );
  }

  // TAMPILAN DETAIL PRODUK
  if (viewDetail) {
    const product = products.find(p => p.id === viewDetail);
    if (!product) return <div>Produk tidak ditemukan</div>;
    const category = categories.find(c => c.id === product.category_id);
    const stockStatus = getStockStatus(product.stock);
    
    return (
      <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Detail Produk</h1>
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={getImageUrl(product)} alt={product.name} style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }} onError={(e) => { e.target.src = '/images/produk/default.jpg'; }} />
          </div>
          <p><strong>Nama Produk:</strong> {product.name}</p>
          <p><strong>Harga:</strong> {formatRupiah(product.price)}</p>
          <p><strong>Stok:</strong> {product.stock}</p>
          <p><strong>Status:</strong> 
            <span style={{ marginLeft: '10px', padding: '4px 12px', borderRadius: '20px', background: stockStatus.badgeClass === 'danger' ? '#f8d7da' : stockStatus.badgeClass === 'warning' ? '#fff3cd' : '#d4edda', color: stockStatus.badgeClass === 'danger' ? '#721c24' : stockStatus.badgeClass === 'warning' ? '#856404' : '#155724', fontWeight: 'bold' }}>
              {stockStatus.text}
            </span>
          </p>
          <p><strong>Kategori:</strong> {category?.name || '-'}</p>
          {product.description && (
            <div>
              <p><strong>Deskripsi:</strong></p>
              <p>{product.description}</p>
            </div>
          )}
        </div>
        <button onClick={() => setViewDetail(null)}>Kembali</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#F5E6D3', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#8B5A2B' }}>📦 Manajemen Produk</h1>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '', category_id: '', description: '', image: null });
            setImagePreview(null);
            setShowForm(!showForm);
          }}
          style={{ padding: '10px 20px', background: showForm ? '#e74c3c' : '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {showForm ? '✕ Batal' : '+ Tambah Produk'}
        </button>
      </div>

      {/* FORM TAMBAH/EDIT PRODUK */}
      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #E6CCB2' }}>
          <h3>{editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}</h3>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div style={{ marginBottom: '15px' }}>
              <label>Nama Produk:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E6CCB2' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Harga (Rp):</label>
              <input type="text" name="price" value={formData.price ? formatPriceInput(formData.price) : ''} onChange={handlePriceChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E6CCB2' }} />
              <small>Masukkan angka tanpa titik</small>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Stok:</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E6CCB2' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Kategori:</label>
              <select name="category_id" value={formData.category_id} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E6CCB2' }}>
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Deskripsi:</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E6CCB2' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>Upload Gambar:</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <small>Format: JPG, PNG, GIF. Maksimal 2MB.</small>
              {imagePreview && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
            </div>
            <div>
              <button type="submit" disabled={uploading} style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '10px' }}>{uploading ? 'Mengupload...' : (editingProduct ? 'Update' : 'Simpan')}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); setFormData({ name: '', price: '', stock: '', category_id: '', description: '', image: null }); setImagePreview(null); }} style={{ padding: '10px 20px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL PRODUK - TANPA KOLOM ID */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', maxHeight: 'calc(100vh - 250px)', border: '1px solid #E6CCB2' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Gambar</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Nama Produk</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Harga</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Stok</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Kategori</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center' }}>Belum ada produk</td>
              </tr>
            ) : (
              products.map((prod, index) => {
                const category = categories.find(c => c.id === prod.category_id);
                const stockStatus = getStockStatus(prod.stock);
                return (
                  <tr key={prod.id} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                    <td style={{ padding: '15px', borderBottom: '1px solid #E6CCB2' }}>
                      <div style={{ width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={getImageUrl(prod)} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/images/produk/default.jpg'; }} />
                      </div>
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #E6CCB2', fontWeight: 'bold' }}>{prod.name}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #E6CCB2', color: '#27ae60', fontWeight: 'bold' }}>{formatRupiah(prod.price)}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #E6CCB2' }}>{prod.stock}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #E6CCB2' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', background: stockStatus.badgeClass === 'danger' ? '#f8d7da' : stockStatus.badgeClass === 'warning' ? '#fff3cd' : '#d4edda', color: stockStatus.badgeClass === 'danger' ? '#721c24' : stockStatus.badgeClass === 'warning' ? '#856404' : '#155724', fontWeight: 'bold' }}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #E6CCB2' }}>{category?.name || '-'}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #E6CCB2' }}>
                      <button onClick={() => setViewDetail(prod.id)} style={{ padding: '5px 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Detail</button>
                      <button onClick={() => { setEditingProduct(prod); setFormData({ name: prod.name, price: prod.price.toString(), stock: prod.stock.toString(), category_id: prod.category_id.toString(), description: prod.description || '', image: null }); setImagePreview(null); setShowForm(true); }} style={{ padding: '5px 10px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                      <button onClick={() => handleDelete(prod.id)} style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
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