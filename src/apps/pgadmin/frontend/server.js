#!/usr/bin/env node

// This script reads the port from the configuration and starts the service
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Try to load the configuration
let port = 3002; // Default port

try {
  // Try to load from the configs directory
  const configPath = path.resolve(__dirname, '../../../configs');
  if (fs.existsSync(configPath)) {
    const config = require(configPath);
    if (config.services && config.services.pgadmin && config.services.pgadmin.frontend) {
      port = config.services.pgadmin.frontend.port || port;
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

console.log(`Starting pgadmin frontend on port ${port}...`);

// Start the webpack development server
const startProcess = spawn('npx', ['webpack', 'serve', '--mode', 'development', '--port', port], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: port
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping pgadmin frontend...');
  startProcess.kill('SIGINT');
  process.exit(0);
});

startProcess.on('close', (code) => {
  console.log(`Pgadmin frontend process exited with code ${code}`);
  process.exit(code);
}); 