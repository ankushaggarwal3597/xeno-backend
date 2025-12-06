const crypto = require('crypto');
const { Customer, Order, Product } = require('../models');

// Verify Shopify webhook signature
const verifyWebhook = (req) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.rawBody; // We'll configure this in express
  
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmac;
};

exports.handleShopifyWebhook = async (req, res) => {
  try {
    // Verify webhook
    if (!verifyWebhook(req)) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const topic = req.get('X-Shopify-Topic');
    const shopDomain = req.get('X-Shopify-Shop-Domain');
    const tenantId = req.query.tenant_id;

    console.log(`📥 Webhook received: ${topic} from ${shopDomain}`);

    // Process webhook based on topic
    switch (topic) {
      case 'customers/create':
      case 'customers/update':
        await handleCustomerWebhook(req.body, tenantId);
        break;
      
      case 'orders/create':
      case 'orders/updated':
        await handleOrderWebhook(req.body, tenantId);
        break;
      
      case 'products/create':
      case 'products/update':
        await handleProductWebhook(req.body, tenantId);
        break;
      
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Shopify from retrying
    res.status(200).json({ received: true, error: error.message });
  }
};

async function handleCustomerWebhook(data, tenantId) {
  await Customer.upsert({
    tenant_id: tenantId,
    shopify_customer_id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    orders_count: data.orders_count || 0,
    total_spent: data.total_spent || 0,
    created_at_shopify: data.created_at,
    updated_at_shopify: data.updated_at
  });
}

async function handleOrderWebhook(data, tenantId) {
  let customer = null;
  if (data.customer && data.customer.id) {
    customer = await Customer.findOne({
      where: {
        tenant_id: tenantId,
        shopify_customer_id: data.customer.id
      }
    });
  }

  await Order.upsert({
    tenant_id: tenantId,
    shopify_order_id: data.id,
    order_number: data.order_number,
    customer_id: customer ? customer.id : null,
    email: data.email,
    total_price: data.total_price,
    subtotal_price: data.subtotal_price,
    total_tax: data.total_tax,
    currency: data.currency,
    financial_status: data.financial_status,
    fulfillment_status: data.fulfillment_status,
    line_items: data.line_items,
    created_at_shopify: data.created_at,
    updated_at_shopify: data.updated_at
  });
}

async function handleProductWebhook(data, tenantId) {
  await Product.upsert({
    tenant_id: tenantId,
    shopify_product_id: data.id,
    title: data.title,
    description: data.body_html,
    vendor: data.vendor,
    product_type: data.product_type,
    status: data.status,
    variants: data.variants,
    images: data.images,
    created_at_shopify: data.created_at,
    updated_at_shopify: data.updated_at
  });
}