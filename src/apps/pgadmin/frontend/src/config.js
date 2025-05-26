// Import the shared configuration
const config = require('../../../../configs');

module.exports = {
  ...config,
  // Add any pgAdmin-specific configuration here
  getApiUrl: (path) => config.getBackendUrl('pgadmin', `/api${path}`)
}; 