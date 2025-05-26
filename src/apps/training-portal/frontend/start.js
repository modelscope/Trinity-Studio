#!/usr/bin/env node

// This script reads the port from the configuration and starts the service
const { spawn } = require('child_process');
const path = require('path');
const config = require('../../../configs');

// Get ports from config
const frontendPort = config.services.trainingPortal.frontendPort;
const backendPort = config.services.trainingPortal.backendPort;

console.log(`Starting training portal frontend on port ${frontendPort}...`);

// Start the webpack development server with environment variables
const startProcess = spawn('npx', ['webpack', 'serve', '--mode', 'development', '--port', frontendPort], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: frontendPort,
    REACT_APP_BACKEND_PORT: backendPort
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping training portal frontend...');
  startProcess.kill('SIGINT');
  process.exit(0);
});

startProcess.on('close', (code) => {
  console.log(`Training portal frontend process exited with code ${code}`);
  process.exit(code);
}); 