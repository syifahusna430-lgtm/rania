import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Toko Gerabah</h2>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/dashboard/products">Produk</Link>
      <Link to="/dashboard/transactions">Transaksi</Link>
      <Link to="/dashboard/users">Pengguna</Link>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
