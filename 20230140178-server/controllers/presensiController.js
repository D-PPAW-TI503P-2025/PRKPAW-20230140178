const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

exports.CheckIn = async (req, res) => {
    try {
        const userId = req.user.id; // FIX ✔
        const waktuSekarang = new Date();
        const { latitude, longitude } = req.body;

        const existingRecord = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
        });

        if (existingRecord) {
            return res
                .status(400)
                .json({ message: "Anda sudah melakukan check-in hari ini." });
        }

        const newRecord = await Presensi.create({
            userId: userId,
            checkIn: waktuSekarang,
            latitude: latitude || null,
            longitude: longitude || null,
        });

        const user = await User.findByPk(userId);

        res.status(201).json({
            message: `Halo ${user.nama}, check-in berhasil pada ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
            data: {
                userId: newRecord.userId,
                nama: user.nama,
                checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
                checkOut: null,
                latitude: newRecord.latitude,
                longitude: newRecord.longitude

            },
        });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};



exports.CheckOut = async (req, res) => {
    try {
        const userId = req.user.id; // FIX ✔
        const waktuSekarang = new Date();

        const recordToUpdate = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
        });

        if (!recordToUpdate) {
            return res.status(404).json({
                message: "Tidak ditemukan catatan check-in aktif.",
            });
        }

        recordToUpdate.checkOut = waktuSekarang;
        await recordToUpdate.save();

        const user = await User.findByPk(userId);

        res.json({
            message: `Selamat jalan ${user.nama}, check-out berhasil pada ${format(
                waktuSekarang,
                "HH:mm:ss",
                { timeZone }
            )} WIB`,
            data: {
                userId: recordToUpdate.userId,
                nama: user.nama,
                checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
                checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};



exports.updatePresensi = async (req, res) => {
    try {
        const userId = req.user.id;
        const presensiId = req.params.id;
        const { status, tanggal } = req.body;

        const cek = await Presensi.findOne({
            where: { id: presensiId, userId },
        });

        if (!cek) {
            return res.status(404).json({
                message: "Presensi tidak ditemukan"
            });
        }

        await cek.update({
            status: status || cek.status,
            tanggal: tanggal || cek.tanggal,
        });

        return res.status(200).json({
            message: "Presensi berhasil diupdate",
            data: cek,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error.message,
        });
    }
};


// Hapus presensi
exports.deletePresensi = async (req, res) => {
    try {
        const userId = req.user.id;
        const presensiId = req.params.id;

        const cek = await Presensi.findOne({
            where: { id: presensiId, userId },
        });

        if (!cek) {
            return res.status(404).json({
                message: "Presensi tidak ditemukan"
            });
        }

        await cek.destroy();

        return res.status(200).json({
            message: "Presensi berhasil dihapus"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error.message,
        });
    }
};

exports.getAllPresensi = async (req, res) => {
    try {
        const data = await Presensi.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["nama", "email", "role"]
                }
            ],
            order: [["checkIn", "DESC"]]
        });

        res.json({
            message: "Data presensi ditemukan",
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error.message
        });
    }
};