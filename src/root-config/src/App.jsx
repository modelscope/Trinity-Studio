import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const config = require('../../configs');

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');
  const [payload, setPayload] = useState(null);

  // Parse URL parameters when component mounts or location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view') || 'dashboard';
    const data = params.get('data');
    setCurrentView(view);
    if (data) {
      try {
        setPayload(JSON.parse(decodeURIComponent(data)));
      } catch (e) {
        console.error('Failed to parse payload:', e);
      }
    }
  }, [location]);

  const navStyle = {
    backgroundColor: '#2c3e50',
    padding: '1rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const navListStyle = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center'
  };

  const getNavItemStyle = (view) => ({
    color: '#ecf0f1',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: currentView === view ? '#34495e' : 'transparent'
  });

  // Function to navigate with payload
  const navigateWithPayload = (view, data = null) => {
    const params = new URLSearchParams();
    params.set('view', view);
    if (data) {
      params.set('data', encodeURIComponent(JSON.stringify(data)));
    }
    navigate(`?${params.toString()}`);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'pgadmin':
        return (
          <iframe
            src={config.getServiceUrl('pgadmin')}
            style={{
              width: '100%',
              height: 'calc(100vh - 100px)',
              border: 'none'
            }}
          />
        );
      case 'labelstudio':
        return (
          <iframe
            src={config.getServiceUrl('labelStudio')}
            style={{
              width: '100%',
              height: 'calc(100vh - 100px)',
              border: 'none'
            }}
          />
        );
      case 'training-portal':
        return (
          <iframe
            src={config.getFrontendUrl('trainingPortal')}
            style={{
              width: '100%',
              height: 'calc(100vh - 100px)',
              border: 'none'
            }}
          />
        );
      case 'dashboard':
        return (
          <div style={{ 
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h1 style={{ 
              color: '#2c3e50', 
              textAlign: 'center',
              marginBottom: '30px',
              fontSize: '2.2rem'
            }}>
              RFT Portal Dashboard
            </h1>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px',
              marginTop: '20px'
            }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
                border: '1px solid #e9ecef'
              }}
              onClick={() => navigateWithPayload('training-portal')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  backgroundColor: '#3498db', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ color: 'white', fontSize: '24px' }}>TP</span>
                </div>
                <h2 style={{ color: '#3498db', marginBottom: '10px' }}>Training Portal</h2>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  Access the training portal to manage your training data and models.
                </p>
                <button 
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  Open Training Portal
                </button>
              </div>
              
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
                border: '1px solid #e9ecef'
              }}
              onClick={() => navigateWithPayload('pgadmin')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  backgroundColor: '#2ecc71', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ color: 'white', fontSize: '24px' }}>DB</span>
                </div>
                <h2 style={{ color: '#2ecc71', marginBottom: '10px' }}>pgAdmin</h2>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  Manage your PostgreSQL databases with pgAdmin.
                </p>
                <button 
                  style={{
                    backgroundColor: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  Open pgAdmin
                </button>
              </div>
              
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
                border: '1px solid #e9ecef'
              }}
              onClick={() => navigateWithPayload('labelstudio')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  backgroundColor: '#e74c3c', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ color: 'white', fontSize: '24px' }}>LS</span>
                </div>
                <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Label Studio</h2>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  Label and annotate your data with Label Studio.
                </p>
                <button 
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  Open Label Studio
                </button>
              </div>
            </div>
            
            {payload && (
              <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Received Payload:</h3>
                <pre style={{ 
                  textAlign: 'left', 
                  maxWidth: '100%', 
                  margin: '0 auto',
                  padding: '15px',
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  border: '1px solid #e9ecef',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div style={{ 
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h1 style={{ color: '#2c3e50' }}>Welcome to RFT Portal!</h1>
            <p style={{ color: '#7f8c8d', fontSize: '18px' }}>
              This is your landing page; try different tools in the navigation bar!
            </p>
            {payload && (
              <div style={{ marginTop: '20px' }}>
                <h3>Received Payload:</h3>
                <pre style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      <nav style={navStyle}>
        <ul style={navListStyle}>
          <li>
            <span 
              style={getNavItemStyle('dashboard')}
              onClick={() => navigateWithPayload('dashboard', { 
                timestamp: new Date().toISOString(),
                source: 'navigation'
              })}
            >
              Dashboard
            </span>
          </li>
          <li>
            <span 
              style={getNavItemStyle('pgadmin')}
              onClick={() => navigateWithPayload('pgadmin')}
            >
              pgAdmin
            </span>
          </li>
          <li>
            <span 
              style={getNavItemStyle('labelstudio')}
              onClick={() => navigateWithPayload('labelstudio')}
            >
              Label Studio
            </span>
          </li>
          <li>
            <span 
              style={getNavItemStyle('training-portal')}
              onClick={() => navigateWithPayload('training-portal')}
            >
              Training Portal
            </span>
          </li>
          <li>
            <span 
              style={getNavItemStyle('settings')}
              onClick={() => navigateWithPayload('settings')}
            >
              Settings
            </span>
          </li>
        </ul>
      </nav>
      {renderContent()}
    </div>
  );
};

export default App; 