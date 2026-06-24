const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  userId: process.env.USER_ID || 'garvpuri_24062006',
  emailId: process.env.EMAIL_ID || 'garv.puri@college.edu',
  collegeRollNumber: process.env.COLLEGE_ROLL_NUMBER || '21CS1001',
};
