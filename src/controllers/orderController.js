const { Order } = require('../models');
const { Op } = require('sequelize');

exports.getAllOrders = async (req, res) => {
  try {
    const { tenant_id, page = 1, limit = 20, startDate, endDate, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { tenant_id };

    if (startDate && endDate) {
      where.created_at_shopify = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (status && status !== 'all') {
      where.financial_status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at_shopify', 'DESC']]
    });

    res.json({
      orders: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};