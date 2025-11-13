import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response ? err.response.data.message : "Login gagal, coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-green-700">
          Selamat Datang
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Masukkan email dan password Anda untuk login.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Masukkan email Anda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            Login
          </button>
        </form>

        {error && (
          <div className="mt-5 text-center text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <div className="text-center mt-6 text-gray-700 text-sm">
          Belum punya akun?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-600 font-semibold hover:underline"
          >
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
