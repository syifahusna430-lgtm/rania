import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { isAdmin, getUserId } from '../utils/auth';

function DeactivatePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const currentUserId = getUserId();

  useEffect(() => {
    if (!isAdmin()) {
      alert('Akses ditolak. Halaman ini hanya untuk admin');
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const filteredUsers = response.data.filter(u => u.id !== parseInt(currentUserId));
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Gagal fetch users:', error);
      alert('Gagal mengambil data users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      alert('Pilih user terlebih dahulu');
      return;
    }

    const user = users.find(u => u.id === parseInt(selectedUser));
    
    if (!window.confirm(`Yakin ingin menonaktifkan user ${user?.name || user?.username}?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/deactivate-user', { 
        id: selectedUser,
        reason: reason 
      });
      alert('✅ User berhasil dinonaktifkan!');
      navigate('/dashboard');
    } catch (error) {
      alert('❌ Gagal: ' + (error.response?.data?.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div style={{ 
      padding: '40px 20px',
      minHeight: 'calc(100vh - 100px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        width: '100%',
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>⚠️ Nonaktifkan User</h1>
        
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeeba',
          color: '#856404',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '30px'
        }}>
          <p style={{ marginTop: 0, fontWeight: 'bold' }}>PERHATIAN:</p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>User tidak akan bisa login ke sistem</li>
            <li>Data transaksi user tetap tersimpan</li>
            <li>Tindakan ini dapat dibatalkan oleh admin</li>
          </ul>
        </div>

        <form onSubmit={handleDeactivate}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Pilih User:
            </label>
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="">-- Pilih User --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (@{user.username}) - {user.role}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Alasan Penonaktifan (opsional):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masukkan alasan penonaktifan..."
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Memproses...' : 'Nonaktifkan User'}
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

        {users.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Daftar User Aktif:</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '5px' }}>
              {users.map(user => (
                <div key={user.id} style={{
                  padding: '10px 15px',
                  borderBottom: '1px solid #dee2e6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8f9fa'
                }}>
                  <div>
                    <strong>{user.name}</strong>
                    <span style={{ color: '#6c757d', marginLeft: '10px' }}>@{user.username}</span>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: user.role === 'admin' ? '#e74c3c' : user.role === 'kasir' ? '#f39c12' : '#27ae60',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeactivatePage;