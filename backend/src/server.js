const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`==================================================`);
  console.log(`🚀 CHITKARA BFHL API SERVER STARTED`);
  console.log(`💻 Environment: ${config.nodeEnv}`);
  console.log(`🔌 Port:        ${config.port}`);
  console.log(`📖 API Docs:    http://localhost:${config.port}/api-docs`);
  console.log(`==================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
