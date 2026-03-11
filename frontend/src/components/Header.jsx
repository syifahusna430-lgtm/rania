import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdmin, isKasir, logout, getRole, getUsername } from '../utils/auth';
import { useCart } from '../context/CartContext';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();
  const username = getUsername();
  const { getCartCount, setIsCartOpen } = useCart();
  const cartCount = getCartCount();

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="logo-container">
        <h2 className="logo">🏺 Toko Gerabah</h2>
        <span className={`role-badge role-${role}`}>
          {role === 'admin' ? 'Admin' : role === 'kasir' ? 'Kasir' : 'Pembeli'}
        </span>
      </div>
      
      <nav className="nav-menu">
        <Link to="/dashboard" className={isActive('/dashboard')}>
          Dashboard
        </Link>
        
        {isAdmin() && (
          <>
            <Link to="/admin/categories" className={isActive('/admin/categories')}>
              Kategori
            </Link>
            <Link to="/admin/products" className={isActive('/admin/products')}>
              Produk
            </Link>
            <Link to="/admin/register" className={isActive('/admin/register')}>
              Register
            </Link>
            <Link to="/admin/deactivate" className={isActive('/admin/deactivate')}>
              Deactivate
            </Link>
          </>
        )}
        
        {/* UPDATE: Menu Transaksi untuk Kasir & Admin - Arahkan ke /transactions/kasir */}
        {(isAdmin() || isKasir()) && (
          <Link to="/transactions/kasir" className={isActive('/transactions/kasir')}>
            💰 Transaksi
          </Link>
        )}
        
        <Link to="/profile" className={isActive('/profile')}>
          Profile
        </Link>
      </nav>
      
      <div className="user-info">
        {/* Tombol Keranjang - hanya untuk pembeli */}
        {role === 'pembeli' && (
          <button 
            className="cart-icon-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Keranjang Belanja"
            title="Keranjang Belanja"
          >
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        )}
        
        <span className="username">Halo, {username || 'User'}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;