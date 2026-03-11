import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { logout } from '../utils/auth';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const userData = response.data.user || response.data;
      setProfile(userData);
    } catch (error) {
      console.error('Gagal ambil profile:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
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

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#e74c3c';
      case 'kasir': return '#f39c12';
      case 'pembeli': return '#27ae60';
      default: return '#3498db';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return <div>Profile tidak ditemukan</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>👤 Profile Saya</h1>
      
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            background: getRoleColor(profile.role),
            borderRadius: '50%', 
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            {profile.name?.charAt(0) || profile.username?.charAt(0)}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <div style={{ width: '120px', fontWeight: 'bold' }}>Nama Lengkap</div>
            <div style={{ flex: 1 }}>: {profile.name || '-'}</div>
          </div>

          <div style={{ 
            display: 'flex',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <div style={{ width: '120px', fontWeight: 'bold' }}>Username</div>
            <div style={{ flex: 1 }}>: {profile.username}</div>
          </div>

          <div style={{ 
            display: 'flex',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <div style={{ width: '120px', fontWeight: 'bold' }}>Role</div>
            <div style={{ flex: 1 }}>
              : 
              <span style={{ 
                marginLeft: '10px',
                padding: '5px 15px',
                borderRadius: '20px',
                background: getRoleColor(profile.role),
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {profile.role}
              </span>
            </div>
          </div>

          <div style={{ 
            display: 'flex',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <div style={{ width: '120px', fontWeight: 'bold' }}>ID User</div>
            <div style={{ flex: 1 }}>: {profile.id}</div>
          </div>

          <div style={{ 
            display: 'flex',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ width: '120px', fontWeight: 'bold' }}>Member Sejak</div>
            <div style={{ flex: 1 }}>: {formatDate(profile.created_at)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 30px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;