const { Tenant, Customer, Order, Product } = require('../models');
const ShopifyService = require('./shopifyService');

class SyncService {
  // Sync all data for a tenant
  static async syncTenant(tenantId) {
    try {
      const tenant = await Tenant.findByPk(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const shopify = new ShopifyService(tenant.shop_domain, tenant.access_token);

      // Sync customers
      await this.syncCustomers(tenant, shopify);

      // Sync products
      await this.syncProducts(tenant, shopify);

      // Sync orders
      await this.syncOrders(tenant, shopify);

      // Update last sync time
      tenant.last_sync_at = new Date();
      await tenant.save();

      console.log(`✅ Sync completed for tenant ${tenant.store_name}`);
      return { success: true };
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  static async syncCustomers(tenant, shopify) {
    const customers = await shopify.getAllCustomers();
    console.log(`Syncing ${customers.length} customers...`);

    for (const shopifyCustomer of customers) {
      await Customer.upsert({
        tenant_id: tenant.id,
        shopify_customer_id: shopifyCustomer.id,
        email: shopifyCustomer.email,
        first_name: shopifyCustomer.first_name,
        last_name: shopifyCustomer.last_name,
        phone: shopifyCustomer.phone,
        orders_count: shopifyCustomer.orders_count || 0,
        total_spent: shopifyCustomer.total_spent || 0,
        created_at_shopify: shopifyCustomer.created_at,
        updated_at_shopify: shopifyCustomer.updated_at
      });
    }
  }

  static async syncProducts(tenant, shopify) {
    const products = await shopify.getAllProducts();
    console.log(`Syncing ${products.length} products...`);

    for (const shopifyProduct of products) {
      await Product.upsert({
        tenant_id: tenant.id,
        shopify_product_id: shopifyProduct.id,
        title: shopifyProduct.title,
        description: shopifyProduct.body_html,
        vendor: shopifyProduct.vendor,
        product_type: shopifyProduct.product_type,
        status: shopifyProduct.status,
        variants: shopifyProduct.variants,
        images: shopifyProduct.images,
        created_at_shopify: shopifyProduct.created_at,
        updated_at_shopify: shopifyProduct.updated_at
      });
    }
  }

  static async syncOrders(tenant, shopify) {
    const orders = await shopify.getAllOrders();
    console.log(`Syncing ${orders.length} orders...`);

    for (const shopifyOrder of orders) {
      // Find customer
      let customer = null;
      if (shopifyOrder.customer && shopifyOrder.customer.id) {
        customer = await Customer.findOne({
          where: {
            tenant_id: tenant.id,
            shopify_customer_id: shopifyOrder.customer.id
          }
        });
      }

      await Order.upsert({
        tenant_id: tenant.id,
        shopify_order_id: shopifyOrder.id,
        order_number: shopifyOrder.order_number,
        customer_id: customer ? customer.id : null,
        email: shopifyOrder.email,
        total_price: shopifyOrder.total_price,
        subtotal_price: shopifyOrder.subtotal_price,
        total_tax: shopifyOrder.total_tax,
        currency: shopifyOrder.currency,
        financial_status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status,
        line_items: shopifyOrder.line_items,
        created_at_shopify: shopifyOrder.created_at,
        updated_at_shopify: shopifyOrder.updated_at
      });
    }
  }

  // Setup webhooks for a tenant
  static async setupWebhooks(tenant, webhookBaseUrl) {
    const shopify = new ShopifyService(tenant.shop_domain, tenant.access_token);

    const topics = [
      'customers/create',
      'customers/update',
      'orders/create',
      'orders/updated',
      'products/create',
      'products/update'
    ];

    const createdWebhooks = [];

    for (const topic of topics) {
      try {
        const webhook = await shopify.createWebhook(
          topic,
          `${webhookBaseUrl}/api/webhooks/shopify?tenant_id=${tenant.id}`
        );
        createdWebhooks.push(webhook);
        console.log(`Webhook created: ${topic}`);
      } catch (error) {
        console.error(`Failed to create webhook: ${topic}`, error.message);
      }
    }

    // Save webhook IDs to tenant
    tenant.webhook_subscriptions = createdWebhooks;
    await tenant.save();

    return createdWebhooks;
  }
}

module.exports = SyncService;