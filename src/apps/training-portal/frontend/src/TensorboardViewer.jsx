import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';
import config from './config';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

const API_BASE_URL = config.getApiUrl('');

function TensorboardViewer() {
  const [logDir, setLogDir] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);

  const handleLoadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch metrics from backend
      const response = await axios.get(`${API_BASE_URL}/api/tensorboard/metrics`, {
        params: { logDir }
      });

      setMetrics(response.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (metrics && Object.keys(metrics).length > 0 && containerRef.current) {
      // Clear previous visualizations
      containerRef.current.innerHTML = '';

      // Create visualizations based on metrics
      Object.entries(metrics).forEach(([metricName, values]) => {
        const surface = { name: metricName, tab: 'Metrics' };
        tfvis.render.linechart(
          surface,
          { values: values.map((v, i) => ({ x: i, y: v })) },
          {
            xLabel: 'Step',
            yLabel: metricName,
            width: containerRef.current.clientWidth - 40,
            height: 300
          }
        );
      });
    }
  }, [metrics]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tensorboard Viewer
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Log Directory"
            value={logDir}
            onChange={(e) => setLogDir(e.target.value)}
            fullWidth
            placeholder="e.g., /path/to/logs"
          />
          <Button
            variant="contained"
            onClick={handleLoadLogs}
            disabled={loading || !logDir}
          >
            Load Metrics
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : Object.keys(metrics).length > 0 ? (
        <Paper sx={{ p: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Metrics" />
            <Tab label="Graph" />
            <Tab label="Distributions" />
          </Tabs>
          <Box ref={containerRef} sx={{ mt: 2 }} />
        </Paper>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Enter log directory to load metrics
        </Typography>
      )}
    </Box>
  );
}

export default TensorboardViewer; 