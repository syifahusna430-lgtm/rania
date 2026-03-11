import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { isAdmin } from '../utils/auth';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'pembeli'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/register', formData);
      alert('✅ User berhasil didaftarkan!');
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal mendaftarkan user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px 20px',
      minHeight: 'calc(100vh - 100px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>👤 Register User Baru</h1>
        
        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '12px', 
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Nama Lengkap:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Masukkan nama lengkap"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Username:
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Masukkan username"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Masukkan password"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Role:
            </label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
              <option value="pembeli">Pembeli</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Mendaftarkan...' : 'Daftarkan User'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              style={{
                flex: 1,
                padding: '14px',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;