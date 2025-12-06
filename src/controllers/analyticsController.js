const { Customer, Order, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getOverview = async (req, res) => {
  try {
    const { tenant_id } = req.query;

    const [customerCount, orderCount, productCount, revenueResult] = await Promise.all([
      Customer.count({ where: { tenant_id } }),
      Order.count({ where: { tenant_id } }),
      Product.count({ where: { tenant_id } }),
      Order.sum('total_price', { where: { tenant_id } })
    ]);

    res.json({
      customers: customerCount,
      orders: orderCount,
      products: productCount,
      revenue: revenueResult || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const { tenant_id, start_date, end_date } = req.query;

    const revenueByDate = await Order.findAll({
      where: {
        tenant_id,
        created_at_shopify: {
          [Op.between]: [start_date, end_date]
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at_shopify')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at_shopify'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at_shopify')), 'ASC']]
    });

    res.json(revenueByDate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue', error: error.message });
  }
};

exports.getTopCustomers = async (req, res) => {
  try {
    const { tenant_id, limit = 5 } = req.query;

    const topCustomers = await Customer.findAll({
      where: { tenant_id },
      order: [['total_spent', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top customers', error: error.message });
  }
};

exports.getOrdersByDate = async (req, res) => {
  try {
    const { tenant_id, start_date, end_date } = req.query;

    const ordersByDate = await Order.findAll({
      where: {
        tenant_id,
        created_at_shopify: {
          [Op.between]: [start_date, end_date]
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at_shopify')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at_shopify'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at_shopify')), 'ASC']]
    });

    res.json(ordersByDate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders by date', error: error.message });
  }
};