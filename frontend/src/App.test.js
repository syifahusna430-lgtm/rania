import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/"
        element={!token ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard/*"
        element={token ? <Dashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
