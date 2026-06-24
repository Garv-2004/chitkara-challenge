const config = require('../config');
const { processGraph } = require('../services/graphService');
const { validateRequestBody } = require('../utils/validator');

/**
 * Handle POST request for hierarchy building, validation, and cycle detection.
 * Endpoint: POST /bfhl
 */
const handlePost = async (req, res, next) => {
  try {
    const { body } = req;

    // Validate the request body schema
    if (!validateRequestBody(body)) {
      return res.status(400).json({
        is_success: false,
        error: 'Invalid request body. Expected format: { "data": ["A->B", ...] }'
      });
    }

    const { data } = body;

    // Process graph connections
    const graphResult = processGraph(data);

    // Merge student identity details with the graph results
    const responsePayload = {
      user_id: config.userId,
      email_id: config.emailId,
      college_roll_number: config.collegeRollNumber,
      ...graphResult
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle GET request. Often used to verify server status.
 * Endpoint: GET /bfhl
 */
const handleGet = async (req, res, next) => {
  try {
    return res.status(200).json({
      operation_code: 1,
      message: 'Chitkara Full Stack Challenge API is active. Use POST /bfhl to process hierarchical data.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handlePost,
  handleGet,
};
