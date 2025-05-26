import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Divider
} from '@mui/material';
import axios from 'axios';
import config from './config';

const API_BASE_URL = config.getApiUrl('');
const WANDB_BASE_URL = config.getWandbBaseUrl();

function WandbMonitor() {
  const [project, setProject] = useState('');
  const [runId, setRunId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [runSuggestions, setRunSuggestions] = useState([]);
  const [projectInput, setProjectInput] = useState('');
  const [runInput, setRunInput] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [wandbUrl, setWandbUrl] = useState('');
  const [runDetails, setRunDetails] = useState(null);

  // Fetch all projects on mount
  useEffect(() => {
    const fetchAllProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/wandb/projects`, {
          params: { q: '' }
        });
        setAllProjects(response.data);
        setProjectSuggestions(response.data);
      } catch (err) {
        console.error('Error fetching all projects:', err);
        setError('Failed to fetch project suggestions');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchAllProjects();
  }, []);

  // Filter projects client-side as user types
  useEffect(() => {
    if (!projectInput) {
      setProjectSuggestions(allProjects);
      return;
    }
    // Fuzzy, case-insensitive filter
    const input = projectInput.toLowerCase();
    const filtered = allProjects.filter(p => {
      const name = typeof p === 'string' ? p : p.display || p.name || '';
      return name.toLowerCase().includes(input);
    });
    setProjectSuggestions(filtered);
  }, [projectInput, allProjects]);

  // Function to fetch run suggestions
  const fetchRunSuggestions = async (query) => {
    if (!project) return;
    setLoadingRuns(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wandb/projects/${project}/runs`, {
        params: { q: query }
      });
      setRunSuggestions(response.data);
    } catch (err) {
      console.error('Error fetching run suggestions:', err);
      setError('Failed to fetch run suggestions');
    } finally {
      setLoadingRuns(false);
    }
  };

  // Fetch run suggestions when input changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRunSuggestions(runInput);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [project, runInput]);

  // Function to construct Wandb URL
  const constructWandbUrl = (project, runId) => {
    if (!project || !runId) return '';
    // Extract just the run ID if it's a full URL
    const cleanRunId = runId.split('/').pop().split('?')[0];
    return `${WANDB_BASE_URL}/dail/${project}/runs/${cleanRunId}?workspace=user-dail`;
  };

  // Handle loading a run
  const handleLoadRun = async () => {
    if (!project || !runId) {
      setError('Please enter both project and run ID');
      return;
    }
    setError(null);
    const url = constructWandbUrl(project, runId);
    setWandbUrl(url);

    // Fetch run details from backend
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wandb/runs/${project}/${runId}`);
      setRunDetails(response.data);
    } catch (err) {
      setRunDetails(null);
      setError('Failed to fetch run details');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Wandb Monitor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, width: '100%' }}>
          <Autocomplete
            sx={{ flex: 1 }}
            freeSolo
            options={projectSuggestions}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.name || ''
            }
            inputValue={projectInput}
            onInputChange={(_, newValue) => {
              setProjectInput(newValue);
            }}
            onChange={(_, newValue) => {
              if (!newValue) {
                setProject('');
                setRunId('');
                setRunInput('');
                setRunDetails(null);
                setWandbUrl('');
                return;
              }
              if (typeof newValue === 'string') {
                setProject(newValue);
              } else if (newValue.name) {
                setProject(newValue.name);
              }
              setRunId('');
              setRunInput('');
              setRunDetails(null);
              setWandbUrl('');
            }}
            loading={loadingProjects}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Project"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingProjects ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Autocomplete
            sx={{ flex: 1 }}
            freeSolo
            options={runSuggestions}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : (option.name ? `${option.name} (${option.id})` : option.id || '')
            }
            inputValue={runInput}
            onInputChange={(_, newValue) => {
              setRunInput(newValue);
            }}
            onChange={(_, newValue) => {
              if (!newValue) {
                setRunId('');
                return;
              }
              if (typeof newValue === 'string') {
                setRunId(newValue);
              } else if (newValue.id) {
                setRunId(newValue.id);
              }
            }}
            loading={loadingRuns}
            disabled={!project}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Run ID"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingRuns ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Button
            variant="contained"
            onClick={handleLoadRun}
            disabled={loading || !project || !runId}
            sx={{ whiteSpace: 'nowrap', alignSelf: 'flex-end', height: '56px' }}
          >
            Load Run
          </Button>
        </Box>
        <Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
          {wandbUrl && runDetails && (
            <>
              <Button
                variant="contained"
                color="primary"
                href={wandbUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mb: 2 }}
              >
                Go to Wandb for more
              </Button>
              <Typography variant="h6" gutterBottom>
                {runDetails.name} <Chip label={runDetails.state} size="small" sx={{ ml: 1 }} />
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Run ID: {runDetails.id} | Author: {runDetails.author} | Created: {runDetails.created_at}
              </Typography>
              {runDetails.tags && runDetails.tags.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {runDetails.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Box>
              )}
              {runDetails.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {runDetails.description}
                </Typography>
              )}
              <Divider sx={{ my: 2 }}>Config</Divider>
              {runDetails.config && (
                <Table size="small" sx={{ mb: 2 }}>
                  <TableBody>
                    {Object.entries(runDetails.config).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                        <TableCell>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Divider sx={{ my: 2 }}>Summary</Divider>
              {runDetails.summary && (
                <Table size="small">
                  <TableBody>
                    {Object.entries(runDetails.summary).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                        <TableCell>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default WandbMonitor; 
