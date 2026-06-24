const config = require('../config');

/**
 * Express error-handling middleware.
 * Formats errors and logs them to console.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Exception:', err);

  const isDev = config.nodeEnv === 'development';

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  const errorResponse = {
    is_success: false,
    message: message,
    ...(isDev && { stack: err.stack })
  };

  return res.status(status).json(errorResponse);
};

module.exports = errorHandler;
