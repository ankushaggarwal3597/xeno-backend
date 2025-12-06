const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/tenants
router.get('/', tenantController.getAllTenants);

// GET /api/tenants/:id
router.get('/:id', tenantController.getTenantById);

// POST /api/tenants/:id/sync
router.post('/:id/sync', tenantController.syncTenant);

// DELETE /api/tenants/:id
router.delete('/:id', tenantController.deleteTenant);

module.exports = router;
