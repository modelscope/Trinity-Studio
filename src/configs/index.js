// Browser-compatible configuration loader
const defaultConfig = require('./default.json');
let envConfig = {};

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment-specific configuration if available
try {
  envConfig = require(`./${NODE_ENV}.json`);
} catch (error) {
  console.warn(`No specific configuration for ${NODE_ENV}, using default`);
}

// Merge configurations
const config = {
  ...defaultConfig,
  ...envConfig,
  // Helper functions
  getServiceUrl: (serviceName) => {
    const service = config.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found in configuration`);
    }
    return `${config.baseUrl}:${service.port}`;
  },
  getBackendUrl: (serviceName, path = '') => {
    const service = config.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found in configuration`);
    }
    return `${config.baseUrl}:${service.backendPort || service.port}${path}`;
  },
  getFrontendUrl: (serviceName) => {
    const service = config.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found in configuration`);
    }
    return `${config.baseUrl}:${service.frontendPort || service.port}`;
  },
  getApiKey: (serviceName) => {
    // Convert service name to environment variable format (e.g., 'wandb' -> 'WANDB_API_KEY')
    const envVarName = `${serviceName.toUpperCase()}_API_KEY`;
    return process.env[envVarName] || null;
  },
  getApiToken: (serviceName) => {
    // Convert service name to environment variable format (e.g., 'labelStudio' -> 'LABEL_STUDIO_API_TOKEN')
    const envVarName = `${serviceName.toUpperCase().replace(/([A-Z])/g, '_$1')}_API_TOKEN`;
    return process.env[envVarName] || null;
  },
  getWandbBaseUrl: () => {
    // In browser environment, process.env is defined by webpack
    const envUrl = typeof process !== 'undefined' && process.env ? process.env.WANDB_BASE_URL : null;
    return envUrl || 'http://localhost:8083';
  }
};

module.exports = config; 