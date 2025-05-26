# Label Studio Proxy

This is a proxy server for Label Studio. It forwards requests to the Label Studio server and adds authentication headers if needed.

## Configuration

The Label Studio proxy uses a centralized configuration system. The configuration is loaded from the `web-portal/configs` directory.

### Port Configuration

The port for the proxy is configured in the `web-portal/configs/default.json` file:

```json
{
  "services": {
    "labelStudio": {
      "port": 8082,
      "targetUrl": "http://localhost:7070"
    }
  }
}
```

You can override the port by setting the `PORT` environment variable when starting the service.

## Starting the Service

To start the proxy service:

```bash
cd web-portal/label-studio-proxy
npm start
```

This will start the proxy service on the port specified in the configuration.

## Development

To start the proxy service in development mode with auto-reload:

```bash
cd web-portal/label-studio-proxy
npm run dev
```

## Direct Start

If you want to start the service directly without using the configuration, you can use:

```bash
cd web-portal/label-studio-proxy
npm run start:direct
```

## Environment Variables

You can override the port by setting the `PORT` environment variable:

```bash
PORT=8083 npm start
```

You can also set the Label Studio API token using the `LABEL_STUDIO_API_TOKEN` environment variable:

```bash
LABEL_STUDIO_API_TOKEN=your_api_token npm start
``` 