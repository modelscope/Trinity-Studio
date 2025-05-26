const { Pool } = require('pg');
const config = require('../../../../../configs');

// Cache for database pools
const poolCache = {};

/**
 * Get a database pool for a specific connection
 * @param {string} connectionId - The ID of the connection
 * @param {string} [database] - Optional database name to override the default
 * @returns {Promise<Pool>} - A PostgreSQL pool
 */
async function getPool(connectionId, database = null) {
  // Check if we already have a pool for this connection and database
  const cacheKey = database ? `${connectionId}:${database}` : connectionId;
  if (poolCache[cacheKey]) {
    return poolCache[cacheKey];
  }
  
  // Find the connection configuration
  const connConfig = config.database.connections.find(conn => conn.id === connectionId);
  if (!connConfig) {
    throw new Error(`Connection ${connectionId} not found in configuration`);
  }
  
  // Create a new pool
  const poolConfig = {
    host: connConfig.host,
    port: connConfig.port,
    user: connConfig.username,
    password: connConfig.password,
    database: database || connConfig.database
  };
  
  const pool = new Pool(poolConfig);
  
  // Test the connection
  try {
    await pool.query('SELECT 1');
    console.log(`Connected to database: ${poolConfig.database} on ${poolConfig.host}:${poolConfig.port}`);
  } catch (error) {
    console.error(`Failed to connect to database: ${poolConfig.database} on ${poolConfig.host}:${poolConfig.port}`, error);
    throw error;
  }
  
  // Cache the pool
  poolCache[cacheKey] = pool;
  
  return pool;
}

/**
 * Get all available database connections
 * @returns {Array} - List of connection configurations
 */
function getConnections() {
  return config.database.connections.map(conn => ({
    id: conn.id,
    name: conn.name,
    host: conn.host,
    port: conn.port,
    database: conn.database
  }));
}

/**
 * Close all database pools
 */
async function closeAllPools() {
  for (const pool of Object.values(poolCache)) {
    await pool.end();
  }
  Object.keys(poolCache).forEach(key => delete poolCache[key]);
}

module.exports = {
  getPool,
  getConnections,
  closeAllPools
}; 