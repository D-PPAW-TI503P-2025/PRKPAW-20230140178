import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    let role = "";

    if (token) {
        try {
            const decoded = jwtDecode(token);
            role = decoded.role;
        } catch (err) {
            console.error("Token error:", err);
            localStorage.removeItem("token");
            navigate("/login");
        }
    }

    return (
        <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-lg text-center w-[90%] max-w-lg border-2 border-emerald-300">

                <h1 className="text-4xl font-bold mb-2 text-emerald-700">
                    {role === "admin" ? "Dashboard Admin" : "Dashboard User"}
                </h1>

                {/* Badge hijau */}
                <p className="text-md mb-4">
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg shadow capitalize">
                        Role: {role || "unknown"}
                    </span>
                </p>

                <p className="text-lg mb-6 text-emerald-700">
                    Selamat datang di aplikasi <span className="font-semibold">Pengembangan Aplikasi Web</span>
                </p>
            </div>
        </div>
    );
}

export default DashboardPage;
