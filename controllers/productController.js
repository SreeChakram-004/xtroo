const { Product } = require('../models');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
  const shopId = req.user?.Shop?.dataValues?.id;
  let { search = '', page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Set default values for page and limit if they are not provided in req.query
  page = page || 1;
  limit = limit || 10;

  try {
    const whereClause = { shopId };
    if (search) {
      whereClause.productName = { [Op.like]: `%${search}%` };
    }

    const totalCount = await Product.count({ where: whereClause });

    let totalPages = 1;
    let offset = 0;
    if (limit) {
      limit = parseInt(limit); // Parsing limit to an integer
      totalPages = Math.ceil(totalCount / limit);
      offset = (page - 1) * limit;
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      offset,
      limit,
    });

    res.status(200).json({
      status: true,
      products,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'An error occurred while fetching products.' });
  }
};




const createProduct = async (req, res) => {
    const shopId = req.user.Shop.dataValues.id; // Access the shop ID from req.user
    const { productName } = req.body;
    try {
      const product = await Product.create({ productName, shopId });
      res.status(201).json({ status: true,id:product.id,uuid:product.uuid, productName: product.productName,shopId : product.shopId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, message: 'An error occurred while creating the product.' });
    }
};

const updateProduct = async (req, res) => {
  const shopId = req.user.Shop.dataValues.id; // Access the shop ID from req.user
  const { productId } = req.params;
  const { productName } = req.body;

  try {
    const product = await Product.findOne({ where: { id: productId, shopId } });

    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found.' });
    }

    product.productName = productName;
    await product.save();

    res.status(200).json({ status: true, product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'An error occurred while updating the product.' });
  }
};

const deleteProduct = async (req, res) => {
  const shopId = req.user.Shop.dataValues.id; // Access the shop ID from req.user
  const { productId } = req.params;

  try {
    const product = await Product.findOne({ where: { id: productId, shopId } });

    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found.' });
    }

    await product.destroy();

    res.status(200).json({ status: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'An error occurred while deleting the product.' });
  }
};

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
