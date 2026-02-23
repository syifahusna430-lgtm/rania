import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import "./Dashboard.css";

function Home() {
  return (
    <>
      <h1>
        Selamat Datang, {localStorage.getItem("name")} (
        {localStorage.getItem("role")})
      </h1>

      <div className="about">
        <h3>Tentang Toko Gerabah</h3>
        <p>
          Toko Gerabah kami menyediakan berbagai macam kerajinan gerabah berkualitas tinggi yang dibuat dengan sentuhan seni dan ketelitian. Kami menghadirkan produk seperti vas, pot hias, kendi, celengan, patung, dan berbagai dekorasi rumah lainnya dengan desain unik dan estetik.
          Setiap produk dibuat dari bahan pilihan dan melalui proses pengerjaan yang teliti sehingga menghasilkan karya yang kuat, tahan lama, dan bernilai seni tinggi. Kami berkomitmen untuk menghadirkan produk terbaik dengan harga terjangkau untuk mempercantik hunian Anda.
          Toko Gerabah kami bukan hanya tempat berbelanja, tetapi juga tempat melestarikan seni dan budaya kerajinan lokal. 💛
        </p>
      </div>
    </>
  );
}

function Produk() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/products").then((res) => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Data Produk</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div className="product-card" key={p.id}>
            <h4>{p.name}</h4>
            <p>Harga: Rp {p.price}</p>
            <p>Stok: {p.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="products" element={<Produk />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
