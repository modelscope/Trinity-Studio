# Configuration Management

This directory contains configuration files for the web portal services.

## Environment Variables

Environment variables are managed using `.env` files. These files contain sensitive information like API keys and tokens.

### Setting Up Environment Variables

1. Copy the example file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to add your actual API keys and tokens:
   ```
   # Weights & Biases API Key
   WANDB_API_KEY=your_actual_wandb_api_key

   # Label Studio API Token
   LABEL_STUDIO_API_TOKEN=your_actual_label_studio_api_token

   # Environment
   NODE_ENV=development
   ```

### Available Environment Variables

- `WANDB_API_KEY`: Your Weights & Biases API key
- `LABEL_STUDIO_API_TOKEN`: Your Label Studio API token
- `NODE_ENV`: The environment (development, production, etc.)

## Configuration Files

- `default.json`: Default configuration for all environments
- `development.json`: Development-specific configuration (optional)
- `production.json`: Production-specific configuration (optional)

## Accessing Configuration in Code

Configuration can be accessed in your code using:

```javascript
const config = require('../configs');

// Get a service URL
const labelStudioUrl = config.getServiceUrl('labelStudio');

// Get an API key
const wandbApiKey = config.getApiKey('wandb');

// Get an API token
const labelStudioToken = config.getApiToken('labelStudio');
```

## Security Notes

- Never commit the `.env` file to version control
- Keep your API keys and tokens secure
- For production environments, consider using a secret management service 