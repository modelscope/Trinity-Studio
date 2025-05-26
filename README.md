# Trinity-Studio

This is a monorepo for the Trinity Studio web portal, see more technical details in Trinity-RFT [repo](https://github.com/modelscope/Trinity-RFT). It contains multiple micro-frontend applications and shared configuration, being actively enhanced and updated according to Trinity-RFT.

## Structure

```
src/                             # Monorepo root
├── scripts/                     # Useful and reference cfg/scripts
├── src/                         # Source code directory
│   ├── package.json             # Root package.json with shared dependencies
│   ├── package-lock.json        # Lock file for consistent dependencies
│   ├── root-config/             # Single-spa root configuration; the landing page
│   │   ├── src/                 # Root config source code
│   │   ├── public/              # Static assets
│   │   ├── webpack.config.js    # Webpack configuration
│   │   └── server.js            # Development server
│   ├── configs/                 # Shared configuration
│   └── apps/                    # Applications directory
│       ├── label-studio-proxy/  # Label Studio proxy
│       ├── training-portal/     # Training portal
│       │   ├── frontend/        # Training portal frontend
│       │   └── backend/         # Training portal backend
│       └── pgadmin/             # pgAdmin
│           ├── frontend/        # pgAdmin frontend
│           └── backend/         # pgAdmin backend
```

## Getting Started

### Installation

To install all dependencies:

```bash
# navigate to sub directory
cd src/
npm install

# navigate to training-portal backend directory
cd src/apps/training-portal/backend
bash setup.sh
```

This will install all dependencies for all services in the monorepo.

### Starting Services

You can start individual services using the scripts in the root package.json:

```bash
# navigate to sub directory
cd  src/

# Start root-config (micro-frontend orchestrator)
npm run start:root-config

# Start Label Studio proxy
npm run start:label-studio

# Start pgAdmin frontend
npm run start:pgadmin:frontend

# Start pgAdmin backend
npm run start:pgadmin:backend

# Start Training Portal frontend
npm run start:training-portal:frontend

# Start Training Portal backend
cd src/apps/training-portal/backend
bash start.sh
```

Or you can start services directly from their respective directories:

```bash
# Start root-config
cd src/root-config
npm start

# Start Label Studio proxy
cd src/apps/label-studio-proxy
npm start

# Start pgAdmin frontend
cd src/apps/pgadmin/frontend
npm start

# Start pgAdmin backend
cd src/apps/pgadmin/backend
npm start

# Start Training Portal frontend
cd src/apps/training-portal/frontend
npm start

# Start Training Portal backend
cd src/apps/training-portal/backend
bash start.sh
```

## Configuration

The configuration is centralized in the `src/configs` directory. Each service can access the configuration by requiring the `configs` module:

```javascript
const config = require('../../configs');
```

## Environment Variables

Environment variables are loaded from the `.env` file in the `src/configs` directory. You can override these variables by setting them in your environment.

## Micro-Frontend Architecture

This project uses single-spa for micro-frontend architecture. The `src/root-config` directory contains the single-spa root configuration that orchestrates all the micro-frontend applications.

### Root Config

The root-config is responsible for:
- Loading and unloading micro-frontend applications
- Managing shared dependencies
- Providing a consistent layout and navigation

To start the root-config:

```bash
npm run start:root-config
```

## Development

For development, you can use the `dev` script in each service's package.json:

```bash
cd src/apps/label-studio-proxy
npm run dev
```

This will start the service with auto-reload enabled. 