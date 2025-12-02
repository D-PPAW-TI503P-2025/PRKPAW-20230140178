'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Presensi, {
        foreignKey: 'userId',
        as: 'presensi'
      });
    }
  }

  User.init(
    {
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('mahasiswa', 'admin'),
        allowNull: false,
        defaultValue: 'mahasiswa',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',     // ← SUDAH SESUAI TABEL KAMU
      freezeTableName: true,  // agar tidak diubah jadi "Users"
      timestamps: true,       // createdAt & updatedAt aktif
    }
  );

  return User;
};
