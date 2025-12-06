const { Customer } = require('../models');
const { Op } = require('sequelize');

exports.getAllCustomers = async (req, res) => {
  try {
    const { tenant_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Customer.findAndCountAll({
      where: { tenant_id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      customers: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

exports.searchCustomers = async (req, res) => {
  try {
    const { tenant_id, q } = req.query;

    const customers = await Customer.findAll({
      where: {
        tenant_id,
        [Op.or]: [
          { first_name: { [Op.like]: `%${q}%` } },
          { last_name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: 50
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error searching customers', error: error.message });
  }
};