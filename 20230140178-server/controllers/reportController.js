const { Presensi, User, Sequelize } = require("../models");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama } = req.query;

    const options = {
      include: [
        {
          model: User,
          as: "user", // pastikan sama dengan alias di model
          attributes: ["nama"],
          where: nama
            ? { nama: { [Sequelize.Op.like]: `%${nama}%` } }
            : undefined,
          required: false,
        },
      ],
      order: [["checkIn", "ASC"]],
    };

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString("id-ID"),
      data: records,
    });
  } catch (error) {
    console.error("Error getDailyReport:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};
