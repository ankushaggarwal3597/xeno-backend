const axios = require('axios');

class ShopifyService {
  constructor(shopDomain, accessToken) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
    this.apiVersion = '2024-01';
    this.baseURL = `https://${shopDomain}/admin/api/${this.apiVersion}`;
  }

  // Create axios instance with auth
  getAxiosInstance() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  // Fetch all customers with pagination
  async getAllCustomers() {
    const api = this.getAxiosInstance();
    let customers = [];
    let hasNextPage = true;
    let pageInfo = null;

    try {
      while (hasNextPage) {
        const params = { limit: 250 };
        if (pageInfo) {
          params.page_info = pageInfo;
        }

        const response = await api.get('/customers.json', { params });
        customers = customers.concat(response.data.customers);

        // Check for pagination
        const linkHeader = response.headers.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
          const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
          const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
          pageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
        } else {
          hasNextPage = false;
        }
      }

      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error.response?.data || error.message);
      throw error;
    }
  }

  // Fetch all orders with pagination
  async getAllOrders(status = 'any') {
    const api = this.getAxiosInstance();
    let orders = [];
    let hasNextPage = true;
    let pageInfo = null;

    try {
      while (hasNextPage) {
        const params = { limit: 250, status };
        if (pageInfo) {
          params.page_info = pageInfo;
        }

        const response = await api.get('/orders.json', { params });
        orders = orders.concat(response.data.orders);

        const linkHeader = response.headers.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
          const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
          const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
          pageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
        } else {
          hasNextPage = false;
        }
      }

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw error;
    }
  }

  // Fetch all products
  async getAllProducts() {
    const api = this.getAxiosInstance();
    let products = [];
    let hasNextPage = true;
    let pageInfo = null;

    try {
      while (hasNextPage) {
        const params = { limit: 250 };
        if (pageInfo) {
          params.page_info = pageInfo;
        }

        const response = await api.get('/products.json', { params });
        products = products.concat(response.data.products);

        const linkHeader = response.headers.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
          const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
          const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
          pageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
        } else {
          hasNextPage = false;
        }
      }

      return products;
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create webhook subscription
  async createWebhook(topic, address) {
    const api = this.getAxiosInstance();
    try {
      const response = await api.post('/webhooks.json', {
        webhook: {
          topic,
          address,
          format: 'json'
        }
      });
      return response.data.webhook;
    } catch (error) {
      console.error(`Error creating webhook for ${topic}:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Get all webhook subscriptions
  async getWebhooks() {
    const api = this.getAxiosInstance();
    try {
      const response = await api.get('/webhooks.json');
      return response.data.webhooks;
    } catch (error) {
      console.error('Error fetching webhooks:', error.response?.data || error.message);
      throw error;
    }
  }

  // Delete webhook
  async deleteWebhook(webhookId) {
    const api = this.getAxiosInstance();
    try {
      await api.delete(`/webhooks/${webhookId}.json`);
      return true;
    } catch (error) {
      console.error('Error deleting webhook:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = ShopifyService;