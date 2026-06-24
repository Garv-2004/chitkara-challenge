const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const bfhlRoutes = require('./routes/bfhlRoutes');
const errorHandler = require('./middleware/errorHandler');

// Read Swagger document
let swaggerDocument;
try {
  swaggerDocument = require('../docs/swagger.json');
} catch (err) {
  console.warn('Swagger documentation file not found or contains errors. API documentation under /api-docs will be unavailable.');
}

const app = express();

// Configure CORS - Enable access for multiple origins (Vercel frontend, local frontend)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API Swagger docs
if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Mount Routes
app.use('/bfhl', bfhlRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
