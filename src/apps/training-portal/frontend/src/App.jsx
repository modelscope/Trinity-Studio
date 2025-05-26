import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Tabs,
  Tab,
  Link,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as ConfigIcon,
  Timeline as WandbIcon,
  Dashboard as TensorboardIcon
} from '@mui/icons-material';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import { parse, stringify } from 'yaml';
import config from './config';
import WandbMonitor from './WandbMonitor';
import TensorboardViewer from './TensorboardViewer';

const drawerWidth = 240;
const API_BASE_URL = config.getApiUrl('');
const config_manager = require('../../../../configs');

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeContent, setRecipeContent] = useState('');
  const [wandbProjects, setWandbProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [wandbRuns, setWandbRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [runMetrics, setRunMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [openNewRecipeDialog, setOpenNewRecipeDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('configurator');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchRecipes();
    fetchWandbProjects();
  }, []);

  useEffect(() => {
    if (selectedRecipe) {
      setRecipeContent(stringify(selectedRecipe.content));
    }
  }, [selectedRecipe]);

  useEffect(() => {
    if (selectedProject) {
      fetchWandbRuns(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedRun) {
      fetchRunMetrics(selectedRun);
    }
  }, [selectedRun]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      console.log('Fetching recipes from:', `${API_BASE_URL}/api/recipes`);
      const response = await axios.get(`${API_BASE_URL}/api/recipes`);
      console.log('Recipes response:', response.data);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError(`Failed to fetch recipes: ${error.message}`);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchWandbProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wandb/projects`);
      setWandbProjects(response.data);
    } catch (error) {
      handleError('Failed to fetch wandb projects');
    }
  };

  const fetchWandbRuns = async (project) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wandb/projects/${project}/runs`);
      const runs = Array.isArray(response.data) ? response.data : [];
      setWandbRuns(runs);
    } catch (error) {
      console.error('Error fetching wandb runs:', error);
      setWandbRuns([]);
      handleError('Failed to fetch wandb runs');
    }
  };

  const fetchRunMetrics = async (runId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wandb/runs/${runId}/metrics`);
      setRunMetrics(response.data);
    } catch (error) {
      handleError('Failed to fetch run metrics');
    }
  };

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleSaveRecipe = async () => {
    try {
      const content = parse(recipeContent);
      await axios.post(`${API_BASE_URL}/api/recipes/${selectedRecipe.name}`, { content });
      fetchRecipes();
    } catch (error) {
      handleError('Failed to save recipe');
    }
  };

  const handleStartJob = async () => {
    try {
      const recipeName = selectedRecipe.name.replace('.yaml', '');
      await axios.post(`${API_BASE_URL}/api/jobs/start`, {
        recipe: recipeName,
        type: 'train'
      });
    } catch (error) {
      handleError('Failed to start job');
    }
  };

  const handleError = (message) => {
    setError(message);
    setErrorOpen(true);
  };

  const handleCloseError = () => {
    setErrorOpen(false);
  };

  const handleOpenWandbPortal = () => {
    window.open('http://8.130.26.137:8083/home', '_blank');
  };

  const handleCreateRecipe = async () => {
    try {
      console.log('Creating recipe:', newRecipeName);
      await axios.post(`${API_BASE_URL}/api/recipes`, {
        name: newRecipeName,
        content: ''
      });
      setOpenNewRecipeDialog(false);
      setNewRecipeName('');
      fetchRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError(`Failed to create recipe: ${error.message}`);
      setErrorOpen(true);
    }
  };

  const handleDeleteRecipe = async (recipeName) => {
    try {
      console.log('Deleting recipe:', recipeName);
      await axios.delete(`${API_BASE_URL}/api/recipes/${recipeName}`);
      fetchRecipes();
      if (selectedRecipe && selectedRecipe.name === recipeName) {
        setSelectedRecipe(null);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError(`Failed to delete recipe: ${error.message}`);
      setErrorOpen(true);
    }
  };

  const handleSave = () => {
    fetchRecipes();
  };

  const handleStartTraining = () => {
    // You can add any additional logic here when training starts
    console.log('Training started');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    handleMenuClose();
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'configurator':
        return (
          <iframe
            src={config_manager.getServiceUrl('configManager')}
            style={{
              width: '100%',
              height: 'calc(100vh - 100px)',
              border: 'none'
            }}
          />
        );
      case 'wandb':
        return <WandbMonitor />;
      case 'tensorboard':
        return <TensorboardViewer />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Training Portal
          </Typography>
          <Button
            color="inherit"
            onClick={handleMenuClick}
            startIcon={<ConfigIcon />}
          >
            Tools
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleViewChange('configurator')}>
              <ListItemIcon>
                <ConfigIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configurator</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleViewChange('wandb')}>
              <ListItemIcon>
                <WandbIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Wandb Monitor</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleViewChange('tensorboard')}>
              <ListItemIcon>
                <TensorboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Tensorboard</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
{/*       <Drawer */}
{/*         variant="permanent" */}
{/*         sx={{ */}
{/*           width: drawerWidth, */}
{/*           flexShrink: 0, */}
{/*           '& .MuiDrawer-paper': { */}
{/*             width: drawerWidth, */}
{/*             boxSizing: 'border-box', */}
{/*           }, */}
{/*         }} */}
{/*       > */}
{/*         <Toolbar /> */}
{/*         <Box sx={{ overflow: 'auto' }}> */}
{/*           <List> */}
{/*             <ListItem> */}
{/*               <Typography variant="h6">Recipes</Typography> */}
{/*             </ListItem> */}
{/*             {loading ? ( */}
{/*               <ListItem> */}
{/*                 <ListItemText primary="Loading recipes..." /> */}
{/*               </ListItem> */}
{/*             ) : ( */}
{/*               recipes.map((recipe) => ( */}
{/*                 <ListItem */}
{/*                   key={recipe.name} */}
{/*                   button */}
{/*                   selected={selectedRecipe?.name === recipe.name} */}
{/*                   onClick={() => handleRecipeSelect(recipe)} */}
{/*                 > */}
{/*                   <ListItemText primary={recipe.name} /> */}
{/*                   <IconButton */}
{/*                     edge="end" */}
{/*                     aria-label="delete" */}
{/*                     onClick={(e) => { */}
{/*                       e.stopPropagation(); */}
{/*                       handleDeleteRecipe(recipe.name); */}
{/*                     }} */}
{/*                   > */}
{/*                     <DeleteIcon /> */}
{/*                   </IconButton> */}
{/*                 </ListItem> */}
{/*               )) */}
{/*             )} */}
{/*             <ListItem> */}
{/*               <Button */}
{/*                 variant="contained" */}
{/*                 startIcon={<AddIcon />} */}
{/*                 onClick={() => setOpenNewRecipeDialog(true)} */}
{/*                 fullWidth */}
{/*               > */}
{/*                 New Recipe */}
{/*               </Button> */}
{/*             </ListItem> */}
{/*           </List> */}
{/*         </Box> */}
{/*       </Drawer> */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {renderActiveView()}
      </Box>
      <Dialog open={openNewRecipeDialog} onClose={() => setOpenNewRecipeDialog(false)}>
        <DialogTitle>Create New Recipe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Recipe Name"
            fullWidth
            value={newRecipeName}
            onChange={(e) => setNewRecipeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewRecipeDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRecipe} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App; 