// ============= GET DATA DARI LOCALSTORAGE =============
export const getToken = () => {
  return localStorage.getItem('token');
};

export const getRole = () => {
  return localStorage.getItem('role');
};

export const getUserId = () => {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId) : null;
};

export const getUsername = () => {
  return localStorage.getItem('username') || 'User';
};

// ============= CEK ROLE =============
export const isAdmin = () => {
  return getRole() === 'admin';
};

export const isKasir = () => {
  return getRole() === 'kasir';
};

export const isPembeli = () => {
  return getRole() === 'pembeli';
};

export const hasRole = (allowedRoles) => {
  const role = getRole();
  return allowedRoles.includes(role);
};

// ============= CEK AKSES BERDASARKAN ENDPOINT =============
export const canAccessCategories = () => {
  const role = getRole();
  return role === 'admin'; // Hanya admin
};

export const canAccessProducts = () => {
  const role = getRole();
  return role === 'admin'; // Hanya admin
};

export const canAccessTransactions = () => {
  const role = getRole();
  return role === 'admin' || role === 'kasir'; // Admin & kasir
};

export const canManageUsers = () => {
  const role = getRole();
  return role === 'admin'; // Hanya admin
};

// ============= LOGOUT =============
export const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

// ============= CEK LOGIN STATUS =============
export const isLoggedIn = () => {
  return !!getToken();
};