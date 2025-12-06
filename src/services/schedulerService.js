const cron = require('node-cron');
const { Tenant } = require('../models');
const SyncService = require('./syncService');

class SchedulerService {
  static start() {
    // Run sync every 6 hours for all active tenants
    cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 Starting scheduled sync...');
      
      try {
        const tenants = await Tenant.findAll({ where: { is_active: true } });
        
        for (const tenant of tenants) {
          try {
            await SyncService.syncTenant(tenant.id);
            console.log(`✅ Synced: ${tenant.store_name}`);
          } catch (error) {
            console.error(`❌ Sync failed for ${tenant.store_name}:`, error.message);
          }
        }
      } catch (error) {
        console.error('Scheduler error:', error);
      }
    });

    console.log('⏰ Scheduler started - syncing every 6 hours');
  }
}

module.exports = SchedulerService;