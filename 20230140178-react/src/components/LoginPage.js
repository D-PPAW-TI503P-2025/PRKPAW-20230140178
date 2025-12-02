// src/pages/LoginPage.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email dan password harus diisi!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      const data = res.data;
      console.log("Login response:", data);

      // Pastikan struktur data sesuai backend
      const token = data.token;
      const role = data.data?.role || data.user?.role; // fallback jika backend pakai `user` atau `data`

      if (!token) {
        alert("Login gagal! Token tidak diterima dari server.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);

      alert(data.message || "Login berhasil!");
      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message);
      if (err.response) {
        alert(err.response.data.message || "Login gagal!");
      } else if (err.code === "ECONNABORTED") {
        alert("Timeout! Server tidak merespon.");
      } else {
        alert("Tidak dapat terhubung ke server!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-emerald-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-emerald-100">
        <h2 className="text-3xl font-bold text-center text-emerald-700 mb-6">
          Selamat Datang
        </h2>

        <form onSubmit={handleLogin}>
          <label className="block mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email..."
            className="w-full p-2 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400"
          />

          <label className="block mb-2 font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password..."
            className="w-full p-2 mb-6 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold shadow-md transition ${
              loading ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Belum punya akun?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-emerald-700 font-medium hover:underline"
          >
            Daftar di sini
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
