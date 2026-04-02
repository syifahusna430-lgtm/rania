import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      console.log('📦 Data mentah dari API:', response.data);
      console.log('📦 Tipe data:', typeof response.data);
      console.log('📦 Keys:', Object.keys(response.data));
      
      // STRATEGI EKSTRAK DATA YANG FLEKSIBEL
      let userData = null;
      
      // Kasus 1: Data langsung berisi id, name, username, role
      if (response.data.id || response.data.name || response.data.username) {
        userData = response.data;
        console.log('✅ Kasus 1: Data langsung');
      }
      // Kasus 2: Data dibungkus dalam properti 'user'
      else if (response.data.user) {
        userData = response.data.user;
        console.log('✅ Kasus 2: Data dalam properti user');
      }
      // Kasus 3: Data dalam array
      else if (Array.isArray(response.data) && response.data.length > 0) {
        userData = response.data[0];
        console.log('✅ Kasus 3: Data dalam array');
      }
      // Kasus 4: Data dalam properti 'data'
      else if (response.data.data) {
        userData = response.data.data;
        console.log('✅ Kasus 4: Data dalam properti data');
      }
      
      console.log('👤 User data setelah ekstrak:', userData);
      
      if (userData) {
        setProfile({
          id: userData.id || '-',
          name: userData.name || '-',
          username: userData.username || '-',
          role: userData.role || '-'
        });
        console.log('✅ Profile state:', {
          id: userData.id || '-',
          name: userData.name || '-',
          username: userData.username || '-',
          role: userData.role || '-'
        });
      } else {
        console.error('❌ Tidak bisa mengekstrak data user');
        // Fallback ke data dari localStorage
        setProfile({
          id: localStorage.getItem('userId') || '-',
          name: '-',
          username: localStorage.getItem('username') || '-',
          role: localStorage.getItem('role') || '-'
        });
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      // Fallback ke localStorage
      setProfile({
        id: localStorage.getItem('userId') || '-',
        name: '-',
        username: localStorage.getItem('username') || '-',
        role: localStorage.getItem('role') || '-'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role) => {
    if (role === 'admin') return 'ADMIN';
    if (role === 'kasir') return 'KASIR';
    if (role === 'pembeli') return 'PEMBELI';
    return role || '-';
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return '#8B5A2B';
    if (role === 'kasir') return '#C49A6C';
    if (role === 'pembeli') return '#D4A76A';
    return '#8B5A2B';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#F5E6D3'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '500px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #E6CCB2'
      }}>
        
        {/* Title */}
        <h2 style={{ 
          color: '#8B5A2B', 
          textAlign: 'center',
          borderBottom: '2px solid #D4A76A',
          paddingBottom: '15px',
          marginBottom: '25px',
          fontSize: '1.5rem'
        }}>
          {profile?.role === 'admin' ? 'Administrator' : 
           profile?.role === 'kasir' ? 'Kasir' : 
           profile?.role === 'pembeli' ? 'Pembeli' : 'Profile'}
        </h2>

        {/* Nama Lengkap */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '15px',
          padding: '10px 0',
          borderBottom: '1px solid #E6CCB2'
        }}>
          <div style={{ width: '120px', fontWeight: 'bold', color: '#8B5A2B' }}>Nama Lengkap</div>
          <div style={{ flex: 1, color: '#5D3A1A' }}>: {profile?.name || '-'}</div>
        </div>

        {/* Username */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '15px',
          padding: '10px 0',
          borderBottom: '1px solid #E6CCB2'
        }}>
          <div style={{ width: '120px', fontWeight: 'bold', color: '#8B5A2B' }}>Username</div>
          <div style={{ flex: 1, color: '#5D3A1A' }}>: {profile?.username || '-'}</div>
        </div>

        {/* Role dengan badge warna */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '15px',
          padding: '10px 0',
          borderBottom: '1px solid #E6CCB2'
        }}>
          <div style={{ width: '120px', fontWeight: 'bold', color: '#8B5A2B' }}>Role</div>
          <div style={{ flex: 1 }}>
            : 
            <span style={{ 
              marginLeft: '10px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: getRoleColor(profile?.role),
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {getRoleDisplay(profile?.role)}
            </span>
          </div>
        </div>

        {/* ID User */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '15px',
          padding: '10px 0',
          borderBottom: '1px solid #E6CCB2'
        }}>
          <div style={{ width: '120px', fontWeight: 'bold', color: '#8B5A2B' }}>ID User</div>
          <div style={{ flex: 1, color: '#5D3A1A' }}>: {profile?.id || '-'}</div>
        </div>

        {/* Tombol Kembali */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 30px',
              background: '#8B5A2B',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#C49A6C'}
            onMouseOut={(e) => e.target.style.background = '#8B5A2B'}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;