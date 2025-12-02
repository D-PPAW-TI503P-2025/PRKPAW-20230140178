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
  const [photo, setPhoto] = useState(null);

  const campusLocation = { lat: -7.806817, lng: 110.327136 };
  const MAX_RADIUS = 50; 

  // Distance function
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
  };

  // Get GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      () => {
        setError("Tidak bisa mengambil lokasi GPS.");
        setShowPopup(true);
        setIsLoading(false);
      }
    );
  }, []);

  // Ambil foto
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  };

  // Kirim presensi
  const sendPresensi = async (type) => {
    if (!coords) return;

    const distance = calculateDistance(
      coords.lat,
      coords.lng,
      campusLocation.lat,
      campusLocation.lng
    );

    if (distance > MAX_RADIUS) {
      setError(`Anda berada di luar radius! (${distance.toFixed(2)}m)`);
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

      const res = await axios.post(
        `http://localhost:3001/api/presensi/${type}`,
        {
          latitude: coords.lat,
          longitude: coords.lng,
          image: photo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Presensi berhasil!");
      setShowPopup(true);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim presensi!");
      setShowPopup(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full flex justify-center p-4">
      <div className="w-full max-w-[450px]">

        {/* POPUP MODAL */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
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

        {isLoading && <p>Mengambil lokasi...</p>}

        {/* MAP */}
        {coords && (
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={17}
            style={{ height: "280px", width: "100%", borderRadius: "10px" }}
            className="shadow-md mb-6"
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
                videoConstraints={{ width: 350, facingMode: "user" }}
              />
              <button
                onClick={capturePhoto}
                className="mt-3 w-full py-2 bg-purple-600 text-white font-semibold rounded-lg"
              >
                Ambil Foto
              </button>
            </>
          ) : (
            <>
              <img
                src={photo}
                alt="Captured"
                className="rounded-lg w-full shadow-md"
              />
              <button
                onClick={() => setPhoto(null)}
                className="mt-3 w-full py-2 bg-gray-600 text-white font-semibold rounded-lg"
              >
                Ambil Ulang Foto
              </button>
            </>
          )}
        </div>

        {/* BUTTONS */}
        <div className="mt-5 space-y-3">
          <button
            onClick={() => sendPresensi("check-in")}
            disabled={sending || !coords}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Check-in
          </button>

          <button
            onClick={() => sendPresensi("check-out")}
            disabled={sending || !coords}
            className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Check-out
          </button>
        </div>

      </div>
    </div>
  );
}

export default PresensiPage;