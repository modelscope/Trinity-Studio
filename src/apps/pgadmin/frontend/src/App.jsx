import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  TableChart as TableIcon,
  Refresh as RefreshIcon,
  PlayArrow as ExecuteIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
const config = require('./config');

const drawerWidth = 240;

const App = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableStructure, setTableStructure] = useState([]);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [queryParams, setQueryParams] = useState([]);
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleError = (error) => {
    let errorMessage = 'An error occurred';
    if (error.response) {
      errorMessage = error.response.data.error || error.response.data.details || errorMessage;
    } else if (error.request) {
      errorMessage = 'No response received from server';
    } else {
      errorMessage = error.message;
    }
    setError(errorMessage);
    setErrorOpen(true);
  };

  const handleCloseError = () => {
    setErrorOpen(false);
    setError(null);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      fetchDatabases();
    }
  }, [selectedConnection]);

  useEffect(() => {
    if (selectedDatabase) {
      fetchTables();
    }
  }, [selectedDatabase]);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(config.getApiUrl('/connections'));
      setConnections(response.data);
      if (response.data.length > 0) {
        setSelectedConnection(response.data[0].id);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const fetchDatabases = async () => {
    if (!selectedConnection) return;
    
    try {
      const response = await axios.get(config.getApiUrl(`/databases/${selectedConnection}`));
      setDatabases(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTables = async (database) => {
    if (!selectedConnection || !database) return;
    
    try {
      const response = await axios.get(config.getApiUrl(`/tables/${selectedConnection}/${database}`));
      setTables(response.data);
      setSelectedDatabase(database);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTableStructure = async (table) => {
    if (!selectedConnection || !selectedDatabase || !table) return;
    
    try {
      const response = await axios.get(config.getApiUrl(`/table/${selectedConnection}/${selectedDatabase}/${table}`));
      setTableStructure(response.data);
      setSelectedTable(table);
    } catch (error) {
      handleError(error);
    }
  };

  const executeQuery = async () => {
    if (!selectedConnection || !selectedDatabase) return;
    
    try {
      const response = await axios.post(
        config.getApiUrl(`/query/${selectedConnection}/${selectedDatabase}`), 
        { 
          query,
          params: queryParams
        }
      );
      setQueryResult(response.data);
      setError(null);
    } catch (error) {
      handleError(error);
      setQueryResult([]);
    }
  };

  const handleConnectionChange = (event) => {
    setSelectedConnection(event.target.value);
    setDatabases([]);
    setTables([]);
    setSelectedDatabase(null);
    setSelectedTable(null);
    setTableStructure([]);
    setQueryResult([]);
    setError(null);
  };

  const handleDatabaseChange = (event) => {
    const database = event.target.value;
    setSelectedDatabase(database);
    setTables([]);
    setSelectedTable(null);
    setTableStructure([]);
    setQueryResult([]);
    setError(null);
    if (database) {
      fetchTables(database);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            pgAdmin
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200, mr: 2, backgroundColor: 'white', borderRadius: 1 }}>
            <Select
              value={selectedConnection}
              onChange={handleConnectionChange}
              displayEmpty
              sx={{ color: 'black' }}
            >
              <MenuItem value="" disabled>Select Connection</MenuItem>
              {connections.map((conn) => (
                <MenuItem key={conn.id} value={conn.id}>{conn.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton color="inherit" onClick={fetchConnections}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px'
          },
        }}
      >
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Database</InputLabel>
            <Select
              value={selectedDatabase || ''}
              onChange={handleDatabaseChange}
              label="Database"
            >
              <MenuItem value="" disabled>Select Database</MenuItem>
              {databases.map((db) => (
                <MenuItem key={db.datname} value={db.datname}>{db.datname}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Tables</Typography>
          <List>
            {tables.map((table) => (
              <ListItem 
                button 
                key={table.table_name}
                selected={selectedTable === table.table_name}
                onClick={() => fetchTableStructure(table.table_name)}
              >
                <ListItemIcon>
                  <TableIcon />
                </ListItemIcon>
                <ListItemText primary={table.table_name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          marginTop: '64px'
        }}
      >
        {selectedTable && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Table Structure: {selectedTable}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Column</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Nullable</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableStructure.map((column) => (
                    <TableRow key={column.column_name}>
                      <TableCell>{column.column_name}</TableCell>
                      <TableCell>{column.data_type}</TableCell>
                      <TableCell>{column.is_nullable}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            SQL Query
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter SQL query..."
            sx={{ mb: 2 }}
            error={!!error}
            helperText={error}
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ExecuteIcon />}
            onClick={executeQuery}
            disabled={!selectedConnection || !selectedDatabase}
          >
            Execute Query
          </Button>
          
          {queryResult.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(queryResult[0]).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryResult.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar 
        open={errorOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
          icon={<ErrorIcon />}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App; 