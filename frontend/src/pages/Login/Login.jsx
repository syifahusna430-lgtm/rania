import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        { username, password }
      );
      
      console.log("Response dari server:", response.data);
      
      const { token, user } = response.data;
      
      if (!user) {
        throw new Error("Data user tidak ditemukan dalam response");
      }
      
      const role = user.role;
      const userId = user.id;
      const userName = user.name || user.username || username;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("username", userName);
      
      alert(`✅ Selamat datang, ${userName}!`);
      
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error detail:", error);
      
      if (error.response) {
        setError(error.response.data?.message || `Error ${error.response.status}`);
      } else if (error.request) {
        setError("Tidak dapat terhubung ke server. Pastikan backend menyala.");
      } else {
        setError(error.message || "Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Floating decorative elements */}
      <div className="floating-icon">🫖</div>
      <div className="floating-icon">🫖</div>
      <div className="floating-icon">🫖</div>
      
      
      <div className="login-box">
        <h2>Gerabah Mart</h2>
        <h3>Login Aplikasi</h3>
        
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        
        {/* FOOTER / COPYRIGHT TELAH DIHAPUS! */}
      </div>
    </div>
  );
}

export default Login;