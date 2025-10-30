"use strict";


const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const { Op } = require("sequelize");
const timeZone = "Asia/Jakarta";


exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;

    // Siapkan kondisi pencarian
    let whereClause = {};

    // Filter berdasarkan nama (LIKE)
    if (nama) {
      whereClause.nama = { [Op.like]: `%${nama}%` };
    }

    // Filter berdasarkan rentang tanggal (checkIn)
    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(`${tanggalMulai}T00:00:00`);
      const endDate = new Date(`${tanggalSelesai}T23:59:59`);
      whereClause.checkIn = { [Op.between]: [startDate, endDate] };
    }

    // Ambil data dari database
    const records = await Presensi.findAll({
      where: whereClause,
      order: [["checkIn", "ASC"]],
    });

    // Format hasil untuk response
    const formattedData = records.map((record) => ({
      id: record.id,
      userId: record.userId,
      nama: record.nama,
      checkIn: record.checkIn
        ? format(record.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
        : null,
      checkOut: record.checkOut
        ? format(record.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
        : null,
    }));

    // Kirim response
    res.json({
      message: "Laporan presensi berhasil diambil.",
      total: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error(" Error getDailyReport:", error);
    res.status(500).json({
      message: "Gagal mengambil laporan presensi.",
      error: error.message,
    });
  }
};
