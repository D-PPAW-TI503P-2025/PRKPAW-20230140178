// src/components/PresensiPage.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// Fix icon leaflet
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

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null); // base64 data URL

  // Get GPS on mount
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Browser tidak mendukung geolocation.");
      setIsLoading(false);
      setShowPopup(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError("Tidak bisa mengambil lokasi GPS. Pastikan izin lokasi diaktifkan.");
        setIsLoading(false);
        setShowPopup(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Ambil foto dari webcam (base64)
  const capturePhoto = () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Gagal mengambil foto. Coba ulangi.");
        setShowPopup(true);
        return;
      }
      setPhoto(imageSrc);
      setError("");
    } catch (e) {
      setError("Gagal mengambil foto.");
      setShowPopup(true);
    }
  };

  // Helper: convert dataURL (base64) -> File
  const dataURLtoFile = async (dataUrl, filename = "presensi.jpg") => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  };

  // Kirim presensi (check-in/check-out) sebagai multipart (image file)
  const sendPresensi = async (type) => {
    if (!coords) {
      setError("Lokasi belum tersedia. Pastikan GPS aktif.");
      setShowPopup(true);
      return;
    }

    if (!photo) {
      setError("Silakan ambil foto dulu sebelum presensi.");
      setShowPopup(true);
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        setShowPopup(true);
        setSending(false);
        return;
      }

      // convert base64 -> File
      const file = await dataURLtoFile(photo, `presensi-${Date.now()}.jpg`);

      const formData = new FormData();
      formData.append("image", file); // field name harus 'image' sesuai multer.single('image')
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);

      const res = await axios.post(
        `http://localhost:3001/api/presensi/${type}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      setMessage(res.data.message || "Presensi berhasil!");
      setShowPopup(true);

      // optionally clear photo after sukses
      setPhoto(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal mengirim presensi!");
      setShowPopup(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full flex justify-center p-4">
      <div className="w-full max-w-[520px]">

        {/* POPUP MODAL */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-md text-center">
              <h3 className="text-lg font-semibold mb-3">
                {error ? "Pemberitahuan" : "Berhasil"}
              </h3>

              <p className="text-sm mb-4 text-gray-700">
                {error || message}
              </p>

              <button
                onClick={() => {
                  setShowPopup(false);
                  setError("");
                  setMessage("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg w-full"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Presensi Kehadiran
        </h2>

        {isLoading && <p className="text-center mb-3">Mengambil lokasi...</p>}

        {/* MAP (tampilkan lokasi user jika ada) */}
        {coords && (
          <div className="shadow-md rounded mb-5 overflow-hidden" style={{ height: 260 }}>
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={17}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[coords.lat, coords.lng]}>
                <Popup>Lokasi Anda</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* CAMERA */}
        <div className="mb-5">
          <h3 className="font-semibold mb-2">Ambil Foto</h3>

          {!photo ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-lg w-full shadow-md"
                videoConstraints={{ width: 640, facingMode: "user" }}
              />
              <button
                onClick={capturePhoto}
                className="mt-3 w-full py-2 bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-60"
                disabled={sending}
              >
                Ambil Foto
              </button>
            </>
          ) : (
            <>
              <img
                src={photo}
                alt="Captured"
                className="rounded-lg w-full shadow-md object-cover max-h-72"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setPhoto(null)}
                  className="flex-1 py-2 bg-gray-600 text-white font-semibold rounded-lg"
                  disabled={sending}
                >
                  Ambil Ulang Foto
                </button>
                <button
                  onClick={() => {
                    // quick re-capture: show webcam again for better UX you may implement modal
                    setPhoto(null);
                  }}
                  className="py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg"
                >
                  Edit
                </button>
              </div>
            </>
          )}
        </div>

        {/* BUTTONS */}
        <div className="mt-5 space-y-3">
          <button
            onClick={() => sendPresensi("check-in")}
            disabled={sending || !coords}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {sending ? "Mengirim..." : "Check-in"}
          </button>

          <button
            onClick={() => sendPresensi("check-out")}
            disabled={sending || !coords}
            className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {sending ? "Mengirim..." : "Check-out"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PresensiPage;