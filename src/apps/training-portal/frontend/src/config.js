import sharedConfig from '../../../../configs/index';

const config = {
  apiUrl: sharedConfig.getBackendUrl('trainingPortal'),
  frontendPort: sharedConfig.services.trainingPortal.frontendPort,
  getApiUrl: (path) => {
    return `${config.apiUrl}${path}`;
  },
  getFrontendPort: () => {
    return config.frontendPort;
  },
  getWandbBaseUrl: () => {
    return sharedConfig.getWandbBaseUrl();
  }
};

export default config; 