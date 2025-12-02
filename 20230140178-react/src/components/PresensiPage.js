// src/components/PresensiPage.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icon
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: icon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

export default function PresensiPage() {
  const [coords, setCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const campusLocation = { lat: -7.806911268869281, lng: 110.32712407846763 };
  const MAX_RADIUS = 50; // meter

  // Hitung jarak
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
  };

  // Ambil GPS untuk semua user (admin & mahasiswa)
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung GPS");
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLoading(false);
      },
      (err) => {
        console.log("GPS error:", err);
        setError("Tidak dapat mengambil lokasi. Aktifkan izin lokasi di browser.");
        setShowPopup(true);
        setIsLoading(false);
      }
    );
  }, []);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
    }
  };

  const sendPresensi = async (type) => {
    if (!coords) {
      setError("Lokasi belum tersedia.");
      setShowPopup(true);
      return;
    }

    if (!photo) {
      setError("Silakan ambil foto terlebih dahulu.");
      setShowPopup(true);
      return;
    }

    const distance = calculateDistance(
      coords.lat,
      coords.lng,
      campusLocation.lat,
      campusLocation.lng
    );

    if (distance > MAX_RADIUS) {
      setError(`Anda berada di luar radius kampus (${distance.toFixed(2)} m)`);
      setShowPopup(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      setShowPopup(true);
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `http://localhost:3001/api/presensi/${type}`,
        { latitude: coords.lat, longitude: coords.lng, image: photo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Presensi berhasil!");
      setShowPopup(true);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(err.response?.data?.message || "Gagal mengirim presensi!");
      setShowPopup(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full flex justify-center p-4 bg-emerald-50 min-h-screen">
      <div className="w-full max-w-[450px]">
        {/* Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl w-80 border border-emerald-300">
              <h3 className="text-lg font-semibold text-emerald-700 mb-3">
                {error ? "Pemberitahuan" : "Berhasil"}
              </h3>
              <p className="text-sm mb-4 text-gray-700">{error || message}</p>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setError("");
                  setMessage("");
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg w-full"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-emerald-700 mb-4 text-center">
          Presensi Kehadiran
        </h2>

        {isLoading && <p className="text-center text-emerald-700">Mengambil lokasi...</p>}

        {/* Map */}
        {coords && (
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={17}
            style={{ height: "280px", width: "100%", borderRadius: "12px", border: "2px solid #34d399" }}
            className="shadow-lg mb-6"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>Lokasi Anda</Popup>
            </Marker>
            <Marker position={[campusLocation.lat, campusLocation.lng]}>
              <Popup>Lokasi Kampus</Popup>
            </Marker>
          </MapContainer>
        )}

        {/* Webcam */}
        <div className="mb-6">
          <h3 className="font-semibold text-emerald-700 mb-2">Ambil Foto</h3>
          {!photo ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: "100%", height: "280px", borderRadius: "12px", border: "2px solid #34d399" }}
              />
              <button
                onClick={capturePhoto}
                className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Ambil Foto
              </button>
            </>
          ) : (
            <>
              <img src={photo} alt="Captured" className="rounded-lg w-full shadow-md" />
              <button
                onClick={() => setPhoto(null)}
                className="mt-3 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Ambil Ulang Foto
              </button>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => sendPresensi("check-in")}
            disabled={sending || !coords}
            className={`w-full py-3 rounded-lg ${coords ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"} text-white font-semibold shadow`}
          >
            Check-in
          </button>
          <button
            onClick={() => sendPresensi("check-out")}
            disabled={sending || !coords}
            className={`w-full py-3 rounded-lg ${coords ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"} text-white font-semibold shadow`}
          >
            Check-out
          </button>
        </div>
      </div>
    </div>
  );
}
