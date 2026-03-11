import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { isAdmin } from '../utils/auth';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [viewDetail, setViewDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      alert('Akses ditolak. Halaman ini hanya untuk admin');
      navigate('/dashboard');
      return;
    }
    fetchCategories();
  }, []);

  // Fungsi untuk mengekstrak data dari response API
  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.rows && Array.isArray(response.rows)) return response.rows;
    if (response.categories && Array.isArray(response.categories)) return response.categories;
    console.warn('Struktur response tidak dikenal:', response);
    return [];
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      
      const categoriesData = extractData(response.data);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Gagal fetch categories:', error);
      
      // Data dummy
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
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        alert('✅ Kategori berhasil diupdate');
      } else {
        await api.post('/categories', formData);
        alert('✅ Kategori berhasil ditambahkan');
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '' });
      fetchCategories();
    } catch (error) {
      alert('❌ Gagal: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      alert('✅ Kategori berhasil dihapus');
      fetchCategories();
    } catch (error) {
      alert('❌ Gagal menghapus: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!Array.isArray(categories)) {
    console.error('Categories bukan array:', categories);
    return <div>Error: Data kategori tidak valid</div>;
  }

  if (loading) return <div className="loading">Loading...</div>;

  // TAMPILAN DETAIL KATEGORI
  if (viewDetail) {
    const category = categories.find(c => c.id === viewDetail);
    if (!category) return <div>Kategori tidak ditemukan</div>;
    
    return (
      <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Detail Kategori</h1>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p><strong>ID:</strong> {category.id}</p>
          <p><strong>Nama Kategori:</strong> {category.name}</p>
          <p><strong>Dibuat:</strong> {formatDate(category.created_at)}</p>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setViewDetail(null)}>Kembali</button>
        </div>
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
        <h1>📁 Manajemen Kategori</h1>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '' });
            setShowForm(!showForm);
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
          {showForm ? '✕ Batal' : '+ Tambah Kategori'}
        </button>
      </div>

      {showForm && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px' 
        }}>
          <h3 style={{ marginTop: 0 }}>
            {editingCategory ? '✏️ Edit Kategori' : '➕ Tambah Kategori Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nama Kategori:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Masukkan nama kategori"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
            </div>
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
                  marginRight: '10px'
                }}
              >
                {editingCategory ? 'Update' : 'Simpan'}
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
                  cursor: 'pointer'
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
              <th style={{ padding: '15px', textAlign: 'left' }}>Nama Kategori</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Dibuat</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '30px', textAlign: 'center' }}>
                  Belum ada kategori
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id} style={{ 
                  borderBottom: '1px solid #dee2e6',
                  background: index % 2 === 0 ? 'white' : '#f8f9fa'
                }}>
                  <td style={{ padding: '15px' }}>{cat.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{cat.name}</td>
                  <td style={{ padding: '15px' }}>{formatDate(cat.created_at)}</td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      onClick={() => setViewDetail(cat.id)}
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
                        setEditingCategory(cat);
                        setFormData({ name: cat.name });
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
                      onClick={() => handleDelete(cat.id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoriesPage;