import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRole, getUsername } from '../../utils/auth';
import AdminDashboard from './AdminDashboard';
import KasirDashboard from './KasirDashboard';
import PembeliDashboard from './PembeliDashboard';
import './Dashboard.css';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    role: '',
    username: '',
    name: ''
  });
  
  const navigate = useNavigate();
  const role = getRole();
  const username = getUsername();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setUserData({ role, username, name: username });
    setLoading(false);
  }, [navigate, role, username]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const renderDashboard = () => {
    switch(role) {
      case 'admin':
        return <AdminDashboard userData={userData} />;
      case 'kasir':
        return <KasirDashboard userData={userData} />;
      case 'pembeli':
        return <PembeliDashboard userData={userData} />;
      default:
        return (
          <div className="error-message">
            Role tidak dikenal: {role}
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {renderDashboard()}
    </div>
  );
}

export default Dashboard;