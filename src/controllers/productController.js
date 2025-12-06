const { Product } = require('../models');

exports.getAllProducts = async (req, res) => {
  try {
    const { tenant_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: { tenant_id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      products: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};