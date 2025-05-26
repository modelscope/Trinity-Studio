# Training Portal

This is the training portal for the Trinity-RFT project. It consists of a frontend React application and a backend Express server.

## Configuration

The training portal uses a centralized configuration system. The configuration is loaded from the `src/configs` directory.

### Port Configuration

The ports for the frontend and backend are configured in the `src/configs/default.json` file:

```json
{
  "services": {
    "trainingPortal": {
      "backendPort": 3004,
      "frontendPort": 3003,
      "backendUrl": "http://localhost:3004"
    },
  }
}
```

You can override these ports by setting the `PORT` environment variable when starting the services.

## Starting the Services

### Frontend

To start the frontend service:

```bash
cd src/apps/training-portal/frontend
npm start
```

This will start the frontend service on the port specified in the configuration.

### Backend

To start the backend service:

```bash
cd src/apps/training-portal/backend
# install dependencies
bash setup.sh
# start the server
bash start.sh
# stop the server
bash stop.sh
```

This will start the backend service on the port specified in the configuration.

## Development

### Frontend

To start the frontend service in development mode:

```bash
cd src/apps/training-portal/frontend
npm start
```

### Backend

To start the backend service in development mode with auto-reload:

```bash
cd src/apps/training-portal/backend
# install dependencies
bash setup.sh
# start the server
bash start.sh
# stop the server
bash stop.sh
```

## Direct Start

If you want to start the services directly without using the configuration, you can use:

```bash
# Frontend
cd src/apps/training-portal/frontend
npm run start:direct

# Backend
cd src/apps/training-portal/backend
# install dependencies
bash setup.sh
# start the server
bash start.sh
# stop the server
bash stop.sh
```
