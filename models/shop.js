const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Shop = sequelize.define(
    'Shop',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      shopName: { // Change field name from 'name' to 'shopName'
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      timestamps: false, // Remove timestamps createdAt, updatedAt, and deletedAt
    }
  );

  // Define associations
  Shop.associate = (models) => {
    Shop.hasMany(models.User, {
      foreignKey: 'shopId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Shop;
};
