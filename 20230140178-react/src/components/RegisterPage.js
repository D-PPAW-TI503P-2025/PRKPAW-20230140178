import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("mahasiswa");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!nama || !email || !password) {
            alert("Semua field wajib diisi!");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("http://localhost:3001/api/auth/register", {
                nama,
                email,
                password,
                role,
            });

            alert(res.data.message || "Registrasi berhasil!");
            navigate("/login");
        } catch (err) {
            if (err.response) {
                alert(err.response.data.message || "Registrasi gagal!");
            } else {
                alert("Gagal terhubung ke server!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
                    Daftar Akun Baru
                </h2>

                <form onSubmit={handleRegister}>
                    <label className="block mb-2 font-medium text-gray-700">Nama</label>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                    />

                    <label className="block mb-2 font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                    />

                    <label className="block mb-2 font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                    />

                    <label className="block mb-2 font-medium text-gray-700">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-2 mb-6 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="mahasiswa">Mahasiswa</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded-lg text-white transition ${loading
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Memproses..." : "Daftar Sekarang"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Sudah punya akun?{" "}
                    <button
                        onClick={() => navigate("/login")}
                        className="text-blue-600 hover:underline"
                    >
                        Masuk di sini
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;