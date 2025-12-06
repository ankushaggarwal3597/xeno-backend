require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const shopifyAuthRoutes = require("./routes/shopifyAuthRoutes");
const shopifyCallbackRoutes = require("./routes/shopifyCallBackRoutes");

// Import routes
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const SchedulerService = require('./services/schedulerService');
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000
});
app.use('/api/', limiter);

// Body parser - special handling for webhooks
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use("/api/shopify", shopifyAuthRoutes);
app.use("/api/shopify", shopifyCallbackRoutes);
app.use("/api/webhooks", webhookRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models (in production, use migrations)
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
    SchedulerService.start();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();