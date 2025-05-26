#!/usr/bin/env node

// This script reads the port from the configuration and starts the service
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Try to load the configuration
let port = 8082; // Default port

try {
  // Try to load from the configs directory
  const configPath = path.resolve(__dirname, '../../configs/index.js');
  if (fs.existsSync(configPath)) {
    const config = require(configPath);
    if (config.services && config.services.labelStudio && config.services.labelStudio.port) {
      port = config.services.labelStudio.port;
    }
  }
} catch (error) {
  console.warn('Could not load configuration, using default port:', port);
  console.warn('Error:', error.message);
}

// Check if port is provided via environment variable (overrides config)
if (process.env.PORT) {
  port = process.env.PORT;
}

console.log(`Starting Label Studio proxy on port ${port}...`);

// Start the proxy server
const startProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: port
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping Label Studio proxy...');
  startProcess.kill('SIGINT');
  process.exit(0);
});

startProcess.on('close', (code) => {
  console.log(`Label Studio proxy process exited with code ${code}`);
  process.exit(code);
}); 