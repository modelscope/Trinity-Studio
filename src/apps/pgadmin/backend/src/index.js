const express = require('express');
const cors = require('cors');
const config = require('../../../../configs');
const dbService = require('./services/database');
const { Parser } = require('node-sql-parser');

const app = express();
const port = config.services.pgadmin.backendPort;
const parser = new Parser();

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Get list of available connections
app.get('/api/connections', (req, res) => {
  try {
    const connections = dbService.getConnections();
    console.log('Retrieved available connections:', connections);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ 
      error: 'Failed to fetch database connections',
      details: error.message 
    });
  }
});

// Get list of databases
app.get('/api/databases/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    console.log(`Fetching databases for connection: ${connectionId}`);
    
    const pool = await dbService.getPool(connectionId);
    const result = await pool.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false
    `);
    
    console.log(`Found ${result.rows.length} databases for connection ${connectionId}`);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching databases for connection ${req.params.connectionId}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch databases',
      details: error.message,
      connectionId: req.params.connectionId
    });
  }
});

// Get tables for a specific database
app.get('/api/tables/:connectionId/:database', async (req, res) => {
  try {
    const { connectionId, database } = req.params;
    console.log(`Fetching tables for database ${database} on connection ${connectionId}`);
    
    const pool = await dbService.getPool(connectionId, database);
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`Found ${result.rows.length} tables in database ${database}`);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching tables for database ${req.params.database}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch tables',
      details: error.message,
      connectionId: req.params.connectionId,
      database: req.params.database
    });
  }
});

// Get table structure
app.get('/api/table/:connectionId/:database/:table', async (req, res) => {
  try {
    const { connectionId, database, table } = req.params;
    console.log(`Fetching structure for table ${table} in database ${database}`);
    
    const pool = await dbService.getPool(connectionId, database);
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
    `, [table]);
    
    console.log(`Found ${result.rows.length} columns in table ${table}`);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching table structure for ${req.params.table}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch table structure',
      details: error.message,
      connectionId: req.params.connectionId,
      database: req.params.database,
      table: req.params.table
    });
  }
});

// Helper function to check if a query is safe
function isQuerySafe(query) {
  try {
    // Remove trailing semicolon and trim whitespace
    const cleanQuery = query.replace(/;$/, '').trim();
    
    // Parse the query to validate syntax and get AST
    const ast = parser.parse(cleanQuery);
    console.log('AST:', JSON.stringify(ast, null, 2));
    
    // Check for dangerous operations
    const dangerousOperations = [
      'drop', 'delete', 'truncate', 'alter', 'create', 'insert', 
      'update', 'replace', 'grant', 'revoke'
    ];
    
    // Check if the query is a SELECT statement
    // More lenient check for SELECT queries
    const isSelectQuery = cleanQuery.toLowerCase().startsWith('select');
    if (!isSelectQuery) {
      console.log('Not a SELECT query');
      return false;
    }
    
    // Check for dangerous operations in the AST
    const queryString = cleanQuery.toLowerCase();
    if (dangerousOperations.some(op => queryString.includes(op))) {
      console.log('Dangerous operation detected in query');
      return false;
    }
    
    // Additional safety checks
    if (queryString.includes('--') || queryString.includes('/*') || queryString.includes('*/')) {
      console.log('SQL comment detected in query');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Query validation error:', error.message);
    console.error('Query that caused error:', query);
    // For simple SELECT queries, allow them even if parser fails
    const simpleSelectRegex = /^SELECT\s*\*\s*FROM\s+[a-zA-Z_][a-zA-Z0-9_]*\s*;?$/i;
    return simpleSelectRegex.test(query);
  }
}

// Helper function to validate query parameters
function validateParameters(params) {
  if (!params) return true;
  
  return params.every(param => {
    // Only allow primitive types
    if (typeof param !== 'string' && typeof param !== 'number' && typeof param !== 'boolean') {
      return false;
    }
    
    // For strings, check for dangerous content
    if (typeof param === 'string') {
      const lowerParam = param.toLowerCase();
      const dangerousContent = ['--', '/*', '*/', ';', 'xp_', 'exec', 'waitfor'];
      return !dangerousContent.some(content => lowerParam.includes(content));
    }
    
    return true;
  });
}

// Execute custom query
app.post('/api/query/:connectionId/:database', async (req, res) => {
  const startTime = Date.now();
  const { connectionId, database } = req.params;
  const { query, params } = req.body;
  
  console.log(`\n=== Query Execution Started ===`);
  console.log(`Connection: ${connectionId}`);
  console.log(`Database: ${database}`);
  console.log(`Query: ${query}`);
  console.log(`Parameters:`, params || []);
  
  try {
    // Validate that query is a string
    if (typeof query !== 'string') {
      console.error('Invalid query type:', typeof query);
      return res.status(400).json({ 
        error: 'Invalid query format',
        details: 'Query must be a string'
      });
    }
    
    // Check if query is safe
    if (!isQuerySafe(query)) {
      console.error('Unsafe query detected:', query);
      return res.status(400).json({ 
        error: 'Query validation failed',
        details: 'Query contains unsafe operations or does not match allowed patterns'
      });
    }
    
    // Validate parameters
    if (params) {
      if (!Array.isArray(params)) {
        console.error('Invalid parameters type:', typeof params);
        return res.status(400).json({ 
          error: 'Invalid parameters format',
          details: 'Parameters must be an array'
        });
      }
      
      if (!validateParameters(params)) {
        console.error('Unsafe parameters detected:', params);
        return res.status(400).json({ 
          error: 'Parameters validation failed',
          details: 'Parameters contain unsafe values'
        });
      }
    }
    
    const pool = await dbService.getPool(connectionId, database);
    
    // Execute the query with parameters
    const result = await pool.query(query, params || []);
    
    const executionTime = Date.now() - startTime;
    console.log(`Query executed successfully in ${executionTime}ms`);
    console.log(`Rows returned: ${result.rows.length}`);
    console.log(`=== Query Execution Completed ===\n`);
    
    res.json(result.rows);
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`\n=== Query Execution Failed ===`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    console.error(`Execution time: ${executionTime}ms`);
    console.error(`=== Query Execution Failed ===\n`);
    
    // Determine the appropriate error status code
    let statusCode = 500;
    let errorMessage = 'Failed to execute query';
    let errorDetails = error.message;
    
    if (error.code === '42P01') { // undefined_table
      statusCode = 400;
      errorMessage = 'Table does not exist';
    } else if (error.code === '42P02') { // undefined_column
      statusCode = 400;
      errorMessage = 'Column does not exist';
    } else if (error.code === '42601') { // syntax_error
      statusCode = 400;
      errorMessage = 'SQL syntax error';
    } else if (error.code === '28P01') { // invalid_password
      statusCode = 401;
      errorMessage = 'Database authentication failed';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: errorDetails,
      connectionId,
      database,
      query: query.substring(0, 100) + (query.length > 100 ? '...' : '') // Truncate long queries in error response
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await dbService.closeAllPools();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`pgAdmin backend running on port ${port}`);
}); 