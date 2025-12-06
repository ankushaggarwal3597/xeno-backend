const { Tenant } = require('../models');
const SyncService = require('../services/syncService');

/**
 * PUBLIC ROUTES (Frontend)
 */

exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]  // FIXED
    });

    return res.json(tenants);
  } catch (error) {
    console.error("Get Tenants Error:", error);
    return res
      .status(500)
      .json({ message: 'Error fetching tenants', error: error.message });
  }
};

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    return res.json(tenant);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching tenant', error: error.message });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await tenant.destroy();
    return res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting tenant', error: error.message });
  }
};

exports.syncTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await SyncService.syncTenant(tenant.id);

    tenant.last_sync_at = new Date();
    await tenant.save();

    return res.json({ success: true, message: 'Sync completed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Sync failed', error: error.message });
  }
};


/**
 * INTERNAL — USED ONLY BY OAUTH CALLBACK
 */

exports.createTenantFromOAuth = async ({ userId, storeName, shopDomain, accessToken }) => {
  try {
    const existing = await Tenant.findOne({
      where: { user_id: userId, shop_domain: shopDomain }
    });

    if (existing) {
      await existing.update({
        access_token: accessToken,
        is_active: true
      });

      await SyncService.syncTenant(existing.id);
      existing.last_sync_at = new Date();
      await existing.save();

      return existing;
    }

    const tenant = await Tenant.create({
      user_id: userId,
      store_name: storeName,
      shop_domain: shopDomain,
      access_token: accessToken,
      is_active: true,
      last_sync_at: new Date()
    });

    if (process.env.WEBHOOK_BASE_URL) {
      try {
        await SyncService.setupWebhooks(tenant, process.env.WEBHOOK_BASE_URL);
      } catch (err) {
        console.log("Webhook setup skipped:", err.message);
      }
    }

    await SyncService.syncTenant(tenant.id);
    tenant.last_sync_at = new Date();
    await tenant.save();

    return tenant;
  } catch (error) {
    throw new Error("OAuth tenant creation failed: " + error.message);
  }
};
