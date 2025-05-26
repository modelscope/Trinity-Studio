const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const config = require('../../../configs');

const app = express();
const PORT = config.services.pgadmin.backendPort;

// Enable CORS for development
app.use(cors());
app.use(express.json());

// Create a pool using the first connection config
const pool = new Pool(config.database.connections[0]);

// ... rest of the server code ... 