import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async (query) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const baseUrl = "http://localhost:3001/api/reports/daily";
      const url = query ? `${baseUrl}?nama=${query}` : baseUrl;

      const response = await axios.get(url, config);
      setReports(response.data.data);
      setError(null);
    } catch (err) {
      setReports([]);
      setError(
        err.response ? err.response.data.message : "Gagal mengambil data"
      );
    }
  };

  useEffect(() => {
    fetchReports("");
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-3xl font-bold text-green-700 mb-6">
        Laporan Presensi Harian
      </h1>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border border-green-400 rounded-md shadow-sm 
                     focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow 
                     hover:bg-green-700"
        >
          Cari
        </button>
      </form>

      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">
          {error}
        </p>
      )}

      {!error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">

          <table className="min-w-full divide-y divide-green-300">
            <thead className="bg-green-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Check-In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Check-Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Latitude</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Longitude</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Bukti Foto</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-green-200">
              {reports.length > 0 ? (
                reports.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {p.user?.nama || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(p.checkIn).toLocaleString("id-ID")}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.checkOut
                        ? new Date(p.checkOut).toLocaleString("id-ID")
                        : "Belum Check-Out"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.latitude || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.longitude || "N/A"}
                    </td>

                    {/* FOTO */}
                    <td className="px-6 py-4">
                      {p.buktiFoto ? (
                        <img
                          src={`http://localhost:3001/${p.buktiFoto}`}
                          alt="Bukti"
                          className="h-16 w-16 rounded-md shadow cursor-pointer object-cover 
                                     border border-green-500"
                          onClick={() =>
                            setSelectedImage(
                              `http://localhost:3001/${p.buktiFoto}`
                            )
                          }
                        />
                      ) : (
                        "Tidak ada foto"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FOTO */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Foto Besar"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg border-4 border-green-500"
            />

            <button
              className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded shadow font-bold hover:bg-green-700"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReportPage;
