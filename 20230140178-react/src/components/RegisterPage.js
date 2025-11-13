import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mahasiswa");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/auth/register", {
        nama,
        email,
        password,
        role,
      });
      setMessage("Registrasi berhasil! Silakan login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Registrasi gagal, periksa kembali data Anda.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-green-700">
          Daftar Akun Baru
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Silakan isi data Anda dengan benar untuk membuat akun.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Masukkan email aktif"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            Register
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 text-center text-sm font-medium ${
              message.includes("berhasil")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-center mt-6 text-gray-700 text-sm">
          Sudah punya akun?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 font-semibold hover:underline"
          >
            Login di sini
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
