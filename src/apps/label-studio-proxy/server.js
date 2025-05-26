const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../../configs');

const app = express();
// Use PORT from environment variable if set, otherwise use config
const PORT = process.env.PORT || config.services.labelStudio.port;

// Enable CORS for development
app.use(cors());

// Get API token from environment variables
const apiToken = config.getApiToken('labelStudio');
if (!apiToken) {
  console.warn('Warning: LABEL_STUDIO_API_TOKEN not found in environment variables');
}

// Proxy middleware configuration
const proxyOptions = {
  target: config.services.labelStudio.targetUrl,
  changeOrigin: true,
  onProxyReq: (proxyReq) => {
    // Add authentication headers if needed
    if (apiToken) {
      proxyReq.setHeader('Authorization', `Token ${apiToken}`);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  },
};

// Proxy all requests to Label Studio
app.use('/', createProxyMiddleware(proxyOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Label Studio proxy server is running',
    apiTokenConfigured: !!apiToken
  });
});

app.listen(PORT, () => {
  console.log(`Label Studio proxy server running on port ${PORT}`);
  console.log(`API Token configured: ${!!apiToken}`);
}); 