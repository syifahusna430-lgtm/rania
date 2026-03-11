import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/Cart/CartDrawer';

// Context
import { CartProvider } from './context/CartContext';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import DeactivatePage from './pages/DeactivateUserPage';

// New Kasir Pages
import KasirPage from './pages/Transactions/KasirPage';
import StrukPage from './pages/Transactions/StrukPage';

// Utils
import { isLoggedIn, hasRole } from './utils/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App">
          {isAuthenticated && <Header />}
          {isAuthenticated && <CartDrawer />}
          
          <main className="main-content">
            <Routes>
              <Route path="/login" element={
                <Login onLogin={() => setIsAuthenticated(true)} />
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/categories" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoriesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/products" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/register" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RegisterPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/deactivate" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DeactivatePage />
                </ProtectedRoute>
              } />
              
              <Route path="/transactions" element={
                <ProtectedRoute allowedRoles={['admin', 'kasir']}>
                  <TransactionsPage />
                </ProtectedRoute>
              } />

              {/* New Kasir Routes */}
              <Route path="/transactions/kasir" element={
                <ProtectedRoute allowedRoles={['admin', 'kasir']}>
                  <KasirPage />
                </ProtectedRoute>
              } />

              <Route path="/transactions/struk" element={
                <ProtectedRoute allowedRoles={['admin', 'kasir']}>
                  <StrukPage />
                </ProtectedRoute>
              } />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          
          {/* Footer sudah dihapus */}
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;