import React from "react";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 to-blue-200">
      {/* 🔹 Header / Navbar */}
      <header className="w-full bg-white/80 backdrop-blur-md shadow-md flex justify-between items-center p-4 px-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-green-700">Dashboard</h2>
      </header>

      {/* 🔹 Isi Dashboard */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-10 text-center w-full max-w-lg">
          <h1 className="text-4xl font-extrabold text-green-700 mb-4">
            Login Sukses!
          </h1>
          <p className="text-gray-700 text-base mb-8">
            Selamat datang di <span className="font-semibold">Dashboard</span> Anda.<br />
            Sekarang Anda sudah berhasil login ke sistem.
          </p>

          <div className="flex justify-center mb-10">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="User Avatar"
              className="w-24 h-24 rounded-full shadow-md border-2 border-green-400"
            />
          </div>

          {/* Tombol Logout di Dalam Card */}
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            Logout
          </button>

          <p className="text-sm text-gray-500 mt-6">
            Terima kasih telah menggunakan aplikasi ini 
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
