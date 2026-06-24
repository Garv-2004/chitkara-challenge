/**
 * Validates whether the input body has the correct structure.
 * Expected body: { "data": [...] }
 * 
 * @param {object} body - Request body
 * @returns {boolean} - True if valid, false otherwise
 */
const validateRequestBody = (body) => {
  if (!body || typeof body !== 'object') {
    return false;
  }
  if (!Array.isArray(body.data)) {
    return false;
  }
  return true;
};

/**
 * Validates a single edge string.
 * Format must be X->Y, where X and Y are uppercase letters (A-Z) and X !== Y.
 * 
 * @param {string} entry - Raw edge string from request
 * @returns {object} - Validation outcome: { isValid, parent, child, errorReason }
 */
const validateEdge = (entry) => {
  if (typeof entry !== 'string') {
    return { isValid: false, errorReason: 'Not a string' };
  }

  const trimmed = entry.trim();
  if (trimmed === '') {
    return { isValid: false, errorReason: 'Empty string' };
  }

  // Regex to validate uppercase letter -> uppercase letter pattern
  // E.g., A->B, Z->X, etc.
  const edgeRegex = /^([A-Z])->([A-Z])$/;
  const match = trimmed.match(edgeRegex);

  if (!match) {
    // Check if it's alphanumeric or lowercase to help verify why it failed
    if (trimmed.includes('->')) {
      const parts = trimmed.split('->');
      if (parts.length === 2) {
        const parent = parts[0];
        const child = parts[1];
        if (parent.length !== 1 || child.length !== 1) {
          return { isValid: false, errorReason: 'Multi-character node label' };
        }
        if (!/^[a-zA-Z0-9]$/.test(parent) || !/^[a-zA-Z0-9]$/.test(child)) {
          return { isValid: false, errorReason: 'Non-alphanumeric characters' };
        }
        return { isValid: false, errorReason: 'Not uppercase letters' };
      }
    }
    return { isValid: false, errorReason: 'Invalid node format' };
  }

  const parent = match[1];
  const child = match[2];

  if (parent === child) {
    return { isValid: false, errorReason: 'Self-loop' };
  }

  return {
    isValid: true,
    parent,
    child,
    formatted: `${parent}->${child}`
  };
};

module.exports = {
  validateRequestBody,
  validateEdge,
};
